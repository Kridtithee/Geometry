'use strict';
/* =====================================================================
   shapes.js — วาดรูปทรงด้วย SVG (ขนาดรูปเปลี่ยนตามค่าที่ปรับ)
   แต่ละฟังก์ชันรับ (p = ค่าตัวแปร, S = สเปกของตัวแปร) แล้วคืน SVG ภายใน
   viewBox 0 0 220 170   สี/เส้นแก้ใน style.css (.sf .sf2 .sf3 .dash .lbl)
   ===================================================================== */

const r1 = x => Math.round(x * 10) / 10;
const sc = (p, S, k, lo, hi) => lo + (hi - lo) * clamp((p[k] - S[k].min) / (S[k].max - S[k].min), 0, 1);
const T = (x, y, t, c = '') => `<text x="${r1(x)}" y="${r1(y)}" class="lbl ${c}">${t}</text>`;
const Ln = (a, b, c, d, cls = 'dash') => `<line x1="${r1(a)}" y1="${r1(b)}" x2="${r1(c)}" y2="${r1(d)}" class="${cls}"/>`;
const Pg = (pts, cls = 'sf') => `<polygon points="${pts.map(q => q.map(r1).join(',')).join(' ')}" class="${cls}"/>`;
const Rc = (x, y, w, h, cls = 'sf') => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" class="${cls}"/>`;
const El = (cx, cy, rx, ry, cls = 'sf') => `<ellipse cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" class="${cls}"/>`;
// เครื่องหมายมุมฉาก ที่มุม (x,y) ชี้เข้าด้านใน dx,dy = ±1
const RA = (x, y, dx = 1, dy = -1, s = 9) => `<path d="M${r1(x + dx * s)},${r1(y)} L${r1(x + dx * s)},${r1(y + dy * s)} L${r1(x)},${r1(y + dy * s)}" class="dash"/>`;

