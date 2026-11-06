import { db, send, fail, isHost, getRoom, runDraw, ICONS, parseNo, handler } from '../_lib/logic.js';

/** คำสั่งของผู้จัดห้อง: ส่งรหัสห้องใน body และรหัสลับใน header x-admin-key */
export default handler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'method');
  const b = req.body || {};
  const room = await getRoom(b.room);
  if (!room) return fail(res, 404, 'room_not_found');
  if (!isHost(req, room)) {
    await new Promise((r) => setTimeout(r, 400));
    return fail(res, 401, 'bad_key');
  }
  const action = String(req.query.action || '');
  const sb = db();
  const rid = room.id;

  switch (action) {
    case 'state': {
      const [players, results] = await Promise.all([
        sb.from('players').select('id,user_id,nick,gift_no,gift_text,unspecified,icon,created_at').eq('room_id', rid).order('created_at'),
        sb.from('results').select('receiver_id,giver_id,gift_no,opened_at').eq('room_id', rid),
      ]);
      if (players.error || results.error) return fail(res, 500, 'server_error');
      return send(res, 200, {
        room: { id: room.id, title: room.title, phase: room.phase, number_mode: room.number_mode || 'running', reveal_mode: room.reveal_mode || 'names', drawn_at: room.drawn_at, expires_at: room.expires_at },
        players: players.data.map(({ user_id, ...p }) => ({ ...p, bound: !!user_id })),
        results: results.data,
      });
    }

    case 'draw': {
      const r = await runDraw(room);
      return r.ok ? send(res, 200, r) : fail(res, r.status, r.error);
    }

    case 'add': {
      if (room.phase !== 'register') return fail(res, 409, 'already_drawn');
      const nick = String(b.nick || '').trim();
      const unspecified = !!b.unspecified;
      const giftText = unspecified ? '' : String(b.gift_text || '').trim();
      const [ik, iv] = String(b.icon || '').split(':');
      const icon = ICONS.includes(ik) ? ik + (/^[1-9]$/.test(iv || '') ? ':' + iv : '') : (unspecified ? 'mystery' : 'box');
      if (!nick || nick.length > 24) return fail(res, 400, 'bad_nick');
      if (!unspecified && (giftText.length < 2 || giftText.length > 200)) return fail(res, 400, 'bad_gift');
      const n = await sb.from('players').select('id', { count: 'exact', head: true }).eq('room_id', rid);
      if ((n.count || 0) >= 300) return fail(res, 403, 'room_full');
      for (let i = 0; i < 6; i++) {
        const { data: last } = await sb.from('players').select('gift_no').eq('room_id', rid).order('gift_no', { ascending: false }).limit(1).maybeSingle();
        const ins = await sb.from('players').insert({ room_id: rid, user_id: null, nick, gift_no: (b.gift_no != null && b.gift_no !== '' && parseNo(b.gift_no)) || (last ? last.gift_no : 0) + 1, gift_text: giftText, unspecified, icon }).select('id').single();
        if (!ins.error) return send(res, 200, { ok: true, id: ins.data.id });
        if (ins.error.code === '23505') {
          if (String(ins.error.message || '').includes('players_room_nick_uq')) return fail(res, 409, 'nick_taken');
          if (b.gift_no != null && b.gift_no !== '') return fail(res, 409, 'no_taken');
          continue;
        }
        console.error(ins.error);
        return fail(res, 500, 'server_error');
      }
      return fail(res, 500, 'server_error');
    }

    case 'set-number': {
      const n = parseNo(b.gift_no);
      if (n == null) return fail(res, 400, 'bad_no');
      const id = String(b.id || '');
      const up = await sb.from('players').update({ gift_no: n }).eq('room_id', rid).eq('id', id).select('id');
      if (up.error) return up.error.code === '23505' ? fail(res, 409, 'no_taken') : fail(res, 500, 'server_error');
      if (!up.data.length) return fail(res, 404, 'not_found');
      await sb.from('results').update({ gift_no: n }).eq('room_id', rid).eq('giver_id', id);
      return send(res, 200, { ok: true });
    }

    case 'unbind': {
      const id = String(b.id || '');
      const up = await sb.from('players').update({ user_id: null }).eq('room_id', rid).eq('id', id).select('id');
      if (up.error) return fail(res, 500, 'server_error');
      if (!up.data.length) return fail(res, 404, 'not_found');
      if (b.unopen) await sb.from('results').update({ opened_at: null }).eq('room_id', rid).eq('receiver_id', id);
      return send(res, 200, { ok: true });
    }

    case 'remove': {
      if (room.phase !== 'register') return fail(res, 409, 'already_drawn');
      const del = await sb.from('players').delete().eq('room_id', rid).eq('id', String(b.id || ''));
      if (del.error) return fail(res, 500, 'server_error');
      return send(res, 200, { ok: true });
    }

    case 'reset-round': {
      await sb.from('results').delete().eq('room_id', rid);
      await sb.from('rooms').update({ phase: 'register', drawn_at: null }).eq('id', rid);
      return send(res, 200, { ok: true });
    }

    case 'settings': {
      const patch = {};
      if (b.title != null) {
        const t = String(b.title).trim().slice(0, 60);
        if (!t) return fail(res, 400, 'bad_title');
        patch.title = t;
      }
      if (b.reveal_mode != null) {
        if (room.phase === 'drawn') return fail(res, 409, 'already_drawn');
        patch.reveal_mode = b.reveal_mode === 'gifts' ? 'gifts' : 'names';
      }
      if (Object.keys(patch).length) await sb.from('rooms').update(patch).eq('id', rid);
      return send(res, 200, { ok: true });
    }

    case 'delete-room': {
      const del = await sb.from('rooms').delete().eq('id', rid);
      if (del.error) return fail(res, 500, 'server_error');
      return send(res, 200, { ok: true });
    }

    default:
      return fail(res, 404, 'unknown_action');
  }
});
