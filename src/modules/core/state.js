/* module: core/state.js — PNDDRR engine (classic globals) */
/* ---------- État ---------- */
var DB = {
  seq:{comb:0, dem:0},
  groupes:GROUPES,
  users:[
    {id:"u1",login:"admin",pass:"admin2026",nom:"Administrateur système",role:"admin",actif:true},
    {id:"u2",login:"agent",pass:"agent2026",nom:"Agent DDR — Bangui",role:"agent",actif:true},
    {id:"u3",login:"suivi",pass:"suivi2026",nom:"Chargé de suivi & évaluation",role:"suivi",actif:true}
  ],
  combattants:[],
  journal:[]
};
var CUR = null;          // utilisateur connecté
var VIEW = "dashboard";  // vue courante
var FICHE_ID = null;     // fiche ouverte

const ROLES = {admin:"Administrateur", agent:"Agent DDR", suivi:"Chargé de suivi", superviseur:"Superviseur (lecture seule)"};
const PERMS = {
  enregistrer:"Enregistrer / modifier les dossiers",
  desarmer:"Procès-verbaux de désarmement",
  demobiliser:"Prononcer les démobilisations",
  orienter:"Orienter en réintégration (militaire / socio-éco.)",
  visites:"Réaliser les visites de suivi",
  cloturer:"Clôturer les parcours et déclarer les abandons",
  importer:"Importer des données (dossiers, registres d'armes)",
  referentiels:"Gérer les référentiels (groupes armés)"
};
const ROLE_PERMS = {
  admin: Object.keys(PERMS),
  agent: ["enregistrer","desarmer","demobiliser","orienter","visites","cloturer","importer"],
  suivi: ["visites"],
  superviseur: []
};
function userPerms(u){ return u.role==="admin"?Object.keys(PERMS):(u.perms||ROLE_PERMS[u.role]||[]); }
function hasPerm(p){ return !!CUR && userPerms(CUR).includes(p); }
const $ = id => document.getElementById(id);
const esc = s => (s==null?"":String(s)).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmtD = d => { if(!d) return "—"; const [a,m,j]=d.split("-"); return `${j}/${m}/${a}`; };
const today = () => new Date().toISOString().slice(0,10);
const fmtN = n => (n==null||n==="")?"—":Number(n).toLocaleString("fr-FR");
function toast(msg){ const t=$("toast"); t.textContent=msg; t.style.display="block"; clearTimeout(t._h); t._h=setTimeout(()=>t.style.display="none",2600); }
/* ---------- Mode hors ligne : persistance locale automatique ----------
   L'application est un fichier unique qui fonctionne sans serveur ni connexion.
   Chaque opération est enregistrée automatiquement dans le stockage local du
   navigateur de l'appareil (localStorage) : en zone éloignée, les données
   survivent à la fermeture du navigateur et aux coupures. La sauvegarde JSON
   reste le moyen de transfert entre appareils (fusion multi-postes ci-dessous).
   Nota : dans certains aperçus intégrés (bac à sable), le stockage local est
   indisponible — l'application bascule alors en mémoire de session. */
