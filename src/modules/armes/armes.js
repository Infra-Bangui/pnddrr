/* module: armes/armes.js — PNDDRR engine (classic globals) */
/* ================= REGISTRE DES ARMES ================= */
function allArmes(){
  const out=[];
  DB.combattants.forEach(c=>{ if(c.desarmement) c.desarmement.armes.forEach((a,ai)=>out.push(Object.assign({num:c.num,nom:`${c.nom} ${c.prenom}`,groupe:c.groupe,date:c.desarmement.date,lieu:c.desarmement.lieu,cid:c.id,ai},a))); });
  return out;
}
function allMunitions(){
  const out=[];
  DB.combattants.forEach(c=>{ if(c.desarmement) (c.desarmement.munitions||[]).forEach(m=>out.push(Object.assign({num:c.num,nom:`${c.nom} ${c.prenom}`,groupe:c.groupe,date:c.desarmement.date,lieu:c.desarmement.lieu,cid:c.id},m))); });
  return out;
}
const GARDE_LBL={depot:"En dépôt",scelle:"Scellée",detruit:"Détruite"};
function gardeBadge(a){
  const g=a.garde&&a.garde.etat||"depot";
  const cls=g==="detruit"?"st-abandon":g==="scelle"?"st-demobilise":"st-enregistre";
  const tip=a.garde?(a.garde.depot?("Dépôt : "+a.garde.depot+" ") : "")+(a.garde.scelle?("Scellé "+a.garde.scelle+" "):"")+(a.garde.destruction?("PV "+(a.garde.destruction.pv||"—")+" le "+fmtD(a.garde.destruction.date)):""):"";
  return `<span class="badge ${cls}" title="${esc(tip)}">${GARDE_LBL[g]}</span>`;
}
function mGarde(cid, ai){
  const c=DB.combattants.find(x=>x.id===cid); if(!c||!c.desarmement) return;
  const a=c.desarmement.armes[ai]; if(!a) return;
  const g=a.garde||{etat:"depot"};
  openModal("Garde de l'arme — cycle de vie", `
    <p class="small muted" style="margin-bottom:12px"><b>${esc(a.type)}</b>${a.serie?" — n° de série "+esc(a.serie):""} · remise par ${esc(c.nom)} ${esc(c.prenom)} (${c.num}) le ${fmtD(c.desarmement.date)}.</p>
    <div class="field"><label>Étape de garde</label><select id="gd_etat" onchange="$('gd_scelleBox').style.display=this.value==='scelle'?'grid':'none';$('gd_destBox').style.display=this.value==='detruit'?'grid':'none'">
      <option value="depot" ${g.etat==="depot"?"selected":""}>En dépôt (armurerie / conteneur)</option>
      <option value="scelle" ${g.etat==="scelle"?"selected":""}>Scellée (mise sous scellé)</option>
      <option value="detruit" ${g.etat==="detruit"?"selected":""}>Détruite (procès-verbal de destruction)</option>
    </select></div>
    <div class="field"><label>Dépôt / lieu de garde</label><input id="gd_depot" value="${esc(g.depot||"")}" placeholder="Ex. : armurerie MINUSCA Bangui — conteneur 4"></div>
    <div class="grid2" id="gd_scelleBox" style="display:${g.etat==="scelle"?"grid":"none"}">
      <div class="field"><label>N° de scellé</label><input id="gd_scelle" value="${esc(g.scelle||"")}" placeholder="Ex. : SC-2026-0145"></div>
      <div class="field"><label>Date de mise sous scellé</label><input type="date" id="gd_scelleDate" value="${g.scelleDate||today()}"></div>
    </div>
    <div class="grid2" id="gd_destBox" style="display:${g.etat==="detruit"?"grid":"none"}">
      <div class="field"><label>Date de destruction</label><input type="date" id="gd_destDate" value="${g.destruction?g.destruction.date:today()}"></div>
      <div class="field"><label>N° du procès-verbal</label><input id="gd_destPv" value="${esc(g.destruction?g.destruction.pv:"")}" placeholder="Ex. : PV-DEST-2026-07"></div>
      <div class="field" style="grid-column:1/-1"><label>Commission / lieu de destruction</label><input id="gd_destCom" value="${esc(g.destruction?g.destruction.commission:"")}" placeholder="Ex. : Commission mixte UEPNDDR-MINUSCA — Bangui"></div>
    </div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveGarde('${cid}',${ai})">Enregistrer</button>`);
}
function saveGarde(cid, ai){
  if(!hasPerm("desarmer")){ toast("Autorisation « désarmer » requise."); return; }
  const c=DB.combattants.find(x=>x.id===cid); const a=c.desarmement.armes[ai];
  const etat=$("gd_etat").value;
  a.garde={etat, depot:$("gd_depot").value.trim()};
  if(etat==="scelle"){ a.garde.scelle=$("gd_scelle").value.trim(); a.garde.scelleDate=$("gd_scelleDate").value||today(); }
  if(etat==="detruit"){ a.garde.destruction={date:$("gd_destDate").value||today(), pv:$("gd_destPv").value.trim(), commission:$("gd_destCom").value.trim()}; }
  log("Garde d'arme",`${a.type}${a.serie?" ("+a.serie+")":""} — ${GARDE_LBL[etat]}${etat==="scelle"&&a.garde.scelle?" · scellé "+a.garde.scelle:""}${etat==="detruit"&&a.garde.destruction.pv?" · "+a.garde.destruction.pv:""} (dossier ${c.num})`);
  closeModal(); toast("Garde mise à jour."); rArmes();
}
function rArmes(){
  const A=allArmes(), MU=allMunitions();
  $("view").innerHTML = `
  <div class="cards">
    <div class="kpi"><div class="n">${A.length}</div><div class="l">Armes & lots collectés</div></div>
    <div class="kpi c-ok"><div class="n">${A.filter(a=>a.etat==="Fonctionnelle").length}</div><div class="l">Fonctionnelles</div></div>
    <div class="kpi c-ab"><div class="n">${A.filter(a=>a.etat!=="Fonctionnelle").length}</div><div class="l">Défectueuses / hors d'usage</div></div>
    <div class="kpi c-dem"><div class="n">${MU.length}</div><div class="l">Lots de munitions</div></div>
    <div class="kpi"><div class="n">${A.filter(a=>!a.garde||a.garde.etat==="depot").length}</div><div class="l">En dépôt</div></div>
    <div class="kpi c-rs"><div class="n">${A.filter(a=>a.garde&&a.garde.etat==="scelle").length}</div><div class="l">Sous scellé</div></div>
    <div class="kpi c-ab"><div class="n">${A.filter(a=>a.garde&&a.garde.etat==="detruit").length}</div><div class="l">Détruites</div></div>
    <div class="kpi c-rm"><div class="n">${fmtN(MU.filter(m=>m.unite==="cartouches").reduce((a,m)=>a+m.qte,0))}</div><div class="l">Cartouches collectées</div></div>
  </div>
  <div class="toolbar">
    <div class="field"><label>Type</label><select id="wType" onchange="filtArmes()"><option value="">Tous</option>${TYPES_ARMES.map(t=>`<option>${t}</option>`).join("")}</select></div>
    <div class="field" style="flex:1"><label>Recherche</label><input id="wTxt" placeholder="N° série, nom, dossier…" oninput="filtArmes()"></div>
    <button class="btn sec" onclick="exportArmesCSV()">Exporter CSV</button>
    ${hasPerm("importer")?`<button class="btn sec" onclick="go('import','armes')">Importer un registre…</button>`:""}
    <button class="btn sec" onclick="printRegArmes()">Imprimer le registre</button>
  </div>
  <div class="panel"><div class="ph"><h3>Armes collectées</h3><span class="muted small">cycle de vie : dépôt → scellé → destruction</span></div><div class="pb nopad"><table><thead><tr><th>Type</th><th>Marque</th><th>N° série</th><th>État</th><th>Garde</th><th>Remise par</th><th>Dossier</th><th>Date / lieu</th><th>Actions</th></tr></thead><tbody id="tbArm"></tbody></table></div></div>
  <div class="panel"><div class="ph"><h3>Munitions et explosifs collectés (${MU.length} lot(s))</h3>
    <span style="display:flex;gap:7px"><button class="btn sm sec" onclick="exportMunCSV()">Exporter CSV</button></span></div>
    <div class="pb nopad">${MU.length?`<table><thead><tr><th>Nature / calibre</th><th>Quantité</th><th>Unité</th><th>Observations</th><th>Remise par</th><th>Dossier</th><th>Date / lieu</th></tr></thead><tbody>${
      MU.map(m=>`<tr><td>${esc(m.nature)||"—"}</td><td><b>${fmtN(m.qte)}</b></td><td>${esc(m.unite)}</td><td class="small">${esc(m.obs)||"—"}</td><td>${esc(m.nom)}</td><td><span class="link" onclick="go('fiche','${m.cid}')">${m.num}</span></td><td class="small">${fmtD(m.date)}${m.lieu?" · "+esc(m.lieu):""}</td></tr>`).join("")
    }</tbody></table>`:`<div class="empty">Aucune munition enregistrée — utilisez la section « Munitions et explosifs remis » du procès-verbal de désarmement.</div>`}</div></div>
  <div class="panel"><div class="ph"><h3>Synthèse des munitions par nature</h3></div><div class="pb">${
    MU.length?(()=>{const agg={};MU.forEach(m=>{const k=(m.nature||"(non précisée)")+" — "+m.unite;agg[k]=(agg[k]||0)+m.qte;});
      return Object.entries(agg).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span class="lbl" style="width:260px">${esc(k)}</span><span class="val">${fmtN(v)}</span></div>`).join("");})()
    :`<span class="muted small">Aucune donnée.</span>`}</div></div>`;
  filtArmes();
}
function exportMunCSV(){
  const rows=[["Nature / calibre","Quantité","Unité","Observations","Remise par","N° dossier","Groupe","Date","Lieu"]];
  allMunitions().forEach(m=>rows.push([m.nature,m.qte,m.unite,m.obs,m.nom,m.num,m.groupe,m.date,m.lieu]));
  dl("pnddrr_registre_munitions.csv", csv(rows), "text/csv"); log("Export CSV","Registre des munitions");
}
var ARM_LIM=PAGE_TAILLE;
function armPlus(tout){ ARM_LIM=tout?Infinity:ARM_LIM+PAGE_TAILLE; filtArmes(); }
function filtArmes(){
  const t=$("wType").value, q=$("wTxt").value.toLowerCase();
  const rows=allArmes().filter(a=>(!t||a.type===t)&&(!q||`${a.serie} ${a.nom} ${a.num} ${a.marque}`.toLowerCase().includes(q)));
  const tronq=rows.length>ARM_LIM;
  $("tbArm").innerHTML = (rows.length ? rows.slice(0,ARM_LIM).map(a=>`<tr><td class="small">${esc(a.type)}</td><td>${esc(a.marque)||"—"}</td><td>${esc(a.serie)||"—"}</td><td>${esc(a.etat)}</td><td>${gardeBadge(a)}</td><td>${esc(a.nom)}</td><td><span class="link" onclick="go('fiche','${a.cid}')">${a.num}</span></td><td class="small">${fmtD(a.date)} · ${esc(a.lieu)}</td><td>${hasPerm("desarmer")?`<button class="btn sm sec" onclick="mGarde('${a.cid}',${a.ai})">Garde…</button>`:""}</td></tr>`).join("")
  : `<tr><td colspan="9" class="empty">Aucune arme enregistrée.</td></tr>`)
  + (tronq?`<tr><td colspan="9" style="text-align:center;padding:11px;background:#FBFDFC"><span class="small muted">${ARM_LIM} affichée(s) sur ${rows.length} — </span><button class="btn sm sec" onclick="armPlus()">Afficher ${Math.min(PAGE_TAILLE,rows.length-ARM_LIM)} de plus</button> <button class="btn sm ghost" onclick="armPlus(true)">Tout afficher</button></td></tr>`:"");
}

