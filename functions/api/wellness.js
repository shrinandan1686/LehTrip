// GET /api/wellness — load all wellness records
export async function onRequestGet({ env }) {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS wellness (
        day_id TEXT PRIMARY KEY,
        spo2 TEXT NOT NULL DEFAULT '',
        water TEXT NOT NULL DEFAULT '',
        headache INTEGER NOT NULL DEFAULT 0,
        diamox INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `).run();
    const { results } = await env.DB.prepare('SELECT * FROM wellness').all();
    return Response.json(results || []);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
