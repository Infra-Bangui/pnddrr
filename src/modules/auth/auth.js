/* module: auth/auth.js — PNDDRR engine (classic globals) */
/* ---------- Authentification ---------- */
function doLogin(){
  const u = DB.users.find(x=>x.login===$("loginUser").value.trim() && x.actif && pwdOK(x,$("loginPass").value));
  if(!u){ $("loginErr").style.display="block"; return; }
  CUR = u; $("loginErr").style.display="none";
  $("loginScreen").style.display="none"; $("app").classList.add("on");
  $("uName").textContent = u.nom; $("uRole").textContent = ROLES[u.role];
  $("todayLbl").textContent = new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  log("Connexion", `Ouverture de session (${ROLES[u.role]})`);
  buildNav(); updNetBadge(); go("dashboard");
}
["loginUser","loginPass"].forEach(id=>$(id).addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); doLogin(); } }));
$("loginForm").addEventListener("submit",e=>{ e.preventDefault(); doLogin(); });
function mMonPass(){
  openModal("Changer mon mot de passe", `
    <div class="field"><label>Mot de passe actuel</label><input type="password" id="mp_old"></div>
    <div class="grid2"><div class="field"><label>Nouveau mot de passe</label><input type="password" id="mp_new"></div>
    <div class="field"><label>Confirmation</label><input type="password" id="mp_new2"></div></div>
    <p class="small muted">Au moins 6 caractères. Les mots de passe sont conservés hachés (SHA-256) — ils ne peuvent pas être relus, seulement réinitialisés par l'administrateur.</p>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveMonPass()">Changer</button>`);
}
function saveMonPass(){
  if(!pwdOK(CUR,$("mp_old").value)){ toast("Mot de passe actuel incorrect."); return; }
  const nv=$("mp_new").value;
  if(nv.length<6){ toast("Le nouveau mot de passe doit compter au moins 6 caractères."); return; }
  if(nv!==$("mp_new2").value){ toast("La confirmation ne correspond pas."); return; }
  CUR.pass=hashPwd(nv); log("Mot de passe","Changement du mot de passe personnel");
  closeModal(); toast("Mot de passe changé.");
}
/* Verrouillage automatique après 15 minutes d'inactivité */
var LOCK_T=Date.now(), LOCKED=false;
["click","keydown","input"].forEach(ev=>document.addEventListener(ev,()=>{ LOCK_T=Date.now(); },true));
function checkLock(){
  const min=+cfg("verrouMin");
  if(!min||!CUR||LOCKED) return;
  if(Date.now()-LOCK_T>min*60*1000) lockSession();
}
setInterval(checkLock, 30000);
function lockSession(){
  LOCKED=true;
  $("lockName").textContent=CUR.nom;
  $("lockPass").value=""; $("lockErr").style.display="none";
  $("lockScreen").style.display="flex";
  log("Session","Verrouillage automatique (inactivité)");
}
function unlockSession(){
  if(!pwdOK(CUR,$("lockPass").value)){ $("lockErr").style.display="block"; return; }
  LOCKED=false; LOCK_T=Date.now(); $("lockScreen").style.display="none";
  log("Session","Déverrouillage");
}
function logout(){ log("Déconnexion","Fermeture de session"); CUR=null; $("app").classList.remove("on"); $("loginScreen").style.display="flex"; $("loginForm").reset(); }

