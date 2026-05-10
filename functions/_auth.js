// Shared auth utilities — used by _middleware.js and api/login.js

export function getCookie(request, name) {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='));
  return match ? match.slice(name.length + 1) : null;
}

async function hmac(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

export async function makeSession(user, secret) {
  const payload = btoa(JSON.stringify({ user, iat: Date.now() }));
  const sig = await hmac(payload, secret);
  return `${payload}.${sig}`;
}

export async function verifySession(token, secret) {
  if (!token || !secret) return null;
  try {
    const dot = token.lastIndexOf('.');
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig     = token.slice(dot + 1);
    const expected = await hmac(payload, secret);
    if (expected !== sig) return null;
    const { user, iat } = JSON.parse(atob(payload));
    if (Date.now() - iat > 30 * 24 * 60 * 60 * 1000) return null; // 30-day expiry
    return user;
  } catch (_) { return null; }
}
