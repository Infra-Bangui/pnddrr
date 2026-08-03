/* module: shell/modal.js — PNDDRR engine (classic globals) */
/* ---------- Modale ---------- */
function openModal(title, body, footer){
  $("modalBox").innerHTML = `<div class="mh"><h3>${title}</h3><button onclick="closeModal()">×</button></div><div class="mb">${body}</div><div class="mf">${footer||'<button class="btn ghost" onclick="closeModal()">Fermer</button>'}</div>`;
  $("modalBack").classList.add("on");
}
function closeModal(){ $("modalBack").classList.remove("on"); }
$("modalBack").addEventListener("click",e=>{ if(e.target.id==="modalBack") closeModal(); });


