/* module: admin/import.js — PNDDRR engine (classic globals) */
/* ================= IMPORTATION DE DONNÉES (CSV / Excel / Word / PDF) =================
   Assistant en 3 étapes : lecture du fichier → correspondance des colonnes →
   aperçu, contrôle et synchronisation avec le registre des ex-combattants.
   CSV : traité intégralement hors connexion. XLSX / DOCX / PDF : bibliothèques
   chargées à la demande depuis cdnjs (connexion Internet requise pour ces formats). */

var IMP = {kind:"comb", grid:null, headers:[], map:{}, fileName:"", report:null};

const IMP_FIELDS_ARMES = {
  num:"N° dossier", nom:"Nom (si pas de n° dossier)", prenom:"Prénom",
  type:"Type d'arme *", marque:"Marque / modèle", calibre:"Calibre", serie:"N° de série",
  etat:"État", mun:"Munitions", munQte:"Munitions — quantité", munUnite:"Munitions — unité", dateRemise:"Date de remise", lieu:"Lieu de collecte",
  prefecture:"Préfecture (si création de dossier)", groupe:"Groupe armé (si création)"
};
const IMP_SYNONYMS_ARMES = {
  num:["numdossier","ndossier","dossier","numero","reference","ref","id"],
  nom:["nom","noms","remisepar","detenteur","excombattant","proprietaire"],
  prenom:["prenom","prenoms"],
  type:["type","typedarme","typearme","arme","categorie","nature"],
  marque:["marque","modele","marquemodele","fabricant"],
  calibre:["calibre","cal"],
  serie:["nserie","numserie","numerodeserie","serie","serial","sn"],
  etat:["etat","condition","fonctionnement"],
  mun:["munitions","mun"],
  munQte:["munitionsquantite","quantitemunitions","qtemunitions","quantite","qte","nombre","cartouches"],
  munUnite:["munitionsunite","unitemunitions","unite"],
  dateRemise:["dateremise","date","datecollecte","remisele"],
  lieu:["lieu","lieudecollecte","site","lieuremise"],
  prefecture:["prefecture","pref"],
  groupe:["groupearme","groupe","faction"]
};

const IMP_FIELDS = {
  num:"N° dossier", nom:"Nom *", prenom:"Prénom *", alias:"Alias", sexe:"Sexe",
  dn:"Date de naissance", ln:"Lieu de naissance", nat:"Nationalité", tel:"Téléphone",
  prefecture:"Préfecture *", sousPref:"Sous-préfecture", commune:"Commune", site:"Site",
  groupe:"Groupe armé", grade:"Grade / fonction", annees:"Années de service", zone:"Zone d'opération",
  souhait:"Souhait de réintégration", instr:"Instruction", obs:"Observations",
  statut:"Statut", carte:"N° carte démobilisé", corps:"Corps (militaire)", matricule:"Matricule",
  filiere:"Filière (socio-éco.)"
};
const IMP_SYNONYMS = {
  num:["numdossier","ndossier","dossier","numero","reference","ref","id"],
  nom:["nom","noms","nomfamille","lastname","surname"],
  prenom:["prenom","prenoms","firstname"],
  alias:["alias","nomdeguerre","surnom","pseudo"],
  sexe:["sexe","genre","sex","gender"],
  dn:["datenaissance","datedenaissance","nele","dob","naissance"],
  ln:["lieunaissance","lieudenaissance","nea"],
  nat:["nationalite"],
  tel:["telephone","tel","contact","phone","portable"],
  prefecture:["prefecture","pref"],
  sousPref:["sousprefecture","sp","souspref"],
  commune:["commune"],
  site:["site","siteregroupement","cantonnement","camp"],
  groupe:["groupearme","groupe","faction","mouvement"],
  grade:["grade","fonction","rang"],
  annees:["annees","anneesservice","anciennete"],
  zone:["zone","zoneoperation"],
  souhait:["souhait","orientation","voeu","choix"],
  instr:["instruction","niveau","scolarite","education"],
  obs:["observations","obs","remarques","notes","commentaires"],
  statut:["statut","status","etape","phase","situation"],
  carte:["carte","cartedemobilise","numcarte","dem"],
  corps:["corps","armee","unite"],
  matricule:["matricule"],
  filiere:["filiere","metier","activite","formation"]
};
const normTxt = s => String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");

