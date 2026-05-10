// PUT /api/wellness/:dayId — upsert wellness data for a day
export async function onRequestPut({ request, env, params }) {
  try {
    const { spo2, water, headache, diamox } = await request.json();
    const { dayId } = params;

    await env.DB.prepare(`
      INSERT INTO wellness (day_id, spo2, water, headache, diamox, updated_at)
      VALUES (?, ?, ?, ?, ?, unixepoch())
      ON CONFLICT(day_id) DO UPDATE SET
        spo2 = excluded.spo2,
        water = excluded.water,
        headache = excluded.headache,
        diamox = excluded.diamox,
        updated_at = unixepoch()
    `).bind(
      dayId,
      spo2    || '',
      water   || '',
      parseInt(headache) || 0,
      diamox ? 1 : 0
    ).run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
