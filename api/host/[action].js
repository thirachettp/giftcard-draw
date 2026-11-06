import { db, send, fail, isHost, getRoom, runDraw, handler } from '../_lib/logic.js';

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
        room: { id: room.id, title: room.title, phase: room.phase, drawn_at: room.drawn_at, expires_at: room.expires_at },
        players: players.data.map(({ user_id, ...p }) => ({ ...p, bound: !!user_id })),
        results: results.data,
      });
    }

    case 'draw': {
      const r = await runDraw(room);
      return r.ok ? send(res, 200, r) : fail(res, r.status, r.error);
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
