import { db, norm, send, fail, userFrom, getRoom, handler } from './_lib/logic.js';

/** เข้าห้องด้วยรหัสประจำตัว: ผูกเครื่องนี้กับรหัสที่ลงทะเบียนไว้แล้ว (ใช้ได้ทุกช่วง) */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const b = req.body || {};
  const key = norm(b.emp_id);
  if (!key || key.length > 20) return fail(res, 400, 'bad_emp');

  const uid = await userFrom(req);
  if (!uid) return fail(res, 401, 'no_session');
  const room = await getRoom(b.room);
  if (!room) return fail(res, 404, 'room_not_found');

  const sb = db();
  const { data: row } = await sb.from('players').select('emp_id,user_id').eq('room_id', room.id).eq('emp_id', key).maybeSingle();
  if (!row) return fail(res, 404, 'not_found');
  if (row.user_id && row.user_id !== uid) return fail(res, 409, 'bound');
  if (row.user_id === uid) return send(res, 200, { ok: true });

  const { data: other } = await sb.from('players').select('emp_id').eq('room_id', room.id).eq('user_id', uid).neq('emp_id', key).maybeSingle();
  if (other) return fail(res, 409, 'device_has_other');

  const { error } = await sb.from('players').update({ user_id: uid }).eq('room_id', room.id).eq('emp_id', key).is('user_id', null);
  if (error) return error.code === '23505' ? fail(res, 409, 'device_has_other') : fail(res, 500, 'server_error');
  return send(res, 200, { ok: true });
});
