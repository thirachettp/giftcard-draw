import { db, send, fail, genCode, genKey, sha, ipHash, handler } from './_lib/logic.js';

const MAX_PER_HOUR = 5;
const MAX_ROOMS = 5000;

/** สร้างห้องใหม่ ไม่ต้องล็อกอิน รับแค่ชื่องาน คืนรหัสห้องและรหัสลับผู้จัด (แสดงครั้งเดียว) */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const title = String((req.body || {}).title || '').trim();
  if (!title || title.length > 60) return fail(res, 400, 'bad_title');

  const sb = db();
  const ip = ipHash(req);
  const since = new Date(Date.now() - 3600 * 1000).toISOString();
  const recent = await sb.from('create_log').select('ip_hash', { count: 'exact', head: true }).eq('ip_hash', ip).gt('at', since);
  if ((recent.count || 0) >= MAX_PER_HOUR) return fail(res, 429, 'rate_limited');
  const total = await sb.from('rooms').select('id', { count: 'exact', head: true });
  if ((total.count || 0) >= MAX_ROOMS) return fail(res, 503, 'full');

  for (let i = 0; i < 6; i++) {
    const code = genCode(), key = genKey();
    const ins = await sb.from('rooms').insert({ id: code, admin_hash: sha(key), title });
    if (!ins.error) {
      await sb.from('create_log').insert({ ip_hash: ip });
      await sb.rpc('bump_rooms_created');
      return send(res, 200, { code, key });
    }
    if (ins.error.code !== '23505') { console.error(ins.error); return fail(res, 500, 'server_error'); }
  }
  return fail(res, 500, 'server_error');
});
