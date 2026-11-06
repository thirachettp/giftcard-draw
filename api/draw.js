import { send, fail, userFrom, getRoom, memberOf, isHost, runDraw, handler } from './_lib/logic.js';

/** เริ่มจับฉลาก: ใครก็ได้ที่อยู่ในห้อง (หรือผู้จัด) กดได้ ทำได้ครั้งเดียวต่อรอบ */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const room = await getRoom((req.body || {}).room);
  if (!room) return fail(res, 404, 'room_not_found');
  if (!isHost(req, room)) {
    const uid = await userFrom(req);
    if (!uid) return fail(res, 401, 'no_session');
    if (!(await memberOf(room.id, uid))) return fail(res, 403, 'not_member');
  }
  const r = await runDraw(room);
  if (!r.ok) return fail(res, r.status, r.error);
  return send(res, 200, r);
});
