// Edge middleware — runs before every request.
// Protects API write operations; pages are public (auth handled client-side via modal).
// GET endpoints stay public so the itinerary page can read booking/tracker data.

import { getCookie, verifySession } from './_auth.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE']);

export async function onRequest({ request, env, next }) {
  const url    = new URL(request.url);
  const path   = url.pathname;
  const method = request.method;

  const isWriteApi = path.startsWith('/api/')
    && WRITE_METHODS.has(method)
    && path !== '/api/login'    // login must stay open
    && path !== '/api/logout';  // logout must stay open to clear the cookie

  if (!isWriteApi) return next();

  const token = getCookie(request, 'leh_session');
  const user  = await verifySession(token, env.SESSION_SECRET || '');

  if (user) return next();

  return Response.json({ error: 'Unauthorized — please log in' }, { status: 401 });
}
