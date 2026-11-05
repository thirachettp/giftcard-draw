/* ตัวช่วยที่ใช้ร่วมกันทั้งหน้าผู้เล่นและหน้าแอดมิน */
(function () {
  'use strict';
  var TIERS = [
    { key: 'common', th: 'ธรรมดา', en: 'COMMON', hex: '#46d6b0', confetti: ['#46d6b0', '#8de9d0', '#f6effc'], n: 70 },
    { key: 'rare', th: 'หายาก', en: 'RARE', hex: '#a78bff', confetti: ['#a78bff', '#c9b8ff', '#ff6b81', '#f6effc'], n: 130 },
    { key: 'legend', th: 'ตำนาน', en: 'LEGENDARY', hex: '#f4c24d', confetti: ['#f4c24d', '#ffe08a', '#fff3c4', '#ff6b81'], n: 230 }
  ];

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function baht(n) { return '฿' + Number(n).toLocaleString('en-US'); }
  function norm(s) { return String(s == null ? '' : s).trim().toLowerCase(); }

  /* ต้องตรงกับ makeTier ใน api/_lib/logic.js */
  function makeTier(prices) {
    var set = {}, list = [];
    prices.forEach(function (p) { p = Number(p) || 0; if (!set[p]) { set[p] = 1; list.push(p); } });
    list.sort(function (a, b) { return a - b; });
    var k = list.length;
    return function (price) {
      if (k < 2) return 0;
      var pos = list.indexOf(Number(price) || 0) / (k - 1);
      return pos >= 1 ? 2 : (pos >= 0.4 ? 1 : 0);
    };
  }

  var toastT = 0;
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }

  /* items: [{no, price, prompt, mine}] ; opt.list === false แสดงเฉพาะสรุป */
  function renderPool(box, items, opt) {
    box.replaceChildren();
    var arr = items.slice().sort(function (a, b) {
      return (b.price - a.price) || String(a.no).localeCompare(String(b.no), 'en', { numeric: true });
    });
    if (!arr.length) { box.append(el('p', 'muted', 'ยังไม่มีใครลงทะเบียนของขวัญ')); return; }
    var tierOf = makeTier(arr.map(function (g) { return g.price; }));
    var head = el('div', 'pool-head');
    head.append(el('span', 'pool-total', String(arr.length)), el('span', 'muted', 'ใบ ของขวัญทั้งหมดในกล่อง'));
    box.append(head);

    var groups = {}, prices = [];
    arr.forEach(function (g) {
      var p = Number(g.price) || 0;
      if (!groups[p]) { groups[p] = 0; prices.push(p); }
      groups[p]++;
    });
    prices.sort(function (a, b) { return b - a; });
    var max = Math.max.apply(null, prices.map(function (p) { return groups[p]; }));
    var rows = el('div', 'tiers');
    prices.forEach(function (p) {
      var t = TIERS[tierOf(p)], r = el('div', 'trow');
      r.style.setProperty('--tc', t.hex);
      var lp = el('span', 'tp'); lp.append(el('i'), document.createTextNode(baht(p) + ' ขึ้นไป'));
      var bar = el('span', 'tbar'), fill = el('i'); fill.style.width = (groups[p] / max * 100) + '%'; bar.append(fill);
      r.append(lp, bar, el('span', 'tn', groups[p] + ' ใบ'));
      rows.append(r);
    });
    box.append(rows);
    if (opt && opt.list === false) return;

    var ul = el('ul', 'prizes');
    arr.forEach(function (g) {
      var t = TIERS[tierOf(g.price)], li = el('li');
      li.style.setProperty('--tc', t.hex); li.tabIndex = 0;
      li.append(el('span', 'pno', '#' + g.no));
      var meta = el('div', 'pmeta');
      meta.append(el('span', null, baht(g.price) + ' ขึ้นไป'), el('span', null, t.th));
      if (g.mine) meta.append(el('span', 'tag', 'ของขวัญของคุณ'));
      li.append(meta, el('p', 'pdesc', g.prompt || ''));
      var tog = function () { li.classList.toggle('open'); };
      li.addEventListener('click', tog);
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
      ul.append(li);
    });
    box.append(ul);
  }

  window.GD = { TIERS: TIERS, el: el, baht: baht, norm: norm, makeTier: makeTier, toast: toast, renderPool: renderPool };
})();