const LS_KEY="pnddrr_db", LS_TS="pnddrr_ts";
function storageOK(){ try{ localStorage.setItem("__t","1"); localStorage.removeItem("__t"); return true; }catch(e){ return false; } }
var HAS_LS = storageOK();
function persist(){
  if(HAS_LS){
    try{ localStorage.setItem(LS_KEY, JSON.stringify(DB)); localStorage.setItem(LS_TS, new Date().toISOString()); updNetBadge(); }catch(e){}
  }
  scheduleServerSave();
}
var _saveT=null;
function scheduleServerSave(){
  if(!window.__PNDDRR_SERVER || !window.__PNDDRR_SYNCED) return;
  clearTimeout(_saveT);
  _saveT=setTimeout(pushServer, 500);
}
function pushServer(){
  fetch("/api/db",{method:"PUT",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(DB)})
    .then(r=>{ if(r.status===401) toast("Session expirée — reconnectez-vous."); })
    .catch(()=>{});
}
function lastPersist(){ try{ return localStorage.getItem(LS_TS); }catch(e){ return null; } }
/* SHA-256 pure JS (synchrone, hors ligne) — implémentation standard FIPS 180-4 */
function sha256(ascii){
  function rr(v,c){return (v>>>c)|(v<<(32-c));}
  ascii=unescape(encodeURIComponent(ascii));
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const l=ascii.length*8, words=[];
  ascii+='\x80'; while(ascii.length%64-56) ascii+='\x00';
  for(let i=0;i<ascii.length;i++) words[i>>2]=(words[i>>2]||0)|(ascii.charCodeAt(i)<<((3-i%4)*8));
  words.push(0, l|0);
  for(let j=0;j<words.length;j+=16){
    const w=words.slice(j,j+16); let [a,b,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){
      const wi = i<16?w[i]:(w[i]=(w[i-16]+(rr(w[i-15],7)^rr(w[i-15],18)^(w[i-15]>>>3))+w[i-7]+(rr(w[i-2],17)^rr(w[i-2],19)^(w[i-2]>>>10)))|0);
      const t1=(h+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+K[i]+wi)|0;
      const t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b)^(a&c)^(b&c)))|0;
      h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0;
    }
    H=[(H[0]+a)|0,(H[1]+b)|0,(H[2]+c)|0,(H[3]+d)|0,(H[4]+e)|0,(H[5]+f)|0,(H[6]+g)|0,(H[7]+h)|0];
  }
  return H.map(x=>(x>>>0).toString(16).padStart(8,"0")).join("");
}
function hashPwd(p){ return "sha256:"+sha256("PNDDRR|"+p); }
function pwdOK(u, saisie){ return !!(u.pass && u.pass.startsWith("sha256:") && u.pass===hashPwd(saisie)); }
function migrateDB(){
  if(!DB.journal) DB.journal=[];
  if(!DB.groupes||!DB.groupes.length) DB.groupes=DEFAULT_GROUPES.slice();
  if(!DB.groupes.includes("Autre")) DB.groupes.push("Autre");
  GROUPES=DB.groupes;
  if(!DB.seq) DB.seq={comb:0,dem:0};
  if(DB.poste===undefined) DB.poste="";
  if(!DB.syncs) DB.syncs=[];
  /* Sécurité : hachage des mots de passe encore en clair */
  DB.users.forEach(u=>{ if(u.pass && !String(u.pass).startsWith("sha256:")) u.pass=hashPwd(u.pass); });
  if(!DB.secret) DB.secret=null; /* secret d'installation (défini par l'administrateur) */
  if(DB.posteCode===undefined) DB.posteCode="";
  /* Configuration du programme (onglet Paramètres → Configuration) */
  const C_DEF={villeSignature:"Bangui", signataireCarte:"Le Coordonnateur de l'UEPNDDR",
    seuilOrientation:90, seuilVisite:60, seuilFormation:270,
    verrouMin:15, pageTaille:100, rappelJours:7,
    carteQR:true, carteCodeBarres:true};
  DB.config=Object.assign({}, C_DEF, DB.config||{});
}
function cfg(k){ return (DB.config||{})[k]; }
function applyConfig(){ PAGE_TAILLE=+cfg("pageTaille")||100; }
function posteSlug(){ return (DB.poste||"poste").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"").toLowerCase()||"poste"; }
function addSync(type, fichier, detail){
  DB.syncs.unshift({date:new Date().toISOString(), type, fichier, poste:DB.poste||"(non nommé)", detail});
  if(DB.syncs.length>50) DB.syncs.length=50;
  persist();
}
function loadPersisted(){
  if(!HAS_LS) return false;
  try{
    const raw=localStorage.getItem(LS_KEY); if(!raw) return false;
    const d=JSON.parse(raw); if(!d.combattants||!d.users) return false;
    DB=d; migrateDB(); return true;
  }catch(e){ return false; }
}
function clearPersisted(){ try{ localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_TS); }catch(e){} }
if(!loadPersisted()) migrateDB();
/* Premier démarrage : pré-charger la simulation (60 ex-combattants fictifs) pour découvrir le programme.
   L'effacement des données locales laisse ensuite l'appareil vierge (marqueur pnddrr_skip_demo). */
