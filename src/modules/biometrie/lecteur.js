/* module: biometrie/lecteur.js — PNDDRR engine (classic globals) */
/* Lecteur d'empreintes : le SDK fourni par la direction s'expose via window.PnddrrLecteur
   (fichier optionnel /engine/lecteur-vendor.js). Sans ce module, la capture signale l'absence du lecteur. */
var _lecteurVendorTried=false;
function chargerLecteurVendor(done){
  if(window.PnddrrLecteur||_lecteurVendorTried){ if(done) done(); return; }
  _lecteurVendorTried=true;
  const s=document.createElement("script");
  s.src="/engine/lecteur-vendor.js";
  s.dataset.pnddrrLecteur="1";
  s.onload=()=>{ if(done) done(); };
  s.onerror=()=>{ if(done) done(); };
  document.body.appendChild(s);
}
function lecteurDispo(){
  return !!(window.PnddrrLecteur && typeof window.PnddrrLecteur.capture==="function");
}
function empreinteResume(fp){
  if(!fp) return "";
  if(typeof fp==="string") return fp.slice(0,24);
  return fp.id||fp.template&&String(fp.template).slice(0,24)||"capturée";
}
function captureEmpreinte(onDone){
  function run(){
    if(!lecteurDispo()){
      toast("Lecteur d'empreintes non détecté. Installez le module fourni par la direction, puis rechargez la page.");
      if(onDone) onDone(null);
      return;
    }
    Promise.resolve(window.PnddrrLecteur.capture())
      .then(tpl=>{
        if(!tpl){ toast("Aucune empreinte n'a été lue."); if(onDone) onDone(null); return; }
        const fp=typeof tpl==="object"?Object.assign({capturedAt:new Date().toISOString()}, tpl):{template:String(tpl),capturedAt:new Date().toISOString()};
        toast("Empreinte capturée.");
        if(onDone) onDone(fp);
      })
      .catch(()=>{
        toast("Échec de lecture. Vérifiez le lecteur et réessayez.");
        if(onDone) onDone(null);
      });
  }
  chargerLecteurVendor(run);
}
function uiEmpreinte(boxId, initial){
  const box=$(boxId); if(!box) return;
  function paint(fp){
    box._fp=fp||null;
    box.innerHTML = fp
      ? `<div class="fp-ok">Empreinte enregistrée</div><div class="small muted">${esc(empreinteResume(fp))}</div><button type="button" class="btn sm sec" style="margin-top:7px" onclick="event.preventDefault();captureEmpreinte(p=>{if(p) paint(p);})">Reprendre</button>`
      : `<div class="fp-empty">Empreinte<br>digitale</div><button type="button" class="btn sm sec" style="margin-top:7px" onclick="event.preventDefault();captureEmpreinte(p=>{if(p) paint(p);})">Capturer</button>`;
  }
  paint(initial||null);
  box.getEmpreinte=()=>box._fp||null;
}
chargerLecteurVendor();
