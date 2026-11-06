import { db, fail, handler } from './_lib/logic.js';

/** จำนวนห้องที่เคยสร้างทั้งหมด (แสดงหน้าแรก) cache ที่ CDN 60 วินาที */
export default handler(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'method');
  const { data } = await db().from('app_stats').select('n').eq('key', 'rooms_created').maybeSingle();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.status(200).json({ rooms: data ? Number(data.n) : 0 });
});
