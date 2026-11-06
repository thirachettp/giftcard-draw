import { db, send, fail, userFrom, getRoom, memberOf, isHost, handler } from './_lib/logic.js';

/** ลบของขวัญ (ทั้งของตัวเองและของคนอื่น) ทำได้เฉพาะก่อนจับฉลาก โดยผู้ที่อยู่ในห้องหรือผู้จัด */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const b = req.body || {};
  const id = String(b.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(res, 400, 'bad_id');
  const room = await getRoom(b.room);
  if (!room) return fail(res, 404, 'room_not_found');
  if (!isHost(req, room)) {
    const uid = await userFrom(req);
    if (!uid) return fail(res, 401, 'no_session');
    if (!(await memberOf(room.id, uid))) return fail(res, 403, 'not_member');
  }
  if (room.phase !== 'register') return fail(res, 403, 'closed');
  const del = await db().from('players').delete().eq('id', id).eq('room_id', room.id).select('id');
  if (del.error) return fail(res, 500, 'server_error');
  if (!del.data.length) return fail(res, 404, 'not_found');
  return send(res, 200, { ok: true });
});
