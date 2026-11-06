import { db, send, fail, userFrom, getRoom, memberOf, handler } from './_lib/logic.js';

/** ผูกเครื่องนี้กับรายชื่อที่ผู้จัดปลดเครื่องไว้แล้ว (ใช้เมื่อเปลี่ยนเครื่องหรือล้างเบราว์เซอร์) */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const b = req.body || {};
  const id = String(b.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(res, 400, 'bad_id');
  const uid = await userFrom(req);
  if (!uid) return fail(res, 401, 'no_session');
  const room = await getRoom(b.room);
  if (!room) return fail(res, 404, 'room_not_found');
  if (await memberOf(room.id, uid)) return fail(res, 409, 'device_has_other');

  const up = await db().from('players').update({ user_id: uid }).eq('id', id).eq('room_id', room.id).is('user_id', null).select('id');
  if (up.error) return up.error.code === '23505' ? fail(res, 409, 'device_has_other') : fail(res, 500, 'server_error');
  if (!up.data.length) return fail(res, 409, 'not_free');
  return send(res, 200, { ok: true });
});
