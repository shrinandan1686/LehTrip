// Edge middleware — runs before every request.
// Protects tracker/budget pages and all API write operations.
// GET endpoints stay public so the itinerary page can read booking/tracker data.

import { getCookie, verifySession } from './_auth.js';

const PROTECTED_PAGES  = new Set(['/tracker', '/tracker.html', '/leh-budget', '/leh-budget.html']);
const WRITE_METHODS    = new Set(['POST', 'PUT', 'DELETE']);

export async function onRequest({ request, env, next }) {
  const url    = new URL(request.url);
  const path   = url.pathname;
  const method = request.method;

  const isProtectedPage = PROTECTED_PAGES.has(path);
  const isWriteApi = path.startsWith('/api/')
    && WRITE_METHODS.has(method)
    && path !== '/api/login'    // login endpoint must stay open
    && path !== '/api/logout';  // logout must stay open to clear the cookie

  if (!isProtectedPage && !isWriteApi) return next();

  const token = getCookie(request, 'leh_session');
  const user  = await verifySession(token, env.SESSION_SECRET || '');

  if (user) return next();

  // Not authenticated
  if (isWriteApi) {
    return Response.json({ error: 'Unauthorized — please log in at /login' }, { status: 401 });
  }

  // Redirect page requests to login, preserving the intended destination
  const loginUrl = new URL('/login', url.origin);
  loginUrl.searchParams.set('next', path);
  return Response.redirect(loginUrl.toString(), 302);
}
