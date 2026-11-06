import { createClient } from '@supabase/supabase-js';
import { randomInt, randomBytes, createHash, timingSafeEqual } from 'node:crypto';

let client = null;
export function db() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('missing_env');
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();

export function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
export const fail = (res, status, error) => send(res, status, { error });

/** สลับแบบ Sattolo: ได้วงเดียวทั้งหมด จึงไม่มีใครได้ของตัวเอง */
export function cyclicPerm(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = randomInt(0, i); // 0..i-1
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const ICONS = ['cup', 'book', 'phones', 'plant', 'candle', 'snack', 'bag', 'toy', 'box', 'mystery', 'shirt', 'socks', 'watch', 'bottle', 'camera', 'gamepad', 'lamp', 'wallet', 'perfume', 'umbrella', 'pen', 'candy', 'teapot', 'cake', 'soap', 'glasses'];

/** ผู้เล่น (ของขวัญ) ของเครื่องนี้ในห้อง หรือ null */
export async function memberOf(roomId, uid) {
  if (!uid) return null;
  const { data } = await db().from('players').select('id,nick').eq('room_id', roomId).eq('user_id', uid).maybeSingle();
  return data || null;
}

/** จับฉลากแบบวงเดียว: ล็อกห้องก่อน แล้วเขียนผล ถ้าเขียนไม่สำเร็จจะย้อนกลับ */
export async function runDraw(room) {
  const sb = db(), rid = room.id;
  if (room.phase !== 'register') return { error: 'already_drawn', status: 409 };
  const { data: players, error } = await sb.from('players').select('id,gift_no,gift_text,unspecified,icon').eq('room_id', rid).order('gift_no');
  if (error) return { error: 'server_error', status: 500 };
  if (players.length < 2) return { error: 'too_few', status: 400 };
  const perm = cyclicPerm(players.length);
  const rows = players.map((p, i) => {
    const g = players[perm[i]];
    return { room_id: rid, receiver_id: p.id, giver_id: g.id, gift_no: g.gift_no, gift_text: g.gift_text, unspecified: g.unspecified, icon: g.icon };
  });
  const lock = await sb.from('rooms').update({ phase: 'drawn', drawn_at: new Date().toISOString() }).eq('id', rid).eq('phase', 'register').select('id');
  if (lock.error || !lock.data || !lock.data.length) return { error: 'already_drawn', status: 409 };
  const ins = await sb.from('results').insert(rows);
  if (ins.error) {
    await sb.from('results').delete().eq('room_id', rid);
    await sb.from('rooms').update({ phase: 'register', drawn_at: null }).eq('id', rid);
    return { error: 'insert_failed', status: 500 };
  }
  return { ok: true, count: rows.length };
}

/* ---------- ห้อง ---------- */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // ตัดตัวที่สับสน (0 O 1 I)
export function genCode(n = 6) {
  let s = '';
  for (let i = 0; i < n; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}
export const genKey = () => randomBytes(24).toString('base64url');
export const sha = (s) => createHash('sha256').update(String(s)).digest('hex');

export function ipHash(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ip = fwd || (req.socket && req.socket.remoteAddress) || '?';
  return sha('giftcard|' + ip).slice(0, 32);
}

/** หาห้องจากรหัส (ตัวพิมพ์เล็กใหญ่ได้) คืน null ถ้าไม่มีหรือหมดอายุแล้ว */
export async function getRoom(code) {
  const c = String(code || '').trim().toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(c)) return null;
  const { data } = await db().from('rooms').select('*').eq('id', c).gt('expires_at', new Date().toISOString()).maybeSingle();
  return data || null;
}

/** ตรวจรหัสลับผู้จัดห้อง (เก็บแฮชไว้ในฐานข้อมูล) */
export function isHost(req, room) {
  const given = String(req.headers['x-admin-key'] || '');
  if (!given || !room || !room.admin_hash) return false;
  const a = Buffer.from(sha(given));
  const b = Buffer.from(String(room.admin_hash));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** ตรวจ JWT ของผู้เล่น (Supabase anonymous session) แล้วคืน user id */
export async function userFrom(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  const { data, error } = await db().auth.getUser(token);
  if (error || !data || !data.user) return null;
  return data.user.id;
}

export function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (e) {
      if (e && e.message === 'missing_env') return fail(res, 500, 'missing_env');
      console.error(e);
      return fail(res, 500, 'server_error');
    }
  };
}

/** เลขของขวัญที่กรอกเอง (โหมด manual) ต้องเป็นจำนวนเต็ม 1-9999 */
export function parseNo(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 9999 ? n : null;
}
/** หาคนที่ใช้ชื่อนี้อยู่ในห้อง (ไม่สนตัวพิมพ์เล็กใหญ่) */
export async function findByNick(roomId, nick) {
  const { data } = await db().from('players').select('id,gift_no,user_id,nick').eq('room_id', roomId).ilike('nick', nick.replace(/[%_\\]/g, '\\$&')).maybeSingle();
  return data || null;
}
