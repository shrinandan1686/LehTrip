// PUT    /api/entries/:id — update an entry
// DELETE /api/entries/:id — delete an entry

const VALID_CATS = ['fuel','food','stay','act','toll','misc'];
const VALID_WHO  = ['shrinandan','shubhashree','ss',''];
const VALID_PAY  = ['cc','upi','cash',''];

export async function onRequestPut({ request, env, params }) {
  try {
    const { entry } = await request.json();
    const { id } = params;

    const desc       = String(entry.desc || '').slice(0, 500);
    const cat        = VALID_CATS.includes(entry.cat) ? entry.cat : 'misc';
    const who        = VALID_WHO.includes(entry.who)  ? entry.who : '';
    const paid_using = VALID_PAY.includes(entry.paid_using) ? entry.paid_using : '';
    const amount     = Math.max(0, parseFloat(entry.amount) || 0);

    await env.DB.prepare(
      'UPDATE entries SET description=?, category=?, who=?, paid_using=?, amount=? WHERE id=?'
    ).bind(desc, cat, who, paid_using, amount, id).run();

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
