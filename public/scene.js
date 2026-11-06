/* ฉากคลังสินค้าซานต้า: ชั้นวางกล่องตามจำนวนจริง สายพานส่งกล่องใหม่ และอนิเมชันรถเลื่อนแจกของขวัญ */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var COLS = ['#c8334b', '#2f9e7a', '#e0a63a', '#7a5cd6', '#d9703a', '#3d8fd0'];
  var INNER = "\n    <defs>\n      <linearGradient id=\"hbg\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\"><stop offset=\"0\" stop-color=\"#1a1230\"/><stop offset=\".6\" stop-color=\"#3a1d3f\"/><stop offset=\"1\" stop-color=\"#6b2a3a\"/></linearGradient>\n      <radialGradient id=\"hglow\" cx=\".5\" cy=\".6\" r=\".6\"><stop offset=\"0\" stop-color=\"#ffb85c\" stop-opacity=\".45\"/><stop offset=\"1\" stop-color=\"#ffb85c\" stop-opacity=\"0\"/></radialGradient>\n\n      <symbol id=\"elf\" viewBox=\"0 0 60 100\" overflow=\"visible\">\n        <path d=\"M12 36 30 2l18 34Z\" fill=\"var(--c,#2f9e7a)\"/>\n        <rect x=\"12\" y=\"32\" width=\"36\" height=\"7\" rx=\"3\" fill=\"#f6efdc\"/>\n        <circle cx=\"30\" cy=\"3\" r=\"5\" fill=\"#fff\"/>\n        <path d=\"M14 46 3 40l8 14ZM46 46l11-6-8 14Z\" fill=\"#f1c9a0\"/>\n        <circle cx=\"30\" cy=\"48\" r=\"16\" fill=\"#f1c9a0\"/>\n        <circle cx=\"24\" cy=\"46\" r=\"2\" fill=\"#3a2614\"/><circle cx=\"36\" cy=\"46\" r=\"2\" fill=\"#3a2614\"/>\n        <path d=\"M24 54q6 5 12 0\" fill=\"none\" stroke=\"#3a2614\" stroke-width=\"2\" stroke-linecap=\"round\"/>\n        <circle cx=\"20\" cy=\"52\" r=\"3\" fill=\"#ff8a9a\" opacity=\".6\"/><circle cx=\"40\" cy=\"52\" r=\"3\" fill=\"#ff8a9a\" opacity=\".6\"/>\n        <rect x=\"14\" y=\"64\" width=\"32\" height=\"26\" rx=\"8\" fill=\"var(--c2,#b3203a)\"/>\n        <rect x=\"14\" y=\"78\" width=\"32\" height=\"5\" fill=\"#3a2614\"/><rect x=\"26\" y=\"77\" width=\"8\" height=\"7\" rx=\"1\" fill=\"#f4c24d\"/>\n        <rect x=\"17\" y=\"90\" width=\"10\" height=\"10\" rx=\"3\" fill=\"#3a2614\"/><rect x=\"33\" y=\"90\" width=\"10\" height=\"10\" rx=\"3\" fill=\"#3a2614\"/>\n      </symbol>\n\n      <symbol id=\"santa\" viewBox=\"0 0 120 150\" overflow=\"visible\">\n        <path d=\"M30 40Q60 -6 92 38Z\" fill=\"#c8334b\"/><rect x=\"24\" y=\"36\" width=\"72\" height=\"12\" rx=\"6\" fill=\"#fff\"/><circle cx=\"96\" cy=\"14\" r=\"8\" fill=\"#fff\"/>\n        <circle cx=\"60\" cy=\"62\" r=\"22\" fill=\"#f1c9a0\"/>\n        <path d=\"M36 62q0 46 24 46t24-46q-8 14-24 14T36 62Z\" fill=\"#fff\"/>\n        <circle cx=\"52\" cy=\"58\" r=\"2.2\" fill=\"#3a2614\"/><circle cx=\"68\" cy=\"58\" r=\"2.2\" fill=\"#3a2614\"/>\n        <circle cx=\"60\" cy=\"68\" r=\"4\" fill=\"#e9a58a\"/>\n        <rect x=\"22\" y=\"94\" width=\"76\" height=\"48\" rx=\"24\" fill=\"#c8334b\"/>\n        <rect x=\"22\" y=\"112\" width=\"76\" height=\"9\" fill=\"#2a1a14\"/><rect x=\"52\" y=\"110\" width=\"16\" height=\"13\" rx=\"2\" fill=\"#f4c24d\"/>\n        <rect x=\"46\" y=\"94\" width=\"28\" height=\"48\" fill=\"#fff\" opacity=\".0\"/>\n      </symbol>\n\n      <symbol id=\"gbox\" viewBox=\"0 0 60 60\" overflow=\"visible\">\n        <rect x=\"0\" y=\"12\" width=\"60\" height=\"48\" rx=\"5\" fill=\"var(--b,#c8334b)\"/>\n        <rect x=\"26\" y=\"12\" width=\"8\" height=\"48\" fill=\"#ffe9b8\"/><rect x=\"0\" y=\"30\" width=\"60\" height=\"8\" fill=\"#ffe9b8\" opacity=\".9\"/>\n        <path d=\"M30 12C20-6 8 0 14 8c4 5 14 4 16 4Zm0 0c10-18 22-12 16-4-4 5-14 4-16 4Z\" fill=\"#ffe9b8\"/>\n      </symbol>\n    </defs>\n\n    <rect width=\"1280\" height=\"780\" fill=\"url(#hbg)\"/>\n    <ellipse cx=\"640\" cy=\"470\" rx=\"660\" ry=\"320\" fill=\"url(#hglow)\"/>\n    <polygon points=\"500,0 780,0 880,140 400,140\" fill=\"#ffe2a8\" opacity=\".1\"/>\n    <g stroke=\"#2a1a38\" stroke-width=\"5\" opacity=\".85\">\n      <line x1=\"640\" y1=\"-30\" x2=\"0\" y2=\"190\"/><line x1=\"640\" y1=\"-30\" x2=\"320\" y2=\"190\"/><line x1=\"640\" y1=\"-30\" x2=\"960\" y2=\"190\"/><line x1=\"640\" y1=\"-30\" x2=\"1280\" y2=\"190\"/><line x1=\"0\" y1=\"120\" x2=\"1280\" y2=\"120\" stroke-width=\"8\"/>\n    </g>\n\n    <!-- \u0e0a\u0e31\u0e49\u0e19\u0e27\u0e32\u0e07\u0e0b\u0e49\u0e32\u0e22/\u0e02\u0e27\u0e32 -->\n    <g opacity=\".95\">\n      <g fill=\"#3b5f9a\"><rect x=\"30\" y=\"190\" width=\"9\" height=\"420\"/><rect x=\"170\" y=\"190\" width=\"9\" height=\"420\"/><rect x=\"310\" y=\"190\" width=\"9\" height=\"420\"/>\n        <rect x=\"960\" y=\"190\" width=\"9\" height=\"420\"/><rect x=\"1100\" y=\"190\" width=\"9\" height=\"420\"/><rect x=\"1240\" y=\"190\" width=\"9\" height=\"420\"/></g>\n      <g fill=\"#d9703a\"><rect x=\"24\" y=\"290\" width=\"302\" height=\"8\"/><rect x=\"24\" y=\"390\" width=\"302\" height=\"8\"/><rect x=\"24\" y=\"490\" width=\"302\" height=\"8\"/><rect x=\"24\" y=\"590\" width=\"302\" height=\"8\"/>\n        <rect x=\"954\" y=\"290\" width=\"302\" height=\"8\"/><rect x=\"954\" y=\"390\" width=\"302\" height=\"8\"/><rect x=\"954\" y=\"490\" width=\"302\" height=\"8\"/><rect x=\"954\" y=\"590\" width=\"302\" height=\"8\"/></g>\n    </g>\n\n    <!-- \u0e44\u0e1f\u0e1b\u0e23\u0e30\u0e14\u0e31\u0e1a -->\n    <path d=\"M-20 150Q640 240 1300 150\" fill=\"none\" stroke=\"#2a1a38\" stroke-width=\"2\"/>\n    <g>\n      <circle class=\"gctw\" cx=\"60\" cy=\"172\" r=\"5\" fill=\"#ffd36b\"/><circle class=\"gctw\" cx=\"160\" cy=\"192\" r=\"5\" fill=\"#ff7a8a\" style=\"animation-delay:.4s\"/><circle class=\"gctw\" cx=\"260\" cy=\"207\" r=\"5\" fill=\"#7fe3c0\" style=\"animation-delay:.9s\"/><circle class=\"gctw\" cx=\"360\" cy=\"217\" r=\"5\" fill=\"#b9a5ff\" style=\"animation-delay:1.3s\"/><circle class=\"gctw\" cx=\"460\" cy=\"223\" r=\"5\" fill=\"#ffd36b\" style=\"animation-delay:.2s\"/><circle class=\"gctw\" cx=\"560\" cy=\"226\" r=\"5\" fill=\"#ff7a8a\" style=\"animation-delay:1.1s\"/><circle class=\"gctw\" cx=\"660\" cy=\"226\" r=\"5\" fill=\"#7fe3c0\" style=\"animation-delay:.6s\"/><circle class=\"gctw\" cx=\"760\" cy=\"223\" r=\"5\" fill=\"#b9a5ff\" style=\"animation-delay:1.7s\"/><circle class=\"gctw\" cx=\"860\" cy=\"217\" r=\"5\" fill=\"#ffd36b\" style=\"animation-delay:.3s\"/><circle class=\"gctw\" cx=\"960\" cy=\"207\" r=\"5\" fill=\"#ff7a8a\" style=\"animation-delay:1s\"/><circle class=\"gctw\" cx=\"1060\" cy=\"192\" r=\"5\" fill=\"#7fe3c0\" style=\"animation-delay:1.5s\"/><circle class=\"gctw\" cx=\"1160\" cy=\"172\" r=\"5\" fill=\"#b9a5ff\" style=\"animation-delay:.7s\"/>\n    </g>\n\n    <!-- \u0e1e\u0e37\u0e49\u0e19\u0e41\u0e25\u0e30\u0e2a\u0e32\u0e22\u0e1e\u0e32\u0e19 -->\n    <rect x=\"0\" y=\"600\" width=\"1280\" height=\"180\" fill=\"#2a1428\"/>\n    <rect x=\"0\" y=\"600\" width=\"1280\" height=\"6\" fill=\"#ffb85c\" opacity=\".35\"/>\n    <rect x=\"0\" y=\"672\" width=\"1280\" height=\"40\" rx=\"4\" fill=\"#1c1224\"/>\n    <line class=\"gcbelt\" x1=\"0\" y1=\"682\" x2=\"1280\" y2=\"682\" stroke=\"#7c6a96\" stroke-width=\"4\" stroke-dasharray=\"24 24\"/>\n    <rect x=\"0\" y=\"712\" width=\"1280\" height=\"8\" fill=\"#ffb85c\" opacity=\".25\"/>\n    <g fill=\"#1c1224\"><rect x=\"120\" y=\"712\" width=\"10\" height=\"68\"/><rect x=\"360\" y=\"712\" width=\"10\" height=\"68\"/><rect x=\"600\" y=\"712\" width=\"10\" height=\"68\"/><rect x=\"840\" y=\"712\" width=\"10\" height=\"68\"/><rect x=\"1080\" y=\"712\" width=\"10\" height=\"68\"/></g>\n\n    <!-- \u0e01\u0e25\u0e48\u0e2d\u0e07\u0e02\u0e2d\u0e07\u0e02\u0e27\u0e31\u0e0d\u0e40\u0e25\u0e37\u0e48\u0e2d\u0e19\u0e15\u0e32\u0e21\u0e2a\u0e32\u0e22\u0e1e\u0e32\u0e19 -->\n    <g class=\"gcmv\"><use href=\"#gbox\" x=\"0\" y=\"630\" width=\"50\" height=\"50\" style=\"--b:#c8334b\"/></g>\n    <g class=\"gcmv\" style=\"animation-delay:-3s\"><use href=\"#gbox\" x=\"0\" y=\"628\" width=\"54\" height=\"54\" style=\"--b:#2f9e7a\"/></g>\n    <g class=\"gcmv\" style=\"animation-delay:-6s\"><use href=\"#gbox\" x=\"0\" y=\"634\" width=\"46\" height=\"46\" style=\"--b:#e0a63a\"/></g>\n    <g class=\"gcmv\" style=\"animation-delay:-9.5s\"><use href=\"#gbox\" x=\"0\" y=\"626\" width=\"56\" height=\"56\" style=\"--b:#7a5cd6\"/></g>\n    <g class=\"gcmv\" style=\"animation-delay:-13s\"><use href=\"#gbox\" x=\"0\" y=\"632\" width=\"48\" height=\"48\" style=\"--b:#d9703a\"/></g>\n    <g class=\"gcmv\" style=\"animation-delay:-16s\"><use href=\"#gbox\" x=\"0\" y=\"630\" width=\"52\" height=\"52\" style=\"--b:#3d8fd0\"/></g>\n    <!-- \u0e01\u0e25\u0e48\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e40\u0e1e\u0e34\u0e48\u0e07\u0e21\u0e35\u0e04\u0e19\u0e2a\u0e23\u0e49\u0e32\u0e07 \u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e1b\u0e49\u0e32\u0e22 -->\n    <g class=\"gcmv\" style=\"animation-delay:-1.6s\">\n      <use href=\"#gbox\" x=\"0\" y=\"624\" width=\"58\" height=\"58\" style=\"--b:#f4c24d\"/>\n      <g class=\"gcpop\"><rect x=\"-26\" y=\"566\" width=\"116\" height=\"36\" rx=\"18\" fill=\"#f4c24d\"/><text x=\"32\" y=\"590\" text-anchor=\"middle\" font-family=\"Noto Sans Thai,sans-serif\" font-size=\"15\" font-weight=\"700\" fill=\"#2a1606\">\u0e19\u0e49\u0e33\u0e1d\u0e19 \u0e21\u0e32\u0e16\u0e36\u0e07\u0e41\u0e25\u0e49\u0e27</text></g>\n    </g>\n\n    <!-- \u0e40\u0e2d\u0e25\u0e1f\u0e4c\u0e41\u0e25\u0e30\u0e0b\u0e32\u0e19\u0e15\u0e49\u0e32 -->\n    <use href=\"#santa\" x=\"1005\" y=\"360\" width=\"130\" height=\"190\"/>\n    <rect x=\"1130\" y=\"470\" width=\"30\" height=\"62\" rx=\"3\" fill=\"#f6efdc\" transform=\"rotate(8 1145 500)\"/>\n    <g stroke=\"#9a8aa8\" stroke-width=\"2\"><line x1=\"1136\" y1=\"482\" x2=\"1154\" y2=\"486\"/><line x1=\"1136\" y1=\"492\" x2=\"1154\" y2=\"496\"/><line x1=\"1136\" y1=\"502\" x2=\"1154\" y2=\"506\"/></g>\n\n    <use href=\"#elf\" x=\"330\" y=\"505\" width=\"64\" height=\"110\" style=\"--c:#2f9e7a;--c2:#b3203a\"/>\n    <rect x=\"388\" y=\"540\" width=\"34\" height=\"44\" rx=\"3\" fill=\"#f6efdc\"/><rect x=\"396\" y=\"534\" width=\"18\" height=\"8\" rx=\"2\" fill=\"#7c6a96\"/>\n    <path d=\"M394 552h20M394 562h20M394 572h14\" stroke=\"#9a8aa8\" stroke-width=\"2\"/>\n\n    <use href=\"#elf\" x=\"120\" y=\"505\" width=\"64\" height=\"110\" style=\"--c:#b3203a;--c2:#2f9e7a\"/>\n    <rect x=\"176\" y=\"560\" width=\"110\" height=\"38\" rx=\"5\" fill=\"#7c6a96\"/><circle cx=\"196\" cy=\"604\" r=\"10\" fill=\"#1c1224\"/><circle cx=\"268\" cy=\"604\" r=\"10\" fill=\"#1c1224\"/>\n    <rect x=\"196\" y=\"532\" width=\"40\" height=\"28\" rx=\"4\" fill=\"#3d8fd0\"/><rect x=\"232\" y=\"538\" width=\"34\" height=\"22\" rx=\"4\" fill=\"#e0a63a\"/>\n\n    <use href=\"#elf\" x=\"1215\" y=\"190\" width=\"50\" height=\"86\" style=\"--c:#7a5cd6;--c2:#e0a63a\"/>\n    <rect x=\"1262\" y=\"186\" width=\"6\" height=\"170\" fill=\"#c9a36a\"/>\n\n    <!-- \u0e23\u0e16\u0e22\u0e01 + \u0e40\u0e2d\u0e25\u0e1f\u0e4c -->\n    <g>\n      <rect x=\"640\" y=\"520\" width=\"150\" height=\"70\" rx=\"8\" fill=\"#f4c24d\"/>\n      <rect x=\"700\" y=\"470\" width=\"60\" height=\"56\" rx=\"6\" fill=\"#e0a63a\"/>\n      <use href=\"#elf\" x=\"706\" y=\"430\" width=\"48\" height=\"82\" style=\"--c:#2f9e7a;--c2:#d9703a\"/>\n      <rect x=\"796\" y=\"420\" width=\"8\" height=\"170\" fill=\"#3a2614\"/><rect x=\"796\" y=\"560\" width=\"64\" height=\"8\" fill=\"#3a2614\"/>\n      <rect x=\"808\" y=\"508\" width=\"48\" height=\"48\" rx=\"4\" fill=\"#c8334b\"/><rect x=\"826\" y=\"508\" width=\"8\" height=\"48\" fill=\"#ffe9b8\"/>\n      <circle cx=\"668\" cy=\"596\" r=\"16\" fill=\"#1c1224\"/><circle cx=\"764\" cy=\"596\" r=\"16\" fill=\"#1c1224\"/>\n    </g>\n  ";
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function slots() {
    var out = [], shelves = [590, 490, 390, 290];
    for (var d = 0; d < 2; d++) shelves.forEach(function (y) {
      for (var i = 0; i < 6; i++) [46, 976].forEach(function (x0) { out.push({ x: x0 + i * 42 + d * 12, y: y - d * 12, d: d }); });
    });
    return out;
  }
  var SLOTS = slots();

  function mount(host, opt) {
    opt = opt || {};
    host.innerHTML = '<svg viewBox="0 0 1280 780" preserveAspectRatio="xMidYMid ' + (opt.fit || 'slice') + '" style="width:100%;height:100%;display:block;background:#1a1230" role="img" aria-label="ฉากคลังสินค้าของซานต้า">' + INNER +
      '<g id="gcRack"></g><g id="gcFly"></g></svg>';
    var svg = host.firstChild, rack = svg.querySelector('#gcRack'), fly = svg.querySelector('#gcFly');
    var shown = 0, boxEls = [], seed = 5;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var look = SLOTS.map(function () { return { h: 30 + Math.round(rnd() * 14), w: 34 + Math.round(rnd() * 4), c: COLS[Math.floor(rnd() * COLS.length)] }; });
    function boxSvg(x, y, w, h, c, op) {
      var g = document.createElementNS(NS, 'g');
      g.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      g.innerHTML = '<rect width="' + w + '" height="' + h + '" rx="4" fill="' + c + '" opacity="' + (op == null ? 1 : op) + '"/><rect x="' + (w / 2 - 3) + '" width="6" height="' + h + '" fill="#ffe9b8" opacity=".85"/><rect y="' + (h * .42) + '" width="' + w + '" height="' + (h * .14) + '" fill="#ffe9b8" opacity=".85"/>';
      return g;
    }
    function setCount(n) {
      n = Math.max(0, Math.min(SLOTS.length, n | 0));
      while (boxEls.length > n) rack.removeChild(boxEls.pop());
      while (boxEls.length < n) {
        var i = boxEls.length, s = SLOTS[i], l = look[i];
        var g = boxSvg(s.x, s.y - l.h, l.w, l.h, l.c, s.d ? .7 : 1);
        g._slot = i; rack.appendChild(g); boxEls.push(g);
      }
      shown = n;
    }
    function arrive(name) {
      /* กล่องใหม่วิ่งมาตามสายพาน พร้อมป้ายชื่อ */
      if (reduced) return;
      var g = document.createElementNS(NS, 'g');
      g.innerHTML = '<use href="#gbox" x="0" y="624" width="58" height="58" style="--b:#f4c24d"/><rect x="-30" y="566" width="124" height="34" rx="17" fill="#f4c24d"/><text x="32" y="589" text-anchor="middle" font-family="Noto Sans Thai,sans-serif" font-size="15" font-weight="700" fill="#2a1606"></text>';
      g.querySelector('text').textContent = (name || 'ของขวัญใหม่') + ' มาถึงแล้ว';
      fly.appendChild(g);
      var a = g.animate([{ transform: 'translateX(-140px)' }, { transform: 'translateX(1380px)' }], { duration: 9000, easing: 'linear' });
      a.onfinish = function () { if (g.parentNode) g.parentNode.removeChild(g); };
    }
    function sleigh() {
      var g = document.createElementNS(NS, 'g');
      g.innerHTML =
        '<g fill="#8a5a34"><ellipse cx="70" cy="140" rx="46" ry="22"/><rect x="38" y="150" width="8" height="38" rx="3"/><rect x="58" y="152" width="8" height="38" rx="3"/><rect x="86" y="152" width="8" height="38" rx="3"/><circle cx="22" cy="112" r="15"/><path d="M12 100 6 78M22 98l6-24M32 100l14-20" stroke="#6b4423" stroke-width="3" fill="none" stroke-linecap="round"/></g><circle cx="8" cy="114" r="5" fill="#ff4d5e"/>' +
        '<g fill="#a06a3e"><ellipse cx="160" cy="130" rx="40" ry="20"/><rect x="132" y="140" width="7" height="36" rx="3"/><rect x="172" y="142" width="7" height="36" rx="3"/><circle cx="118" cy="104" r="13"/><path d="M110 94 104 74M122 92l2-18M127 94l12-18" stroke="#6b4423" stroke-width="3" fill="none" stroke-linecap="round"/></g>' +
        '<path d="M200 124Q215 120 232 126" stroke="#f4c24d" stroke-width="3" fill="none"/>' +
        '<path d="M226 118h188q14 0 12 14l-8 34q-4 14-22 14H252q-18 0-22-14Z" fill="#b3203a"/><path d="M232 132h190" stroke="#f4c24d" stroke-width="5"/>' +
        '<path d="M214 196q-14 0-14-16M214 196h230" stroke="#f4c24d" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<circle cx="372" cy="92" r="18" fill="#f1c9a0"/><path d="M354 90q0 34 18 34t18-34q-6 10-18 10t-18-10Z" fill="#fff"/><path d="M352 82Q372 44 394 80Z" fill="#c8334b"/><rect x="350" y="78" width="46" height="10" rx="5" fill="#fff"/><circle cx="396" cy="62" r="7" fill="#fff"/><rect x="350" y="112" width="46" height="26" rx="12" fill="#c8334b"/>';
      return g;
    }
    /* กล่องจากชั้นวางย้ายเข้ารถเลื่อน รถเลื่อนบินขึ้นฟ้า แล้วกล่องร่วงลงมาแจก */
    function deliver(done, onPhase) {
      var total = boxEls.length, ph = function (n) { if (onPhase) onPhase(n); };
      if (reduced || !svg.animate) { ph(3); if (done) done(); return; }
      var S = sleigh(), SX = 420, SY = 470;
      S.style.transform = 'translate(' + SX + 'px,' + SY + 'px)';
      fly.appendChild(S);
      S.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: 'forwards' });
      ph(1);
      var stagger = Math.min(160, 2600 / Math.max(1, total)), moved = 0;
      var cargo = document.createElementNS(NS, 'g'); cargo.style.transform = 'translate(' + SX + 'px,' + SY + 'px)'; fly.appendChild(cargo);
      boxEls.slice().reverse().forEach(function (b, k) {
        var s = SLOTS[b._slot], l = look[b._slot];
        var tx = 270 + (k % 6) * 26, ty = 78 + ((k / 6) | 0 % 3) * -10 - (k % 3) * 6;
        var clone = boxSvg(0, 0, l.w * .8, l.h * .8, l.c, 1);
        clone.style.transform = 'translate(' + s.x + 'px,' + (s.y - l.h) + 'px)';
        fly.appendChild(clone);
        b.style.visibility = 'hidden';
        var dx = SX + tx, dy = SY + ty;
        var an = clone.animate([
          { transform: 'translate(' + s.x + 'px,' + (s.y - l.h) + 'px)' },
          { transform: 'translate(' + ((s.x + dx) / 2) + 'px,' + (Math.min(s.y, dy) - 90) + 'px)', offset: .5 },
          { transform: 'translate(' + dx + 'px,' + dy + 'px)' }
        ], { duration: 900, delay: 500 + k * stagger, easing: 'ease-in-out', fill: 'forwards' });
        an.onfinish = function () { cargo.appendChild(clone); clone.style.transform = 'translate(' + tx + 'px,' + ty + 'px)'; if (++moved === total) takeOff(); };
      });
      if (!total) takeOff();
      function takeOff() {
        ph(2);
        var parent = document.createElementNS(NS, 'g'); fly.appendChild(parent); parent.appendChild(S); parent.appendChild(cargo);
        var a = parent.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: 'translate(120px,-30px) scale(1)', offset: .15 },
          { transform: 'translate(900px,-560px) scale(.2)', opacity: 0 }
        ], { duration: 3200, delay: 300, easing: 'ease-in', fill: 'forwards' });
        a.onfinish = function () { if (parent.parentNode) parent.parentNode.removeChild(parent); rain(); };
      }
      function rain() {
        ph(3);
        var n = Math.min(Math.max(total, 6), 40), left = n;
        for (var i = 0; i < n; i++) (function (i) {
          var x = 60 + Math.round(((i * 97) % 1160)), c = COLS[i % COLS.length], g = boxSvg(0, 0, 36, 34, c, 1);
          fly.appendChild(g);
          var endY = 640 - 34 + ((i % 3) * 6);
          var an = g.animate([
            { transform: 'translate(' + x + 'px,-80px) rotate(' + (i % 2 ? 40 : -40) + 'deg)' },
            { transform: 'translate(' + x + 'px,' + endY + 'px) rotate(0deg)' }
          ], { duration: 1300, delay: i * 70, easing: 'cubic-bezier(.4,.1,.7,1)', fill: 'forwards' });
          an.onfinish = function () { if (--left === 0) setTimeout(function () { if (done) done(); fly.replaceChildren(); }, 1400); };
        })(i);
      }
    }
    setCount(opt.count || 0);
    return { setCount: setCount, arrive: arrive, deliver: deliver, svg: svg, capacity: SLOTS.length };
  }

  /* กล่องของขวัญสีต่างๆ เป็นพื้นหลังหน้าห้อง ตามจำนวนจริง */
  function bgBoxes(host, n) {
    host.replaceChildren();
    var seed = 11, r = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    n = Math.min(n, 60);
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'), s = 26 + Math.round(r() * 30);
      d.className = 'bgbox';
      d.style.cssText = 'left:' + (r() * 92).toFixed(1) + '%;top:' + (r() * 90).toFixed(1) + '%;width:' + s + 'px;height:' + Math.round(s * .9) + 'px;background:' + COLS[Math.floor(r() * COLS.length)] + ';transform:rotate(' + Math.round(r() * 50 - 25) + 'deg);opacity:' + (0.1 + r() * 0.16).toFixed(2);
      host.append(d);
    }
  }
  window.GCScene = { mount: mount, bgBoxes: bgBoxes };
})();
