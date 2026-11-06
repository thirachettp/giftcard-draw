/* Giftcard hero: ฉากคลังสินค้า 3 มิติแบบจุดแสง วาดด้วย three.js (r128) เขียนขึ้นเองทั้งหมด
   ใช้: GCHero.mount(element, { variant: 'a' | 'b' | 'c' }) คืนค่า { destroy } หรือ null ถ้าเครื่องไม่รองรับ WebGL */
(function () {
'use strict';
window.GCHero = { mount: function (container, opts) {
opts = opts || {};
var THREE = window.THREE;
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var small = Math.min(innerWidth, innerHeight) < 700 || window.matchMedia('(pointer: coarse)').matches;
var Q = small ? 0.55 : 1;
var renderer;
try {
  if (!THREE) throw new Error('no three');
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
} catch (e) { return null; }
function W() { return Math.max(1, container.clientWidth); }
function H() { return Math.max(1, container.clientHeight); }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75));
renderer.setSize(W(), H());
renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
container.appendChild(renderer.domElement);
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(62, W() / H(), 0.1, 400);
camera.rotation.order = 'YXZ';

/* ---------- จุดแสงทั้งหมดวาดด้วย shader เดียว ---------- */
var VERT = [
'uniform float uTravel,uTime,uPR,uDisperse,uPeriod,uAspect,uGrow;',
'uniform vec2 uMouse; uniform vec3 uSway;',
'attribute vec3 aColor; attribute float aSize,aSeed,aSpeed,aCz; attribute vec4 aPath;',
'varying vec3 vColor; varying float vAlpha;',
'float h(float n){return fract(sin(n*91.345+17.17)*43758.5453);}',
'void main(){',
'  float g=aCz+uTravel+aSpeed*uTime;',
'  float gz=mod(g,uPeriod)-uPeriod;',
'  vec3 p=position;',
'  p.z=gz+(position.z-aCz);',
'  p.x+=aPath.x+aPath.y*sin(aPath.z*gz+aPath.w);',
'  p-=uSway;',
'  float depth=-gz;',
'  vec3 dir=normalize(vec3(h(aSeed),h(aSeed+1.7),h(aSeed+3.1))-.5+vec3(1e-3));',
'  p+=dir*uDisperse*(3.+16.*h(aSeed+5.));',
'  p.y+=uDisperse*(1.5+sin(uTime*.6+aSeed*40.)*1.2);',
'  p.x+=uDisperse*sin(uTime*.4+aSeed*23.)*1.5;',
'  vec4 mv=modelViewMatrix*vec4(p,1.);',
'  vec4 clip=projectionMatrix*mv;',
'  vec2 ndc=clip.xy/clip.w;',
'  vec2 d=ndc-uMouse; d.x*=uAspect;',
'  float dist=length(d);',
'  float push=exp(-dist*dist*26.)*.15;',
'  float glow=exp(-dist*dist*9.);',
'  vec2 dn=d/max(dist,1e-4); dn.x/=uAspect;',
'  ndc+=dn*push;',
'  gl_Position=vec4(ndc*clip.w,clip.z,clip.w);',
'  float grow=1.-smoothstep(uPeriod*uGrow,uPeriod*.97,depth);',
'  float tw=.86+.14*sin(uTime*2.+aSeed*60.);',
'  float sz=aSize*uPR*(140./max(-mv.z,.5))*mix(.35,1.,grow)*(1.+glow*.7)*mix(1.,.7,uDisperse)*tw;',
'  gl_PointSize=clamp(sz,0.,26.*uPR);',
'  vColor=aColor*.8*(1.+glow*1.2);',
'  vAlpha=(1.-smoothstep(uPeriod*.55,uPeriod*.97,depth))*smoothstep(1.,12.,depth)*mix(1.,.75,uDisperse)*step(.3,-mv.z);',
'}'
].join('\n');
var FRAG = [
'varying vec3 vColor; varying float vAlpha;',
'void main(){',
'  float d=length(gl_PointCoord-.5);',
'  float a=smoothstep(.5,0.,d); a*=a;',
'  float core=smoothstep(.2,0.,d);',
'  gl_FragColor=vec4(vColor+core*.3,a*vAlpha);',
'}'
].join('\n');
var uniforms = {
  uTravel: { value: 0 }, uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() },
  uDisperse: { value: 0 }, uPeriod: { value: 80 }, uAspect: { value: W() / H() }, uGrow: { value: .5 },
  uMouse: { value: new THREE.Vector2(9, 9) }, uSway: { value: new THREE.Vector3() }
};
var material = new THREE.ShaderMaterial({
  uniforms: uniforms, vertexShader: VERT, fragmentShader: FRAG,
  transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending
});

/* ---------- ตัวสร้างจุด ---------- */
function rngFrom(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function Builder(seed) { this.p = []; this.c = []; this.s = []; this.sd = []; this.sp = []; this.cz = []; this.pa = []; this.rng = rngFrom(seed); this.g = null; }
Builder.prototype.setGroup = function (speed, cz, path) { this.g = { speed: speed, cz: cz, path: path }; };
Builder.prototype.clearGroup = function () { this.g = null; };
Builder.prototype.pt = function (x, y, z, col, size, k) {
  k = k == null ? 1 : k;
  this.p.push(x, y, z); this.c.push(col[0] * k, col[1] * k, col[2] * k); this.s.push(size); this.sd.push(this.rng());
  var g = this.g;
  this.sp.push(g ? g.speed : 0); this.cz.push(g && g.cz != null ? g.cz : z);
  if (g && g.path) this.pa.push(g.path[0], g.path[1], g.path[2], g.path[3]); else this.pa.push(0, 0, 0, 0);
};
Builder.prototype.line = function (x1, y1, z1, x2, y2, z2, n, col, size, k) {
  n = Math.max(2, Math.round(n));
  for (var i = 0; i < n; i++) { var t = i / (n - 1); this.pt(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, z1 + (z2 - z1) * t, col, size, k); }
};
Builder.prototype.box = function (cx, cy, cz, w, h, d, col, edgeN, faceN, size) {
  var hx = w / 2, hy = h / 2, hz = d / 2, i, j;
  for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) {
    this.line(cx - hx, cy + i * hy, cz + j * hz, cx + hx, cy + i * hy, cz + j * hz, edgeN, col, size);
    this.line(cx + i * hx, cy - hy, cz + j * hz, cx + i * hx, cy + hy, cz + j * hz, edgeN, col, size);
    this.line(cx + i * hx, cy + j * hy, cz - hz, cx + i * hx, cy + j * hy, cz + hz, edgeN, col, size);
  }
  for (i = 0; i < faceN; i++) {
    var f = (this.rng() * 6) | 0, ax = f >> 1, sd = (f & 1) ? 1 : -1, u = this.rng() - .5, v = this.rng() - .5, x = cx, y = cy, z = cz;
    if (ax === 0) { x += sd * hx; y += u * h; z += v * d; } else if (ax === 1) { y += sd * hy; x += u * w; z += v * d; } else { z += sd * hz; x += u * w; y += v * h; }
    this.pt(x, y, z, col, size * .8, .38);
  }
};
function toGeometry(B) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3));
  g.setAttribute('aColor', new THREE.Float32BufferAttribute(B.c, 3));
  g.setAttribute('aSize', new THREE.Float32BufferAttribute(B.s, 1));
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(B.sd, 1));
  g.setAttribute('aSpeed', new THREE.Float32BufferAttribute(B.sp, 1));
  g.setAttribute('aCz', new THREE.Float32BufferAttribute(B.cz, 1));
  g.setAttribute('aPath', new THREE.Float32BufferAttribute(B.pa, 4));
  return g;
}
function pad(n, w) { return String(n).padStart(w, '0'); }
function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

