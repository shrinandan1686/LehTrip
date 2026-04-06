// POST /api/entries   — create a new expense entry
// DELETE /api/entries — clear all entries (reset)

export async function onRequestPost({ request, env }) {
  try {
    const { dayId, entry, entries } = await request.json();
    const payload = Array.isArray(entries) ? entries : (entry ? [entry] : []);
    if (!dayId) throw new Error('Missing dayId');
    if (!payload.length) throw new Error('Missing entry payload');

    const stmt = env.DB.prepare(
      'INSERT INTO entries (id, day_id, description, category, who, amount) VALUES (?, ?, ?, ?, ?, ?)'
    );

    if (payload.length === 1) {
      const row = payload[0];
      await stmt.bind(
        String(row.id),
        dayId,
        row.desc || '',
        row.cat || 'food',
        row.who || 'ss',
        parseFloat(row.amount) || 0,
      ).run();
    } else {
      const batch = payload.map(row => stmt.bind(
        String(row.id),
        dayId,
        row.desc || '',
        row.cat || 'food',
        row.who || 'ss',
        parseFloat(row.amount) || 0,
      ));
      await env.DB.batch(batch);
    }

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