/* ---------- Vue ---------- */
function rImport(kind){
  IMP={kind:kind||IMP.kind||"comb",grid:null,headers:[],map:{},fileName:"",report:null};
  const armes=IMP.kind==="armes";
  $("view").innerHTML = `
  <div class="toolbar">
    <button class="btn ghost" onclick="go('parametres')">← Retour aux paramètres</button>
    <button class="btn ghost" onclick="go('registre')">← Registre</button>
    <button class="btn ghost" onclick="go('dashboard')">← Tableau de bord</button>
  </div>
  <div class="panel"><div class="ph"><h3>Étape 1 — Fichier source</h3></div><div class="pb">
    <div class="field" style="max-width:420px"><label>Type de registre à importer</label>
      <select onchange="rImport(this.value)"><option value="comb" ${armes?"":"selected"}>Ex-combattants (dossiers individuels)</option><option value="armes" ${armes?"selected":""}>Registre des armes (rattaché aux dossiers)</option></select></div>
    <p class="small muted" style="margin-bottom:10px">Formats acceptés : <b>CSV</b> (recommandé, hors connexion), <b>Excel</b> (.xlsx/.xls), <b>Word</b> (.docx — première table du document) et <b>PDF</b> (extraction de tableau, au mieux). La première ligne doit contenir les en-têtes de colonnes. ${armes?"Chaque ligne du fichier correspond à <b>une arme ou un lot</b>, rattaché à un dossier par son n° (sinon par nom + prénom).":"Modèle : utilisez l'export CSV du registre comme gabarit."}</p>
    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <label class="btn" style="display:inline-flex;align-items:center">Choisir un fichier…<input type="file" id="impFile" accept=".csv,.txt,.xlsx,.xls,.docx,.pdf" style="display:none" onchange="impRead(this)"></label>
      <span class="small muted" id="impFileLbl">Aucun fichier sélectionné.</span>
      <button class="btn sec sm" onclick="impGabarit()">Télécharger le gabarit CSV</button>
      ${armes?`<button class="btn ghost sm" onclick="go('armes')">← Retour au registre des armes</button>`:""}
    </div>
  </div></div>
  <div id="impStep2"></div>
  <div id="impStep3"></div>
  <div id="impReport"></div>`;
}
function impGabarit(){
  if(IMP.kind==="armes"){
    const rows=[Object.values(IMP_FIELDS_ARMES).map(x=>x.replace(" *","")),
      ["DDR-2026-0001","","","Fusil d'assaut AK-47 / dérivés","Type 56","7,62 mm","AK-556677","Fonctionnelle","2 chargeurs","15/06/2026","Bambari","",""],
      ["","YAKETE","Fidèle","Grenade","","","","Fonctionnelle","1","15/06/2026","Bambari","",""]];
    dl("gabarit_import_registre_armes.csv", csv(rows), "text/csv"); return;
  }
  const rows=[Object.values(IMP_FIELDS).map(x=>x.replace(" *","")),
    ["","YAKETE","Fidèle","","M","11/04/1992","Bambari","Centrafricaine","72000000","Ouaka","Bambari","Ippy","Site A","UPC","Chef de groupe","5","Bambari","Militaire","Primaire","","Enregistré","","","",""]];
  dl("gabarit_import_ex-combattants.csv", csv(rows), "text/csv");
}

