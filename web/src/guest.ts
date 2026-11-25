import { LIST_ID, newSecret, sha256Hex } from './crypto';
import { esc, ICON_CHECK, ICON_GIFT, page } from './html';
import { cookie, html, HttpError, readBody } from './http';
import { listWishes, release, reserve, type WishRow } from './lists';

/** Random per-browser id, so a guest can undo their own reservation. Nothing else. */
const GUEST_COOKIE = 'bk_g';
const GUEST_VALUE = /^[A-Za-z0-9_-]{22}$/;

const TITLE = 'Ønskeliste til babyen';
const DESCRIPTION = 'Se hva vi trenger, og reserver det du vil gi – så blir ingenting kjøpt to ganger.';

const ITEM_MESSAGES: Record<string, { text: string; tone: 'ok' | 'warn' }> = {
  reserved: { text: 'Takk! Den er reservert på deg. Foreldrene ser at den er tatt, men ikke av hvem.', tone: 'ok' },
  released: { text: 'Reservasjonen er fjernet, så andre kan ta den.', tone: 'ok' },
  taken: { text: 'Noen andre rakk å reservere denne først.', tone: 'warn' },
  notmine: { text: 'Denne er reservert fra en annen nettleser, så den kan bare angres der.', tone: 'warn' },
};

const PAGE_MESSAGES: Record<string, string> = {
  gone: 'Det ønsket er ikke lenger på lista.',
  limited: 'Mange forsøk på kort tid. Vent litt, og prøv igjen.',
};

/** GET /l/:id shows a shared list; POST /l/:id/reserve reserves or releases a wish. */
export async function handleGuest(request: Request, env: Env, url: URL): Promise<Response> {
  const m = url.pathname.match(/^\/l\/([^/]+?)(\/reserve)?\/?$/);
  const id = m?.[1].toLowerCase();
  if (!m || !id || !LIST_ID.test(id)) return missing(url);

  if (m[2]) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
    return reserveAction(request, env, url, id);
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }
  return showList(request, env, url, id);
}

async function showList(request: Request, env: Env, url: URL, id: string): Promise<Response> {
  const wishes = await listWishes(env.DB, id);
  if (!wishes) return missing(url);

  const guest = cookie(request, GUEST_COOKIE);
  const mine = guest && GUEST_VALUE.test(guest) ? await sha256Hex(guest) : null;
  const message = url.searchParams.get('m') ?? '';
  const target = url.searchParams.get('w');

  const isTaken = (w: WishRow) => w.reserved_at !== null && w.reserver_hash !== mine;
  const open = wishes.filter((w) => !isTaken(w));
  const taken = wishes.filter(isTaken);
  const card = (w: WishRow) => wishCard(id, w, mine, w.id === target ? ITEM_MESSAGES[message] : undefined);

  const lead = !wishes.length
    ? '<p class="empty">Det er ingen ønsker på lista akkurat nå. Ta gjerne en titt igjen senere.</p>'
    : !open.length
      ? '<p class="empty">Alt på lista er reservert. Tusen takk!</p>'
      : `<ul class="wishes">${open.map(card).join('')}</ul>`;

  const body = `<main class="list">
  <section class="list-hero">
    <div class="gift">${ICON_GIFT}</div>
    <h1>${TITLE}</h1>
    <p>Her er det vi faktisk trenger. Reserver det du vil gi, så unngår vi at noe blir kjøpt to ganger.</p>
  </section>
  ${PAGE_MESSAGES[message] ? `<p class="flash warn" role="status">${PAGE_MESSAGES[message]}</p>` : ''}
  ${lead}
  ${taken.length ? `<h2 class="list-section">Allerede reservert</h2><ul class="wishes">${taken.map(card).join('')}</ul>` : ''}
  <p class="list-how">Reservasjonen huskes i denne nettleseren, så du kan angre senere. Foreldrene ser at noe er reservert, men ikke hvem som har reservert det.</p>
  <footer class="list-foot">Laget med <a href="/">BabyKlar</a> · <a href="/personvern">Personvern</a></footer>
</main>`;

  return html(page({ title: TITLE, description: DESCRIPTION, origin: url.origin, body }));
}