const DRAW = {
  tri(p, S) {
    const B = sc(p, S, 'b', 70, 170), H = sc(p, S, 'h', 50, 115), x0 = (220 - B) / 2, y = 138, ax = x0 + B * .3;
    return Pg([[x0, y], [x0 + B, y], [ax, y - H]]) + Ln(ax, y - H, ax, y) + RA(ax, y, 1, -1, 8) +
      T(110, 157, 'ฐาน') + T(ax + 16, y - H / 2, 'สูง');
  },
  equi(p, S) {
    const s = sc(p, S, 'a', 60, 150), h = s * .866, y = 140;
    return Pg([[110 - s / 2, y], [110 + s / 2, y], [110, y - h]]) + T(110, 158, 'ด้าน') +
      T(110 + s / 4 + 14, y - h / 2, 'ด้าน') + T(110 - s / 4 - 14, y - h / 2, 'ด้าน');
  },
  right(p, S) {
    const W = sc(p, S, 'w', 50, 150), H = sc(p, S, 'u', 40, 115), x0 = (220 - W) / 2, y = 140;
    return Pg([[x0, y], [x0 + W, y], [x0, y - H]]) + RA(x0, y, 1, -1, 10) +
      T(x0 - 12, y - H / 2 + 4, '①') + T(x0 + W / 2, 158, '②');
  },
  square(p, S) {
    const s = sc(p, S, 'a', 50, 120), x = 110 - s / 2, y = 76 - s / 2;
    return Rc(x, y, s, s) + Ln(x, y, x + s, y + s) + Ln(x + s, y, x, y + s) + T(110, y + s + 15, 'ด้าน');
  },
  rect(p, S) {
    const W = sc(p, S, 'l', 70, 170), H = sc(p, S, 'w', 40, 105), x = 110 - W / 2, y = 76 - H / 2;
    return Rc(x, y, W, H) + T(110, y + H + 15, 'ยาว') + T(x - 4, y + H / 2 + 4, 'กว้าง', 'r');
  },
  rhombus(p, S) {
    const D1 = sc(p, S, 'd1', 70, 180), D2 = sc(p, S, 'd2', 50, 130), cx = 110, cy = 76;
    return Pg([[cx - D1 / 2, cy], [cx, cy - D2 / 2], [cx + D1 / 2, cy], [cx, cy + D2 / 2]]) +
      Ln(cx - D1 / 2, cy, cx + D1 / 2, cy) + Ln(cx, cy - D2 / 2, cx, cy + D2 / 2) +
      T(cx + D1 / 4, cy - 5, 'd₁') + T(cx + 11, cy + D2 / 4 + 4, 'd₂');
  },
  para(p, S) {
    const B = sc(p, S, 'b', 70, 140), H = sc(p, S, 'h', 45, 105), sh = 34, x0 = (220 - B - sh) / 2, yb = 76 + H / 2;
    return Pg([[x0, yb], [x0 + B, yb], [x0 + B + sh, yb - H], [x0 + sh, yb - H]]) +
      Ln(x0 + sh, yb - H, x0 + sh, yb) + RA(x0 + sh, yb, 1, -1, 8) +
      T(x0 + B / 2, yb + 16, 'ฐาน') + T(x0 + sh + 15, yb - H / 2 + 4, 'สูง');
  },
  kite(p, S) {
    const D1 = sc(p, S, 'd1', 70, 170), D2 = sc(p, S, 'd2', 60, 140), cx = 110, yT = 78 - D2 / 2, yC = yT + D2 * .38, yB = yT + D2;
    return Pg([[cx, yT], [cx + D1 / 2, yC], [cx, yB], [cx - D1 / 2, yC]]) +
      Ln(cx - D1 / 2, yC, cx + D1 / 2, yC) + Ln(cx, yT, cx, yB) +
      T(cx + D1 / 4, yC - 5, 'd₁') + T(cx + 12, yC + D2 * .3, 'd₂');
  },
  trap(p, S) {
    const A = sc(p, S, 'a', 40, 110), B = sc(p, S, 'b', 90, 180), H = sc(p, S, 'h', 40, 105), yb = 78 + H / 2, yt = 78 - H / 2;
    return Pg([[110 - B / 2, yb], [110 + B / 2, yb], [110 + A / 2, yt], [110 - A / 2, yt]]) +
      Ln(110 - A / 2, yt, 110 - A / 2, yb) + RA(110 - A / 2, yb, 1, -1, 8) +
      T(110, yt - 6, 'a') + T(110, yb + 16, 'b') + T(110 - A / 2 + 13, 78 + 4, 'h');
  },
  circle(p, S) {
    const R = sc(p, S, 'r', 20, 72);
    return El(110, 78, R, R) + Ln(110, 78, 110 + R, 78) + `<circle cx="110" cy="78" r="2.5" class="dot"/>` + T(110 + R / 2, 72, 'r');
  },
  sphere(p, S) {
    const R = sc(p, S, 'r', 25, 70);
    return El(110, 78, R, R) + El(110, 78, R, R * .3, 'dash') + Ln(110, 78, 110 + R, 78) +
      `<circle cx="110" cy="78" r="2.5" class="dot"/>` + T(110 + R / 2, 72, 'r');
  },
  cyl(p, S) {
    const Rx = sc(p, S, 'r', 25, 62), Hh = sc(p, S, 'h', 45, 105), ry = Rx * .3, yT = 78 - Hh / 2, yB = 78 + Hh / 2;
    return `<path d="M${r1(110 - Rx)},${r1(yT)} L${r1(110 - Rx)},${r1(yB)} A${r1(Rx)},${r1(ry)} 0 0 0 ${r1(110 + Rx)},${r1(yB)} L${r1(110 + Rx)},${r1(yT)}" class="sf"/>` +
      El(110, yT, Rx, ry, 'sf2') + Ln(110, yT, 110 + Rx, yT) + T(110 + Rx / 2, yT + 4 - 7, 'r') +
      Ln(110 + Rx + 9, yT, 110 + Rx + 9, yB) + T(110 + Rx + 21, 82, 'h');
  },
  cone(p, S) {
    const Rx = sc(p, S, 'r', 20, 60), Hh = sc(p, S, 'h', 45, 110), ry = Rx * .3, yT = 76 - Hh / 2, yB = 76 + Hh / 2;
    return `<path d="M110,${r1(yT)} L${r1(110 - Rx)},${r1(yB)} A${r1(Rx)},${r1(ry)} 0 0 0 ${r1(110 + Rx)},${r1(yB)} Z" class="sf"/>` +
      Ln(110, yT, 110, yB) + Ln(110, yB, 110 + Rx, yB) +
      T(101, (yT + yB) / 2 + 4, 'h') + T(110 + Rx / 2, yB + 15, 'r') + T(110 + Rx / 2 + 13, (yT + yB) / 2 - 2, 'ℓ');
  },
  prism(p, S) {
    const W = sc(p, S, 'l', 60, 120), D = sc(p, S, 'w', 18, 45), dx = D * .9, dy = D * .55, H = sc(p, S, 'h', 35, 85),
      x0 = (220 - W - dx) / 2, y0 = 78 + (H + dy) / 2, yt = y0 - H;
    return Rc(x0, yt, W, H) +
      Pg([[x0, yt], [x0 + dx, yt - dy], [x0 + W + dx, yt - dy], [x0 + W, yt]], 'sf2') +
      Pg([[x0 + W, yt], [x0 + W + dx, yt - dy], [x0 + W + dx, y0 - dy], [x0 + W, y0]], 'sf3') +
      T(x0 + W / 2, y0 + 15, 'ยาว') + T(x0 - 4, yt + H / 2 + 4, 'สูง', 'r') + T(x0 + W + dx / 2 + 14, y0 - dy / 2 + 12, 'กว้าง');
  },
  pyramid(p, S) {
    const W = sc(p, S, 'l', 70, 130), D = sc(p, S, 'w', 20, 40), dx = D * .9, dy = D * .5, H = sc(p, S, 'h', 45, 105),
      x0 = (220 - W - dx) / 2, yb = 140, qx = x0 + (W + dx) / 2, qy = yb - dy / 2 - H;
    return Pg([[x0, yb], [x0 + W, yb], [x0 + W + dx, yb - dy], [x0 + dx, yb - dy]], 'sf2') +
      Ln(qx, qy, x0 + dx, yb - dy) +
      Pg([[qx, qy], [x0, yb], [x0 + W, yb]]) + Pg([[qx, qy], [x0 + W, yb], [x0 + W + dx, yb - dy]], 'sf3') +
      Ln(qx, qy, qx, yb - dy / 2) + T(qx - 10, (qy + yb) / 2, 'h') +
      T(x0 + W / 2, yb + 15, 'ยาว') + T(x0 + W + dx / 2 + 14, yb - dy / 2 + 12, 'กว้าง');
  }
};

// mini = true → ซ่อนตัวอักษรในรูปเล็ก (การ์ดรายการ)
function shapeSVG(e, p, mini) {
  return `<svg viewBox="0 0 220 170" class="${mini ? 'mini' : ''}" role="img" aria-label="${e.name}">${DRAW[e.sh](p, e.S)}</svg>`;
}
