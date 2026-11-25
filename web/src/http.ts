export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

/**
 * The API is called from the app (no CORS) and from the app's web build on another
 * origin. Owner calls use a bearer key, never cookies, so allowing any origin is safe.
 */
export const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400',
};

export function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { ...CORS, 'Cache-Control': 'no-store' } });
}

export function html(body: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', ...headers } });
}

/** Reads at most `max` bytes, so an oversized body can't exhaust memory. */
export async function readBody(request: Request, max: number): Promise<string> {
  const declared = Number(request.headers.get('Content-Length') ?? 0);
  if (declared > max) throw new HttpError(413, 'too_large');
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(413, 'too_large');
    }
    chunks.push(value);
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(all);
}

export async function readJson(request: Request, max: number): Promise<unknown> {
  const text = await readBody(request, max);
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'invalid_json');
  }
}

export function cookie(request: Request, name: string): string | null {
  for (const part of (request.headers.get('Cookie') ?? '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

const CSP = [
  "default-src 'none'",
  "img-src 'self'",
  "style-src 'self'",
  "form-action 'self'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ');

/**
 * `list` pages hold a private link: never cached, never indexed, and the link is
 * not leaked as a referrer when a guest follows a shop link.
 */
export function withSecurityHeaders(res: Response, kind: 'site' | 'list'): Response {
  const out = new Response(res.body, res);
  const h = out.headers;
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if ((h.get('Content-Type') ?? '').includes('text/html')) {
    h.set('Content-Security-Policy', CSP);
    h.set('X-Frame-Options', 'DENY');
  }
  if (kind === 'list') {
    h.set('Referrer-Policy', 'same-origin');
    h.set('X-Robots-Tag', 'noindex, nofollow');
    h.set('Cache-Control', 'no-store');
  } else {
    h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  return out;
}
