import { db, norm, send, fail, isHost, getRoom, cyclicPerm, makeTier, handler } from '../_lib/logic.js';

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
      const [players, results, allowed] = await Promise.all([
        sb.from('players').select('emp_id,emp_label,user_id,nick,gift_no,price,prompt,created_at').eq('room_id', rid).order('created_at'),
        sb.from('results').select('receiver_emp,giver_emp,gift_no,price,tier,opened_at').eq('room_id', rid),
        sb.from('allowed_ids').select('emp_id').eq('room_id', rid),
      ]);
      if (players.error || results.error) return fail(res, 500, 'server_error');
      return send(res, 200, {
        room: { id: room.id, title: room.title, id_label: room.id_label, phase: room.phase, drawn_at: room.drawn_at, expires_at: room.expires_at },
        players: players.data.map(({ user_id, ...p }) => ({ ...p, bound: !!user_id })),
        results: results.data,
        allowed: (allowed.data || []).map((x) => x.emp_id),
      });
    }

    case 'draw': {
      if (room.phase !== 'register') return fail(res, 409, 'already_drawn');
      const { data: players, error } = await sb.from('players').select('emp_id,gift_no,price,prompt').eq('room_id', rid);
      if (error) return fail(res, 500, 'server_error');
      if (players.length < 2) return fail(res, 400, 'too_few');

      const tierOf = makeTier(players.map((p) => p.price));
      const perm = cyclicPerm(players.length);
      const rows = players.map((p, i) => {
        const g = players[perm[i]];
        return { room_id: rid, receiver_emp: p.emp_id, giver_emp: g.emp_id, gift_no: g.gift_no, price: g.price, prompt: g.prompt, tier: tierOf(g.price) };
      });

      const lock = await sb.from('rooms').update({ phase: 'drawn', drawn_at: new Date().toISOString() }).eq('id', rid).eq('phase', 'register').select('id');
      if (lock.error || !lock.data || !lock.data.length) return fail(res, 409, 'already_drawn');
      const ins = await sb.from('results').insert(rows);
      if (ins.error) {
        await sb.from('results').delete().eq('room_id', rid);
        await sb.from('rooms').update({ phase: 'register', drawn_at: null }).eq('id', rid);
        return fail(res, 500, 'insert_failed');
      }
      return send(res, 200, { ok: true, count: rows.length });
    }

    case 'reset-employee': {
      const key = norm(b.emp_id);
      if (!key) return fail(res, 400, 'bad_emp');
      const up = await sb.from('players').update({ user_id: null }).eq('room_id', rid).eq('emp_id', key).select('emp_id');
      if (up.error) return fail(res, 500, 'server_error');
      if (!up.data.length) return fail(res, 404, 'not_found');
      if (b.unopen) await sb.from('results').update({ opened_at: null }).eq('room_id', rid).eq('receiver_emp', key);
      return send(res, 200, { ok: true });
    }

    case 'remove': {
      if (room.phase !== 'register') return fail(res, 409, 'already_drawn');
      const del = await sb.from('players').delete().eq('room_id', rid).eq('emp_id', norm(b.emp_id));
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
      if (b.id_label != null) {
        const l = String(b.id_label).trim().slice(0, 20);
        if (!l) return fail(res, 400, 'bad_id_label');
        patch.id_label = l;
      }
      if (Object.keys(patch).length) await sb.from('rooms').update(patch).eq('id', rid);
      return send(res, 200, { ok: true });
    }

    case 'allowed': {
      const ids = [...new Set((Array.isArray(b.ids) ? b.ids : []).map(norm).filter((x) => x && x.length <= 20))].slice(0, 2000);
      await sb.from('allowed_ids').delete().eq('room_id', rid);
      if (ids.length) {
        const ins = await sb.from('allowed_ids').insert(ids.map((emp_id) => ({ room_id: rid, emp_id })));
        if (ins.error) return fail(res, 500, 'server_error');
      }
      return send(res, 200, { ok: true, count: ids.length });
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
