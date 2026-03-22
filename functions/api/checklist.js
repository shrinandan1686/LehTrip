// GET /api/checklist — fetch all checklist states
// POST /api/checklist — update a specific checklist item's state

export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM checklists').all();
    return Response.json(results && Array.isArray(results) ? results : []);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { id, state } = await request.json();

    if (!id) throw new Error('Missing checklist item ID');

    // Insert or update the checkbox state (1 for checked, 0 for unchecked)
    await env.DB.prepare(
      'INSERT INTO checklists (id, state) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET state = excluded.state, updated_at = unixepoch()'
    ).bind(
      String(id),
      state ? 1 : 0
    ).run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