/* ---------- แบบ A: ทางเดินชั้นวาง ---------- */
function buildA(B) {
  var L = 80, rng = B.rng, steel = [.16, .30, .58];
  var PAL = [[1, .70, .24], [1, .70, .24], [1, .70, .24], [.36, .88, 1], [.86, .62, .36], [.86, .62, .36], [1, .30, .42]];
  [-21.2, -13.2, -5.2, 5.2, 13.2, 21.2].forEach(function (xc) {
    var near = Math.abs(xc) < 15;
    for (var i = 0; i < L / 4; i++) {
      var z = -i * 4 - 2;
      [-1.6, 1.6].forEach(function (dx) { B.line(xc + dx, 0, z - 2, xc + dx, 13, z - 2, (near ? 16 : 9) * Math.max(.7, Q), steel, 1.3); });
      [0.3, 3.3, 6.3, 9.3, 12.3].forEach(function (y) {
        [-1.6, 1.6].forEach(function (dx) { B.line(xc + dx, y, z - 2, xc + dx, y, z + 2, near ? 5 : 3, steel, 1.1); });
      });
      if (near || rng() < .4) {
        [0.3, 3.3, 6.3, 9.3].forEach(function (y) {
          [-1, 1].forEach(function (side) {
            if (rng() < .62) {
              var h = 1.6 + rng() * .9, d = 2.4 + rng() * 1.1, col = PAL[(rng() * PAL.length) | 0];
              B.box(xc + side * .8, y + .1 + h / 2, z + (rng() - .5) * .4, 1.4, h, d, col, 5, Math.round((near ? 12 : 6) * Q + 3), 1.7);
            }
          });
        });
      }
    }
  });
  for (var k = 0; k < L / .8; k++) {
    if (k % 3 === 0) continue;
    [-3.4, 3.4].forEach(function (x) { B.pt(x, .02, -k * .8, [1, .7, .2], 1.2, .55); });
  }
  for (var zl = -4; zl > -L; zl -= 8) {
    [0, -9.2, 9.2].forEach(function (x) {
      for (var n = 0; n < 5; n++) B.pt(x + (rng() - .5) * 1.2, 14.4, zl + (rng() - .5) * 1.2, [1, .85, .55], 5, 1.3);
      for (var m = 0; m < 8; m++) B.pt(x + (rng() - .5) * 1.6, 10 + rng() * 4, zl + (rng() - .5) * 1.6, [1, .8, .5], 2.4, .22);
    });
  }
  for (var q = 0, nd = Math.round(2600 * Q); q < nd; q++) B.pt((rng() - .5) * 48, rng() * 14, -rng() * L, [.5, .55, .7], .9, .5);
  return {
    period: L, camY: 3.4, pitch: -.02, drift: 3.6, grow: .5,
    sway: function (t, time) { return [Math.sin(t * .045) * .7, Math.sin(time * .5) * .06, 0]; },
    roll: function () { return 0; },
    hud: function (t) { return 'ทางเดิน ' + pad(7 + Math.floor(t / 80), 2) + ' · ช่อง ' + pad((((Math.floor(t / 4)) % 20) + 20) % 20 + 1, 2); }
  };
}

