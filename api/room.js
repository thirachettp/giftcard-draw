import { db, send, fail, getRoom, handler } from './_lib/logic.js';

/** ข้อมูลสาธารณะของห้อง (ต้องรู้รหัสห้อง) ไม่ส่งรหัสลับผู้จัดออกไป */
export default handler(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'method');
  const room = await getRoom(req.query.code);
  if (!room) return fail(res, 404, 'not_found');
  const { count } = await db().from('players').select('emp_id', { count: 'exact', head: true }).eq('room_id', room.id);
  res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
  res.status(200).json({ id: room.id, title: room.title, id_label: room.id_label, phase: room.phase, players: count || 0 });
});