/* ---------- Lecture des fichiers ---------- */
function impLoadLib(url){
  return new Promise((ok,ko)=>{
    if(document.querySelector(`script[src="${url}"]`)) return ok();
    const sc=document.createElement("script"); sc.src=url;
    sc.onload=()=>ok(); sc.onerror=()=>ko(new Error("chargement impossible"));
    document.head.appendChild(sc);
  });
}
function impRead(inp){
  const f=inp.files[0]; if(!f) return;
  IMP.fileName=f.name;
  $("impFileLbl").textContent=f.name;
  const ext=f.name.toLowerCase().split(".").pop();
  const fail=msg=>{ toast(msg); $("impStep2").innerHTML=`<div class="panel"><div class="pb" style="color:var(--danger)">${esc(msg)}</div></div>`; };
  if(ext==="csv"||ext==="txt"){
    const r=new FileReader();
    r.onload=()=>{ try{ impSetGrid(impParseCSV(r.result)); }catch(e){ fail("Lecture CSV impossible : "+e.message); } };
    r.readAsText(f,"utf-8");
  } else if(ext==="xlsx"||ext==="xls"){
    const r=new FileReader();
    r.onload=async()=>{ try{
      await impLoadLib("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
      const wb=XLSX.read(new Uint8Array(r.result),{type:"array",cellDates:true});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const grid=XLSX.utils.sheet_to_json(ws,{header:1,raw:false,defval:""});
      impSetGrid(grid.filter(row=>row.some(c=>String(c).trim()!=="")));
    }catch(e){ fail("Lecture Excel impossible (connexion Internet requise pour ce format) — exportez en CSV depuis Excel si besoin."); } };
    r.readAsArrayBuffer(f);
  } else if(ext==="docx"){
    const r=new FileReader();
    r.onload=async()=>{ try{
      await impLoadLib("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js");
      const res=await mammoth.convertToHtml({arrayBuffer:r.result});
      const doc=new DOMParser().parseFromString(res.value,"text/html");
      const table=doc.querySelector("table");
      if(!table) throw new Error("aucune table trouvée dans le document Word");
      const grid=[...table.querySelectorAll("tr")].map(tr=>[...tr.querySelectorAll("td,th")].map(td=>td.textContent.trim()));
      impSetGrid(grid);
    }catch(e){ fail("Lecture Word impossible : "+e.message+" (connexion Internet requise pour ce format)."); } };
    r.readAsArrayBuffer(f);
  } else if(ext==="pdf"){
    const r=new FileReader();
    r.onload=async()=>{ try{
      await impLoadLib("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");
      pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(r.result)}).promise;
      let grid=[];
      for(let i=1;i<=pdf.numPages;i++){
        const tc=await(await pdf.getPage(i)).getTextContent();
        const lines={};
        tc.items.forEach(it=>{ const y=Math.round(it.transform[5]/3)*3; (lines[y]=lines[y]||[]).push({x:it.transform[4],t:it.str}); });
        Object.keys(lines).sort((a,b)=>b-a).forEach(y=>{
          const items=lines[y].sort((a,b)=>a.x-b.x);
          const cells=[]; let cur=items[0].t; let lastEnd=items[0].x+items[0].t.length*4;
          for(let k=1;k<items.length;k++){
            if(items[k].x-lastEnd>18){ cells.push(cur.trim()); cur=items[k].t; }
            else cur+=" "+items[k].t;
            lastEnd=items[k].x+items[k].t.length*4;
          }
          cells.push(cur.trim());
          if(cells.filter(c=>c).length>1) grid.push(cells);
        });
      }
      if(grid.length<2) throw new Error("aucun tableau détecté dans le PDF");
      impSetGrid(grid);
      toast("Extraction PDF « au mieux » — vérifiez soigneusement l'aperçu.");
    }catch(e){ fail("Lecture PDF impossible : "+e.message+" (connexion Internet requise ; préférez le CSV)."); } };
    r.readAsArrayBuffer(f);
  } else fail("Format non pris en charge : "+ext);
  inp.value="";
}
function impParseCSV(text){
  text=text.replace(/^\uFEFF/,"");
  const firstLine=text.split(/\r?\n/)[0]||"";
  const sep=(firstLine.match(/;/g)||[]).length>=(firstLine.match(/,/g)||[]).length?";":",";
  const rows=[]; let row=[], cell="", inQ=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(inQ){
      if(ch==='"'){ if(text[i+1]==='"'){cell+='"';i++;} else inQ=false; }
      else cell+=ch;
    } else {
      if(ch==='"') inQ=true;
      else if(ch===sep){ row.push(cell); cell=""; }
      else if(ch==="\n"||ch==="\r"){ if(ch==="\r"&&text[i+1]==="\n") i++; row.push(cell); if(row.some(c=>c.trim()!=="")) rows.push(row); row=[]; cell=""; }
      else cell+=ch;
    }
  }
  row.push(cell); if(row.some(c=>c.trim()!=="")) rows.push(row);
  if(rows.length<2) throw new Error("le fichier doit contenir une ligne d'en-têtes et au moins une ligne de données");
  return rows;
}

/* ---------- Étape 2 : correspondance des colonnes ---------- */
function impFields(){ return IMP.kind==="armes"?IMP_FIELDS_ARMES:IMP_FIELDS; }
function impSyns(){ return IMP.kind==="armes"?IMP_SYNONYMS_ARMES:IMP_SYNONYMS; }
function impSetGrid(grid){
  IMP.grid=grid; IMP.headers=grid[0].map(h=>String(h).trim());
  IMP.map={};
  IMP.headers.forEach((h,i)=>{
    const n=normTxt(h);
    for(const [f,syns] of Object.entries(impSyns())){
      if(Object.values(IMP.map).includes(i)) break;
      if(IMP.map[f]===undefined && (syns.includes(n)||n===normTxt(impFields()[f].replace(" *","")))) { IMP.map[f]=i; break; }
    }
  });
  $("impReport").innerHTML="";
  $("impStep2").innerHTML=`<div class="panel"><div class="ph"><h3>Étape 2 — Correspondance des colonnes</h3><span class="small muted">${IMP.grid.length-1} ligne(s) de données détectée(s)</span></div><div class="pb">
    <div class="grid4">${Object.entries(impFields()).map(([f,lbl])=>`
      <div class="field"><label>${lbl}</label><select id="map_${f}" onchange="IMP.map['${f}']=this.value===''?undefined:+this.value">
        <option value="">— Ignorer —</option>
        ${IMP.headers.map((h,i)=>`<option value="${i}" ${IMP.map[f]===i?"selected":""}>${esc(h)||("Colonne "+(i+1))}</option>`).join("")}
      </select></div>`).join("")}
    </div>
    <div style="display:flex;gap:9px">
      <button class="btn ghost" type="button" onclick="rImport()">← Choisir un autre fichier</button>
      <button class="btn" onclick="IMP.kind==='armes'?impPreviewArmes():impPreview()">Contrôler et prévisualiser</button>
    </div>
  </div></div>`;
  $("impStep3").innerHTML="";
}