/* ---------- แบบ B: ลานพาเลท ---------- */
function buildB(B) {
  var L = 119, cell = 7, rng = B.rng, teal = [.12, .95, .78], mint = [.72, 1, .9], gold = [1, .78, .28], grid = [.05, .36, .32], wood = [.55, .4, .2];
  var xi, zi, k;
  for (xi = -8; xi <= 8; xi++) B.line(xi * cell, 0, -L, xi * cell, 0, 0, Math.round(L / 1.1 * Q + 10), grid, 1.1);
  for (zi = 0; zi < L / cell; zi++) B.line(-56, 0, -zi * cell, 56, 0, -zi * cell, Math.round(100 / 1.1 * Q + 10), grid, 1.1);
  for (xi = -8; xi < 8; xi++) for (zi = 0; zi < L / cell; zi++) {
    if (rng() > .72) continue;
    var x = (xi + .5) * cell + (rng() - .5) * 2.4, z = -(zi + .5) * cell + (rng() - .5) * 2.4;
    var n = 1 + ((rng() * rng() * 5) | 0) + (rng() < .15 ? 1 : 0);
    B.box(x, .15, z, 2.7, .3, 2.7, wood, 3, 8, 1.5);
    for (k = 0; k < n; k++) {
      var isGold = rng() < .09, col = isGold ? gold : lerp3(teal, mint, k / 5), h = 1.4 + rng() * .3, cy = .3 + k * 1.55 + h / 2;
      B.box(x + (rng() - .5) * .15, cy, z, 2.4, h, 2.4, col, 6, Math.round(11 * Q + 3), 1.8);
      if (isGold) {
        B.line(x - 1.2, cy + h / 2, z, x + 1.2, cy + h / 2, z, 5, [1, .95, .6], 2.4);
        B.line(x, cy + h / 2, z - 1.2, x, cy + h / 2, z + 1.2, 5, [1, .95, .6], 2.4);
      }
    }
  }
  for (var f = 0, nf = Math.round(1400 * Q); f < nf; f++) {
    var gc = rng() < .2 ? gold : mint;
    B.setGroup((rng() - .5) * 1.2, null, null);
    B.pt((rng() - .5) * 112, .6 + rng() * 13, -rng() * L, gc, 2.6, 1.1);
  }
  B.clearGroup();
  for (var q = 0, nd = Math.round(3000 * Q); q < nd; q++) B.pt((rng() - .5) * 112, rng() * 2.5, -rng() * L, [.2, .6, .55], 1, .55);
  return {
    period: L, camY: 11, pitch: -.22, drift: 7, grow: .42,
    sway: function (t) { return [Math.sin(t * .03) * 5, 0, 0]; },
    roll: function (t) { return Math.cos(t * .03) * .05; },
    hud: function (t) { return 'โซน B · พาเลท ' + pad(231 + Math.floor(t / 3.5), 4); }
  };
}

