'use strict';
/* =====================================================================
   main.js — สลับแท็บ + เริ่มต้นทุกส่วน
   ===================================================================== */

function go(tab) {
  $$('.tab').forEach(s => s.classList.toggle('on', s.id === 'tab-' + tab));
  $$('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  window.scrollTo({ top: 0 });
}

$('nav').addEventListener('click', ev => {
  const b = ev.target.closest('[data-tab]');
  if (b) go(b.dataset.tab);
});
// ปุ่มลัดในเนื้อหา เช่น "ไปเล่นเกม"
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-go]');
  if (b) go(b.dataset.go);
});

initFormulas();
initAnims();
initGame();
