// 32 symbols without the look-alikes l, o, 0 and 1, so a link read aloud still works.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

/** The public code in a list's link. */
export const LIST_ID = /^[a-km-np-z2-9]{16}$/;

/** 16 symbols × 5 bits = 80 random bits: not guessable, still short enough to share. */
export function newListId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => ALPHABET[b & 31]).join('');
}

/** A random base64url secret (owner key or guest cookie). */
export function newSecret(byteLength: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time check of a secret against its stored SHA-256 hash. */
export async function matchesHash(secret: string, expectedHex: string): Promise<boolean> {
  const actual = new TextEncoder().encode(await sha256Hex(secret));
  const expected = new TextEncoder().encode(expectedHex);
  return actual.byteLength === expected.byteLength && crypto.subtle.timingSafeEqual(actual, expected);
}