/* ---------- แบบ C: สายพานคัดแยก ---------- */
function buildC(B) {
  var L = 96, lanes = 11, rng = B.rng, kf = function (k) { return Math.PI * 2 * k / L; };
  var steel = [.42, .2, .32], hot = [1, .8, .86];
  for (var i = 0; i < lanes; i++) {
    var baseX = (i - 5) * 5, y = ((i % 3) - 1) * 3.4, amp = 1 + (i % 4) * .55, kk = 1 + (i % 2), phase = i * 1.3;
    var path = [baseX, amp, kf(kk), phase], dirn = i % 2 ? 1 : -1, speed = dirn * (4.5 + rng() * 5), zz;
    B.setGroup(0, null, path);
    for (zz = 0; zz < L; zz += .45) { B.pt(-.55, y, -zz, steel, 1.3); B.pt(.55, y, -zz, steel, 1.3); }
    for (zz = 0; zz < L; zz += 3) B.line(-.6, y - .05, -zz, .6, y - .05, -zz, 3, steel, 1.1, .6);
    for (zz = 6; zz < L; zz += 12) B.line(-.6, y + .02, -zz, .6, y + .02, -zz, 3, hot, 2.2);
    var n = Math.round(L / 7.5);
    for (var j = 0; j < n; j++) {
      var z0 = -(j * 7.5 + rng() * 3), s = 1.1 + rng() * .9, r = rng();
      var col = r < .6 ? [1, .35, .5] : (r < .85 ? [1, .8, .35] : [1, .92, .8]);
      B.setGroup(speed, z0, path);
      B.box((rng() - .5) * .3, y + .35 + s * .35, z0, s * 1.1, s * .7, s * 1.2, col, 5, Math.round(11 * Q + 3), 2.0);
      B.line(-s * .55, y + .35 + s * .7, z0, s * .55, y + .35 + s * .7, z0, 4, [1, .95, .7], 2.3);
      for (var t = 1; t <= 8; t++) B.pt(0, y + .5, z0 - Math.sign(speed) * (s * .7 + t * .55), col, 2.2 * (1 - t / 10), (1 - t / 9) * .8);
    }
  }
  B.clearGroup();
  for (var q = 0, nd = Math.round(1800 * Q); q < nd; q++) B.pt((rng() - .5) * 56, (rng() - .5) * 14, -rng() * L, [1, .7, .75], 1.1, .6);
  return {
    period: L, camY: 0, pitch: 0, drift: 4, grow: .5,
    sway: function (t) { return [Math.sin(t * .05) * 2.4, Math.sin(t * .037) * 1.2, 0]; },
    roll: function (t) { return Math.sin(t * .05) * .03; },
    hud: function (t, time) { return 'ไลน์คัดแยก · ' + Math.floor(1284 + time * 3.1 + t * .7).toLocaleString('en-US') + ' ชิ้น'; }
  };
}

