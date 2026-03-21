// POST /api/entries   — create a new expense entry
// DELETE /api/entries — clear all entries (reset)

export async function onRequestPost({ request, env }) {
  try {
    const { dayId, entry } = await request.json();

    await env.DB.prepare(
      'INSERT INTO entries (id, day_id, description, category, who, amount) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      String(entry.id),
      dayId,
      entry.desc   || '',
      entry.cat    || 'food',
      entry.who    || 'ss',
      parseFloat(entry.amount) || 0,
    ).run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestDelete({ env }) {
  try {
    await env.DB.prepare('DELETE FROM entries').run();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
