'use strict';
/* =====================================================================
   formulas.js — แท็บ "สูตร" (รายการการ์ด + โหมดท่องจำ) และหน้าต่าง "ทดลอง"
   (เลื่อนแถบปรับค่า → รูปเปลี่ยน → เห็นการแทนค่าและคำตอบ)
   ===================================================================== */

let fcat = 'all';
let lab = null;

const chipsHTML = (cur, attr) =>
  CATS.map(([k, n]) => `<button class="chip ${k === cur ? 'on' : ''}" ${attr}="${k}">${n}</button>`).join('');

function renderList() {
  let html = '', last = '';
  E.filter(e => fcat === 'all' || e.cat === fcat).forEach(e => {
    if (e.grp !== last) { html += `<div class="gh">${e.grp}</div>`; last = e.grp; }
    html += `<div class="card item" data-id="${e.id}">${shapeSVG(e, defaults(e), true)}
      <div><div class="nm">${e.name}</div><div class="fm">${e.f}</div></div></div>`;
  });
  $('#list').innerHTML = html;
}

/* ---------- หน้าต่างทดลอง ---------- */
function openLab(id) {
  const e = EM[id];
  lab = { e, p: defaults(e), pi: PIS[0] };
  $('#sheetBody').innerHTML = `
    <h2>${e.name}</h2><div class="cat">${CAT[e.cat]}</div>
    <div id="labSvg" class="labsvg"></div>
    <div class="sliders">${e.P.map(s => `
      <label>${s.label} = <b id="v-${s.k}">${s.val}</b>
        <input type="range" min="${s.min}" max="${s.max}" step="1" value="${s.val}" data-k="${s.k}"></label>`).join('')}</div>
    ${e.pi ? `<div class="seg"><span>ค่า π</span>${PIS.map((x, i) => `<button data-pi="${i}" class="${i === 0 ? 'on' : ''}">${x.n}</button>`).join('')}</div>` : ''}
    <div class="res">
      <div class="fm">${e.f}</div>
      <div id="labX" class="extra"></div>
      <div id="labSub" class="sub"></div>
      <div id="labVal" class="val"></div>
      ${e.note ? `<div class="note">${e.note}</div>` : ''}
    </div>
    <div class="tipbox">💡 ${e.tip}</div>`;
  $('#sheet').hidden = false;
  document.body.classList.add('lock');
  updLab();
}

function updLab() {
  const { e, p, pi } = lab;
  $('#labSvg').innerHTML = shapeSVG(e, p);
  $('#labX').innerHTML = e.x ? e.x(p) : '';
  $('#labSub').innerHTML = `แทนค่า: ${e.s(p, pi)}`;
  $('#labVal').innerHTML = `= <b>${fmt(e.v(p, pi))}</b> ${e.unit}`;
}

function closeLab() {
  $('#sheet').hidden = true;
  document.body.classList.remove('lock');
}

function initFormulas() {
  $('#fchips').innerHTML = chipsHTML(fcat, 'data-c');
  renderList();

  $('#fchips').addEventListener('click', ev => {
    const b = ev.target.closest('[data-c]');
    if (!b) return;
    fcat = b.dataset.c;
    $('#fchips').innerHTML = chipsHTML(fcat, 'data-c');
    renderList();
  });

  $('#blur').addEventListener('change', ev => $('#list').classList.toggle('blur', ev.target.checked));

  $('#list').addEventListener('click', ev => {
    const card = ev.target.closest('.item');
    if (!card) return;
    const fm = ev.target.closest('.fm');
    // โหมดท่องจำ: แตะสูตรครั้งแรก = เปิดเฉลย, แตะอีกครั้ง/แตะส่วนอื่น = เปิดหน้าทดลอง
    if (fm && $('#list').classList.contains('blur') && !fm.classList.contains('show')) {
      fm.classList.add('show');
      return;
    }
    openLab(card.dataset.id);
  });

  $('#sheet').addEventListener('click', ev => { if (ev.target.id === 'sheet' || ev.target.closest('#closeSheet')) closeLab(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeLab(); });

  $('#sheetBody').addEventListener('input', ev => {
    const k = ev.target.dataset && ev.target.dataset.k;
    if (!k || !lab) return;
    lab.p[k] = +ev.target.value;
    $('#v-' + k).textContent = ev.target.value;
    updLab();
  });
  $('#sheetBody').addEventListener('click', ev => {
    const b = ev.target.closest('[data-pi]');
    if (!b || !lab) return;
    lab.pi = PIS[+b.dataset.pi];
    $$('#sheetBody [data-pi]').forEach(x => x.classList.toggle('on', x === b));
    updLab();
  });
}
