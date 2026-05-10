// POST /api/entries   — create a new expense entry
// DELETE /api/entries — clear all entries (reset)

export async function onRequestPost({ request, env }) {
  try {
    const { dayId, entry, entries } = await request.json();
    const payload = Array.isArray(entries) ? entries : (entry ? [entry] : []);
    if (!dayId) throw new Error('Missing dayId');
    if (!payload.length) throw new Error('Missing entry payload');

    const VALID_CATS = ['fuel','food','stay','act','toll','misc'];
    const VALID_WHO  = ['shrinandan','shubhashree','ss',''];
    const VALID_PAY  = ['cc','upi','cash',''];

    function sanitiseRow(row) {
      const amount = Math.max(0, parseFloat(row.amount) || 0);
      return {
        id:        String(row.id),
        desc:      String(row.desc || '').slice(0, 500),
        cat:       VALID_CATS.includes(row.cat) ? row.cat : 'misc',
        who:       VALID_WHO.includes(row.who)  ? row.who : '',
        paid_using:VALID_PAY.includes(row.paid_using) ? row.paid_using : '',
        amount,
      };
    }

    const stmt = env.DB.prepare(
      'INSERT INTO entries (id, day_id, description, category, who, paid_using, amount) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    if (payload.length === 1) {
      const row = sanitiseRow(payload[0]);
      await stmt.bind(row.id, dayId, row.desc, row.cat, row.who, row.paid_using, row.amount).run();
    } else {
      const batch = payload.map(raw => {
        const row = sanitiseRow(raw);
        return stmt.bind(row.id, dayId, row.desc, row.cat, row.who, row.paid_using, row.amount);
      });
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
