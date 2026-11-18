'use strict';
/* =====================================================================
   game.js — แท็บ "เกม"
   โหมด: ✔✘ ตรงสูตรไหม? · 🎯 เลือกสูตร · 🧮 คำนวณ · 🔁 ทบทวนข้อที่พลาด
   - ถามรอบละ 10 ข้อ (แก้ได้ที่ ROUND)
   - จำสถิติถูก/ผิดรายสูตรไว้ใน localStorage → สูตรที่พลาดจะโผล่บ่อยขึ้น
   ===================================================================== */

const ROUND = 10;
const MODES = {
  tf:   { n: 'ตรงสูตรไหม?', i: '✔✘', d: 'ดูสูตรที่โชว์ แล้วตัดสินว่าถูกหรือผิด' },
  mc:   { n: 'เลือกสูตร', i: '🎯', d: 'ดูรูปทรงและชื่อ แล้วเลือกสูตรที่ใช่' },
  calc: { n: 'คำนวณ', i: '🧮', d: 'แทนค่าแล้วเลือกคำตอบ (ใช้ π = 3.14)' },
  rev:  { n: 'ทบทวนข้อที่พลาด', i: '🔁', d: 'วนเฉพาะสูตรที่เคยตอบผิด' }
};

let G = null;          // สถานะรอบที่กำลังเล่น
let gcat = 'all';      // หมวดที่เลือก
const asObj = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}; // กันข้อมูลใน localStorage เพี้ยน
let stats = asObj(store.get('fm_stats', {}));

const weak = e => { const s = stats[e.id]; return !!s && s.ng > 0 && s.ok <= s.ng * 2; };

/* ---------- เลือกสูตรมาถาม (สูตรที่เคยพลาดมีน้ำหนักมากกว่า) ---------- */
function wsort(ps) {
  return ps.map(e => {
    const s = stats[e.id] || { ok: 0, ng: 0 };
    const w = Math.max(.5, 1 + 2 * s.ng - .5 * s.ok);
    return [e, Math.pow(Math.random(), 1 / w)];
  }).sort((a, b) => b[1] - a[1]).map(x => x[0]);
}
function pickEntries(ps, n) {
  const out = [];
  let bag = [];
  while (out.length < n) {
    if (!bag.length) {
      bag = wsort(ps);
      if (out.length && bag.length > 1 && bag[0] === out[out.length - 1]) bag.push(bag.shift());
    }
    out.push(bag.shift());
  }
  return out;
}

/* ---------- สร้างโจทย์ ---------- */
function makeQ(e, type) {
  if (type === 'tf') {
    const ok = Math.random() < .5;
    return { type, e, ok, show: ok ? e.f : pick(e.d)[0] };
  }
  if (type === 'mc') {
    const opts = shuffle([{ h: e.f, ok: 1 }, ...shuffle(e.d).slice(0, 3).map(d => ({ h: d[0], ok: 0 }))]);
    return { type, e, opts };
  }
  const p = e.g ? e.g() : defGen(e), pi = PIS[0], c = r2(e.v(p, pi));
  let wr = [];
  shuffle(e.d).forEach(d => {
    const w = r2(d[1](p, pi));
    if (isFinite(w) && w > 0 && w !== c && !wr.includes(w)) wr.push(w);
  });
  wr = wr.slice(0, 3);
  for (const w of [r2(c * 2), r2(c / 2), r2(c * 3), r2(c + 10), r2(c * 1.5)]) {
    if (wr.length >= 3) break;
    if (w > 0 && w !== c && !wr.includes(w)) wr.push(w);
  }
  return { type, e, p, c, opts: shuffle([{ t: c, ok: 1 }, ...wr.map(t => ({ t, ok: 0 }))]) };
}

/* ---------- หน้าแรกของเกม ---------- */
function gameHome() {
  G = null;
  const wk = E.filter(weak).length, best = asObj(store.get('fm_best', {}));
  $('#game').innerHTML =
    `<div class="chips">${chipsHTML(gcat, 'data-g')}</div>` +
    ['tf', 'mc', 'calc', 'rev'].map(m => {
      const dis = m === 'rev' && !wk;
      const desc = m === 'rev' ? (wk ? `มี ${wk} สูตรที่ควรทบทวน` : 'ยังไม่มีข้อที่พลาด 🎉') : MODES[m].d;
      return `<button class="mode" data-act="start" data-m="${m}" ${dis ? 'disabled' : ''}>
        <span class="mi">${MODES[m].i}</span>
        <span><b>${MODES[m].n}</b><br><small>${desc}</small>${best[m] != null && m !== 'rev' ? `<br><small>คะแนนสูงสุด ${best[m]}/${ROUND}</small>` : ''}</span></button>`;
    }).join('') +
    `<button class="btn ghost small" data-act="reset">ล้างสถิติการทบทวน</button>`;
}

function startGame(m) {
  let ps = m === 'rev' ? E.filter(weak) : E.filter(e => gcat === 'all' || e.cat === gcat);
  if (!ps.length) return;
  const es = pickEntries(ps, ROUND);
  G = { mode: m, i: 0, score: 0, streak: 0, lock: false, missed: [],
        qs: es.map(e => makeQ(e, m === 'rev' ? pick(['tf', 'mc', 'calc']) : m)) };
  renderQ();
}

