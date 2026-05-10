// POST /api/logout — clear the session cookie

export async function onRequestPost() {
  return Response.json({ ok: true }, {
    headers: {
      'Set-Cookie': 'leh_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    }
  });
}
