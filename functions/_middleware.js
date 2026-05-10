// Edge middleware — runs before every request.
// All pages require a valid session; unauthenticated visitors are redirected to /login.
// Static assets (/js/, /icon*, manifest, sw) and the login page itself stay open.
// All API write operations also require auth (401 if missing).
// API read endpoints stay public (no auth required).

import { getCookie, verifySession } from './_auth.js';

const WRITE_METHODS  = new Set(['POST', 'PUT', 'DELETE']);

export async function onRequest({ request, env, next }) {
  const url    = new URL(request.url);
  const path   = url.pathname;
  const method = request.method;

  // Always open: login page and static assets
  if (path === '/login' || path === '/login.html') return next();
  if (
    path === '/sw.js' ||
    path === '/manifest.json' ||
    path.startsWith('/js/') ||
    path.startsWith('/icon')
  ) return next();

  const isApi      = path.startsWith('/api/');
  const isWriteApi = isApi && WRITE_METHODS.has(method)
    && path !== '/api/login'    // login endpoint must stay open
    && path !== '/api/logout';  // logout must stay open to clear the cookie

  // API reads are always public (tracker data visible to app JS)
  if (isApi && !isWriteApi) return next();

  // Everything else (pages + write APIs) requires a valid session
  const token = getCookie(request, 'leh_session');
  const user  = await verifySession(token, env.SESSION_SECRET || '');

  if (user) return next();

  // Unauthenticated write API → 401
  if (isWriteApi) {
    return Response.json({ error: 'Unauthorized — please log in' }, { status: 401 });
  }

  // Unauthenticated page navigation → redirect to /login, preserving destination
  const loginUrl = new URL('/login', url.origin);
  loginUrl.searchParams.set('next', path + url.search);
  return Response.redirect(loginUrl.toString(), 302);
}
