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

// เริ่มทีละส่วน: ถ้าส่วนไหนพัง (หรือไฟล์ของมันโหลดไม่ขึ้น) แท็บนั้นจะแสดงข้อความแจ้ง แทนที่จะว่างเปล่า
// และไม่ลากส่วนอื่นพังตามไปด้วย
function safeInit(name, tabId, fn) {
  try {
    if (typeof fn !== 'function') throw new Error(name + ' ไม่ถูกโหลด (ตรวจว่าไฟล์อยู่ในโฟลเดอร์เดียวกับ index.html และชื่อตรง)');
    fn();
  } catch (err) {
    console.error(err);
    $(tabId).innerHTML = '<div class="card"><b>⚠️ แท็บนี้เริ่มทำงานไม่ได้</b><div class="hint">' +
      String(err && err.message || err) + '</div></div>';
  }
}
safeInit('formulas.js', '#tab-formulas', typeof initFormulas === 'function' ? initFormulas : null);
safeInit('anim.js', '#tab-anim', typeof initAnims === 'function' ? initAnims : null);
safeInit('game.js', '#tab-game', typeof initGame === 'function' ? initGame : null);
