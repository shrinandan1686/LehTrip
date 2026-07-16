// Edge middleware — runs before every request.
// Pages and read APIs are always public — the trip plan is meant to be shared.
// Only write operations (POST/PUT/DELETE), aside from login/logout, require a valid session.

import { getCookie, verifySession } from './_auth.js';

const WRITE_METHODS = new Set(['POST', 'PUT', 'DELETE']);

export async function onRequest({ request, env, next }) {
  const url    = new URL(request.url);
  const path   = url.pathname;
  const method = request.method;

  const isApi      = path.startsWith('/api/');
  const isWriteApi = isApi && WRITE_METHODS.has(method)
    && path !== '/api/login'    // login endpoint must stay open
    && path !== '/api/logout';  // logout must stay open to clear the cookie

  if (!isWriteApi) return next();

  const token = getCookie(request, 'leh_session');
  const user  = await verifySession(token, env.SESSION_SECRET || '');

  if (user) return next();

  return Response.json({ error: 'Unauthorized — please log in' }, { status: 401 });
}