/* ---------- Analyse d'une ligne ---------- */
function impDate(v){
  v=String(v||"").trim(); if(!v) return "";
  let m=v.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
  if(m) return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
  m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(m) return `${m[1]}-${m[2].padStart(2,"0")}-${m[3].padStart(2,"0")}`;
  if(/^\d{4,5}$/.test(v)){ const d=new Date(Date.UTC(1899,11,30)+(+v)*86400000); return d.toISOString().slice(0,10); }
  return "";
}
function impMatchRef(v,list){
  const n=normTxt(v); if(!n) return "";
  for(const x of list) if(normTxt(x)===n) return x;
  for(const x of list) if(normTxt(x).includes(n)||n.includes(normTxt(x))) return x;
  return null;
}
function impStatut(v){
  const n=normTxt(v);
  if(!n) return "enregistre";
  if(n.includes("abandon")) return "abandon";
  if(n.includes("acheve")||n==="reintegre"||n.includes("reintegre")&&!n.includes("militaire")&&!n.includes("socio")) return "reintegre";
  if(n.includes("militaire")) return "reintegration_militaire";
  if(n.includes("socio")||n.includes("economique")) return "reintegration_socio";
  if(n.includes("demobil")) return "demobilise";
  if(n.includes("desarm")) return "desarme";
  if(n.includes("enregistr")) return "enregistre";
  return "enregistre";
}
function impRow(row, idx){
  const g=f=>IMP.map[f]===undefined?"":String(row[IMP.map[f]]||"").trim();
  const err=[];
  const nom=g("nom").toUpperCase(), prenom=g("prenom");
  if(!nom||!prenom) err.push("nom/prénom manquant");
  let prefecture=null;
  if(g("prefecture")){ prefecture=impMatchRef(g("prefecture"),PREFECTURES); if(prefecture===null) err.push("préfecture inconnue : « "+g("prefecture")+" »"); }
  if(!g("prefecture")) err.push("préfecture manquante");
  const sexeRaw=normTxt(g("sexe"));
  const sexe=sexeRaw.startsWith("f")?"F":"M";
  const groupe=g("groupe")?(impMatchRef(g("groupe"),GROUPES)||"Autre"):"Autre";
  const statut=impStatut(g("statut"));
  const d={
    num:g("num").toUpperCase(), nom, prenom, alias:g("alias"), sexe, dn:impDate(g("dn")), ln:g("ln"),
    nat:g("nat")||"Centrafricaine", tel:g("tel"),
    prefecture:prefecture||"", sousPref:g("sousPref"), commune:g("commune"), site:g("site"),
    groupe, groupeLibre:g("groupe"), grade:g("grade"), annees:g("annees").replace(/\D/g,""), zone:g("zone"),
    souhait:impMatchRef(g("souhait"),["Socio-économique","Militaire","Indécis"])||"Indécis",
    instr:impMatchRef(g("instr"),["Aucun","Primaire","Secondaire","Supérieur","Coranique"])||"Aucun",
    obs:g("obs"), statut, carte:g("carte").toUpperCase(), corps:g("corps"), matricule:g("matricule"), filiere:g("filiere")
  };
  return {ligne:idx+2, d, err};
}

