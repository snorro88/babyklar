import { GARMENT_TEMPLATE, SIZES } from '@/data/catalog';
import { SEASON_LABEL, seasonOf, type Season } from '@/lib/plan';
import type { GarmentRow } from '@/types';

/** Approximate age in months [from, to) for each size. */
const SIZE_MONTHS: Record<string, [number, number]> = {
  '50': [0, 1],
  '56': [1, 2],
  '62': [2, 4],
  '68': [4, 6],
  '74': [6, 9],
  '80': [9, 12],
  '86': [12, 18],
};

/** Garments that cover cold weather — used to check whether a cold period is covered. */
const WARM_TYPES = /ytter|dress|ull|vognpose|votter|lue/i;

const MS_DAY = 86_400_000;

const startOfDay = (d: Date) => {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
};

const addMonths = (d: Date, months: number) => {
  const out = new Date(d);
  out.setMonth(out.getMonth() + months);
  return out;
};

/** Local ISO date — toISOString would shift the date in Norwegian summer time. */
const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function seasonsBetween(from: Date, to: Date): Season[] {
  const out: Season[] = [];
  const cursor = new Date(from);
  while (cursor < to) {
    const s = seasonOf(localIso(cursor));
    if (!out.includes(s)) out.push(s);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  if (!out.length) out.push(seasonOf(localIso(from)));
  return out;
}

export const monthLabel = (d: Date) =>
  d.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });

export type SizePhase = 'ferdig' | 'na' | 'neste' | 'senere';

export interface SizeGap {
  type: string;
  count: number;
}

export interface SizeWindow {
  size: string;
  from: Date;
  to: Date;
  seasons: Season[];
  seasonLabel: string;
  phase: SizePhase;
  weeksUntilStart: number;
  have: number;
  gaps: SizeGap[];
  /** Perioden faller på høst/vinter uten at noe varmt er registrert. */
  needsWarmClothes: boolean;
  registered: boolean;
}

/**
 * Projects which size the child uses when, and crosses it against the wardrobe
 * and the season. Makes size and season alerts concrete instead of generic.
 */
export function sizeTimeline(birthDate: string, wardrobe: Record<string, GarmentRow[]>): SizeWindow[] {
  const birth = startOfDay(new Date(`${birthDate}T00:00:00`));
  const today = startOfDay(new Date());

  const windows = SIZES.filter((s) => SIZE_MONTHS[s]).map<SizeWindow>((size) => {
    const [fromMonths, toMonths] = SIZE_MONTHS[size];
    const from = addMonths(birth, fromMonths);
    const to = addMonths(birth, toMonths);
    const rows = wardrobe[size];
    const registered = !!rows?.length;
    const effective = registered ? rows : GARMENT_TEMPLATE;
    const seasons = seasonsBetween(from, to);

    return {
      size,
      from,
      to,
      seasons,
      seasonLabel: seasons.map((s) => SEASON_LABEL[s]).join(' og '),
      phase: today >= to ? 'ferdig' : today >= from ? 'na' : 'senere',
      weeksUntilStart: Math.max(0, Math.ceil((from.getTime() - today.getTime()) / (7 * MS_DAY))),
      have: effective.reduce((sum, r) => sum + r.have, 0),
      gaps: effective
        .filter((r) => r.have < r.min)
        .map((r) => ({ type: r.type, count: r.min - r.have })),
      needsWarmClothes:
        seasons.some((s) => s === 'host' || s === 'vinter') &&
        !effective.some((r) => WARM_TYPES.test(r.type) && r.have > 0),
      registered,
    };
  });

  const upcoming = windows.find((w) => w.phase === 'senere');
  if (upcoming) upcoming.phase = 'neste';
  return windows;
}

export const nextSizeWindow = (birthDate: string, wardrobe: Record<string, GarmentRow[]>) =>
  sizeTimeline(birthDate, wardrobe).find((w) => w.phase === 'neste');

export function sizeAlert(w: SizeWindow): string {
  const when = w.weeksUntilStart <= 1 ? 'snart' : `om ca. ${w.weeksUntilStart} uker`;
  if (!w.gaps.length) {
    return `Str. ${w.size} blir aktuelt ${when}, og dere har allerede det dere trenger.`;
  }
  const list = w.gaps
    .slice(0, 2)
    .map((g) => `${g.count} ${g.type.toLowerCase()}`)
    .join(' og ');
  return `Str. ${w.size} blir aktuelt ${when} – ${w.seasonLabel}. Dere mangler ${list}.`;
}
