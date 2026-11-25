import { LIST_ID, matchesHash } from './crypto';
import { CORS, HttpError, json, readJson } from './http';
import { createList, deleteList, ownerHash, parseWishes, replaceWishes, reservedIds } from './lists';

const MAX_BODY = 256 * 1024;

/**
 * The app's API for its own shared list:
 *   POST   /api/lists       create, returns { id, key, url, reserved }
 *   GET    /api/lists/:id   reserved wish ids
 *   PUT    /api/lists/:id   replace the wishes, returns reserved wish ids
 *   DELETE /api/lists/:id   stop sharing
 * Everything except POST needs `Authorization: Bearer <key>`.
 */
export async function handleApi(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  try {
    if (url.pathname === '/api/lists') {
      if (request.method !== 'POST') throw new HttpError(405, 'method_not_allowed');
      return await create(request, env, url);
    }

    const id = url.pathname.match(/^\/api\/lists\/([^/]+)$/)?.[1];
    if (!id || !LIST_ID.test(id)) throw new HttpError(404, 'not_found');
    if (!['GET', 'PUT', 'DELETE'].includes(request.method)) throw new HttpError(405, 'method_not_allowed');
    await authorize(request, env, id);

    const now = Date.now();
    if (request.method === 'GET') return json({ reserved: await reservedIds(env.DB, id, now) });
    if (request.method === 'PUT') {
      const wishes = parseWishes(await readJson(request, MAX_BODY));
      return json({ reserved: await replaceWishes(env.DB, id, wishes, now) });
    }
    await deleteList(env.DB, id);
    console.log(JSON.stringify({ event: 'list_deleted' }));
    return new Response(null, { status: 204, headers: CORS });
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.code }, err.status);
    throw err;
  }
}

async function create(request: Request, env: Env, url: URL): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!(await env.CREATE_LIMITER.limit({ key: ip })).success) throw new HttpError(429, 'rate_limited');
  const wishes = parseWishes(await readJson(request, MAX_BODY));
  const { id, key } = await createList(env.DB, wishes, Date.now());
  console.log(JSON.stringify({ event: 'list_created', wishes: wishes.length }));
  return json({ id, key, url: `${url.origin}/l/${id}`, reserved: [] }, 201);
}

async function authorize(request: Request, env: Env, id: string): Promise<void> {
  if (!(await env.OWNER_LIMITER.limit({ key: id })).success) throw new HttpError(429, 'rate_limited');
  const header = request.headers.get('Authorization') ?? '';
  const key = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const hash = await ownerHash(env.DB, id);
  if (!hash) throw new HttpError(404, 'not_found');
  if (!key || !(await matchesHash(key, hash))) throw new HttpError(403, 'forbidden');
}
