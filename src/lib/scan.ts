import Constants from 'expo-constants';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

import { garmentType } from '@/lib/insights';
import type { Item, ScanResult, ScanSuggestion } from '@/types';

const MAX_SIDE = 1280;
const TIMEOUT_MS = 45_000;

export interface Photo {
  uri: string;
  width: number;
  height: number;
}

export class ScanError extends Error {
  constructor(readonly reason: 'not-configured' | 'failed') {
    super(reason);
  }
}

/**
 * Where `/api/scan` lives: same origin on web, the dev server while developing,
 * otherwise the deployed EAS Hosting URL baked in at build time.
 */
function apiBase(): string | null {
  if (Platform.OS === 'web') return '';
  const devHost = Constants.expoConfig?.hostUri;
  if (__DEV__ && devHost) return `http://${devHost}`;
  return process.env.EXPO_PUBLIC_API_URL || null;
}

/** Downscales and re-encodes as JPEG: a much smaller upload, and the AI can't read iPhone HEIC. */
async function toJpegBase64(photo: Photo): Promise<string> {
  let ctx = ImageManipulator.manipulate(photo.uri);
  if (Math.max(photo.width, photo.height) > MAX_SIDE) {
    ctx = ctx.resize(photo.width >= photo.height ? { width: MAX_SIDE } : { height: MAX_SIDE });
  }
  const image = await ctx.renderAsync();
  const saved = await image.saveAsync({ base64: true, compress: 0.7, format: SaveFormat.JPEG });
  if (!saved.base64) throw new ScanError('failed');
  return saved.base64;
}

export async function analyzePhoto(photo: Photo, items: Item[]): Promise<ScanResult> {
  const base = apiBase();
  if (base === null) throw new ScanError('not-configured');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const image = await toJpegBase64(photo);
    // Clothes are matched locally on type + size, so the AI only needs the rest.
    const list = items.filter((i) => i.category !== 'clothes').map((i) => ({ id: i.id, name: i.name }));
    const res = await fetch(`${base}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, list }),
      signal: controller.signal,
    });
    if (res.status === 503) throw new ScanError('not-configured');
    if (!res.ok) throw new ScanError('failed');
    return (await res.json()) as ScanResult;
  } catch (e) {
    throw e instanceof ScanError ? e : new ScanError('failed');
  } finally {
    clearTimeout(timer);
  }
}

/** The item on the list a suggestion refers to. Clothes match on garment type + size, the rest on the AI's pick. */
export function matchFor(s: ScanSuggestion, items: Item[]): Item | undefined {
  if (s.category === 'clothes') {
    if (!s.size) return undefined;
    const t = garmentType(s.name);
    return items.find((i) => i.category === 'clothes' && i.size === s.size && garmentType(i.name) === t);
  }
  return s.matchId ? items.find((i) => i.id === s.matchId) : undefined;
}
