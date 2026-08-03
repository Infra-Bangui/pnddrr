/* module: reintegration/suivi.js — PNDDRR engine (classic globals) */
/* ================= PARTIE 2 — SUIVI DES RÉINTÉGRATIONS ================= */
var ATT_F="", REI_Q="";
function attSet(v){ ATT_F=v; rReint(); }
function reiSearch(v){
  REI_Q=v; rReint();
  const el=$("rei_q"); if(el){ el.focus(); const n=el.value.length; try{el.setSelectionRange(n,n);}catch(e){} }
}
function reiMatch(c){
  const q=REI_Q.trim().toLowerCase(); if(!q) return true;
  const r=reintOf(c);
  const txt=[c.num,c.nom,c.prenom,c.alias,c.vague,c.prefecture,c.groupe,c.souhait,
    r&&r.promo||"", c.reintMil?c.reintMil.corps:"", c.reintMil?c.reintMil.unite:"", c.reintMil?c.reintMil.matricule:"",
    c.reintSocio?c.reintSocio.filiere:"", c.reintSocio?c.reintSocio.centre:""].join(" ").toLowerCase();
  return txt.includes(q);
}
function attFiltre(){
  const attente=DB.combattants.filter(c=>["desarme","demobilise"].includes(c.statut));
  return ATT_F?attente.filter(c=>c.souhait===ATT_F):attente;
}
function exportAttenteCSV(){
  const rows=[["N° dossier","Nom","Prénom","Sexe","Âge","Statut","Souhait de réintégration","Vague","Groupe armé","Préfecture","Sous-préfecture","Commune","Désarmé le","Téléphone"]];
  attFiltre().forEach(c=>rows.push([c.num,c.nom,c.prenom,c.sexe,age(c.dn),STATUTS[c.statut].lbl,c.souhait,c.vague||"",c.groupe,c.prefecture,c.sousPref||"",c.commune||"",c.desarmement?c.desarmement.date:"",c.tel||""]));
  dl(`pnddrr_attente_orientation${ATT_F?"_"+ATT_F.toLowerCase().replace(/[^a-z]+/g,"-"):""}_${today()}.csv`, csv(rows), "text/csv");
  log("Export CSV",`En attente d'orientation${ATT_F?" — souhait "+ATT_F:""} (${attFiltre().length})`);
  toast("Liste d'attente exportée.");
}
function printAttente(){
  const L=attFiltre();
  doPrint(docWrap(`${docEntete("Liste des ex-combattants en attente d'orientation")}
    <h2 class="titre">En attente d'orientation${ATT_F?` — souhait : ${esc(ATT_F)}`:""}</h2>
    <p>${L.length} ex-combattant(s) désarmé(s) ou démobilisé(s) en attente d'orientation${ATT_F?` ayant exprimé le souhait « ${esc(ATT_F)} »`:""}, arrêté au ${new Date().toLocaleDateString("fr-FR")}.</p>
    <table class="dt"><tr><th>N°</th><th>Dossier</th><th>Nom & prénom</th><th>Statut</th><th>Souhait</th><th>Vague</th><th>Préfecture</th></tr>${
      L.map((c,i)=>`<tr><td>${i+1}</td><td>${c.num}</td><td>${esc(c.nom)} ${esc(c.prenom)}</td><td>${STATUTS[c.statut].lbl}</td><td>${esc(c.souhait)}</td><td>${esc(c.vague||"—")}</td><td>${esc(c.prefecture)}</td></tr>`).join("")}</table>
    <div class="sig"><div class="c"></div><div class="c">Fait à ${esc(cfg("villeSignature")||"Bangui")}, le ${new Date().toLocaleDateString("fr-FR")}<br>Pour le PNDDRR<div class="ligne">${esc(CUR.nom)}</div></div></div>`));
  log("Impression",`Liste d'attente d'orientation${ATT_F?" — "+ATT_F:""}`);
}
function vagueDe(c){ const r=reintOf(c); return (r&&r.promo)||c.vague||"(sans vague)"; }
function grpVagues(list){
  const m={}; list.forEach(c=>{ const v=vagueDe(c); (m[v]=m[v]||[]).push(c); });
  return Object.keys(m).sort().map(v=>[v,m[v]]);
}
function vgRow(v,n,cols){ return `<tr style="background:var(--teal-light)"><td colspan="${cols}" style="font-weight:700;color:var(--teal-dark);padding:7px 12px">▸ ${esc(v)} — ${n} dossier(s)</td></tr>`; }
function rReint(){
  const C=DB.combattants;
  const attente=attFiltre().filter(reiMatch);
  const enCours=C.filter(c=>["reintegration_militaire","reintegration_socio"].includes(c.statut)&&reiMatch(c));
  const enFormation=enCours.filter(c=>!reintOf(c).formFin);
  const enReint=enCours.filter(c=>reintOf(c).formFin);
  const acheves=C.filter(c=>c.statut==="reintegre"&&reiMatch(c));
  const visites=C.reduce((a,c)=>a+(c.reintSocio?c.reintSocio.visites.length:0),0);
  const A=hasPerm("orienter");
  $("view").innerHTML = `
  <div class="toolbar">
    <div class="field" style="flex:1;max-width:520px"><label>Recherche</label><input id="rei_q" value="${esc(REI_Q)}" oninput="reiSearch(this.value)" placeholder="Nom, n° dossier, matricule, filière, unité, vague, groupe, préfecture…"></div>
    ${REI_Q?`<button class="btn ghost" style="align-self:end" onclick="REI_Q='';rReint()">✕ Effacer (${attente.length+enCours.length+acheves.length} résultat(s))</button>`:""}
  </div>
  <div class="cards">
    <div class="kpi c-dem"><div class="n">${attente.length}</div><div class="l">En attente d'orientation</div></div>
    <div class="kpi c-rm"><div class="n">${enFormation.length}</div><div class="l">En formation</div></div>
    <div class="kpi c-rs"><div class="n">${enReint.length}</div><div class="l">En réintégration (formation achevée)</div></div>
    <div class="kpi c-ok"><div class="n">${acheves.length}</div><div class="l">Parcours achevés</div></div>
    <div class="kpi"><div class="n">${visites}</div><div class="l">Visites de suivi réalisées</div></div>
    <div class="kpi c-dem"><div class="n">${enCours.filter(c=>reintOf(c).formFin).length}/${enCours.length}</div><div class="l">Formations achevées (en cours)</div></div>
    <div class="kpi c-ok"><div class="n">${enCours.filter(c=>reintOf(c).vieDate).length}/${enCours.length}</div><div class="l">Intégrés vie militaire / civile</div></div>
  </div>

  <div class="panel"><div class="ph"><h3>En attente d'orientation (${attente.length}${ATT_F?` — souhait : ${esc(ATT_F)}`:""})</h3>
    <span style="display:flex;gap:7px;align-items:center">
      <select onchange="attSet(this.value)" style="padding:6px 9px;border:1px solid var(--line);border-radius:7px;font-size:12.5px">
        <option value="">Tous les souhaits</option>
        <option value="Militaire" ${ATT_F==="Militaire"?"selected":""}>Militaire</option>
        <option value="Socio-économique" ${ATT_F==="Socio-économique"?"selected":""}>Socio-économique</option>
        <option value="Indécis" ${ATT_F==="Indécis"?"selected":""}>Indécis</option>
      </select>
      <button class="btn sm sec" onclick="exportAttenteCSV()">Exporter CSV</button>
      <button class="btn sm sec" onclick="printAttente()">Imprimer / PDF</button>
    </span></div><div class="pb nopad">${
    attente.length?`<table><thead><tr><th>N° dossier</th><th>Nom & prénom</th><th>Statut</th><th>Souhait exprimé</th><th>Préfecture</th><th>Actions</th></tr></thead><tbody>${
      grpVagues(attente).map(([v,L])=>vgRow(v,L.length,6)+L.map(c=>`<tr><td><b>${c.num}</b></td><td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
      <td><span class="badge st-${c.statut}">${STATUTS[c.statut].lbl}</span></td><td>${esc(c.souhait)}</td><td class="small">${esc(c.prefecture)}</td>
      <td class="actions-cell">${A?`<button class="btn sm" onclick="mReintMil('${c.id}')">Militaire</button><button class="btn sm sec" onclick="mReintSocio('${c.id}')">Socio-éco.</button><button class="btn sm ghost" onclick="mRapatriement('${c.id}')">Rapatr.</button>`:'<span class="muted small">—</span>'}</td></tr>`).join("")).join("")
    }</tbody></table>`:`<div class="empty">Aucun dossier en attente d'orientation${ATT_F?` avec le souhait « ${esc(ATT_F)} » — <span class="link" onclick="attSet('')">afficher tous</span>`:""}.</div>`}</div></div>

  ${[["En formation — par vague",enFormation,"Les formations en cours (fin de formation non validée), regroupées par vague ; validation possible dossier par dossier ici ou par promotion entière depuis la page « Formation & intégration »."],
     ["En réintégration — par vague (formation achevée)",enReint,"Formation validée : confirmation de l'intégration à la vie militaire ou civile, visites de suivi et clôture, par vague."]].map(([titre,liste,note])=>`
  <div class="panel"><div class="ph"><h3>${titre} (${liste.length})</h3></div><div class="pb nopad">${
    liste.length?`<table><thead><tr><th>N° dossier</th><th>Nom & prénom</th><th>Type</th><th>Détail</th><th>Formation</th><th>Intégration</th><th>Visites</th><th>Actions</th></tr></thead><tbody>${
      grpVagues(liste).map(([v,L])=>vgRow(v,L.length,8)+L.map(c=>{
        const mil=c.statut==="reintegration_militaire";
        const r=reintOf(c);
        const det=mil?`${esc(c.reintMil.corps)} — matricule ${esc(c.reintMil.matricule)}`:`Filière ${esc(c.reintSocio.filiere)}${c.reintSocio.centre?" · "+esc(c.reintSocio.centre):""}`;
        const [bF,bV]=jalonBadge(c);
        const P=hasPerm("orienter");
        return `<tr><td><b>${c.num}</b></td><td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
        <td><span class="badge st-${c.statut}">${mil?"Militaire":"Socio-éco."}</span></td><td class="small">${det}</td>
        <td>${bF}</td><td>${bV}</td>
        <td>${mil?"—":c.reintSocio.visites.length}</td>
        <td class="actions-cell">${!r.formFin&&P?`<button class="btn sm sec" title="Valider la fin de formation" onclick="mFormationFin('${c.id}')">Fin formation</button>`:""}${r.formFin&&!r.vieDate&&P?`<button class="btn sm sec" title="Confirmer l'intégration à la vie ${mil?"militaire":"civile"}" onclick="mIntegration('${c.id}')">Intégration</button>`:""}${!mil&&hasPerm("visites")?`<button class="btn sm sec" onclick="mVisite('${c.id}')">+ Visite</button>`:""}${hasPerm("cloturer")?`<button class="btn sm" onclick="markReintegre('${c.id}')">Clôturer</button>`:""}</td></tr>`;
      }).join("")).join("")
    }</tbody></table><div class="small muted" style="padding:9px 14px">${note}</div>`:`<div class="empty">Aucun parcours à cette étape.</div>`}</div></div>`).join("")}

  <div class="panel"><div class="ph"><h3>Parcours achevés (${acheves.length})</h3></div><div class="pb nopad">${
    acheves.length?`<table><thead><tr><th>N° dossier</th><th>Nom & prénom</th><th>Type de réintégration</th><th>Détail</th><th>Formation</th><th>Intégration</th><th>Achevé le</th></tr></thead><tbody>${
      grpVagues(acheves).map(([v,L])=>vgRow(v,L.length,7)+L.map(c=>{const [bF,bV]=jalonBadge(c);return `<tr><td><b>${c.num}</b></td><td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
      <td>${c.reintMil?"Militaire":c.reintSocio?"Socio-économique":"—"}</td>
      <td class="small">${c.reintMil?esc(c.reintMil.corps):c.reintSocio?esc(c.reintSocio.filiere):"—"}</td>
      <td>${bF||"—"}</td><td>${bV||"—"}</td>
      <td>${fmtD(c.fin)}</td></tr>`;}).join("")).join("")
    }</tbody></table>`:`<div class="empty">Aucun parcours achevé pour le moment.</div>`}</div></div>`;
}

