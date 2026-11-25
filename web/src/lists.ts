import { newListId, newSecret, sha256Hex } from './crypto';
import { HttpError } from './http';

export type Priority = 'high' | 'medium' | 'low';

/** A wish as the app sends it, after validation. */
export interface WishInput {
  id: string;
  name: string;
  size: string | null;
  note: string | null;
  link: string | null;
  priority: Priority;
  usedOk: boolean;
}

export interface WishRow {
  id: string;
  name: string;
  size: string | null;
  note: string | null;
  link: string | null;
  priority: Priority;
  used_ok: number;
  reserved_at: number | null;
  reserver_hash: string | null;
}

export const MAX_WISHES = 200;
const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

/** Trimmed single-line text, cut to `max` characters; null when empty. */
function text(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.replace(/[\u0000-\u001f\u007f]+/g, ' ').trim();
  return t ? [...t].slice(0, max).join('') : null;
}

/** Only http(s) links; «www.butikk.no/x» gets https:// in front. */
function webLink(v: unknown): string | null {
  const t = text(v, 600);
  if (!t) return null;
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(t) ? t : `https://${t}`);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Lenient on purpose: a wish that can't be used is skipped rather than failing the
 * whole sync, so one odd entry never stops the list from updating.
 */
export function parseWishes(body: unknown): WishInput[] {
  const raw = body && typeof body === 'object' ? (body as { wishes?: unknown }).wishes : undefined;
  if (!Array.isArray(raw)) throw new HttpError(400, 'wishes_required');
  if (raw.length > MAX_WISHES) throw new HttpError(413, 'too_many_wishes');
  const seen = new Set<string>();
  const out: WishInput[] = [];
  for (const w of raw) {
    if (!w || typeof w !== 'object') continue;
    const r = w as Record<string, unknown>;
    const id = typeof r.id === 'string' && /^[\w.:-]{1,64}$/.test(r.id) ? r.id : null;
    const name = text(r.name, 120);
    if (!id || !name || seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name,
      size: text(r.size, 40),
      note: text(r.note, 500),
      link: webLink(r.link),
      priority: PRIORITIES.includes(r.priority as Priority) ? (r.priority as Priority) : 'medium',
      usedOk: r.usedOk === true,
    });
  }
  return out;
}

const payload = (wishes: WishInput[]) => JSON.stringify(wishes.map((w) => ({ ...w, usedOk: w.usedOk ? 1 : 0 })));

// The whole list travels as one JSON parameter: D1 caps bound parameters per query at 100.
const UPSERT = `
  INSERT INTO wishes (list_id, id, position, name, size, note, link, priority, used_ok)
  SELECT ?1, json_extract(value, '$.id'), CAST(key AS INTEGER), json_extract(value, '$.name'),
         json_extract(value, '$.size'), json_extract(value, '$.note'), json_extract(value, '$.link'),
         json_extract(value, '$.priority'), json_extract(value, '$.usedOk')
  FROM json_each(?2) WHERE true
  ON CONFLICT (list_id, id) DO UPDATE SET
    position = excluded.position, name = excluded.name, size = excluded.size, note = excluded.note,
    link = excluded.link, priority = excluded.priority, used_ok = excluded.used_ok`;

const PRUNE = `
  DELETE FROM wishes
  WHERE list_id = ?1 AND id NOT IN (SELECT json_extract(value, '$.id') FROM json_each(?2))`;

const RESERVED = 'SELECT id FROM wishes WHERE list_id = ?1 AND reserved_at IS NOT NULL';
const TOUCH = 'UPDATE lists SET updated_at = ?2 WHERE id = ?1';

/** Creates a shared list. Only a hash of the owner key is stored. */
export async function createList(db: D1Database, wishes: WishInput[], now: number) {
  const id = newListId();
  const key = newSecret(32);
  await db.batch([
    db
      .prepare('INSERT INTO lists (id, owner_hash, created_at, updated_at) VALUES (?1, ?2, ?3, ?3)')
      .bind(id, await sha256Hex(key), now),
    db.prepare(UPSERT).bind(id, payload(wishes)),
  ]);
  return { id, key };
}

