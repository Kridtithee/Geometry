'use strict';
/* =====================================================================
   anim.js — แท็บ "ภาพเคลื่อนไหว"
   แต่ละอันคือ { id, title, vb(viewBox), dur(มิลลิวินาที), svg(t), cap(t) }
   t = ความคืบหน้า 0..1  (กดเล่น หรือลากแถบเลื่อนดูทีละขั้นได้)
   อยากเพิ่มแอนิเมชันใหม่ ก็เพิ่มอีกหนึ่งออบเจ็กต์ในอาร์เรย์ ANIMS
   ===================================================================== */

const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a, b, t) => a + (b - a) * t;

const ANIMS = [
  /* 1) กรวย = ⅓ ของทรงกระบอก */
  { id: 'cone', title: '🍦 กรวย = ⅓ ของทรงกระบอก', vb: '0 0 320 175', dur: 7000,
    svg(t) {
      const ph = t * 3, n = Math.min(2, Math.floor(ph)), f = ph - n;
      const hf = Math.cbrt(Math.max(0, 1 - f));        // ระดับน้ำในกรวย (ปริมาตรลดลง → ความสูงลดตามรากที่ 3)
      const lv = (n + f) / 3;                          // ระดับน้ำในทรงกระบอก
      const wx = 80, wy = 140;
      return `<polygon points="${wx},${wy} ${r1(wx - 46 * hf)},${r1(wy - 100 * hf)} ${r1(wx + 46 * hf)},${r1(wy - 100 * hf)}" class="wtr"/>` +
        `<polygon points="34,40 126,40 80,140" class="ol"/>` +
        `<rect x="200" y="${r1(140 - 100 * lv)}" width="92" height="${r1(100 * lv)}" class="wtr"/>` +
        `<rect x="200" y="40" width="92" height="100" class="ol"/>` +
        T(80, 160, 'กรวย') + T(246, 160, 'ทรงกระบอก') + T(163, 92, '➜') +
        T(160, 22, 'เทครั้งที่ ' + (n + 1) + ' / 3', 'acc');
    },
    cap(t) {
      return t >= .999
        ? `เท 3 ครั้งเต็มพอดี → ทรงกระบอก = 3 × กรวย<br><b>กรวย = ${F(1, 3)} × πr${S2} × สูง</b>`
        : `ฐานกว้างเท่ากัน สูงเท่ากัน · กำลังเทครั้งที่ ${Math.floor(t * 3) + 1} จาก 3 …`;
    } },

  /* 2) สามเหลี่ยม = ครึ่งหนึ่งของด้านขนาน */
  { id: 'tri', title: '🔺 สามเหลี่ยม = ½ × ฐาน × สูง', vb: '0 0 300 180', dur: 4500,
    svg(t) {
      const ang = 180 * ease(t), tri = '60,150 180,150 110,55';
      return `<polygon points="${tri}" class="sf"/>` +
        `<g transform="rotate(${r1(ang)} 145 102.5)"><polygon points="${tri}" class="sf3" style="opacity:.85"/></g>` +
        Ln(110, 55, 110, 150) + T(100, 112, 'สูง', 'r') + T(120, 168, 'ฐาน');
    },
    cap(t) {
      return t < .98
        ? 'ก๊อปสามเหลี่ยมอีกอัน แล้วหมุน 180° รอบจุดกึ่งกลางด้านเฉียง …'
        : `ได้สี่เหลี่ยมด้านขนาน (ฐาน × สูง) → สามเหลี่ยมคือครึ่งหนึ่ง<br><b>${F(1, 2)} × ฐาน × สูง</b>`;
    } },

  /* 3) คางหมู = ½ × (a+b) × สูง */
  { id: 'trap', title: '⏢ คางหมู = ½ × (a+b) × สูง', vb: '0 0 320 185', dur: 5000,
    svg(t) {
      const ang = 180 * ease(t), tp = '50,150 190,150 160,70 90,70', end = t >= .98;
      return `<polygon points="${tp}" class="sf"/>` +
        `<g transform="rotate(${r1(ang)} 175 110)"><polygon points="${tp}" class="sf3" style="opacity:.85"/></g>` +
        Ln(90, 70, 90, 150) +
        (end ? T(195, 60, 'a + b', 'acc') + T(155, 168, 'a + b', 'acc') + T(82, 114, 'สูง', 'r')
             : T(125, 62, 'a') + T(120, 168, 'b') + T(82, 114, 'สูง', 'r'));
    },
    cap(t) {
      return t < .98
        ? 'ก๊อปคางหมูแล้วหมุน 180° ต่อเข้าด้านข้าง …'
        : `ได้สี่เหลี่ยมด้านขนาน ฐาน = (a + b) สูงเท่าเดิม → คางหมูคือครึ่งหนึ่ง<br><b>${F(1, 2)} × (a + b) × สูง</b>`;
    } },

  /* 4) ทรงกระบอก คลี่ออก */
  { id: 'cyl', title: '🥫 คลี่ทรงกระบอก → พื้นที่ผิว', vb: '0 0 320 200', dur: 5500,
    svg(t) {
      const e = ease(t), R = 24, w = lerp(2 * R, 2 * Math.PI * R, e), ry = lerp(R * .3, R, e);
      const cyT = lerp(60, 34, e), cyB = lerp(140, 166, e), end = t >= .9;
      return Rc(160 - w / 2, 60, w, 80) + El(160, cyT, R, ry, 'sf2') + El(160, cyB, R, ry, 'sf2') +
        (end ? T(160, 104, '2πr × h', 'acc') + T(160, cyT + 4, 'πr²') + T(160, cyB + 4, 'πr²') +
          T(160 + w / 2 + 14, 104, 'h') : '');
    },
    cap(t) {
      return t < .9
        ? 'ตัดตามแนวตั้ง แล้วคลี่ด้านข้างออกเป็นแผ่นผืนผ้า …'
        : `ด้านข้าง = สี่เหลี่ยมผืนผ้า (กว้าง = เส้นรอบวง 2πr, สูง h) = <b>2πrh</b><br>ฝาบน + ฝาล่าง = 2 × πr²<br><b>พื้นที่ผิว = 2πrh + 2πr${S2}</b>`;
    } }
];

