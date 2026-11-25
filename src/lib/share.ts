import type { WishItem, WishlistShare } from '@/types';

/** babyklar.app hosts the shared wishlists (see web/). Override for local testing. */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL ?? 'https://babyklar.app').replace(/\/$/, '');

/** Shown on wishes reserved through the link: the server never says who. */
export const GUEST_RESERVED = 'En gjest';

/** The server no longer has the list (stopped sharing elsewhere, or cleaned up after a year). */
export class ShareGoneError extends Error {}

type SharedWish = Pick<WishItem, 'id' | 'name' | 'size' | 'note' | 'link' | 'priority' | 'usedOk'>;

/** Only what guests see leaves the phone – not reservations, notes on items, or anything else. */
const sharedWishes = (wishes: WishItem[]): SharedWish[] =>
  wishes.map(({ id, name, size, note, link, priority, usedOk }) => ({ id, name, size, note, link, priority, usedOk }));

/** Changes only when something guests can see changes, not when reservations come back. */
export const shareSignature = (wishes: WishItem[]) => JSON.stringify(sharedWishes(wishes));

/** Lists this app has already deleted, so a later clean-up doesn't try again. */
const deleted = new Set<string>();

async function call(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    return await fetch(`${WEB_URL}${path}`, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const auth = (share: WishlistShare) => ({ Authorization: `Bearer ${share.key}` });

function checkOwner(res: Response, share: WishlistShare) {
  if (res.status === 404 || res.status === 403) {
    deleted.add(share.id);
    throw new ShareGoneError();
  }
  if (!res.ok) throw new Error(`Wishlist request failed: ${res.status}`);
}

/** Uploads the wishlist and returns its new link. */
export async function createShare(wishes: WishItem[]): Promise<WishlistShare> {
  const res = await call('/api/lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wishes: sharedWishes(wishes) }),
  });
  if (!res.ok) throw new Error(`Creating the wishlist link failed: ${res.status}`);
  const data = (await res.json()) as { id: string; key: string; url: string };
  return { id: data.id, key: data.key, url: data.url };
}

/** Makes the shared list match the app. Returns the ids of reserved wishes. */
export async function syncShare(share: WishlistShare, wishes: WishItem[]): Promise<string[]> {
  const res = await call(`/api/lists/${share.id}`, {
    method: 'PUT',
    headers: { ...auth(share), 'Content-Type': 'application/json' },
    body: JSON.stringify({ wishes: sharedWishes(wishes) }),
  });
  checkOwner(res, share);
  return ((await res.json()) as { reserved: string[] }).reserved;
}

/** The ids of reserved wishes. */
export async function fetchReservations(share: WishlistShare): Promise<string[]> {
  const res = await call(`/api/lists/${share.id}`, { method: 'GET', headers: auth(share) });
  checkOwner(res, share);
  return ((await res.json()) as { reserved: string[] }).reserved;
}

/** Deletes the shared list; the link stops working. */
export async function deleteShare(share: WishlistShare): Promise<void> {
  if (deleted.has(share.id)) return;
  const res = await call(`/api/lists/${share.id}`, { method: 'DELETE', headers: auth(share) });
  if (!res.ok && res.status !== 404 && res.status !== 403) throw new Error(`Deleting the wishlist failed: ${res.status}`);
  deleted.add(share.id);
}
