import { handleApi } from './api';
import { handleGuest } from './guest';
import { json, withSecurityHeaders } from './http';
import { deleteStaleLists } from './lists';

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }

    try {
      if (url.pathname.startsWith('/api/')) return withSecurityHeaders(await handleApi(request, env, url), 'list');
      if (url.pathname === '/l' || url.pathname.startsWith('/l/')) {
        return withSecurityHeaders(await handleGuest(request, env, url), 'list');
      }
      return withSecurityHeaders(await env.ASSETS.fetch(request), 'site');
    } catch (err) {
      console.error(
        JSON.stringify({
          event: 'unhandled_error',
          path: url.pathname.replace(/^\/(l|api\/lists)\/[^/]+/, '/$1/:id'),
          error: err instanceof Error ? err.message : String(err),
        }),
      );
      if (url.pathname.startsWith('/api/')) return json({ error: 'internal_error' }, 500);
      return new Response('Noe gikk galt. Prøv igjen om litt.', {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }
  },

  /** Lists the app hasn't been in touch with for a year are deleted. */
  async scheduled(_controller, env): Promise<void> {
    const deleted = await deleteStaleLists(env.DB, Date.now() - YEAR_MS);
    console.log(JSON.stringify({ event: 'stale_lists_deleted', count: deleted }));
  },
} satisfies ExportedHandler<Env>;
