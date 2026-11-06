import { db, send, fail, userFrom, getRoom, memberOf, ICONS, parseNo, findByNick, handler } from './_lib/logic.js';

const MAX_PLAYERS = 300;

/** ลงทะเบียนของขวัญ หรือแก้ข้อมูลของเครื่องนี้ (เฉพาะช่วงเปิดรับลงทะเบียน) 1 เครื่อง = 1 คน = 1 ของขวัญ */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const b = req.body || {};
  const nick = String(b.nick || '').trim();
  const unspecified = !!b.unspecified;
  const giftText = unspecified ? '' : String(b.gift_text || '').trim();
  const [iconKey, iconVar] = String(b.icon || '').split(':');
  const icon = ICONS.includes(iconKey) ? iconKey + (/^[0-9]$/.test(iconVar || '') && iconVar !== '0' ? ':' + iconVar : '') : (unspecified ? 'mystery' : 'box');
  if (!nick || nick.length > 24) return fail(res, 400, 'bad_nick');
  if (!unspecified && (giftText.length < 2 || giftText.length > 200)) return fail(res, 400, 'bad_gift');

  const uid = await userFrom(req);
  if (!uid) return fail(res, 401, 'no_session');
  const room = await getRoom(b.room);
  if (!room) return fail(res, 404, 'room_not_found');
  if (room.phase !== 'register') return fail(res, 403, 'closed');

  const sb = db();
  const manual = room.number_mode === 'manual';
  const wantNo = manual ? parseNo(b.gift_no) : null;
  if (manual && wantNo == null) return fail(res, 400, 'bad_no');
  const me = await memberOf(room.id, uid);
  const fields = { nick, gift_text: giftText, unspecified, icon };
  if (manual) fields.gift_no = wantNo;
  const clash = async (e) => {
    const m = String((e && e.message) || '');
    if (m.includes('players_room_gift_uq')) return fail(res, 409, 'no_taken');
    const o = await findByNick(room.id, nick);
    return send(res, 409, { error: 'nick_taken', existing: o ? { id: o.id, no: o.gift_no, free: !o.user_id, mine: !!me && me.id === o.id } : null });
  };

  if (me) {
    const up = await sb.from('players').update(fields).eq('id', me.id);
    if (up.error) return up.error.code === '23505' ? clash(up.error) : fail(res, 500, 'server_error');
    return send(res, 200, { ok: true, id: me.id });
  }

  const n = await sb.from('players').select('id', { count: 'exact', head: true }).eq('room_id', room.id);
  if ((n.count || 0) >= MAX_PLAYERS) return fail(res, 403, 'room_full');

  for (let i = 0; i < 6; i++) {
    const { data: last } = await sb.from('players').select('gift_no').eq('room_id', room.id).order('gift_no', { ascending: false }).limit(1).maybeSingle();
    const ins = await sb.from('players').insert({ room_id: room.id, user_id: uid, gift_no: manual ? wantNo : (last ? last.gift_no : 0) + 1, ...fields }).select('id,gift_no').single();
    if (!ins.error) return send(res, 200, { ok: true, id: ins.data.id, gift_no: ins.data.gift_no });
    const msg = String(ins.error.message || '');
    if (ins.error.code === '23505') {
      if (msg.includes('players_room_nick_uq')) return clash(ins.error);
      if (msg.includes('players_room_user_uq')) return fail(res, 409, 'device_has_other');
      if (manual) return fail(res, 409, 'no_taken');
      continue; // เลขของขวัญชนกัน ลองใหม่
    }
    console.error(ins.error);
    return fail(res, 500, 'server_error');
  }
  return fail(res, 500, 'server_error');
});
