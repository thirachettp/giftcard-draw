/* แผงผู้จัด: ตั้งค่าห้อง + จัดการรายชื่อ (โหลดเฉพาะเมื่อมีลิงก์ผู้จัดของห้องนี้) */
(function () {
'use strict';
var G = window.GD, el = G.el, toast = G.toast;
var $ = function (s) { return document.querySelector(s); };
var HP = window.HostPanel = { D: null, ok: false };
var CODE = '', KEY = '', ctx = {}, showGift = false, armed = {}, busy = false;
try { showGift = localStorage.getItem('gc-showgift') === '1'; } catch (e) {}
HP.isShowGift = function () { return showGift; };

async function call(action, body) {
  try {
    var r = await fetch('/api/host/' + action, { method: 'POST', headers: { 'content-type': 'application/json', 'x-admin-key': KEY }, body: JSON.stringify(Object.assign({ room: CODE }, body || {})) });
    var j = {}; try { j = await r.json(); } catch (e) {}
    j.status = r.status; return j;
  } catch (e) { return { status: 0, error: 'network' }; }
}
HP.call = call;
HP.init = function (c) { ctx = c; CODE = c.code; KEY = c.key; };
HP.adminLink = function () { return location.origin + '/host/' + CODE + '#k=' + KEY; };
HP.load = async function () {
  var r = await call('state');
  if (r.status === 200) { HP.D = r; HP.ok = true; }
  return r;
};
async function load() { if (ctx.onChange) await ctx.onChange(); else await HP.load(); renderTable(); }
var nickOf = function (id) { var p = HP.D.players.find(function (x) { return x.id === id; }); return p ? p.nick : '-'; };
function arm(btn, k, label, confirmLabel, fn) {
  if (!armed[k]) { btn.textContent = confirmLabel; armed[k] = setTimeout(function () { armed[k] = 0; btn.textContent = label; renderTable(); }, 3200); return; }
  clearTimeout(armed[k]); armed[k] = 0; btn.textContent = label; fn();
}
async function copy(text, ok) {
  try { await navigator.clipboard.writeText(text); toast(ok); }
  catch (e) { window.prompt('คัดลอกลิงก์นี้', text); }
}
HP.copy = copy;
function sheet(title) {
  var ov = el('div', 'hsheet'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', title);
  var hd = el('div', 'hh'), x = el('button', 'btn ghost small', 'ปิด'); x.type = 'button';
  hd.append(el('h2', 'h2', title), x);
  var body = el('div', 'hb'); ov.append(hd, body);
  document.body.append(ov); document.body.style.overflow = 'hidden';
  function close() { ov.remove(); document.body.style.overflow = ''; if (ov._onclose) ov._onclose(); }
  x.addEventListener('click', close);
  ov.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  return { ov: ov, body: body, close: close };
}

/* ---------- ตั้งค่าห้อง ---------- */
HP.openSettings = function () {
  var s = sheet('ตั้งค่าห้อง'), b = s.body, D = HP.D, room = D.room, drawn = room.phase === 'drawn';
  if (ctx.isNew) {
    var sv = el('div', 'savebox'); sv.append(el('p', null, 'เก็บลิงก์ผู้จัดไว้ก่อน: ลิงก์นี้คือกุญแจคุมห้อง ไม่มีบัญชีให้กู้คืน ถ้าทำหายจะแก้ไขห้องไม่ได้'));
    var sb = el('button', 'btn small', 'คัดลอกลิงก์ผู้จัด'); sb.type = 'button'; sb.addEventListener('click', function () { copy(HP.adminLink(), 'คัดลอกลิงก์ผู้จัดแล้ว เก็บไว้ให้ดี'); });
    sv.append(sb); b.append(sv);
  }
  var tb = el('div', 'titlebox'), ti = el('input'); ti.type = 'text'; ti.maxLength = 60; ti.value = room.title; ti.setAttribute('aria-label', 'ชื่องาน');
  var ts = el('button', 'btn small', 'บันทึกชื่องาน'); ts.type = 'button';
  ts.addEventListener('click', async function () { var r = await call('settings', { title: ti.value }); toast(r.status === 200 ? 'บันทึกแล้ว' : 'บันทึกไม่สำเร็จ'); await load(); });
  tb.append(ti, ts); b.append(el('div', 'lbl', 'ชื่องาน'), tb);
  if (!drawn) {
    var rm = el('div', 'lbl', 'ตอนเฉลยแล้ว'), sel = el('select'); sel.setAttribute('aria-label', 'โหมดเฉลย');
    [['names', 'เห็นแค่ชื่อ (ใครได้ของใคร)'], ['gifts', 'เห็นของขวัญด้วย (ของที่คนอื่นจับได้คืออะไร)']].forEach(function (o) { var op = el('option', null, o[1]); op.value = o[0]; if ((room.reveal_mode || 'names') === o[0]) op.selected = true; sel.append(op); });
    sel.addEventListener('change', async function () { var r = await call('settings', { reveal_mode: sel.value }); toast(r.status === 200 ? 'บันทึกโหมดเฉลยแล้ว' : 'บันทึกไม่สำเร็จ'); await load(); });
    sel.style.cssText = 'width:100%;margin-bottom:16px'; b.append(rm, sel);
  } else b.append(el('p', 'hintx', 'โหมดเฉลย: ' + ((room.reveal_mode || 'names') === 'gifts' ? 'เห็นของขวัญด้วย' : 'เห็นแค่ชื่อ')));
  var row = el('div', 'admin-row');
  function btn(label, fn, cls) { var x = el('button', 'btn ' + (cls || 'ghost'), label); x.type = 'button'; x.addEventListener('click', function () { fn(x); }); row.append(x); return x; }
  btn('คัดลอกลิงก์ผู้จัด (เก็บไว้ให้ดี)', function () { copy(HP.adminLink(), 'คัดลอกลิงก์ผู้จัดแล้ว เก็บไว้ให้ดี'); });
  btn('คัดลอกลิงก์เข้าห้อง', function () { copy(location.origin + '/r/' + CODE, 'คัดลอกลิงก์ห้องแล้ว'); });
  if (drawn) {
    btn('เล่นอนิเมชันอีกครั้ง', function () { s.close(); if (ctx.replay) ctx.replay(); });
    btn('ดาวน์โหลดผล (CSV)', csv);
    btn('รีเซ็ตรอบ', function (x) {
      arm(x, 'round', 'รีเซ็ตรอบ', 'กดอีกครั้งเพื่อล้างผลจับฉลาก', async function () {
        var r = await call('reset-round'); toast(r.status === 200 ? 'ล้างผลแล้ว เปิดรับลงทะเบียนอีกครั้ง' : 'ล้างผลไม่สำเร็จ'); s.close(); await load();
      });
    });
  }
  b.append(row);
  b.append(el('p', 'hintx', 'ห้องนี้จะถูกลบอัตโนมัติ (รวมข้อมูลทุกคน) ในวันที่ ' + new Date(room.expires_at).toLocaleDateString('th-TH', { dateStyle: 'long' })));
  var dr = el('div', 'btnrow'); dr.style.marginTop = '8px';
  var del = el('button', 'btn ghost small', 'ลบห้องนี้ถาวร'); del.type = 'button';
  del.addEventListener('click', function () {
    arm(del, 'delroom', 'ลบห้องนี้ถาวร', 'กดอีกครั้งเพื่อลบทุกอย่างถาวร', async function () {
      var r = await call('delete-room');
      if (r.status === 200) { try { localStorage.removeItem('gc-host-' + CODE); localStorage.setItem('gc-rooms', JSON.stringify(JSON.parse(localStorage.getItem('gc-rooms') || '[]').filter(function (x) { return x.code !== CODE; }))); } catch (e) {} location.href = '/'; }
      else toast('ลบไม่สำเร็จ ลองอีกครั้ง');
    });
  });
  dr.append(del); b.append(dr);
};
function csvCell(v) { v = String(v == null ? '' : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function csv() {
  var D = HP.D, resBy = {}; D.results.forEach(function (r) { resBy[r.receiver_id] = r; });
  var lines = [['ชื่อ', 'เบอร์ของขวัญที่นำมา', 'ของขวัญที่นำมา', 'ได้เบอร์', 'ได้ของขวัญของ', 'เปิดกล่อง']];
  D.players.forEach(function (p) { var r = resBy[p.id]; lines.push([p.nick, p.gift_no, p.unspecified ? 'ไม่ระบุ' : p.gift_text, r ? r.gift_no : '', r ? nickOf(r.giver_id) : '', r && r.opened_at ? 'ใช่' : 'ไม่']); });
  var text = '﻿' + lines.map(function (l) { return l.map(csvCell).join(','); }).join('\r\n');
  var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' })); a.download = 'giftcard-' + CODE + '.csv';
  document.body.append(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
}

/* ---------- จัดการรายชื่อ ---------- */
var mgr = null;
HP.openManage = function () {
  mgr = sheet('จัดการรายชื่อและของขวัญ'); mgr.ov._onclose = function () { mgr = null; };
  mgr.body.innerHTML =
    '<div class="admin-row" style="align-items:center"><div class="field srch" style="flex:1;min-width:200px;margin:0"><label class="sr" for="giftQ">ค้นหา</label><input type="text" id="giftQ" placeholder="ค้นหาชื่อ เบอร์ ผู้ให้ หรือผู้จับได้" autocomplete="off"></div>' +
    '<button type="button" class="btn ghost" id="aShowGift" aria-pressed="false">แสดงของขวัญ</button><button type="button" class="btn ghost" id="aAddOpen">เพิ่มของขวัญ</button></div>' +
    '<form id="addForm" class="panel" autocomplete="off" hidden style="margin:12px 0"><p class="hintx" style="margin:0">เพิ่มของขวัญแทนคนที่ยังไม่ได้ลงทะเบียน (เครื่องจะยังไม่ผูก เจ้าของเข้าห้องแล้วเลือกชื่อนี้เพื่อรับสิทธิ์ได้)</p>' +
    '<div class="row2"><div class="field"><label class="lbl" for="addNick">ชื่อ</label><input type="text" id="addNick" maxlength="24"></div><div class="field"><label class="lbl" for="addGift">ของขวัญคืออะไร</label><input type="text" id="addGift" maxlength="200"></div></div>' +
    '<div class="field" id="addNoWrap"><label class="lbl" for="addNo">เบอร์ของขวัญ (เว้นว่าง = ต่อเลขอัตโนมัติ)</label><input type="text" inputmode="numeric" id="addNo" maxlength="4" style="max-width:8rem"></div>' +
    '<p class="hintx" style="margin:0">เว้นช่องของขวัญว่างไว้ = กล่องปริศนา ?</p><p class="ferr" id="addErr" role="alert"></p>' +
    '<div class="btnrow"><button class="btn" type="submit" id="addSubmit">เพิ่ม</button><button class="btn ghost" type="button" id="addCancel">ปิด</button></div></form>' +
    '<div class="tablewrap"><table><thead id="aHead"></thead><tbody id="aBody"></tbody></table></div>' +
    '<p class="hintx" style="margin-top:10px">ปลดเครื่อง คือปลดการผูกชื่อกับเครื่องเดิม ให้เจ้าของเลือกชื่อตัวเองเข้าใหม่ได้ (ใช้เมื่อเปลี่ยนเครื่องหรือล้างเบราว์เซอร์)</p>';
  $('#aShowGift').addEventListener('click', toggleGift);
  $('#aAddOpen').addEventListener('click', function () { var f = $('#addForm'); f.hidden = !f.hidden; if (!f.hidden) $('#addNick').focus(); });
  $('#addCancel').addEventListener('click', function () { $('#addForm').hidden = true; });
  $('#giftQ').addEventListener('input', renderTable);
  $('#addForm').addEventListener('submit', addSubmit);
  syncShowBtn(); renderTable();
};
function syncShowBtn() { var b = $('#aShowGift'); if (!b) return; b.textContent = showGift ? 'ซ่อนของขวัญ' : 'แสดงของขวัญ'; b.setAttribute('aria-pressed', String(showGift)); }
function toggleGift() { HP.setShowGift(!showGift); }
HP.setShowGift = function (v) { showGift = !!v; try { localStorage.setItem('gc-showgift', showGift ? '1' : '0'); } catch (e) {} syncShowBtn(); renderTable(); if (ctx.onChange) ctx.onChange(true); };
async function addSubmit(e) {
  e.preventDefault();
  var G = window.GD;
  var nick = $('#addNick').value.trim(), gift = $('#addGift').value.trim(), un = !gift, er = $('#addErr');
  er.textContent = '';
  if (!nick) { er.textContent = 'ใส่ชื่อก่อน'; return; }
  if (gift && gift.length < 2) { er.textContent = 'พิมพ์อย่างน้อย 2 ตัวอักษร หรือเว้นว่างให้เป็นกล่องปริศนา'; return; }
  var body = { nick: nick, gift_text: gift, unspecified: un, icon: G.guessIcon(gift, un) }, nv = $('#addNo').value.trim();
  if (nv) { if (!/^\d{1,4}$/.test(nv) || +nv < 1) { er.textContent = 'เบอร์ต้องเป็นเลข 1–9999'; return; } body.gift_no = +nv; }
  $('#addSubmit').disabled = true;
  var r = await call('add', body);
  $('#addSubmit').disabled = false;
  if (r.status === 200) { $('#addNick').value = ''; $('#addGift').value = ''; $('#addNo').value = ''; toast('เพิ่มของขวัญของ ' + nick + ' แล้ว'); load(); return; }
  er.textContent = r.error === 'no_taken' ? 'เบอร์นี้มีคนใช้แล้ว' : r.error === 'nick_taken' ? 'ชื่อนี้มีอยู่แล้วในห้อง' : r.error === 'already_drawn' ? 'จับฉลากแล้ว เพิ่มไม่ได้' : r.error === 'room_full' ? 'ห้องเต็มแล้ว' : 'เพิ่มไม่สำเร็จ ลองอีกครั้ง';
}
HP.refreshTable = function () { if (mgr) renderTable(); };
function render() { renderTable(); }
function renderTable() {
  if (!mgr || !HP.D) return;
  var ae = document.activeElement;
  if (ae && ae.tagName === 'INPUT' && ae.closest && ae.closest('#aBody')) return;
  var D = HP.D, room = D.room, drawn = room.phase === 'drawn', players = D.players.slice();
  var resBy = {}; D.results.forEach(function (r) { resBy[r.receiver_id] = r; });
  var hd = $('#aHead'); hd.replaceChildren();
  var tr = el('tr');
  ['ชื่อ', 'เบอร์', '__gift', 'เครื่อง'].concat(drawn ? ['ได้ของขวัญของ', 'ใครจับได้ของฉัน', 'เปิดแล้ว'] : []).concat(['จัดการ']).forEach(function (t) {
    var th = el('th');
    if (t === '__gift') {
      th.append(document.createTextNode('ของขวัญ '));
      var tb = el('button', 'mini plain', showGift ? 'ซ่อน' : 'แสดง'); tb.type = 'button'; tb.setAttribute('aria-pressed', String(showGift)); tb.setAttribute('aria-label', showGift ? 'ซ่อนของขวัญ' : 'แสดงของขวัญ');
      tb.addEventListener('click', toggleGift); th.append(tb);
    } else th.textContent = t;
    tr.append(th);
  });
  hd.append(tr);
  var bd = $('#aBody'); bd.replaceChildren();
  var q = $('#giftQ').value.trim().toLowerCase();
  var qn = q.replace(/^#/, '');
  players = players.filter(function (p) {
    if (!q) return true;
    var res = resBy[p.id], mine = D.results.filter(function (x) { return x.giver_id === p.id; })[0];
    var hay = [p.nick, String(p.gift_no), res ? nickOf(res.giver_id) : '', mine ? nickOf(mine.receiver_id) : '', showGift ? (p.gift_text || '') : ''].join('\n').toLowerCase();
    return hay.indexOf(q) >= 0 || (qn && String(p.gift_no) === qn);
  });
  if (!players.length) { var e = el('tr'), c = el('td', 'muted', D.players.length ? 'ไม่พบชื่อนี้' : 'ยังไม่มีใครลงทะเบียน'); c.colSpan = 9; e.append(c); bd.append(e); }
  players.forEach(function (p) {
    var res = resBy[p.id], row = el('tr');
    row.append(el('td', null, p.nick));
    var ntd = el('td', 'num'), nspan = el('span', null, '#' + p.gift_no); ntd.append(nspan);
    if (!drawn) {
      var eb = el('button', 'mini plain', 'แก้'); eb.type = 'button'; eb.setAttribute('aria-label', 'แก้เบอร์ของ ' + p.nick); eb.style.marginLeft = '6px';
      eb.addEventListener('click', function () {
        var inp = el('input'); inp.type = 'text'; inp.inputMode = 'numeric'; inp.maxLength = 4; inp.value = p.gift_no; inp.style.cssText = 'width:4.5rem;padding:4px 8px';
        var ok = el('button', 'mini', 'บันทึก'); ok.type = 'button'; var er = el('div', 'ferr'); er.setAttribute('role', 'alert');
        ntd.replaceChildren(inp, ok, er); inp.focus(); inp.select();
        async function save() {
          var v = inp.value.trim();
          if (!/^\d{1,4}$/.test(v) || +v < 1) { er.textContent = 'ใส่เลข 1–9999'; return; }
          if (+v === p.gift_no) { inp.blur(); render(); return; }
          ok.disabled = true; var r = await call('set-number', { id: p.id, gift_no: +v });
          if (r.status === 200) { inp.blur(); toast('เปลี่ยนเบอร์ของ ' + p.nick + ' เป็น #' + v); load(); }
          else { ok.disabled = false; er.textContent = r.error === 'no_taken' ? 'เบอร์นี้มีคนใช้แล้ว' : 'ไม่สำเร็จ ลองอีกครั้ง'; }
        }
        ok.addEventListener('click', save); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); save(); } else if (e.key === 'Escape') { inp.blur(); render(); } });
      });
      ntd.append(eb);
    }
    row.append(ntd);
    var gc = el('td');
    if (showGift) {
      var gw = el('div'); gw.style.cssText = 'display:flex;align-items:center;gap:10px';
      var th = el('span', 'thumb'); th.innerHTML = G.iconSvg(p.icon, 30); th.style.cssText = 'width:40px;height:40px;border-radius:10px;background:#241a38;display:grid;place-items:center;flex:none';
      gw.append(th, el('span', null, p.unspecified ? 'ไม่ระบุ (กล่องปริศนา)' : p.gift_text)); gc.append(gw);
    } else gc.append(el('span', 'muted', '••••••'));
    row.append(gc);
    row.append(el('td', p.bound ? 'ok' : 'warn', p.bound ? 'ผูกแล้ว' : 'ยังไม่ผูก รอเจ้าของเข้า'));
    if (drawn) row.append(el('td', null, res ? nickOf(res.giver_id) : '-'), el('td', null, (function () { var m = D.results.filter(function (x) { return x.giver_id === p.id; })[0]; return m ? nickOf(m.receiver_id) : '-'; })()), el('td', res && res.opened_at ? 'ok' : 'muted', res && res.opened_at ? 'เปิดแล้ว' : 'ยังไม่เปิด'));
    var act = el('td'), box = el('div', 'cell-actions');
    var rb = el('button', 'btn ghost small', 'ปลดเครื่อง'); rb.type = 'button'; rb.disabled = !p.bound;
    if (armed['ub' + p.id]) rb.textContent = 'กดอีกครั้งเพื่อยืนยัน';
    rb.addEventListener('click', function () {
      arm(rb, 'ub' + p.id, 'ปลดเครื่อง', 'กดอีกครั้งเพื่อยืนยัน', async function () {
        var r = await call('unbind', { id: p.id });
        toast(r.status === 200 ? 'ปลดเครื่องของ ' + p.nick + ' แล้ว ให้เจ้าของเลือกชื่อเข้าใหม่ได้' : 'ปลดเครื่องไม่สำเร็จ'); load();
      });
    });
    box.append(rb);
    if (drawn && res && res.opened_at) {
      var ub = el('button', 'btn ghost small', 'ให้เปิดใหม่'); ub.type = 'button';
      if (armed['un' + p.id]) ub.textContent = 'กดอีกครั้งเพื่อยืนยัน';
      ub.addEventListener('click', function () {
        arm(ub, 'un' + p.id, 'ให้เปิดใหม่', 'กดอีกครั้งเพื่อยืนยัน', async function () {
          var r = await call('unbind', { id: p.id, unopen: true });
          toast(r.status === 200 ? 'ให้ ' + p.nick + ' เปิดกล่องใหม่ได้ (ปลดเครื่องด้วย)' : 'ไม่สำเร็จ'); load();
        });
      });
      box.append(ub);
    }
    if (!drawn) {
      var db = el('button', 'btn ghost small', 'ลบ'); db.type = 'button';
      if (armed['rm' + p.id]) db.textContent = 'กดอีกครั้งเพื่อลบ';
      db.addEventListener('click', function () {
        arm(db, 'rm' + p.id, 'ลบ', 'กดอีกครั้งเพื่อลบ', async function () {
          var r = await call('remove', { id: p.id });
          toast(r.status === 200 ? 'ลบออกจากห้องแล้ว' : 'ลบไม่สำเร็จ'); load();
        });
      });
      box.append(db);
    }
    act.append(box); row.append(act); bd.append(row);
  });

}
})();
