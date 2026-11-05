import { db, send, fail, handler } from '../_lib/logic.js';

/** งานประจำวันของ Vercel Cron: ลบห้องที่หมดอายุ (ลบข้อมูลผู้เล่นและผลทั้งหมดตามไปด้วย) */
export default handler(async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== 'Bearer ' + secret) return fail(res, 401, 'unauthorized');
  const sb = db();
  const now = new Date().toISOString();
  const rooms = await sb.from('rooms').delete().lt('expires_at', now).select('id');
  await sb.from('create_log').delete().lt('at', new Date(Date.now() - 24 * 3600 * 1000).toISOString());
  return send(res, 200, { ok: true, deleted_rooms: rooms.data ? rooms.data.length : 0 });
});
