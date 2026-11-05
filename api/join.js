import { db, norm, send, fail, userFrom, getRoom, handler } from './_lib/logic.js';

const MAX_PLAYERS = 300;

/** ลงทะเบียนหรือแก้ข้อมูลของตัวเอง (เฉพาะช่วงเปิดรับลงทะเบียน) */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const b = req.body || {};
  const empLabel = String(b.emp_id || '').trim();
  const key = norm(empLabel);
  const nick = String(b.nick || '').trim();
  const giftNo = String(b.gift_no || '').trim();
  const price = Number(b.price);
  const prompt = String(b.prompt || '').trim();

  if (!key || key.length > 20 || !/^[0-9a-z._-]+$/.test(key)) return fail(res, 400, 'bad_emp');
  if (!nick || nick.length > 24) return fail(res, 400, 'bad_nick');
  if (!giftNo || giftNo.length > 8 || !/^[0-9A-Za-z-]+$/.test(giftNo)) return fail(res, 400, 'bad_gift_no');
  if (!Number.isFinite(price) || price < 0 || price > 1000000) return fail(res, 400, 'bad_price');
  if (prompt.length < 8 || prompt.length > 400) return fail(res, 400, 'bad_prompt');

  const uid = await userFrom(req);
  if (!uid) return fail(res, 401, 'no_session');
  const room = await getRoom(b.room);
  if (!room) return fail(res, 404, 'room_not_found');
  if (room.phase !== 'register') return fail(res, 403, 'closed');

  const sb = db();
  const allowed = await sb.from('allowed_ids').select('emp_id', { count: 'exact', head: true }).eq('room_id', room.id);
  if ((allowed.count || 0) > 0) {
    const { data: ok } = await sb.from('allowed_ids').select('emp_id').eq('room_id', room.id).eq('emp_id', key).maybeSingle();
    if (!ok) return fail(res, 403, 'not_allowed');
  }

  const { data: row } = await sb.from('players').select('emp_id,user_id').eq('room_id', room.id).eq('emp_id', key).maybeSingle();
  if (row && row.user_id && row.user_id !== uid) return fail(res, 409, 'bound');

  const { data: other } = await sb.from('players').select('emp_id').eq('room_id', room.id).eq('user_id', uid).neq('emp_id', key).maybeSingle();
  if (other) return fail(res, 409, 'device_has_other');

  if (!row) {
    const n = await sb.from('players').select('emp_id', { count: 'exact', head: true }).eq('room_id', room.id);
    if ((n.count || 0) >= MAX_PLAYERS) return fail(res, 403, 'room_full');
  }

  const { data: dup } = await sb.from('players').select('emp_id').eq('room_id', room.id)
    .ilike('gift_no', giftNo.replace(/[%_\\]/g, '\\$&')).neq('emp_id', key).maybeSingle();
  if (dup) return fail(res, 409, 'gift_taken');

  const { error } = await sb.from('players').upsert(
    { room_id: room.id, emp_id: key, emp_label: empLabel, user_id: uid, nick, gift_no: giftNo, price: Math.round(price), prompt },
    { onConflict: 'room_id,emp_id' },
  );
  if (error) {
    if (error.code === '23505') {
      return fail(res, 409, String(error.message || '').includes('players_room_gift_uq') ? 'gift_taken' : 'device_has_other');
    }
    console.error(error);
    return fail(res, 500, 'server_error');
  }
  return send(res, 200, { ok: true });
});
