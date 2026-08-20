/* module: admin/sauvegarde.js — PNDDRR engine (classic globals) */
/* ================= SAUVEGARDE & EXPORTS ================= */
function rSauvegarde(){
  const ts=lastPersist();
  $("view").innerHTML = `
  ${outilRetour()}
  <div class="panel"><div class="ph"><h3>Fonctionnement hors ligne (zones éloignées)</h3></div><div class="pb">
    ${HAS_LS?`<p class="small" style="margin-bottom:10px"><b style="color:var(--ok)">✔ Stockage local actif sur cet appareil.</b>
      Chaque opération (enregistrement, désarmement, importation…) est <b>enregistrée automatiquement</b> dans le navigateur :
      les données survivent à la fermeture du navigateur, au redémarrage de l'appareil et aux coupures de réseau ou d'électricité.
      Aucune connexion Internet n'est nécessaire pour travailler.${ts?` Dernier enregistrement automatique : <b>${new Date(ts).toLocaleString("fr-FR")}</b>.`:""}</p>`
    :`<p class="small" style="margin-bottom:10px"><b style="color:var(--warn)">⚠ Stockage local indisponible dans cet environnement</b> (aperçu bac à sable) —
      les données sont conservées en mémoire de session uniquement. Ouvrez le fichier directement dans un navigateur (Chrome, Firefox, Edge)
      sur l'appareil de terrain pour activer l'enregistrement automatique hors ligne.</p>`}
    <p class="small muted" style="margin-bottom:10px">L'application est un fichier unique sans serveur : copiez <b>ddr-rca.html</b> sur chaque poste de terrain (clé USB) et ouvrez-le dans le navigateur. Formats d'importation hors ligne : CSV et sauvegardes JSON ; Excel/Word/PDF nécessitent une connexion ponctuelle.</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${HAS_LS?`<button class="btn sec" onclick="persist();toast('Données enregistrées sur cet appareil.');rSauvegarde()">Enregistrer maintenant</button>`:""}
      ${CUR.role==="admin"?`<button class="btn sec" onclick="askSeedDemo()">Charger des données de démonstration (simulation)</button>`:""}
      ${HAS_LS&&CUR.role==="admin"?`<button class="btn danger" onclick="askClearLocal()">Effacer les données locales de cet appareil</button>`:""}
    </div>
  </div></div>
  <div class="panel"><div class="ph"><h3>Identification de ce poste</h3></div><div class="pb">
    <p class="small muted" style="margin-bottom:10px">Donnez un nom à chaque poste de terrain (ex. : « Antenne Bambari », « Site Paoua ») : il figure dans le nom des fichiers de synchronisation et dans l'historique, pour savoir d'où viennent les données consolidées.</p>
    <div class="toolbar" style="margin-bottom:0">
      <div class="field" style="flex:1;max-width:340px"><label>Nom de ce poste</label><input id="posteNom" value="${esc(DB.poste||"")}" placeholder="Ex. : Antenne Bambari"></div>
      <div class="field" style="max-width:190px"><label>Code du poste (numérotation)</label><input id="posteCodeInp" maxlength="5" value="${esc(DB.posteCode||"")}" placeholder="Ex. : BAM1" style="text-transform:uppercase"></div>
      <button class="btn sec" style="align-self:end" onclick="savePoste()">Enregistrer</button>
    </div>
    <p class="small muted" style="margin-top:9px">Le <b>code du poste</b> (2 à 5 lettres/chiffres) est intégré aux nouveaux numéros — <b>DDR-${posteCode()||"CODE"}-${new Date().getFullYear()}-0001</b>, <b>DEM-${posteCode()||"CODE"}-…</b> — ce qui rend toute collision impossible entre postes travaillant hors ligne. Les numéros déjà attribués ne changent pas.</p>
  </div></div>
  ${CUR.role==="admin"?`<div class="panel"><div class="ph"><h3>Secret d'installation (authentification des cartes)</h3></div><div class="pb">
    <p class="small muted" style="margin-bottom:10px">Le secret sert au calcul des codes d'authentification des cartes de démobilisé. Défini par l'administrateur et partagé entre les postes par la synchronisation, il rend les codes incalculables sans lui. ${DB.secret?`<b style="color:var(--ok)">✔ Un secret d'installation est défini.</b> Les cartes imprimées avant sa définition restent vérifiables.`:`<b style="color:var(--warn)">⚠ Aucun secret défini</b> — les codes reposent sur le réglage d'usine, commun à toutes les installations.`}</p>
    <div class="toolbar" style="margin-bottom:0">
      <button class="btn sec" onclick="genSecret()">${DB.secret?"Renouveler le secret":"Générer un secret d'installation"}</button>
    </div>
  </div></div>`:""}
  <div class="panel"><div class="ph"><h3>Sauvegarde et transfert entre postes</h3></div><div class="pb">
    <p class="small muted" style="margin-bottom:12px">Le fichier JSON sert au transfert entre appareils : <b>Restaurer</b> remplace toutes les données de ce poste ; <b>Fusionner</b> combine les données collectées hors ligne sur plusieurs postes (déduplication par n° de dossier et n° de série, le statut le plus avancé est conservé).</p>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn" onclick="backupJSON()">⇩ Télécharger la sauvegarde (JSON)</button>
      <label class="btn sec" style="display:inline-flex;align-items:center">⇧ Restaurer une sauvegarde (remplace tout)<input type="file" accept=".json" style="display:none" onchange="restoreJSON(this)"></label>
      <label class="btn sec" style="display:inline-flex;align-items:center">⇆ Fusionner une sauvegarde (multi-postes)<input type="file" accept=".json" style="display:none" onchange="mergeJSONFile(this)"></label>
    </div>
  </div></div>
  <div class="panel"><div class="ph"><h3>Historique des synchronisations (${DB.syncs.length})</h3></div><div class="pb nopad">${
    DB.syncs.length?`<table><thead><tr><th>Date</th><th>Opération</th><th>Fichier</th><th>Poste</th><th>Détail</th></tr></thead><tbody>${
      DB.syncs.slice(0,10).map(x=>`<tr><td class="small">${new Date(x.date).toLocaleString("fr-FR")}</td><td><span class="tag">${esc(x.type)}</span></td><td class="small">${esc(x.fichier)}</td><td class="small">${esc(x.poste)}</td><td class="small">${esc(x.detail)}</td></tr>`).join("")
    }</tbody></table>`:`<div class="empty">Aucune synchronisation pour le moment — exportez le fichier JSON de ce poste, ou fusionnez celui d'un autre poste.</div>`}</div></div>
  <div class="panel"><div class="ph"><h3>Exports CSV</h3></div><div class="pb" style="display:flex;gap:10px;flex-wrap:wrap">
    <button class="btn sec" onclick="exportXLSX()">Classeur Excel complet (.xlsx)</button>
    <button class="btn sec" onclick="exportCombCSV()">Ex-combattants (CSV)</button>
    <button class="btn sec" onclick="exportArmesCSV()">Registre des armes (CSV)</button>
    <button class="btn sec" onclick="exportJournalCSV()">Journal (CSV)</button>
  </div></div>`;
}
function dl(name, content, type){
  try{
    const b=new Blob([content],{type}); const a=document.createElement("a");
    a.href=URL.createObjectURL(b); a.download=name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
    toast(`Fichier « ${name} » téléchargé. S'il n'apparaît pas, ouvrez ddr-rca.html directement dans un navigateur.`);
  }catch(e){
    openModal("Téléchargement bloqué par cet aperçu", `<p class="small muted" style="margin-bottom:8px">Copiez le contenu ci-dessous et collez-le dans un fichier « ${esc(name)} », ou ouvrez ddr-rca.html directement dans Chrome/Edge/Firefox pour un téléchargement normal.</p>
      <textarea style="width:100%;height:260px;font-family:monospace;font-size:11px" onclick="this.select()">${esc(content)}</textarea>`,
      `<button class="btn ghost" onclick="closeModal()">Fermer</button>`);
  }
}
/* Écrivain XLSX minimal embarqué : archive ZIP « stored » + feuilles inlineStr */
var CRC_T=(function(){ const t=[]; for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=c&1?0xEDB88320^(c>>>1):c>>>1; t[n]=c>>>0; } return t; })();
function crc32(u8){ let c=0xFFFFFFFF; for(let i=0;i<u8.length;i++) c=CRC_T[(c^u8[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function xmlEsc(v){ return String(v==null?"":v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function xlsxBytes(sheets){
  const enc=new TextEncoder();
  const colName=i=>{ let n=""; i++; while(i){ n=String.fromCharCode(65+(i-1)%26)+n; i=Math.floor((i-1)/26); } return n; };
  const files=[["[Content_Types].xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'+sheets.map((sh,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join("")+'</Types>'],
  ["_rels/.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
  ["xl/workbook.xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'+sheets.map((sh,i)=>'<sheet name="'+xmlEsc(String(sh.nom).slice(0,31))+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join("")+'</sheets></workbook>'],
  ["xl/_rels/workbook.xml.rels",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+sheets.map((sh,i)=>'<Relationship Id="rId'+(i+1)+'" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join("")+'</Relationships>']];
  sheets.forEach((sh,i)=>{
    const rows=sh.rows.map((r,ri)=>'<row r="'+(ri+1)+'">'+r.map((v,ci)=>{
      const ref=colName(ci)+(ri+1);
      if(typeof v==="number"&&isFinite(v)) return '<c r="'+ref+'" t="n"><v>'+v+'</v></c>';
      const t=String(v==null?"":v); if(t==="") return "";
      return '<c r="'+ref+'" t="inlineStr"><is><t xml:space="preserve">'+xmlEsc(t)+'</t></is></c>';
    }).join("")+'</row>').join("");
    files.push(["xl/worksheets/sheet"+(i+1)+".xml",'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+rows+'</sheetData></worksheet>']);
  });
  const parts=[], central=[]; let off=0;
  for(const [name,content] of files){
    const nm=enc.encode(name), data=enc.encode(content), crc=crc32(data);
    const head=new Uint8Array(30+nm.length); const dv=new DataView(head.buffer);
    dv.setUint32(0,0x04034b50,true); dv.setUint16(4,20,true); dv.setUint16(6,0,true); dv.setUint16(8,0,true);
    dv.setUint16(10,0,true); dv.setUint16(12,0x21,true);
    dv.setUint32(14,crc,true); dv.setUint32(18,data.length,true); dv.setUint32(22,data.length,true);
    dv.setUint16(26,nm.length,true); dv.setUint16(28,0,true); head.set(nm,30);
    parts.push(head,data);
    const cd=new Uint8Array(46+nm.length); const cv=new DataView(cd.buffer);
    cv.setUint32(0,0x02014b50,true); cv.setUint16(4,20,true); cv.setUint16(6,20,true);
    cv.setUint16(12,0,true); cv.setUint16(14,0x21,true);
    cv.setUint32(16,crc,true); cv.setUint32(20,data.length,true); cv.setUint32(24,data.length,true);
    cv.setUint16(28,nm.length,true); cv.setUint32(42,off,true); cd.set(nm,46);
    central.push(cd);
    off+=head.length+data.length;
  }
  const cdLen=central.reduce((a,x)=>a+x.length,0);
  const end=new Uint8Array(22); const ev=new DataView(end.buffer);
  ev.setUint32(0,0x06054b50,true); ev.setUint16(8,files.length,true); ev.setUint16(10,files.length,true);
  ev.setUint32(12,cdLen,true); ev.setUint32(16,off,true);
  const total=off+cdLen+22, out=new Uint8Array(total); let p=0;
  for(const part of [...parts,...central,end]){ out.set(part,p); p+=part.length; }
  return out;
}
function dlXlsx(name, sheets){
  try{
    const b=new Blob([xlsxBytes(sheets)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
    toast(`Fichier Excel « ${name} » téléchargé.`);
  }catch(e){ toast("Export Excel indisponible dans cet aperçu — utilisez l'export CSV ou ouvrez ddr-rca.html dans un navigateur."); }
}
function combRows(src){
  const rows=[["N° dossier","Nom","Prénom","Alias","Sexe","Date naissance","Nationalité","Téléphone","Préfecture","Sous-préfecture","Commune","Site","Groupe armé","Grade","Souhait","Statut","Carte démobilisé","Corps (mil.)","Matricule","Filière (socio-éco)","Appui FCFA","Fin de parcours"]];
  (src||DB.combattants).forEach(c=>rows.push([c.num,c.nom,c.prenom,c.alias||"",c.sexe,c.dn||"",c.nat,c.tel||"",c.prefecture,c.sousPref||"",c.commune||"",c.site||"",c.groupe,c.grade||"",c.souhait,STATUTS[c.statut].lbl,
    c.demobilisation?c.demobilisation.carte:"", c.reintMil?c.reintMil.corps:"", c.reintMil?c.reintMil.matricule:"",
    c.reintSocio?c.reintSocio.filiere:"", c.reintSocio?+c.reintSocio.appui||"":"", c.fin||""]));
  return rows;
}
function armesRowsX(){
  const rows=[["Type","Marque","Calibre","N° série","État","Garde","Remise par","N° dossier","Date","Lieu"]];
  allArmes().forEach(a=>rows.push([a.type,a.marque,a.calibre,a.serie,a.etat,GARDE_LBL[(a.garde&&a.garde.etat)||"depot"],a.nom,a.num,a.date,a.lieu]));
  return rows;
}
function exportXLSX(){
  dlXlsx(`pnddrr_registre_${today()}.xlsx`, [
    {nom:"Ex-combattants", rows:combRows()},
    {nom:"Armes", rows:armesRowsX()},
    {nom:"Munitions", rows:(()=>{const r=[["Nature / calibre","Quantité","Unité","Remise par","N° dossier","Date","Lieu"]];allMunitions().forEach(m=>r.push([m.nature,m.qte,m.unite,m.nom,m.num,m.date,m.lieu]));return r;})()}
  ]);
  log("Export Excel","Classeur registre (ex-combattants, armes, munitions)");
}
function csv(rows){ return "\uFEFF"+rows.map(r=>r.map(x=>`"${String(x==null?"":x).replace(/"/g,'""')}"`).join(";")).join("\r\n"); }
function exportCombCSV(fromSearch){
  const src = fromSearch && window._lastSearch ? window._lastSearch : DB.combattants;
  const rows=[["N° dossier","Nom","Prénom","Alias","Sexe","Date naissance","Nationalité","Téléphone","Préfecture","Sous-préfecture","Commune","Site","Groupe armé","Grade","Souhait","Statut","Carte démobilisé","Corps (mil.)","Matricule","Filière (socio-éco)","Appui FCFA","Fin de parcours"]];
  src.forEach(c=>rows.push([c.num,c.nom,c.prenom,c.alias||"",c.sexe,c.dn||"",c.nat,c.tel||"",c.prefecture,c.sousPref||"",c.commune||"",c.site||"",c.groupe,c.grade||"",c.souhait,STATUTS[c.statut].lbl,
    c.demobilisation?c.demobilisation.carte:"", c.reintMil?c.reintMil.corps:"", c.reintMil?c.reintMil.matricule:"",
    c.reintSocio?c.reintSocio.filiere:"", c.reintSocio?c.reintSocio.appui||"":"", c.fin||""]));
  dl("pnddrr_ex-combattants.csv", csv(rows), "text/csv"); log("Export CSV","Ex-combattants");
}
function exportArmesCSV(){
  const rows=[["Type","Marque","Calibre","N° série","État","Garde","Dépôt","N° scellé","PV destruction","Munitions","Remise par","N° dossier","Groupe","Date","Lieu"]];
  allArmes().forEach(a=>{const g=a.garde||{etat:"depot"};rows.push([a.type,a.marque,a.calibre,a.serie,a.etat,GARDE_LBL[g.etat],g.depot||"",g.scelle||"",g.destruction?g.destruction.pv||"":"",a.mun,a.nom,a.num,a.groupe,a.date,a.lieu]);});
  dl("pnddrr_registre_armes.csv", csv(rows), "text/csv"); log("Export CSV","Registre des armes");
}
function exportJournalCSV(){
  const rows=[["Horodatage","Utilisateur","Action","Détail"]];
  DB.journal.forEach(j=>rows.push([j.date,j.user,j.action,j.detail]));
  dl("pnddrr_journal.csv", csv(rows), "text/csv");
}
function askClearLocal(){
  openModal("Effacer les données locales", `<p>Toutes les données enregistrées sur <b>cet appareil</b> seront supprimées (dossiers, registres, journal, comptes créés). Téléchargez d'abord une sauvegarde JSON si nécessaire.</p>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn danger" onclick="doClearLocal()">Effacer définitivement</button>`);
}
function doClearLocal(){ clearPersisted(); try{ if(HAS_LS) localStorage.setItem("pnddrr_skip_demo","1"); }catch(e){} closeModal(); toast("Données locales effacées — rechargez la page."); }
function mergeJSONFile(inp){
  const f=inp.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ try{
      const d=JSON.parse(r.result);
      if(!d.combattants||!d.users) throw 0;
      const rep=mergeDB(d);
      addSync("Fusion", f.name, `poste source : ${d.poste||"(non précisé)"} — ${rep.ajoutes} ajouté(s), ${rep.fusionnes} fusionné(s)`);
      log("Fusion multi-postes",`${f.name} — ${rep.ajoutes} dossier(s) ajouté(s), ${rep.fusionnes} fusionné(s), ${rep.armes} arme(s), ${rep.groupes} groupe(s)`);
      toast(`Fusion terminée : ${rep.ajoutes} ajouté(s), ${rep.fusionnes} fusionné(s).`);
      go("dashboard");
    }catch(e){ toast("Fichier de sauvegarde invalide."); } };
  r.readAsText(f); inp.value="";
}
function mergeDB(d){
  const rep={ajoutes:0,fusionnes:0,armes:0,groupes:0};
  (d.groupes||[]).forEach(g=>{ if(!GROUPES.some(x=>normTxt(x)===normTxt(g))){ GROUPES.splice(GROUPES.indexOf("Autre"),0,g); rep.groupes++; } });
  (d.users||[]).forEach(u=>{ if(!DB.users.some(x=>x.login===u.login)) DB.users.push(u); });
  const series=new Set(allArmes().map(a=>normTxt(a.serie)).filter(x=>x));
  for(const inc of d.combattants||[]){
    let ex=DB.combattants.find(c=>c.num===inc.num)
      ||DB.combattants.find(c=>c.nom===inc.nom&&normTxt(c.prenom)===normTxt(inc.prenom)&&(!inc.dn||!c.dn||c.dn===inc.dn));
    if(!ex){
      const m=String(inc.num||"").match(/^DDR-(\d{4})-(\d{1,5})$/);
      if(m) DB.seq.comb=Math.max(DB.seq.comb,+m[2]); else inc.num=numDossier();
      if(inc.demobilisation&&inc.demobilisation.carte){ const md=inc.demobilisation.carte.match(/^DEM-(\d{4})-(\d{1,5})$/); if(md) DB.seq.dem=Math.max(DB.seq.dem,+md[2]); }
      DB.combattants.push(inc); rep.ajoutes++;
      if(inc.desarmement) inc.desarmement.armes.forEach(a=>{ if(a.serie) series.add(normTxt(a.serie)); });
      continue;
    }
    // fusion : champs vides complétés, statut le plus avancé conservé
    ["alias","dn","ln","tel","sousPref","commune","site","grade","annees","zone","obs","photo"].forEach(f=>{ if(!ex[f]&&inc[f]) ex[f]=inc[f]; });
    if(STATUTS[inc.statut]&&STATUTS[inc.statut].ord>STATUTS[ex.statut].ord) ex.statut=inc.statut;
    if(inc.desarmement){
      if(!ex.desarmement) ex.desarmement={date:inc.desarmement.date,lieu:inc.desarmement.lieu,agent:inc.desarmement.agent,armes:[],munitions:[]};
      for(const a of inc.desarmement.armes||[]){
        if(a.serie&&series.has(normTxt(a.serie))) continue;
        ex.desarmement.armes.push(a); if(a.serie) series.add(normTxt(a.serie)); rep.armes++;
      }
      for(const m of inc.desarmement.munitions||[]){
        ex.desarmement.munitions=ex.desarmement.munitions||[];
        if(!ex.desarmement.munitions.some(x=>x.nature===m.nature&&x.qte===m.qte&&x.unite===m.unite)) ex.desarmement.munitions.push(m);
      }
    }
    if(inc.demobilisation&&!ex.demobilisation) ex.demobilisation=inc.demobilisation;
    if(inc.reintMil&&!ex.reintMil) ex.reintMil=inc.reintMil;
    if(inc.reintSocio){
      if(!ex.reintSocio) ex.reintSocio=inc.reintSocio;
      else (inc.reintSocio.visites||[]).forEach(v=>{ if(!ex.reintSocio.visites.some(x=>x.date===v.date&&x.obs===v.obs)) ex.reintSocio.visites.push(v); });
    }
    if(inc.fin&&!ex.fin) ex.fin=inc.fin;
    if(inc.abandon&&!ex.abandon&&ex.statut==="abandon") ex.abandon=inc.abandon;
    rep.fusionnes++;
  }
  (d.journal||[]).forEach(j=>{ if(!DB.journal.some(x=>x.date===j.date&&x.user===j.user&&x.action===j.action)) DB.journal.push(j); });
  DB.journal.sort((a,b)=>b.date.localeCompare(a.date));
  return rep;
}
function backupJSON(){
  const name=`pnddrr_sync_${posteSlug()}_${today()}.json`;
  dl(name, JSON.stringify(DB,null,1), "application/json");
  addSync("Export", name, `${DB.combattants.length} dossier(s), ${allArmes().length} arme(s)`);
  log("Sauvegarde",`Export du fichier de synchronisation ${name}`); toast("Fichier de synchronisation téléchargé.");
}
function restoreJSON(inp){
  const f=inp.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!d.combattants||!d.users) throw 0;
      DB=d; migrateDB();
      (DB.users||[]).forEach(u=>{ u.passUpdated=true; });
      addSync("Restauration", f.name, `poste source : ${d.poste||"(non précisé)"} — ${DB.combattants.length} dossier(s)`);
      log("Restauration",`Fichier ${f.name} — ${DB.combattants.length} dossier(s)`);
      toast("Sauvegarde restaurée."); go("dashboard");
    }catch(e){ toast("Fichier de sauvegarde invalide."); }
  };
  r.readAsText(f); inp.value="";
}