export async function ownerHash(db: D1Database, id: string): Promise<string | null> {
  return db.prepare('SELECT owner_hash FROM lists WHERE id = ?1').bind(id).first<string>('owner_hash');
}

/**
 * Makes the shared list match the app. Wishes keep their reservation across edits,
 * because they are matched on the app's id. Returns the ids that are reserved.
 */
export async function replaceWishes(db: D1Database, id: string, wishes: WishInput[], now: number) {
  const data = payload(wishes);
  const results = await db.batch<{ id: string }>([
    db.prepare(PRUNE).bind(id, data),
    db.prepare(UPSERT).bind(id, data),
    db.prepare(TOUCH).bind(id, now),
    db.prepare(RESERVED).bind(id),
  ]);
  return results[3].results.map((r) => r.id);
}

/** The ids that are reserved — never who reserved them. */
export async function reservedIds(db: D1Database, id: string, now: number) {
  const results = await db.batch<{ id: string }>([db.prepare(TOUCH).bind(id, now), db.prepare(RESERVED).bind(id)]);
  return results[1].results.map((r) => r.id);
}

export async function deleteList(db: D1Database, id: string) {
  await db.batch([
    db.prepare('DELETE FROM wishes WHERE list_id = ?1').bind(id),
    db.prepare('DELETE FROM lists WHERE id = ?1').bind(id),
  ]);
}

/** The list's wishes in the app's order, or null when the list doesn't exist. */
export async function listWishes(db: D1Database, id: string): Promise<WishRow[] | null> {
  const [list, wishes] = await db.batch([
    db.prepare('SELECT 1 AS found FROM lists WHERE id = ?1').bind(id),
    db
      .prepare(
        `SELECT id, name, size, note, link, priority, used_ok, reserved_at, reserver_hash
         FROM wishes WHERE list_id = ?1 ORDER BY position`,
      )
      .bind(id),
  ]);
  return list.results.length ? (wishes.results as unknown as WishRow[]) : null;
}

export async function reserve(
  db: D1Database,
  listId: string,
  wishId: string,
  reserverHash: string,
  now: number,
): Promise<'reserved' | 'taken' | 'gone'> {
  const res = await db
    .prepare(
      `UPDATE wishes SET reserved_at = ?4, reserver_hash = ?3
       WHERE list_id = ?1 AND id = ?2 AND reserved_at IS NULL`,
    )
    .bind(listId, wishId, reserverHash, now)
    .run();
  if (res.meta.changes > 0) return 'reserved';
  const holder = await db
    .prepare('SELECT reserver_hash FROM wishes WHERE list_id = ?1 AND id = ?2')
    .bind(listId, wishId)
    .first<{ reserver_hash: string | null }>();
  if (!holder) return 'gone';
  return holder.reserver_hash === reserverHash ? 'reserved' : 'taken';
}

/** Only the browser that reserved a wish can release it. */
export async function release(db: D1Database, listId: string, wishId: string, reserverHash: string) {
  const res = await db
    .prepare(
      `UPDATE wishes SET reserved_at = NULL, reserver_hash = NULL
       WHERE list_id = ?1 AND id = ?2 AND reserver_hash = ?3`,
    )
    .bind(listId, wishId, reserverHash)
    .run();
  return res.meta.changes > 0;
}

/** Deletes lists the app hasn't synced or checked since `cutoff`. */
export async function deleteStaleLists(db: D1Database, cutoff: number) {
  const [, lists] = await db.batch([
    db.prepare('DELETE FROM wishes WHERE list_id IN (SELECT id FROM lists WHERE updated_at < ?1)').bind(cutoff),
    db.prepare('DELETE FROM lists WHERE updated_at < ?1').bind(cutoff),
  ]);
  return lists.meta.changes;
}