function initAnims() {
  const host = $('#tab-anim');
  host.innerHTML = '<p class="hint">กด ▶ เล่น หรือลากแถบเลื่อนเพื่อดูทีละขั้น</p>';
  ANIMS.forEach(a => {
    const c = document.createElement('div');
    c.className = 'card an';
    c.innerHTML = `<h3>${a.title}</h3><svg viewBox="${a.vb}"></svg><div class="cap"></div>
      <div class="ctl"><button class="btn">▶ เล่น</button><input type="range" min="0" max="1000" value="0"></div>`;
    host.appendChild(c);
    const svg = c.querySelector('svg'), cap = c.querySelector('.cap'), btn = c.querySelector('button'), sl = c.querySelector('input');
    const st = { t: 0, raf: 0 };
    const draw = t => { st.t = t; svg.innerHTML = a.svg(t); cap.innerHTML = a.cap(t); sl.value = Math.round(t * 1000); };
    const stop = () => { cancelAnimationFrame(st.raf); st.raf = 0; btn.textContent = '▶ เล่น'; };
    btn.onclick = () => {
      if (st.raf) { stop(); return; }
      if (st.t >= 1) st.t = 0;
      const t0 = performance.now(), s0 = st.t;
      btn.textContent = '⏸ หยุด';
      const step = now => {
        const t = s0 + (now - t0) / a.dur;
        if (t >= 1) { draw(1); stop(); btn.textContent = '↺ เล่นซ้ำ'; return; }
        draw(t);
        st.raf = requestAnimationFrame(step);
      };
      st.raf = requestAnimationFrame(step);
    };
    sl.oninput = () => { stop(); draw(sl.value / 1000); };
    draw(0);
  });
}