var VARIANTS = {
  a: { build: buildA, seed: 7, clear: 0x06080f },
  b: { build: buildB, seed: 21, clear: 0x031110 },
  c: { build: buildC, seed: 42, clear: 0x0d0510 }
};

var cur = null, points = null;
function load(key) {
  if (!VARIANTS[key]) key = 'a';
  var V = VARIANTS[key];
  var B = new Builder(V.seed);
  cur = V.build(B);
  points = new THREE.Points(toGeometry(B), material);
  points.frustumCulled = false;
  scene.add(points);
  uniforms.uPeriod.value = cur.period; uniforms.uGrow.value = cur.grow;
  camera.position.set(0, cur.camY, 0);
  renderer.setClearColor(V.clear, 1);
}

load(opts.variant || 'a');

var mouse = { x: 9, y: 9, sx: 0, sy: 0, seen: false };
function onMove(e) {
  var r = container.getBoundingClientRect();
  if (e.clientY < r.top || e.clientY > r.bottom) { mouse.x = 9; mouse.y = 9; mouse.seen = false; return; }
  mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1; mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1; mouse.seen = true;
}
function onLeave() { mouse.x = 9; mouse.y = 9; mouse.seen = false; }
window.addEventListener('pointermove', onMove);
document.addEventListener('pointerleave', onLeave);

function resize() {
  renderer.setSize(W(), H());
  camera.aspect = W() / H(); camera.updateProjectionMatrix();
  uniforms.uAspect.value = camera.aspect;
}
window.addEventListener('resize', resize);
var ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
if (ro) ro.observe(container);

var visible = true, io = null;
if (window.IntersectionObserver) { io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }); io.observe(container); }

var last = performance.now(), time = 0, travel = 0, dTarget = 0, disperse = 0, raf = 0, dead = false;
function frame(now) {
  if (dead) return;
  raf = requestAnimationFrame(frame);
  var dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!visible || document.hidden) return;
  if (!reduced) time += dt;
  disperse += (dTarget - disperse) * (1 - Math.exp(-dt * 2.4));
  travel += (reduced ? 0 : cur.drift * (1 - disperse)) * dt;
  mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 7)); mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 7));
  var tx = mouse.seen ? mouse.sx : 0, ty = mouse.seen ? mouse.sy : 0;
  var sw = cur.sway(travel, time);
  uniforms.uTravel.value = travel; uniforms.uTime.value = time; uniforms.uDisperse.value = disperse;
  uniforms.uMouse.value.set(mouse.x > 5 ? 9 : mouse.sx, mouse.y > 5 ? 9 : mouse.sy);
  uniforms.uSway.value.set(sw[0], sw[1], sw[2]);
  camera.rotation.y = -tx * .07; camera.rotation.x = cur.pitch + ty * .045; camera.rotation.z = cur.roll(travel);
  renderer.render(scene, camera);
}
raf = requestAnimationFrame(frame);
return {
  disperse: function (v) { dTarget = v ? 1 : 0; },
  destroy: function () {
    dead = true; cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onMove); document.removeEventListener('pointerleave', onLeave); window.removeEventListener('resize', resize);
    if (ro) ro.disconnect(); if (io) io.disconnect();
    if (points) points.geometry.dispose(); material.dispose(); renderer.dispose();
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
};
} };
})();