/* ---------- แสดงโจทย์ ---------- */
function renderQ() {
  const q = G.qs[G.i], e = q.e;
  G.lock = false;
  let body = '';
  if (q.type === 'tf') {
    body = `<div class="qc">${shapeSVG(e, defaults(e))}<div class="qn">${e.name}</div><div class="qf">${q.show}</div></div>
      <div class="two"><button class="opt" data-act="ans" data-v="1">✔ ถูก</button><button class="opt" data-act="ans" data-v="0">✘ ผิด</button></div>`;
  } else if (q.type === 'mc') {
    body = `<div class="qc">${shapeSVG(e, defaults(e))}<div class="qn">สูตรของ <b>${e.name}</b> คือข้อไหน?</div></div>` +
      q.opts.map((o, i) => `<button class="opt" data-act="ans" data-v="${i}">${o.h}</button>`).join('');
  } else {
    const given = e.P.map(s => `${s.label} = <b>${q.p[s.k]}</b>`).join(' , ') + (e.x ? ` , ℓ = <b>${fmt(L(q.p))}</b>` : '');
    const notes = [e.pi ? 'ใช้ π = 3.14' : '', e.id === 'equi' ? 'ใช้ √3 ≈ 1.73' : ''].filter(Boolean).join(' · ');
    body = `<div class="qc">${shapeSVG(e, q.p)}<div class="qn">หา <b>${e.name}</b></div>
      <div class="giv">${given}</div>${notes ? `<div class="note">${notes}</div>` : ''}</div>` +
      q.opts.map((o, i) => `<button class="opt" data-act="ans" data-v="${i}">${fmt(o.t)} <small>${e.unit}</small></button>`).join('');
  }
  $('#game').innerHTML =
    `<div class="gtop"><span>ข้อ ${G.i + 1}/${G.qs.length}</span><span>⭐ ${G.score}</span><span>${G.streak >= 2 ? '🔥 ' + G.streak : ''}</span></div>
     <div class="pg"><i style="width:${G.i / G.qs.length * 100}%"></i></div>${body}<div id="fb"></div>`;
}

/* ---------- ตอบ / เฉลย ---------- */
function answer(v) {
  if (!G || G.lock) return;
  G.lock = true;
  v = +v;
  const q = G.qs[G.i], e = q.e;
  const ok = q.type === 'tf' ? v === (q.ok ? 1 : 0) : !!q.opts[v].ok;
  $$('#game .opt').forEach((b, i) => {
    const isRight = q.type === 'tf' ? +b.dataset.v === (q.ok ? 1 : 0) : !!q.opts[i].ok;
    if (isRight) b.classList.add('ok');
    else if (+b.dataset.v === v) b.classList.add('ng');
    b.disabled = true;
  });
  const s = stats[e.id] || { ok: 0, ng: 0 };
  ok ? s.ok++ : s.ng++;
  stats[e.id] = s;
  store.set('fm_stats', stats);
  if (ok) { G.score++; G.streak++; } else { G.streak = 0; if (!G.missed.includes(e)) G.missed.push(e); }
  if (navigator.vibrate) navigator.vibrate(ok ? 12 : [30, 40, 30]);
  const last = G.i + 1 >= G.qs.length;
  $('#fb').innerHTML = `<div class="fb ${ok ? 'g' : 'b'}">
      <b>${ok ? '✅ ถูกต้อง!' : '❌ ยังไม่ใช่'}</b>${ok && G.streak >= 3 ? ` 🔥 ติดกัน ${G.streak} ข้อ` : ''}
      <div class="fx">สูตรที่ถูก: ${e.f}</div>
      ${q.type === 'tf' && !q.ok ? `<div class="fx">สูตรที่โชว์ผิด: ${q.show}</div>` : ''}
      ${q.type === 'calc' ? `<div class="fx">แทนค่า: ${e.s(q.p, PIS[0])} = <b>${fmt(q.c)}</b> ${e.unit}</div>` : ''}
      <div class="fx tp">💡 ${e.tip}</div></div>
    <button class="btn wide" data-act="next">${last ? 'ดูผลคะแนน' : 'ข้อต่อไป →'}</button>`;
  $('#fb').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function nextQ() {
  G.i++;
  G.i >= G.qs.length ? endGame() : renderQ();
}

function endGame() {
  const b = asObj(store.get('fm_best', {}));
  const newBest = G.mode !== 'rev' && (b[G.mode] == null || G.score > b[G.mode]);
  if (newBest) { b[G.mode] = G.score; store.set('fm_best', b); }
  const pct = G.score / G.qs.length;
  const msg = pct === 1 ? '🏆 เต็ม! จำได้แม่นมาก' : pct >= .8 ? '👏 เก่งมาก เหลืออีกนิดเดียว' : pct >= .5 ? '👍 ใช้ได้ ทบทวนข้อที่พลาดอีกรอบ' : '💪 ไม่เป็นไร ดูแท็บ "จำง่าย" แล้วลองใหม่';
  $('#game').innerHTML = `<div class="end"><div class="big">${G.score}<small>/${G.qs.length}</small></div>
    <div>${msg}</div>${newBest ? '<div class="newbest">🎉 คะแนนสูงสุดใหม่!</div>' : ''}</div>
    ${G.missed.length ? `<h3>สูตรที่พลาดรอบนี้</h3>` + G.missed.map(e => `<div class="card miss"><b>${e.name}</b><div class="fm">${e.f}</div><div class="tipbox">💡 ${e.tip}</div></div>`).join('') : ''}
    <div class="two"><button class="btn" data-act="start" data-m="${G.mode}">เล่นอีกครั้ง</button><button class="btn ghost" data-act="home">กลับหน้าเกม</button></div>`;
}

function initGame() {
  gameHome();
  $('#game').addEventListener('click', ev => {
    const g = ev.target.closest('[data-g]');
    if (g) { gcat = g.dataset.g; gameHome(); return; }
    const b = ev.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (a === 'start') startGame(b.dataset.m);
    else if (a === 'ans') answer(b.dataset.v);
    else if (a === 'next') nextQ();
    else if (a === 'home') gameHome();
    else if (a === 'reset') { stats = {}; store.set('fm_stats', stats); gameHome(); }
  });
}
