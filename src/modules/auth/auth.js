/* module: auth/auth.js — PNDDRR engine (classic globals) */
/* ---------- Authentification ---------- */
function doLogin(){
  const login=$("loginUser").value.trim(), pass=$("loginPass").value;
  $("loginErr").style.display="none";
  fetch("/api/login",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({login,password:pass})})
    .then(r=>{
      if(r.status===429){ $("loginErr").textContent="Trop de tentatives. Réessayez plus tard."; $("loginErr").style.display="block"; return null; }
      if(r.status===401){ $("loginErr").textContent="Identifiant ou mot de passe incorrect."; $("loginErr").style.display="block"; return null; }
      if(!r.ok) throw new Error("login");
      window.__PNDDRR_SERVER=true;
      return fetch("/api/db",{credentials:"include"}).then(x=>{ if(!x.ok) throw new Error("db"); return x.json(); });
    })
    .then(db=>{
      if(!db) return;
      applyServerDb(db);
      const u=DB.users.find(x=>x.login===login&&x.actif);
      if(!u){ $("loginErr").textContent="Identifiant ou mot de passe incorrect."; $("loginErr").style.display="block"; return; }
      enterSession(u);
    })
    .catch(()=>{
      /* Hors ligne / pas d'API : repli local uniquement si le serveur n'est pas en face */
      if(window.__PNDDRR_SERVER){ $("loginErr").textContent="Impossible de charger le registre."; $("loginErr").style.display="block"; return; }
      const u=DB.users.find(x=>x.login===login && x.actif && pwdOK(x,pass));
      if(!u){ $("loginErr").textContent="Identifiant ou mot de passe incorrect."; $("loginErr").style.display="block"; return; }
      enterSession(u);
    });
}
function applyServerDb(db){
  if(!(db&&db.combattants&&db.users)) return false;
  DB=db; migrateDB();
  window.__PNDDRR_SYNCED=true;
  if(HAS_LS){ try{ localStorage.setItem(LS_KEY, JSON.stringify(DB)); localStorage.setItem(LS_TS, new Date().toISOString()); }catch(e){} }
  return true;
}
function enterSession(u, opts){
  CUR=u; $("loginErr").style.display="none";
  $("loginScreen").style.display="none"; $("app").classList.add("on");
  $("uName").textContent=u.nom; $("uRole").textContent=ROLES[u.role];
  $("todayLbl").textContent=new Date().toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  if(!(opts&&opts.resume)) log("Connexion",`Ouverture de session (${ROLES[u.role]})`);
  buildNav(); updNetBadge(); go("dashboard");
}
function resumeSession(user){
  fetch("/api/db",{credentials:"include"})
    .then(x=>{ if(!x.ok) throw new Error("db"); return x.json(); })
    .then(db=>{
      applyServerDb(db);
      const u=DB.users.find(x=>x.login===user.login&&x.actif);
      if(u) enterSession(u,{resume:true});
    })
    .catch(()=>{});
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
  CUR.pass=hashPwd(nv); CUR.passUpdated=true; log("Mot de passe","Changement du mot de passe personnel");
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
function logout(){
  fetch("/api/logout",{method:"POST",credentials:"include"}).catch(()=>{});
  log("Déconnexion","Fermeture de session"); CUR=null; $("app").classList.remove("on"); $("loginScreen").style.display="flex"; $("loginForm").reset();
}
fetch("/api/config",{credentials:"include"}).then(r=>r.json()).then(c=>{
  window.__PNDDRR_SERVER=!!c.server;
  window.__PNDDRR_DEMO=!!c.demo;
  const h=$("demoHint"); if(h&&c.demo) h.style.display="block";
  if(c.user&&c.user.login) resumeSession(c.user);
}).catch(()=>{ window.__PNDDRR_SERVER=false; });

