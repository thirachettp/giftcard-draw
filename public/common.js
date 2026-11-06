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
    mystery: '<path d="M18 8l11 6-11 6-11-6Z" fill="#e6566d"/><path d="M7 14l11 6v12L7 26Z" fill="#a21b33"/><path d="M29 14 18 20v12l11-6Z" fill="#74102a"/><text x="18" y="29" text-anchor="middle" font-family="Chonburi,serif" font-size="14" fill="#ffe9b8">?</text>'
  };
  var KEYWORDS = [
    ['cup', /แก้ว|มัค|ถ้วย|กาแฟ|ชา|cup|mug|tumbler|กระบอก/i],
    ['book', /หนังสือ|สมุด|ปากกา|book|note/i],
    ['phones', /หูฟัง|ลำโพง|phone|ear|speaker/i],
    ['plant', /ต้นไม้|กระถาง|ดอกไม้|plant|flower/i],
    ['candle', /เทียน|น้ำหอม|candle|aroma|สบู่/i],
    ['snack', /ขนม|คุกกี้|ช็อก|อาหาร|snack|cookie|chocolate|เค้ก|ผลไม้/i],
    ['bag', /กระเป๋า|ผ้า|เสื้อ|ถุง|bag|shirt|towel/i],
    ['toy', /ตุ๊กตา|ของเล่น|toy|doll|เกม/i]
  ];
  function guessIcon(text, unspecified) {
    if (unspecified) return 'mystery';
    for (var i = 0; i < KEYWORDS.length; i++) if (KEYWORDS[i][1].test(text || '')) return KEYWORDS[i][0];
    return 'box';
  }
  function iconSvg(key, size) {
    size = size || 36;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 36 36" aria-hidden="true">' + (ICON_SVG[key] || ICON_SVG.box) + '</svg>';
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
        row.append(no, yes); card.append(row);
        no.focus();
      }
      draw();
    });
  }

  window.GD = { el: el, toast: toast, iconSvg: iconSvg, guessIcon: guessIcon, confirmFlow: confirmFlow };
})();
