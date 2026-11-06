import { db, fail, getRoom, handler } from './_lib/logic.js';

/** ข้อมูลสาธารณะของห้อง (ต้องรู้รหัสห้อง): ชื่องาน รายชื่อ และผลหลังจับฉลาก
 *  ชื่อผู้ให้ของขวัญจะส่งออกเฉพาะกล่องที่เปิดแล้ว ไม่ส่งรหัสลับผู้จัดหรือเนื้อหาของขวัญ */
export default handler(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'method');
  const room = await getRoom(req.query.code);
  if (!room) return fail(res, 404, 'not_found');
  const sb = db();
  const [pl, rs] = await Promise.all([
    sb.from('players').select('id,nick,gift_no,user_id,created_at').eq('room_id', room.id).order('created_at'),
    room.phase === 'drawn' ? sb.from('results').select('receiver_id,giver_id,opened_at').eq('room_id', room.id) : Promise.resolve({ data: [] }),
  ]);
  if (pl.error || rs.error) return fail(res, 500, 'server_error');
  res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
  res.status(200).json({
    id: room.id, title: room.title, phase: room.phase, number_mode: room.number_mode || 'running', drawn_at: room.drawn_at,
    players: pl.data.map((p) => ({ id: p.id, nick: p.nick, no: p.gift_no, free: !p.user_id })),
    results: (rs.data || []).map((r) => ({ to: r.receiver_id, from: r.opened_at ? r.giver_id : null, opened: !!r.opened_at })),
  });
});