function wishCard(listId: string, w: WishRow, mine: string | null, message?: { text: string; tone: string }): string {
  const reserved = w.reserved_at !== null;
  const byMe = reserved && mine !== null && w.reserver_hash === mine;
  const meta = [
    w.size ? `<span>str. ${esc(w.size)}</span>` : '',
    w.used_ok ? '<span class="pill">Brukt er helt greit</span>' : '',
    w.priority === 'high' ? '<span class="pill warm">Trengs snart</span>' : '',
  ].join('');

  const action = byMe
    ? `<p class="status mine">${ICON_CHECK} Du har reservert denne</p>${button(listId, w.id, 'release', 'Angre', 'btn ghost small')}`
    : reserved
      ? `<p class="status">${ICON_CHECK} Reservert</p>`
      : button(listId, w.id, 'reserve', 'Reserver', 'btn');

  return `<li class="wish${reserved && !byMe ? ' taken' : ''}${byMe ? ' mine' : ''}" id="w-${esc(w.id)}">
  <div class="wish-text">
    <h3>${esc(w.name)}</h3>
    ${meta ? `<div class="meta">${meta}</div>` : ''}
    ${w.note ? `<p class="note">${esc(w.note)}</p>` : ''}
    ${w.link ? `<a class="ext" href="${esc(w.link)}" target="_blank" rel="noopener noreferrer nofollow ugc">Se eksempel</a>` : ''}
    ${message ? `<p class="flash ${message.tone}" role="status">${message.text}</p>` : ''}
  </div>
  <div class="wish-action">${action}</div>
</li>`;
}

function button(listId: string, wishId: string, action: 'reserve' | 'release', label: string, cls: string): string {
  return `<form method="post" action="/l/${listId}/reserve">
    <input type="hidden" name="wish" value="${esc(wishId)}">
    <button class="${cls}" name="action" value="${action}">${label}</button>
  </form>`;
}

async function reserveAction(request: Request, env: Env, url: URL, listId: string): Promise<Response> {
  if (!sameOrigin(request, url)) return new Response('Forbidden', { status: 403 });

  const back = (m: string, wishId?: string, headers: Headers = new Headers()) => {
    const query = new URLSearchParams(wishId ? { m, w: wishId } : { m });
    const hash = wishId ? `#w-${encodeURIComponent(wishId)}` : '';
    headers.set('Location', `${url.origin}/l/${listId}?${query}${hash}`);
    return new Response(null, { status: 303, headers });
  };

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (!(await env.GUEST_LIMITER.limit({ key: ip })).success) return back('limited');

  let form: URLSearchParams;
  try {
    form = new URLSearchParams(await readBody(request, 4096));
  } catch (err) {
    if (err instanceof HttpError) return new Response('Bad Request', { status: 400 });
    throw err;
  }
  const wishId = form.get('wish') ?? '';
  const action = form.get('action');
  if (!/^[\w.:-]{1,64}$/.test(wishId) || (action !== 'reserve' && action !== 'release')) {
    return new Response('Bad Request', { status: 400 });
  }

  const headers = new Headers();
  let guest = cookie(request, GUEST_COOKIE);
  if (!guest || !GUEST_VALUE.test(guest)) {
    guest = newSecret(16);
    headers.append('Set-Cookie', `${GUEST_COOKIE}=${guest}; Path=/l/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
  }
  const hash = await sha256Hex(guest);

  if (action === 'reserve') {
    const result = await reserve(env.DB, listId, wishId, hash, Date.now());
    return result === 'gone' ? back('gone', undefined, headers) : back(result, wishId, headers);
  }
  const released = await release(env.DB, listId, wishId, hash);
  return back(released ? 'released' : 'notmine', wishId, headers);
}

/** Blocks other sites from posting reservations on a guest's behalf. */
function sameOrigin(request: Request, url: URL): boolean {
  const site = request.headers.get('Sec-Fetch-Site');
  if (site) return site === 'same-origin';
  const origin = request.headers.get('Origin');
  return !origin || origin === url.origin;
}

function missing(url: URL): Response {
  const body = `<main class="list">
  <section class="list-hero">
    <div class="gift">${ICON_GIFT}</div>
    <h1>Fant ikke ønskelisten</h1>
    <p>Kanskje foreldrene har sluttet å dele den, eller så mangler det noe i lenken. Spør den som sendte deg lenken om en ny.</p>
    <p><a class="btn ghost" href="/">Les om BabyKlar</a></p>
  </section>
</main>`;
  return html(page({ title: 'Fant ikke ønskelisten', description: DESCRIPTION, origin: url.origin, body }), 404);
}
