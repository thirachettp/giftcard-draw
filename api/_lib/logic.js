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

/** ระดับการ์ดจากราคา: 0 ธรรมดา, 1 หายาก, 2 ตำนาน (ต้องตรงกับ makeTier ใน public/common.js) */
export function makeTier(prices) {
  const set = new Set(prices.map((p) => Number(p) || 0));
  const list = [...set].sort((a, b) => a - b);
  const k = list.length;
  return (price) => {
    if (k < 2) return 0;
    const pos = list.indexOf(Number(price) || 0) / (k - 1);
    return pos >= 1 ? 2 : pos >= 0.4 ? 1 : 0;
  };
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
