// POST /api/login  — validate passphrase, set session cookie
// GET  /api/login  — already authenticated? redirect to tracker

import { getCookie, makeSession, verifySession } from '../_auth.js';

export async function onRequestGet({ request, env }) {
  const token = getCookie(request, 'leh_session');
  const user  = await verifySession(token, env.SESSION_SECRET || '');
  if (user) return Response.redirect(new URL('/tracker', request.url).toString(), 302);
  return new Response(null, { status: 404 }); // let Pages serve /login.html
}

export async function onRequestPost({ request, env }) {
  try {
    const { passphrase } = await request.json();
    const AUTH_PASS = env.AUTH_PASS || '';

    if (!AUTH_PASS) {
      return Response.json({ error: 'Auth not configured — set AUTH_PASS in Cloudflare dashboard' }, { status: 503 });
    }
    if (!passphrase || passphrase !== AUTH_PASS) {
      return Response.json({ error: 'Wrong passphrase' }, { status: 401 });
    }

    const secret = env.SESSION_SECRET || '';
    const token  = await makeSession('owner', secret);
    const maxAge = 30 * 24 * 60 * 60; // 30 days
    return Response.json({ ok: true }, {
      headers: {
        'Set-Cookie': `leh_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}; Path=/`
      }
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
