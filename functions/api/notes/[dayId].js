// PUT /api/notes/:dayId — upsert a day's note

export async function onRequestPut({ request, env, params }) {
  try {
    const { content } = await request.json();
    const { dayId } = params;

    await env.DB.prepare(
      `INSERT INTO notes (day_id, content, updated_at) VALUES (?, ?, unixepoch())
       ON CONFLICT(day_id) DO UPDATE SET content=excluded.content, updated_at=unixepoch()`
    ).bind(dayId, content || '').run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