/* ---------- Étape 3 : aperçu ---------- */
function impPreview(){
  const rows=IMP.grid.slice(1).map((r,i)=>impRow(r,i));
  IMP.rows=rows;
  const bad=rows.filter(r=>r.err.length), ok=rows.length-bad.length;
  $("impStep3").innerHTML=`<div class="panel"><div class="ph"><h3>Étape 3 — Contrôle et synchronisation</h3>
    <span class="small">${ok} ligne(s) valide(s) · <span style="color:${bad.length?"var(--danger)":"var(--ok)"}">${bad.length} en erreur</span></span></div>
  <div class="pb">
    <div class="pb nopad" style="max-height:300px;overflow:auto;border:1px solid var(--line);border-radius:8px;margin-bottom:12px">
    <table><thead><tr><th>Ligne</th><th>N° dossier</th><th>Nom & prénom</th><th>Sexe</th><th>Préfecture</th><th>Groupe</th><th>Statut</th><th>Anomalies</th></tr></thead><tbody>
    ${rows.slice(0,200).map(r=>`<tr style="${r.err.length?"background:#FDF1F1":""}"><td>${r.ligne}</td><td>${esc(r.d.num)||"<span class='muted'>auto</span>"}</td>
      <td>${esc(r.d.nom)} ${esc(r.d.prenom)}</td><td>${r.d.sexe}</td><td>${esc(r.d.prefecture)||"—"}</td>
      <td class="small">${esc(r.d.groupe)}${r.d.groupe==="Autre"&&r.d.groupeLibre?` <span class="muted">(${esc(r.d.groupeLibre)})</span>`:""}</td>
      <td><span class="badge st-${r.d.statut}">${STATUTS[r.d.statut].lbl}</span></td>
      <td class="small" style="color:var(--danger)">${r.err.join(" · ")||""}</td></tr>`).join("")}
    </tbody></table>${rows.length>200?`<div class="small muted" style="padding:8px">… ${rows.length-200} ligne(s) supplémentaires non affichées.</div>`:""}</div>
    <div class="grid2" style="margin-bottom:12px">
      <div class="field"><label>Mode de synchronisation</label><select id="impMode">
        <option value="fusion">Créer les nouveaux + mettre à jour les existants (fusion)</option>
        <option value="create">Créer uniquement les nouveaux (ignorer les doublons)</option>
      </select></div>
      <div class="small muted" style="align-self:end;padding-bottom:8px">Doublons détectés par n° de dossier, sinon par nom + prénom + date de naissance. La fusion complète les champs vides et fait progresser le statut sans jamais le faire reculer.</div>
    </div>
    <div style="display:flex;gap:9px">
      <button class="btn ghost" type="button" onclick="impBack()">← Modifier la correspondance</button>
      <button class="btn" ${ok?"":"disabled"} onclick="impSync()">Synchroniser ${ok} dossier(s) avec le registre</button>
    </div>
  </div></div>`;
  $("impReport").innerHTML="";
}

function impBack(){ $("impStep3").innerHTML=""; $("impReport").innerHTML=""; $("view").scrollTop=0; }

