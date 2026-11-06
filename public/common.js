/* ตัวช่วยที่ใช้ร่วมกันทั้งหน้าผู้เล่นและหน้าผู้จัด */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var toastT = 0;
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* ภาพของขวัญแบบแบน (flat) ไม่ใช้ AI จึงไม่มีค่าใช้จ่ายและโหลดเร็ว */
  var ICON_SVG = {
    cup: '<path d="M7 11h22v14c0 4-5 7-11 7S7 29 7 25Z" fill="#fbf3df"/><ellipse cx="18" cy="11" rx="11" ry="3" fill="#6b4a2a"/><path d="M29 15c6 0 7 7 1 9" fill="none" stroke="#e9dcc0" stroke-width="2.5" stroke-linecap="round"/>',
    book: '<rect x="7" y="6" width="22" height="26" rx="2" fill="#3d8fd0"/><rect x="7" y="6" width="5" height="26" fill="#2a6aa0"/><rect x="15" y="12" width="10" height="3" rx="1" fill="#e9f3ff"/><rect x="15" y="18" width="8" height="3" rx="1" fill="#e9f3ff"/>',
    phones: '<path d="M8 22v-4c0-6 4-10 10-10s10 4 10 10v4" fill="none" stroke="#f6effc" stroke-width="3" stroke-linecap="round"/><rect x="5" y="20" width="8" height="12" rx="4" fill="#f6effc"/><rect x="23" y="20" width="8" height="12" rx="4" fill="#f6effc"/><rect x="7" y="23" width="2.5" height="6" rx="1.2" fill="#b3203a"/><rect x="26.5" y="23" width="2.5" height="6" rx="1.2" fill="#b3203a"/>',
    plant: '<path d="M18 24c-6 0-9-5-9-11 6 0 9 4 9 11ZM18 24c6 0 9-5 9-11-6 0-9 4-9 11Z" fill="#2f9e7a"/><path d="M10 24h16l-2 9H12Z" fill="#d9703a"/>',
    candle: '<rect x="12" y="15" width="12" height="17" rx="2" fill="#fbf3df"/><path d="M18 5c4 4 3 8 0 9-3-1-4-5 0-9Z" fill="#f4c24d"/><rect x="17.2" y="13" width="1.6" height="4" fill="#3a2614"/>',
    snack: '<path d="M8 8h20l-2 24H10Z" fill="#e0a63a"/><rect x="8" y="8" width="20" height="5" fill="#b3203a"/><circle cx="18" cy="21" r="4" fill="#fbf3df"/>',
    bag: '<path d="M8 13h20l2 19H6Z" fill="#7a5cd6"/><path d="M13 13v-2c0-3 2-5 5-5s5 2 5 5v2" fill="none" stroke="#c9b8ff" stroke-width="2.5" stroke-linecap="round"/>',
    toy: '<circle cx="18" cy="21" r="10" fill="#f4c24d"/><circle cx="14" cy="19" r="1.8" fill="#3a2614"/><circle cx="22" cy="19" r="1.8" fill="#3a2614"/><path d="M13 25q5 4 10 0" fill="none" stroke="#3a2614" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="11" r="4" fill="#f4c24d"/><circle cx="26" cy="11" r="4" fill="#f4c24d"/>',
    box: '<rect x="6" y="14" width="24" height="18" rx="2" fill="#c8334b"/><rect x="16" y="14" width="4" height="18" fill="#ffe9b8"/><rect x="6" y="19" width="24" height="3" fill="#ffe9b8"/><path d="M18 14c-4-8-10-6-7-3 2 2 6 3 7 3Zm0 0c4-8 10-6 7-3-2 2-6 3-7 3Z" fill="#ffe9b8"/>',
    mystery: '<path d="M18 8l11 6-11 6-11-6Z" fill="#e6566d"/><path d="M7 14l11 6v12L7 26Z" fill="#a21b33"/><path d="M29 14 18 20v12l11-6Z" fill="#74102a"/><text x="18" y="29" text-anchor="middle" font-family="Chonburi,serif" font-size="14" fill="#ffe9b8">?</text>',
    shirt: '<path d="M12 6 5 11l3 5 3-2v16h14V14l3 2 3-5-7-5c-1 3-3 4-6 4s-5-1-6-4Z" fill="#3d8fd0"/>',
    socks: '<path d="M10 5h9v14l8 5c3 2 1 8-3 8-4 0-10-4-14-9Z" fill="#e6566d"/><rect x="10" y="5" width="9" height="5" fill="#fbf3df"/>',
    watch: '<rect x="13" y="3" width="10" height="7" fill="#7c6a96"/><rect x="13" y="26" width="10" height="7" fill="#7c6a96"/><circle cx="18" cy="18" r="10" fill="#f4c24d"/><circle cx="18" cy="18" r="7.5" fill="#fbf3df"/><path d="M18 12v6l4 2" stroke="#3a2614" stroke-width="2" fill="none" stroke-linecap="round"/>',
    bottle: '<rect x="14" y="3" width="8" height="5" rx="1.5" fill="#7a5cd6"/><path d="M14 8h8v4c3 2 4 4 4 7v11c0 2-1 3-3 3H13c-2 0-3-1-3-3V19c0-3 1-5 4-7Z" fill="#46d6b0"/><rect x="11" y="20" width="14" height="6" fill="#fbf3df" opacity=".8"/>',
    camera: '<rect x="4" y="11" width="28" height="19" rx="3" fill="#7c6a96"/><path d="M12 11l2-4h8l2 4Z" fill="#7c6a96"/><circle cx="18" cy="20" r="6.5" fill="#241a38"/><circle cx="18" cy="20" r="4" fill="#3d8fd0"/><circle cx="27" cy="15" r="1.5" fill="#f4c24d"/>',
    gamepad: '<path d="M9 11h18c4 0 7 4 7 10s-2 8-4 8-3-2-5-4H11c-2 2-3 4-5 4s-4-2-4-8 3-10 7-10Z" fill="#7a5cd6"/><path d="M10 17v6M7 20h6" stroke="#fbf3df" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="18" r="1.8" fill="#f4c24d"/><circle cx="28" cy="21" r="1.8" fill="#e6566d"/>',
    lamp: '<path d="M11 4h14l5 14H6Z" fill="#f4c24d"/><rect x="17" y="18" width="2" height="10" fill="#b0a3c9"/><rect x="11" y="28" width="14" height="4" rx="2" fill="#7c6a96"/>',
    wallet: '<rect x="4" y="9" width="28" height="21" rx="4" fill="#8a5a34"/><rect x="21" y="16" width="11" height="8" rx="3" fill="#6b4423"/><circle cx="25" cy="20" r="1.6" fill="#f4c24d"/>',
    perfume: '<rect x="14" y="3" width="8" height="6" rx="1.5" fill="#f4c24d"/><rect x="16" y="9" width="4" height="4" fill="#b0a3c9"/><rect x="8" y="13" width="20" height="20" rx="5" fill="#ff8a9a"/><rect x="12" y="19" width="12" height="8" rx="2" fill="#fbf3df" opacity=".85"/>',
    umbrella: '<path d="M3 18C3 9 10 4 18 4s15 5 15 14c-2-2-4-2-5.200 0-1.200-2-3.800-2-5.200 0-1.400-2-3.600-2-5.200 0-1.200-2-3.800-2-5.200 0C7 16 5 16 3 18Z" fill="#e6566d"/><path d="M18 18v12c0 2 4 2 4 0" stroke="#7c6a96" stroke-width="2.4" fill="none" stroke-linecap="round"/>',
    pen: '<path d="M6 30l2-8L26 4l6 6L14 28Z" fill="#f4c24d"/><path d="M6 30l2-8 6 6Z" fill="#fbf3df"/><path d="M26 4l6 6-3 3-6-6Z" fill="#e6566d"/>',
    candy: '<circle cx="18" cy="18" r="9" fill="#e6566d"/><path d="M18 9a9 9 0 0 1 0 18" stroke="#fbf3df" stroke-width="3" fill="none"/><path d="M9 13 2 9v18l7-4ZM27 13l7-4v18l-7-4Z" fill="#f4c24d"/>',
    teapot: '<path d="M9 14h16c2 0 3 2 3 5v3c0 5-4 9-10 9s-9-4-9-9v-3c0-3 1-5 0-5Z" fill="#d9703a"/><path d="M28 17c5-1 6 5 1 7" stroke="#d9703a" stroke-width="2.4" fill="none"/><path d="M9 18 3 14" stroke="#d9703a" stroke-width="3" stroke-linecap="round"/><rect x="13" y="10" width="8" height="4" rx="2" fill="#fbf3df"/>',
    cake: '<rect x="5" y="17" width="26" height="14" rx="3" fill="#fbf3df"/><path d="M5 20c4 4 4-2 8 2s4-2 8 2 4-2 10 0v-5H5Z" fill="#ff8a9a"/><rect x="17" y="9" width="2" height="8" fill="#7c6a96"/><path d="M18 3c3 3 2 5 0 5s-3-2 0-5Z" fill="#f4c24d"/>',
    soap: '<rect x="5" y="14" width="26" height="16" rx="6" fill="#46d6b0"/><circle cx="11" cy="9" r="3" fill="#fbf3df" opacity=".8"/><circle cx="19" cy="6" r="2.2" fill="#fbf3df" opacity=".8"/><circle cx="26" cy="10" r="3.4" fill="#fbf3df" opacity=".8"/>',
    glasses: '<circle cx="10" cy="21" r="7" fill="none" stroke="#f6effc" stroke-width="3"/><circle cx="26" cy="21" r="7" fill="none" stroke="#f6effc" stroke-width="3"/><path d="M17 20c1-2 2-2 2 0M3 18l-1-4M33 18l1-4" stroke="#f6effc" stroke-width="3" stroke-linecap="round" fill="none"/>'
  };
  var KEYWORDS = [
    ['cup', /แก้ว|มัค|ถ้วย|กาแฟ|cup|mug|tumbler/i],
    ['book', /หนังสือ|สมุด|นิยาย|book|note/i],
    ['phones', /หูฟัง|ลำโพง|phone|ear|speaker/i],
    ['plant', /ต้นไม้|กระถาง|ดอกไม้|plant|flower|กระบองเพชร/i],
    ['candle', /เทียน|candle|aroma|อโรมา/i],
    ['perfume', /น้ำหอม|perfume|โคโลญ/i],
    ['soap', /สบู่|soap|แชมพู|ครีม|โลชั่น|bath/i],
    ['snack', /ขนม|คุกกี้|ช็อก|อาหาร|snack|cookie|chocolate|ผลไม้|มันฝรั่ง/i],
    ['cake', /เค้ก|cake|ขนมปัง|bakery|เบเกอรี่/i],
    ['candy', /ลูกอม|candy|ลูกกวาด|sweet/i],
    ['teapot', /ชา|กาน้ำ|tea|ใบชา/i],
    ['bottle', /ขวด|กระบอก|bottle|flask|น้ำดื่ม/i],
    ['shirt', /เสื้อ|shirt|hoodie|jacket|ผ้าพันคอ|หมวก/i],
    ['socks', /ถุงเท้า|socks|รองเท้า/i],
    ['bag', /กระเป๋าผ้า|กระเป๋า|ถุง|bag|tote|ผ้าเช็ด|towel|ผ้าห่ม/i],
    ['wallet', /กระเป๋าสตางค์|wallet|เงิน|บัตร|voucher|คูปอง|แกิฟต์การ์ด|gift card/i],
    ['watch', /นาฬิกา|watch|clock/i],
    ['camera', /กล้อง|camera|ถ่ายรูป|โพลารอยด์/i],
    ['gamepad', /เกม|game|จอย|console/i],
    ['lamp', /โคม|ไฟ|lamp|light/i],
    ['umbrella', /ร่ม|umbrella|เสื้อกันฝน/i],
    ['pen', /ปากกา|ดินสอ|pen|pencil|เครื่องเขียน/i],
    ['glasses', /แว่น|glasses/i],
    ['toy', /ตุ๊กตา|ของเล่น|toy|doll|หมี|โมเดล/i]
  ];
  var ICON_LIST = Object.keys(ICON_SVG).filter(function (k) { return k !== 'mystery'; });
  function guessIcon(text, unspecified) {
    if (unspecified) return 'mystery';
    for (var i = 0; i < KEYWORDS.length; i++) if (KEYWORDS[i][1].test(text || '')) return KEYWORDS[i][0];
    return 'box';
  }
  /* spec = "ชื่อไอคอน" หรือ "ชื่อไอคอน:เลขแบบ" เลขแบบ 0-9 ใช้เปลี่ยนสีและพลิกภาพ (ปุ่ม วาดใหม่) */
  function parseIcon(spec) {
    var m = String(spec || 'box').split(':'), v = parseInt(m[1], 10);
    return { key: ICON_SVG[m[0]] ? m[0] : 'box', v: v >= 0 && v <= 9 ? v : 0 };
  }
  function iconSvg(spec, size) {
    size = size || 36;
    var p = parseIcon(spec), st = '';
    if (p.v) st = 'style="filter:hue-rotate(' + (p.v * 41 % 360) + 'deg)' + (p.v % 2 ? ';transform:scaleX(-1)' : '') + '"';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 36 36" aria-hidden="true" ' + st + '>' + ICON_SVG[p.key] + '</svg>';
  }

  /* ถามย้ำหลายขั้น: steps = [{title, items[], note, ok, cancel, danger}] คืน Promise<boolean> */
  function confirmFlow(steps) {
    return new Promise(function (resolve) {
      var i = 0, prev = document.activeElement;
      var wrap = el('div', 'cfwrap'); wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
      var card = el('div', 'cfcard'); wrap.append(card); document.body.append(wrap);
      function finish(v) { wrap.remove(); document.removeEventListener('keydown', onKey); if (prev && prev.focus) { try { prev.focus(); } catch (e) {} } resolve(v); }
      function onKey(e) { if (e.key === 'Escape') finish(false); }
      document.addEventListener('keydown', onKey);
      function draw() {
        var s = steps[i], last = i === steps.length - 1;
        card.replaceChildren();
        var st = el('div', 'cfstep' + (last && steps.length > 1 ? ' danger' : ''));
        st.append(el('span', null, String(i + 1)), document.createTextNode(' ขั้นที่ ' + (i + 1) + ' จาก ' + steps.length));
        card.append(st, el('h2', 'cftitle', s.title));
        if (s.items && s.items.length) {
          card.append(el('p', 'cfsub', 'สิ่งที่กำลังจะเกิดขึ้น'));
          var ul = el('ul', 'cflist'); s.items.forEach(function (t) { ul.append(el('li', null, t)); }); card.append(ul);
        }
        if (s.note) card.append(el('p', 'cfnote', s.note));
        var row = el('div', 'cfrow');
        var no = el('button', 'btn ghost', s.cancel || 'ยกเลิก'); no.type = 'button'; no.addEventListener('click', function () { finish(false); });
        var yes = el('button', 'btn' + (last && steps.length > 1 ? ' danger' : ''), s.ok || (last ? 'ยืนยัน' : 'ดำเนินการต่อ')); yes.type = 'button';
        yes.addEventListener('click', function () { if (last) finish(true); else { i++; draw(); } });
        if (last && steps.length > 1) {
          /* ขั้นสุดท้าย: สลับตำแหน่งปุ่ม และหน่วงสั้นๆ กันกดรัวทะลุจากขั้นก่อนหน้า */
          row.append(yes, no);
          yes.disabled = true; setTimeout(function () { yes.disabled = false; }, 900);
        } else row.append(no, yes);
        card.append(row);
        no.focus();
      }
      draw();
    });
  }

  window.GD = { el: el, toast: toast, iconSvg: iconSvg, parseIcon: parseIcon, ICON_LIST: ICON_LIST, guessIcon: guessIcon, confirmFlow: confirmFlow };
})();
