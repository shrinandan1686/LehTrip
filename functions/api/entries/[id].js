// PUT    /api/entries/:id — update an entry
// DELETE /api/entries/:id — delete an entry

export async function onRequestPut({ request, env, params }) {
  try {
    const { entry } = await request.json();
    const { id } = params;

    await env.DB.prepare(
      'UPDATE entries SET description=?, category=?, who=?, paid_using=?, amount=? WHERE id=?'
    ).bind(
      entry.desc   || '',
      entry.cat    || 'food',
      entry.who    || '',
      entry.paid_using || '',
      parseFloat(entry.amount) || 0,
      id,
    ).run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestDelete({ env, params }) {
  try {
    const { id } = params;
    await env.DB.prepare('DELETE FROM entries WHERE id=?').bind(id).run();
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
