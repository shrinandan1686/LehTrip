// GET /api/tracker — load full state (all entries + notes)
export async function onRequestGet({ env }) {
  try {
    const [entriesResult, notesResult] = await Promise.all([
      env.DB.prepare(
        'SELECT id, day_id, description, category, who, paid_using, amount FROM entries ORDER BY created_at ASC'
      ).all(),
      env.DB.prepare('SELECT day_id, content FROM notes').all(),
    ]);

    const state = { entries: {}, notes: {} };

    for (const row of entriesResult.results) {
      if (!state.entries[row.day_id]) state.entries[row.day_id] = [];
      state.entries[row.day_id].push({
        id:         row.id,
        desc:       row.description,
        cat:        row.category,
        who:        row.who,
        paid_using: row.paid_using || '',
        amount:     row.amount === 0 ? '' : row.amount,
      });
    }

    for (const row of notesResult.results) {
      state.notes[row.day_id] = row.content;
    }

    return Response.json(state);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
