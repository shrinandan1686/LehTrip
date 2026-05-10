// GET /api/me — lightweight session check used by AuthState.init()

import { getCookie, verifySession } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'leh_session');
  const user  = await verifySession(token, env.SESSION_SECRET || '');
  if (user) return Response.json({ ok: true, user });
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
