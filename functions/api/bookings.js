// GET /api/bookings — fetch all booking states
// POST /api/bookings — upsert a booking (booked flag + hotel details)

export async function onRequestGet({ env }) {
  try {
    // Ensure table exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        booked INTEGER NOT NULL DEFAULT 0,
        hotel_name TEXT NOT NULL DEFAULT '',
        map_url TEXT NOT NULL DEFAULT '',
        confirmation TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `).run();
    const { results } = await env.DB.prepare('SELECT * FROM bookings').all();
    return Response.json(results || []);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { id, booked, hotel_name, map_url, confirmation, notes } = await request.json();
    if (!id) throw new Error('Missing booking ID');

    await env.DB.prepare(`
      INSERT INTO bookings (id, booked, hotel_name, map_url, confirmation, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        booked = excluded.booked,
        hotel_name = excluded.hotel_name,
        map_url = excluded.map_url,
        confirmation = excluded.confirmation,
        notes = excluded.notes,
        updated_at = unixepoch()
    `).bind(
      String(id),
      booked ? 1 : 0,
      hotel_name || '',
      map_url || '',
      confirmation || '',
      notes || ''
    ).run();

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