var DEMO_PRELOADED=false;
function updNetBadge(){
  const el=$("netBadge"); if(!el) return;
  const online=typeof navigator!=="undefined"&&"onLine" in navigator?navigator.onLine:true;
  const ts=lastPersist();
  el.innerHTML=`<span style="display:inline-flex;align-items:center;gap:6px">
    <span style="width:9px;height:9px;border-radius:50%;background:${online?"var(--ok)":"var(--warn)"}"></span>
    ${online?"En ligne":"Hors ligne"} · ${HAS_LS?(ts?"enregistré à "+new Date(ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"stockage local prêt"):"mémoire de session"}</span>`;
}
if(typeof window!=="undefined"){ window.addEventListener("online",()=>updNetBadge()); window.addEventListener("offline",()=>updNetBadge()); }
function log(action, detail){
  const date=new Date().toISOString(), user=CUR?CUR.login:"—";
  const ph=DB.journal.length&&DB.journal[0].h?DB.journal[0].h:"GENESE";
  const h=sha256([ph,date,user,action,detail].join("|"));
  DB.journal.unshift({date, user, action, detail, h, ph});
  persist();
}
function verifJournal(){
  let ok=0, ko=[], sans=0, ruptures=0;
  for(let i=0;i<DB.journal.length;i++){
    const j=DB.journal[i];
    if(!j.h){ sans++; continue; }
    if(j.h===sha256([j.ph||"GENESE",j.date,j.user,j.action,j.detail].join("|"))) ok++;
    else ko.push(i+1);
    const suivant=DB.journal[i+1];
    if(j.ph&&j.ph!=="GENESE"&&suivant&&suivant.h&&j.ph!==suivant.h) ruptures++;
  }
  return {ok, ko, sans, ruptures};
}
function mVerifJournal(){
  const r=verifJournal();
  const corps = r.ko.length
    ? `<div style="background:#FDF1F1;border:1px solid #E3B4B4;border-radius:8px;padding:12px"><b style="color:var(--danger)">✘ Altération détectée.</b> ${r.ko.length} entrée(s) du journal ne correspondent plus à leur empreinte (position(s) : ${r.ko.slice(0,15).join(", ")}${r.ko.length>15?"…":""}). Le contenu de ces entrées a été modifié après leur écriture.</div>`
    : `<div style="background:#EAF7EE;border:1px solid #9ED0AC;border-radius:8px;padding:12px"><b style="color:var(--ok)">✔ Journal intègre.</b> ${r.ok} entrée(s) vérifiée(s) par leur empreinte chaînée (SHA-256) — aucune altération de contenu détectée.</div>`;
  openModal("Vérification de l'intégrité du journal", `${corps}
    <p class="small muted" style="margin-top:10px">Chaque entrée est scellée par une empreinte SHA-256 qui enchaîne l'empreinte précédente : toute modification a posteriori d'une entrée rend son empreinte invalide.${r.sans?` ${r.sans} entrée(s) antérieures à l'activation du chaînage ne portent pas d'empreinte.`:""}${r.ruptures?` ${r.ruptures} raccord(s) de chaîne constatés — normaux après une fusion multi-postes ou une restauration.`:""}</p>`);
  log("Journal","Vérification d'intégrité — "+(r.ko.length?r.ko.length+" altération(s)":"intègre"));
}
function age(dn){ if(!dn) return "—"; const d=new Date(dn), n=new Date(); let a=n.getFullYear()-d.getFullYear(); if(n<new Date(n.getFullYear(),d.getMonth(),d.getDate())) a--; return a; }

function posteCode(){ return (DB.posteCode||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5); }
function numDossier(){ DB.seq.comb++; const p=posteCode(); return `DDR-${p?p+"-":""}${new Date().getFullYear()}-${String(DB.seq.comb).padStart(4,"0")}`; }
function numDem(){ DB.seq.dem++; const p=posteCode(); return `DEM-${p?p+"-":""}${new Date().getFullYear()}-${String(DB.seq.dem).padStart(4,"0")}`; }