/* ---------- Registre des armes : analyse, aperçu, synchronisation ---------- */
function impRowArme(row, idx){
  const g=f=>IMP.map[f]===undefined?"":String(row[IMP.map[f]]||"").trim();
  const err=[];
  const num=g("num").toUpperCase(), nom=g("nom").toUpperCase(), prenom=g("prenom");
  if(!num&&!nom) err.push("aucun identifiant (n° dossier ou nom)");
  const typeRaw=g("type");
  if(!typeRaw) err.push("type d'arme manquant");
  const type=impMatchRef(typeRaw,TYPES_ARMES)||"Autre";
  let prefecture="";
  if(g("prefecture")){ const m=impMatchRef(g("prefecture"),PREFECTURES); if(m===null) err.push("préfecture inconnue : « "+g("prefecture")+" »"); else prefecture=m; }
  const d={ num, nom, prenom, type, typeLibre:typeRaw,
    marque:g("marque"), calibre:g("calibre"), serie:g("serie").toUpperCase(),
    etat:impMatchRef(g("etat"),["Fonctionnelle","Défectueuse","Hors d'usage"])||"Fonctionnelle",
    mun:g("mun"), munQte:+g("munQte").replace(/\D/g,"")||0, munUnite:impMatchRef(g("munUnite"),UNITES_MUN)||"cartouches", dateRemise:impDate(g("dateRemise")), lieu:g("lieu"),
    prefecture, groupe:g("groupe")?(impMatchRef(g("groupe"),GROUPES)||"Autre"):"Autre" };
  return {ligne:idx+2, d, err};
}
function impPreviewArmes(){
  const rows=IMP.grid.slice(1).map((r,i)=>impRowArme(r,i));
  IMP.rows=rows;
  const bad=rows.filter(r=>r.err.length), ok=rows.length-bad.length;
  $("impStep3").innerHTML=`<div class="panel"><div class="ph"><h3>Étape 3 — Contrôle et synchronisation (registre des armes)</h3>
    <span class="small">${ok} arme(s) valide(s) · <span style="color:${bad.length?"var(--danger)":"var(--ok)"}">${bad.length} en erreur</span></span></div>
  <div class="pb">
    <div class="pb nopad" style="max-height:300px;overflow:auto;border:1px solid var(--line);border-radius:8px;margin-bottom:12px">
    <table><thead><tr><th>Ligne</th><th>Rattachement</th><th>Type</th><th>Marque</th><th>N° série</th><th>État</th><th>Date / lieu</th><th>Anomalies</th></tr></thead><tbody>
    ${rows.slice(0,200).map(r=>`<tr style="${r.err.length?"background:#FDF1F1":""}"><td>${r.ligne}</td>
      <td>${esc(r.d.num)||`${esc(r.d.nom)} ${esc(r.d.prenom)}`}</td>
      <td class="small">${esc(r.d.type)}${r.d.type==="Autre"&&r.d.typeLibre?` <span class="muted">(${esc(r.d.typeLibre)})</span>`:""}</td>
      <td>${esc(r.d.marque)||"—"}</td><td>${esc(r.d.serie)||"—"}</td><td>${esc(r.d.etat)}</td>
      <td class="small">${r.d.dateRemise?fmtD(r.d.dateRemise):"—"}${r.d.lieu?" · "+esc(r.d.lieu):""}</td>
      <td class="small" style="color:var(--danger)">${r.err.join(" · ")||""}</td></tr>`).join("")}
    </tbody></table>${rows.length>200?`<div class="small muted" style="padding:8px">… ${rows.length-200} ligne(s) supplémentaires non affichées.</div>`:""}</div>
    <div class="grid2" style="margin-bottom:12px">
      <div class="field"><label>Dossiers introuvables</label><select id="impModeArmes">
        <option value="attach">Ignorer les armes sans dossier correspondant</option>
        <option value="create">Créer automatiquement le dossier (statut Désarmé — préfecture requise)</option>
      </select></div>
      <div class="small muted" style="align-self:end;padding-bottom:8px">Rattachement par n° de dossier, sinon par nom + prénom. Les n° de série déjà présents dans le registre sont ignorés (anti-doublon). Un dossier « Enregistré » qui reçoit une arme passe au statut « Désarmé ».</div>
    </div>
    <div style="display:flex;gap:9px">
      <button class="btn ghost" type="button" onclick="impBack()">← Modifier la correspondance</button>
      <button class="btn" ${ok?"":"disabled"} onclick="impSyncArmes()">Synchroniser ${ok} arme(s) avec les registres</button>
    </div>
  </div></div>`;
  $("impReport").innerHTML="";
}
function impSyncArmes(){
  const mode=$("impModeArmes").value;
  const series=new Set(allArmes().map(a=>normTxt(a.serie)).filter(x=>x));
  const ajoutees=[], crees=[], skipped=[];
  for(const r of IMP.rows){
    if(r.err.length){ skipped.push({ligne:r.ligne, motif:r.err.join(" · ")}); continue; }
    const d=r.d;
    if(d.serie&&series.has(normTxt(d.serie))){ skipped.push({ligne:r.ligne, motif:"n° de série déjà enregistré : "+d.serie}); continue; }
    let c=null;
    if(d.num) c=DB.combattants.find(x=>x.num===d.num);
    if(!c&&d.nom) c=DB.combattants.find(x=>x.nom===d.nom&&(!d.prenom||normTxt(x.prenom)===normTxt(d.prenom)));
    if(!c){
      if(mode!=="create"){ skipped.push({ligne:r.ligne, motif:"dossier introuvable : "+(d.num||`${d.nom} ${d.prenom}`)}); continue; }
      if(!d.prefecture){ skipped.push({ligne:r.ligne, motif:"création impossible sans préfecture"}); continue; }
      if(!d.nom){ skipped.push({ligne:r.ligne, motif:"création impossible sans nom"}); continue; }
      c={ id:"c"+Date.now()+Math.random().toString(36).slice(2,6), num:numDossier(), statut:"enregistre",
        creele:new Date().toISOString(), agent:CUR.login+" (import armes)",
        nom:d.nom, prenom:d.prenom, alias:"", sexe:"M", dn:"", ln:"", nat:"Centrafricaine", tel:"",
        fam:"Célibataire", prefecture:d.prefecture, sousPref:"", commune:"", site:d.lieu||"",
        groupe:d.groupe, grade:"", annees:"", zone:"", souhait:"Indécis", instr:"Aucun",
        obs:"Dossier créé lors de l'importation du registre des armes", photo:null,
        desarmement:null, demobilisation:null, reintMil:null, reintSocio:null, fin:null, abandon:null };
      DB.combattants.push(c); crees.push(c.num);
    }
    if(!c.desarmement) c.desarmement={date:d.dateRemise||"", lieu:d.lieu||"(importé)", agent:"Importation", armes:[]};
    if(!c.desarmement.date&&d.dateRemise) c.desarmement.date=d.dateRemise;
    if(d.type==="Munitions (lot)"){
      c.desarmement.munitions=c.desarmement.munitions||[];
      c.desarmement.munitions.push({nature:d.calibre||d.mun||d.typeLibre, qte:d.munQte||(+String(d.mun).replace(/\D/g,"")||1), unite:d.munUnite, obs:d.marque});
    } else {
      c.desarmement.armes.push({type:d.type, marque:d.marque, calibre:d.calibre, serie:d.serie, etat:d.etat, mun:d.mun});
      if(d.munQte){ c.desarmement.munitions=c.desarmement.munitions||[]; c.desarmement.munitions.push({nature:d.calibre||"", qte:d.munQte, unite:d.munUnite, obs:"remises avec "+(d.serie||d.type)}); }
    }
    if(d.serie) series.add(normTxt(d.serie));
    if(c.statut==="enregistre") c.statut="desarme";
    ajoutees.push((d.serie||d.type)+" → "+c.num);
  }
  IMP.report={ajoutees,crees,skipped};
  log("Importation registre des armes",`${IMP.fileName} — ${ajoutees.length} arme(s) ajoutée(s), ${crees.length} dossier(s) créé(s), ${skipped.length} ignorée(s)`);
  toast(`Synchronisation terminée : ${ajoutees.length} arme(s) ajoutée(s).`);
  $("impReport").innerHTML=`<div class="panel"><div class="ph"><h3>Rapport de synchronisation — ${esc(IMP.fileName)}</h3>
    <span style="display:flex;gap:7px"><button class="btn sm ghost" onclick="rImport('armes')">← Nouvelle importation</button>
    <button class="btn sm sec" onclick="go('armes')">Ouvrir le registre des armes</button></span></div><div class="pb">
    <div class="cards" style="margin-bottom:12px">
      <div class="kpi c-ok"><div class="n">${ajoutees.length}</div><div class="l">Armes ajoutées</div></div>
      <div class="kpi c-des"><div class="n">${crees.length}</div><div class="l">Dossiers créés</div></div>
      <div class="kpi c-ab"><div class="n">${skipped.length}</div><div class="l">Lignes ignorées</div></div>
    </div>
    ${ajoutees.length?`<div class="small" style="margin-bottom:6px"><b>Ajoutées :</b> ${ajoutees.map(n=>`<span class="tag">${esc(n)}</span>`).join(" ")}</div>`:""}
    ${crees.length?`<div class="small" style="margin-bottom:6px"><b>Dossiers créés :</b> ${crees.map(n=>`<span class="tag">${n}</span>`).join(" ")}</div>`:""}
    ${skipped.length?`<table style="margin-top:8px"><thead><tr><th>Ligne</th><th>Motif</th></tr></thead><tbody>${skipped.map(x=>`<tr><td>${x.ligne}</td><td class="small">${esc(x.motif)}</td></tr>`).join("")}</tbody></table>`:""}
  </div></div>`;
}
/* ---------- Synchronisation ---------- */
function impStubs(c){
  const ord=STATUTS[c.statut].ord;
  if(ord>=2&&!c.desarmement) c.desarmement={date:"",lieu:"(importé)",agent:"Importation",armes:[]};
  if(ord>=3&&!c.demobilisation) c.demobilisation={date:"",lieu:"(importé)",carte:c._carte||numDem()};
  if(c.statut==="reintegration_militaire"&&!c.reintMil) c.reintMil={corps:c._corps||"—",unite:"",matricule:c._matricule||"—",date:"",formation:""};
  if(c.statut==="reintegration_socio"&&!c.reintSocio) c.reintSocio={filiere:c._filiere||"—",centre:"",duree:"",date:"",kit:false,kitDate:"",appui:"",visites:[]};
  if(c.statut==="reintegre"&&!c.reintMil&&!c.reintSocio){
    if(c._matricule||c._corps) c.reintMil={corps:c._corps||"—",unite:"",matricule:c._matricule||"—",date:"",formation:""};
    else c.reintSocio={filiere:c._filiere||"—",centre:"",duree:"",date:"",kit:false,kitDate:"",appui:"",visites:[]};
  }
  if(c.statut==="abandon"&&!c.abandon) c.abandon={date:today(),motif:"Importé"};
  delete c._carte; delete c._corps; delete c._matricule; delete c._filiere;
}
function impSync(){
  const mode=$("impMode").value;
  const created=[], updated=[], skipped=[];
  for(const r of IMP.rows){
    if(r.err.length){ skipped.push({ligne:r.ligne, motif:r.err.join(" · ")}); continue; }
    const d=r.d;
    let ex=null;
    if(d.num) ex=DB.combattants.find(c=>c.num===d.num);
    if(!ex) ex=DB.combattants.find(c=>c.nom===d.nom&&normTxt(c.prenom)===normTxt(d.prenom)&&(!d.dn||!c.dn||c.dn===d.dn));
    if(ex){
      if(mode==="create"){ skipped.push({ligne:r.ligne, motif:"doublon de "+ex.num}); continue; }
      const fill=["alias","dn","ln","tel","sousPref","commune","site","grade","annees","zone","obs"];
      fill.forEach(f=>{ if(!ex[f]&&d[f]) ex[f]=d[f]; });
      if(d.groupe!=="Autre") ex.groupe=ex.groupe&&ex.groupe!=="Autre"?ex.groupe:d.groupe;
      if(!ex.prefecture||ex.prefecture!==d.prefecture&&d.prefecture) ex.prefecture=d.prefecture||ex.prefecture;
      if(d.souhait!=="Indécis"&&ex.souhait==="Indécis") ex.souhait=d.souhait;
      if(STATUTS[d.statut].ord>STATUTS[ex.statut].ord||d.statut==="abandon"&&ex.statut!=="reintegre"){
        ex.statut=d.statut;
        ex._carte=d.carte; ex._corps=d.corps; ex._matricule=d.matricule; ex._filiere=d.filiere;
        impStubs(ex);
      }
      updated.push(ex.num);
    } else {
      let num=d.num;
      const mnum=num.match(/^DDR-(\d{4})-(\d{1,5})$/);
      if(mnum){ DB.seq.comb=Math.max(DB.seq.comb,+mnum[2]); }
      else num=numDossier();
      const nc={ id:"c"+Date.now()+Math.random().toString(36).slice(2,6), num, statut:d.statut,
        creele:new Date().toISOString(), agent:CUR.login+" (import)",
        nom:d.nom, prenom:d.prenom, alias:d.alias, sexe:d.sexe, dn:d.dn, ln:d.ln, nat:d.nat, tel:d.tel,
        fam:"Célibataire", prefecture:d.prefecture, sousPref:d.sousPref, commune:d.commune, site:d.site,
        groupe:d.groupe, grade:d.grade, annees:d.annees, zone:d.zone, souhait:d.souhait, instr:d.instr,
        obs:d.obs||(d.groupe==="Autre"&&d.groupeLibre?("Groupe déclaré : "+d.groupeLibre):""), photo:null,
        desarmement:null, demobilisation:null, reintMil:null, reintSocio:null, fin:null, abandon:null,
        _carte:d.carte, _corps:d.corps, _matricule:d.matricule, _filiere:d.filiere };
      impStubs(nc);
      DB.combattants.push(nc);
      created.push(nc.num);
    }
  }
  IMP.report={created,updated,skipped};
  log("Importation",`${IMP.fileName} — ${created.length} créé(s), ${updated.length} mis à jour, ${skipped.length} ignoré(s)`);
  toast(`Synchronisation terminée : ${created.length} créé(s), ${updated.length} mis à jour.`);
  $("impReport").innerHTML=`<div class="panel"><div class="ph"><h3>Rapport de synchronisation — ${esc(IMP.fileName)}</h3>
    <span style="display:flex;gap:7px"><button class="btn sm ghost" onclick="rImport()">← Nouvelle importation</button>
    <button class="btn sm sec" onclick="go('registre')">Ouvrir le registre</button></span></div><div class="pb">
    <div class="cards" style="margin-bottom:12px">
      <div class="kpi c-ok"><div class="n">${created.length}</div><div class="l">Dossiers créés</div></div>
      <div class="kpi c-des"><div class="n">${updated.length}</div><div class="l">Dossiers mis à jour</div></div>
      <div class="kpi c-ab"><div class="n">${skipped.length}</div><div class="l">Lignes ignorées</div></div>
    </div>
    ${created.length?`<div class="small" style="margin-bottom:6px"><b>Créés :</b> ${created.map(n=>`<span class="tag">${n}</span>`).join(" ")}</div>`:""}
    ${updated.length?`<div class="small" style="margin-bottom:6px"><b>Mis à jour :</b> ${updated.map(n=>`<span class="tag">${n}</span>`).join(" ")}</div>`:""}
    ${skipped.length?`<table style="margin-top:8px"><thead><tr><th>Ligne</th><th>Motif</th></tr></thead><tbody>${skipped.map(x=>`<tr><td>${x.ligne}</td><td class="small">${esc(x.motif)}</td></tr>`).join("")}</tbody></table>`:""}
  </div></div>`;
}


