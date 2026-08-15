/* module: combattants/fiche.js — PNDDRR engine (classic globals) */
/* ================= FICHE INDIVIDUELLE ================= */
function stepsHtml(c){
  const order=["enregistre","desarme","demobilise","reint","reintegre"];
  const cur = c.statut==="reintegration_militaire"||c.statut==="reintegration_socio" ? "reint" : c.statut;
  const idx = c.statut==="abandon" ? -1 : order.indexOf(cur);
  const lbl = {enregistre:"1. Enregistrement",desarme:"2. Désarmement",demobilise:"3. Démobilisation",reint:"4. Réintégration",reintegre:"5. Réintégré"};
  let h = order.map((s,i)=>`<div class="step click ${idx>i?"done":idx===i?"now":""}" title="Cliquer pour le détail de cette étape" onclick="stepInfo('${c.id}','${s}')">${lbl[s]}</div>`).join("");
  if(c.statut==="abandon") h+=`<div class="step ab click" title="Cliquer pour le détail" onclick="stepInfo('${c.id}','abandon')">Abandon</div>`;
  return `<div class="steps">${h}</div>`;
}
function stepInfo(id, step){
  const c=DB.combattants.find(x=>x.id===id); if(!c) return;
  const order=["enregistre","desarme","demobilise","reint","reintegre"];
  const cur = c.statut==="reintegration_militaire"||c.statut==="reintegration_socio" ? "reint" : c.statut;
  const idx = c.statut==="abandon" ? -1 : order.indexOf(cur);
  const i=order.indexOf(step);
  const etat = step==="abandon" ? "" : idx>i?`<span class="badge st-reintegre">Étape accomplie</span>` : idx===i?`<span class="badge st-demobilise">Étape en cours</span>` : `<span class="badge st-enregistre">Étape à venir</span>`;
  const L=(k,v)=>`<tr><td style="width:210px;color:var(--muted);font-weight:600">${k}</td><td>${v}</td></tr>`;
  const T=rows=>`<table style="background:transparent">${rows.join("")}</table>`;
  let titre="", corps="", pied=`<button class="btn ghost" onclick="closeModal()">Fermer</button>`;
  if(step==="enregistre"){
    titre="1. Enregistrement";
    corps=T([L("Dossier ouvert le",fmtD(c.creele.slice(0,10))+" par "+esc(c.agent)),
      L("Vague d'enregistrement",c.vague?`<span class="tag">${esc(c.vague)}</span>`:"—"),
      L("Localisation",`${esc(c.prefecture)} (région ${regionOf(c.prefecture)})${c.sousPref?" — "+esc(c.sousPref):""}${c.commune?" — "+esc(c.commune):""}${c.site?" · site : "+esc(c.site):""}`),
      L("Groupe armé d'origine",esc(c.groupe)+(c.grade?" · "+esc(c.grade):"")),
      L("Souhait exprimé",esc(c.souhait))]);
  } else if(step==="desarme"){
    titre="2. Désarmement";
    corps=c.desarmement?T([L("Désarmé le",fmtD(c.desarmement.date)+" à "+esc(c.desarmement.lieu)),
      L("Matériel réceptionné par",esc(c.desarmement.agent)),
      L("Armes remises",c.desarmement.armes.length?c.desarmement.armes.map(a=>`${esc(a.type)}${a.serie?" ("+esc(a.serie)+")":""} — ${esc(a.etat)}`).join("<br>"):"Aucune"),
      L("Munitions / explosifs",(c.desarmement.munitions||[]).length?c.desarmement.munitions.map(m=>`${fmtN(m.qte)} ${esc(m.unite)}${m.nature?" — "+esc(m.nature):""}`).join("<br>"):"—")])
      :`<p class="muted">Le désarmement n'a pas encore eu lieu. Il consiste en la remise des armes et munitions contre attestation, et fait passer le dossier au statut « Désarmé ».</p>`;
    if(c.desarmement) pied=`<button class="btn ghost" onclick="closeModal()">Fermer</button><button class="btn sec" onclick="closeModal();printAttestation('${c.id}')">Attestation de désarmement</button>`;
  } else if(step==="demobilise"){
    titre="3. Démobilisation";
    corps=c.demobilisation?T([L("Prononcée le",fmtD(c.demobilisation.date)+" à "+esc(c.demobilisation.lieu)),
      L("Carte de démobilisé",`<b>${esc(c.demobilisation.carte)}</b>`)])
      :`<p class="muted">La démobilisation n'a pas encore été prononcée. Elle acte la sortie officielle du groupe armé et donne lieu à la délivrance d'une carte de démobilisé (l'orientation en réintégration reste possible dès le désarmement).</p>`;
    if(c.demobilisation) pied=`<button class="btn ghost" onclick="closeModal()">Fermer</button><button class="btn sec" onclick="closeModal();printCarte('${c.id}')">Carte de démobilisé</button>`;
  } else if(step==="reint"){
    titre="4. Réintégration";
    const r=reintOf(c);
    if(!r) corps=`<p class="muted">Aucune orientation prononcée pour l'instant. L'ex-combattant sera orienté vers la voie militaire (incorporation dans les forces) ou socio-économique (formation professionnelle et appui à l'installation).</p>`;
    else{
      const rows=[L("Voie",c.reintMil?"Militaire":"Socio-économique"),L("Orientation prononcée le",fmtD(r.date))];
      if(c.reintMil){ rows.push(L("Corps / unité",esc(c.reintMil.corps)+(c.reintMil.unite?" · "+esc(c.reintMil.unite):"")),L("Matricule",esc(c.reintMil.matricule)||"—"),L("Formation initiale",esc(c.reintMil.formation)||"—")); }
      else{ rows.push(L("Filière",esc(c.reintSocio.filiere)+(c.reintSocio.centre?" · "+esc(c.reintSocio.centre):"")),L("Kit / appui",(c.reintSocio.kit?"Kit remis":"Kit non remis")+(c.reintSocio.appui?" · "+fmtN(c.reintSocio.appui)+" FCFA":"")),L("Visites de suivi",String((c.reintSocio.visites||[]).length))); }
      if(r.promo) rows.push(L("Promotion / vague",`<span class="tag">${esc(r.promo)}</span>`));
      const [bF,bV]=jalonBadge(c);
      rows.push(L("Formation",bF+(r.formNote?` <span class="small muted">${esc(r.formNote)}</span>`:"")),L("Intégration à la vie "+(c.reintMil?"militaire":"civile"),bV+(r.vieDetail?` <span class="small muted">${esc(r.vieDetail)}</span>`:"")));
      corps=T(rows);
    }
  } else if(step==="reintegre"){
    titre="5. Réintégré";
    corps=c.statut==="reintegre"?T([L("Parcours achevé le",fmtD(c.fin)),
      L("Situation",c.reintMil?"Intégré à la vie militaire"+(reintOf(c).vieDetail?" — "+esc(reintOf(c).vieDetail):""):"Intégré à la vie civile"+(reintOf(c).vieDetail?" — "+esc(reintOf(c).vieDetail):""))])
      :`<p class="muted">La clôture interviendra au terme du parcours de réintégration, une fois la formation achevée et l'intégration à la vie militaire ou civile confirmée.</p>`;
    if(c.statut==="reintegre") pied=`<button class="btn ghost" onclick="closeModal()">Fermer</button><button class="btn sec" onclick="closeModal();printParcours('${c.id}')">Relevé du parcours</button>`;
  } else if(step==="abandon"){
    titre="Abandon du processus";
    corps=T([L("Déclaré le",fmtD(c.abandon.date)),L("Motif",esc(c.abandon.motif)||"—")]);
  }
  openModal(`${titre} — dossier ${c.num}`, `<div style="margin-bottom:10px">${etat}</div>${corps}`, pied);
}
function parcoursEvents(c){
  const ev=[];
  const add=(date,titre,detail,cls)=>{ if(date) ev.push({date:String(date).slice(0,10),titre,detail,cls}); };
  add(c.creele,"Enregistrement (désarmement — étape 1)",`Dossier ${c.num} ouvert par ${c.agent}${c.vague?" · vague "+c.vague:""}${c.site?" · site de "+c.site:""}`,"enregistre");
  if(c.desarmement){
    const d=c.desarmement, nm=(d.munitions||[]).length;
    add(d.date,"Désarmement — remise du matériel",`${d.armes.length} arme(s)${nm?` et ${nm} lot(s) de munitions`:""} réceptionnée(s) à ${d.lieu}${d.armes.length?" : "+d.armes.map(a=>a.type+(a.serie?" ("+a.serie+")":"")).join(", "):""}`,"desarme");
  }
  if(c.demobilisation) add(c.demobilisation.date,"Démobilisation prononcée",`Carte ${c.demobilisation.carte} délivrée à ${c.demobilisation.lieu}`,"demobilise");
  if(c.reintMil) add(c.reintMil.date,"Orientation — réintégration militaire",`${c.reintMil.corps}${c.reintMil.unite?" · "+c.reintMil.unite:""}${c.reintMil.matricule?" · matricule "+c.reintMil.matricule:""}${c.reintMil.promo?" · promotion "+c.reintMil.promo:""}${c.reintMil.formation?" · "+c.reintMil.formation:""}`,"reintegration_militaire");
  if(c.reintSocio){
    add(c.reintSocio.date,"Orientation — réintégration socio-économique",`Filière ${c.reintSocio.filiere}${c.reintSocio.centre?" · "+c.reintSocio.centre:""}${c.reintSocio.duree?" · "+c.reintSocio.duree:""}${c.reintSocio.promo?" · promotion "+c.reintSocio.promo:""}`,"reintegration_socio");
    if(c.reintSocio.kit) add(c.reintSocio.kitDate||c.reintSocio.date,"Kit de réinstallation remis","","reintegration_socio");
    if(c.reintSocio.appui) add(c.reintSocio.date,"Appui financier accordé",fmtN(c.reintSocio.appui)+" FCFA","reintegration_socio");
    (c.reintSocio.visites||[]).forEach(v=>add(v.date,"Visite de suivi",`Appréciation : ${v.appr}${v.obs?" — "+v.obs:""} (${v.agent})`,"reintegration_socio"));
  }
  const r=reintOf(c);
  if(r){
    if(r.formFin) add(r.formFin,"Fin de la formation "+(c.reintMil?"initiale":"professionnelle"),r.formNote||"","reintegre");
    if(r.vieDate) add(r.vieDate,c.reintMil?"Intégration à la vie militaire":"Intégration à la vie civile",r.vieDetail||"","reintegre");
  }
  if(c.rapatriement) add(c.rapatriement.date,"Rapatriement vers le pays d'origine",`${c.rapatriement.pays}${c.rapatriement.convoi?" · "+c.rapatriement.convoi:""}${c.rapatriement.autorites?" · remise : "+c.rapatriement.autorites:""}`,"rapatrie");
  if(c.fin&&c.statut!=="rapatrie") add(c.fin,"Clôture — réintégration achevée","Fin du parcours de réintégration","reintegre");
  if(c.abandon) add(c.abandon.date,"Abandon du processus",c.abandon.motif||"","abandon");
  return ev.sort((a,b)=>a.date.localeCompare(b.date));
}
function rFiche(id){
  const c = DB.combattants.find(x=>x.id===id); if(!c){ go("registre"); return; }
  FICHE_ID=id;
  $("pageTitle").textContent = `Dossier ${c.num}`;
  const A = hasPerm("enregistrer");
  const rowsInfo = [
    ["Nom & prénom(s)", `${esc(c.nom)} ${esc(c.prenom)}${c.alias?` — alias « ${esc(c.alias)} »`:""}`],
    ["Sexe / âge", `${c.sexe==="M"?"Masculin":"Féminin"} · ${age(c.dn)} ans (né(e) le ${fmtD(c.dn)} à ${esc(c.ln)||"—"})${estMineur(c)?' <span class="badge" style="background:#FCEBD8;color:#9A5B00" title="Enfant associé aux forces et groupes armés — la voie militaire est bloquée">Mineur (EAFGA)</span>':""}`],
    ["Nationalité / téléphone", `${esc(c.nat)} · ${esc(c.tel)||"—"}`],
    ["Situation familiale / instruction", `${esc(c.fam)} · ${esc(c.instr)}`],
    ["Localisation", `${esc(c.prefecture)} (région ${regionOf(c.prefecture)})${c.sousPref?" — S/P "+esc(c.sousPref):""}${c.commune?" — commune de "+esc(c.commune):""}${c.site?" · Site : "+esc(c.site):""}`],
    ["Vague d'enregistrement", c.vague?esc(c.vague):"—"],
    ["Groupe armé d'origine", `${esc(c.groupe)}${c.grade?" · "+esc(c.grade):""}${c.annees?" · "+c.annees+" an(s)":""}`],
    ["Zone d'opération", esc(c.zone)||"—"],
    ["Souhait de réintégration", esc(c.souhait)],
    ["Observations", esc(c.obs)||"—"],
    ["Dossier ouvert", `${fmtD(c.creele.slice(0,10))} par ${esc(c.agent)}`]
  ];
  let h = stepsHtml(c);
  h += `<div class="panel"><div class="ph"><h3>Identité — <span class="badge st-${c.statut}">${STATUTS[c.statut].lbl}</span></h3>
    <div style="display:flex;gap:7px">
      ${A?`<button class="btn sm sec" onclick="rNouveau('${c.id}')">Modifier</button>`:""}
      <button class="btn sm sec" onclick="printFiche('${c.id}')">Imprimer la fiche</button>
      ${hasPerm("cloturer")&&c.statut!=="abandon"&&c.statut!=="reintegre"?`<button class="btn sm danger" onclick="markAbandon('${c.id}')">Déclarer abandon</button>`:""}
    </div></div>
    <div class="pb" style="display:flex;gap:18px">
      <div class="photo-box">${c.photo?`<img src="${c.photo}">`:"Photo"}</div>
      <table style="background:transparent">${rowsInfo.map(r=>`<tr><td style="width:240px;color:var(--muted);font-weight:600">${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</table>
    </div></div>`;

  /* --- Étape désarmement --- */
  h += `<div class="panel"><div class="ph"><h3>Étape 2 — Désarmement</h3>${
    c.statut==="enregistre"&&hasPerm("desarmer")?`<button class="btn sm" onclick="mDesarmement('${c.id}')">Procéder au désarmement</button>`:
    c.desarmement?`<button class="btn sm sec" onclick="printAttestation('${c.id}')">Attestation de désarmement</button>`:""
  }</div><div class="pb${c.desarmement?" nopad":""}">${
    c.desarmement ? `<table><thead><tr><th>Type</th><th>Marque / modèle</th><th>Calibre</th><th>N° de série</th><th>État</th><th>Munitions</th></tr></thead><tbody>${
      c.desarmement.armes.map(a=>`<tr><td>${esc(a.type)}</td><td>${esc(a.marque)||"—"}</td><td>${esc(a.calibre)||"—"}</td><td>${esc(a.serie)||"—"}</td><td>${esc(a.etat)}</td><td>${esc(a.mun)||"—"}</td></tr>`).join("")
    }</tbody></table>${(c.desarmement.munitions||[]).length?`<div style="padding:8px 16px 0"><b class="small" style="color:var(--teal-dark);text-transform:uppercase">Munitions et explosifs</b></div>
    <table><thead><tr><th>Nature / calibre</th><th>Quantité</th><th>Unité</th><th>Observations</th></tr></thead><tbody>${
      c.desarmement.munitions.map(m=>`<tr><td>${esc(m.nature)||"—"}</td><td>${fmtN(m.qte)}</td><td>${esc(m.unite)}</td><td class="small">${esc(m.obs)||"—"}</td></tr>`).join("")
    }</tbody></table>`:""}<div style="padding:10px 16px" class="small muted">Désarmé le ${fmtD(c.desarmement.date)} à ${esc(c.desarmement.lieu)} — matériel réceptionné par ${esc(c.desarmement.agent)}.</div>`
    : `<span class="muted">En attente — l'intéressé n'a pas encore remis d'armement.</span>`
  }</div></div>`;

  /* --- Étape démobilisation --- */
  h += `<div class="panel"><div class="ph"><h3>Étape 3 — Démobilisation</h3>${
    c.statut==="desarme"&&hasPerm("demobiliser")?`<button class="btn sm" onclick="mDemobilisation('${c.id}')">Prononcer la démobilisation</button>`:
    c.demobilisation?`<button class="btn sm sec" onclick="printCarte('${c.id}')">Carte de démobilisé</button>`:""
  }</div><div class="pb">${
    c.demobilisation ? `Démobilisé le <b>${fmtD(c.demobilisation.date)}</b> — carte n° <span class="tag">${c.demobilisation.carte}</span> délivrée à ${esc(c.demobilisation.lieu)}.`
    : `<span class="muted">En attente — la démobilisation peut être prononcée après la remise des armes${["reintegration_militaire","reintegration_socio"].includes(c.statut)?" (l'intéressé a été orienté directement en réintégration)":""}.</span>`
  }</div></div>`;

  /* --- Étape réintégration --- */
  h += `<div class="panel"><div class="ph"><h3>Étape 4 — Réintégration</h3>${
    (c.statut==="demobilise"||c.statut==="desarme")&&hasPerm("orienter")?`<span style="display:flex;gap:7px"><button class="btn sm" onclick="mReintMil('${c.id}')">Orientation militaire</button><button class="btn sm sec" onclick="mReintSocio('${c.id}')">Orientation socio-économique</button><button class="btn sm ghost" title="Combattant étranger : retour vers le pays d'origine" onclick="mRapatriement('${c.id}')">Rapatriement</button></span>`:""
  }</div><div class="pb">`;
  if(c.reintMil){
    const r=c.reintMil;
    h+=`<b style="color:#5A2E96">Réintégration militaire</b><table style="background:transparent;margin-top:6px">
      <tr><td style="width:240px;color:var(--muted);font-weight:600">Corps d'incorporation</td><td>${esc(r.corps)}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Unité d'affectation</td><td>${esc(r.unite)||"—"}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Matricule</td><td>${r.matricule?`<span class="tag">${esc(r.matricule)}</span>`:"—"}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Date d'incorporation</td><td>${fmtD(r.date)}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Formation initiale</td><td>${esc(r.formation)||"—"}</td></tr></table>
    ${jalonsFiche(c)}`;
  } else if(c.reintSocio){
    const r=c.reintSocio;
    h+=`<b style="color:#8A5400">Réintégration socio-économique</b><table style="background:transparent;margin-top:6px">
      <tr><td style="width:240px;color:var(--muted);font-weight:600">Filière choisie</td><td>${esc(r.filiere)}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Centre / structure de formation</td><td>${esc(r.centre)||"—"}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Durée de formation</td><td>${esc(r.duree)||"—"}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Kit de réinstallation</td><td>${r.kit?"Remis le "+fmtD(r.kitDate):"Non remis"}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Appui financier</td><td>${r.appui?fmtN(r.appui)+" FCFA":"—"}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Début du parcours</td><td>${fmtD(r.date)}</td></tr></table>
    ${jalonsFiche(c)}
      <h3 style="font-size:13px;color:var(--teal-dark);margin:14px 0 8px;text-transform:uppercase">Visites de suivi (${r.visites.length})</h3>
      ${r.visites.length?`<table><thead><tr><th>Date</th><th>Agent</th><th>Appréciation</th><th>Observations</th></tr></thead><tbody>${
        r.visites.map(v=>`<tr><td>${fmtD(v.date)}</td><td>${esc(v.agent)}</td><td>${esc(v.appr)}</td><td>${esc(v.obs)}</td></tr>`).join("")
      }</tbody></table>`:`<span class="muted small">Aucune visite de suivi enregistrée.</span>`}
      ${(c.statut==="reintegration_socio"&&hasPerm("visites"))?`<div style="margin-top:10px"><button class="btn sm sec" onclick="mVisite('${c.id}')">Ajouter une visite de suivi</button></div>`:""}`;
  } else if(c.rapatriement){
    const r=c.rapatriement;
    h+=`<b style="color:#274B8F">Rapatriement — combattant étranger</b><table style="background:transparent;margin-top:6px">
      <tr><td style="width:240px;color:var(--muted);font-weight:600">Pays de retour</td><td>${esc(r.pays)}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Rapatrié le</td><td>${fmtD(r.date)}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Convoi / point de passage</td><td>${esc(r.convoi)||"—"}</td></tr>
      <tr><td style="color:var(--muted);font-weight:600">Remise aux autorités</td><td>${esc(r.autorites)||"—"}</td></tr>
      ${r.obs?`<tr><td style="color:var(--muted);font-weight:600">Observations</td><td>${esc(r.obs)}</td></tr>`:""}</table>`;
  } else {
    h+=`<span class="muted">En attente — l'orientation est possible dès le désarmement${c.souhait&&c.souhait!=="Indécis"?` (souhait exprimé : ${esc(c.souhait)})`:""}.</span>`;
  }
  h+=`</div></div>`;

  /* --- Clôture --- */
  h += `<div class="panel"><div class="ph"><h3>Étape 5 — Clôture du parcours</h3>${
    ["reintegration_militaire","reintegration_socio"].includes(c.statut)&&hasPerm("cloturer")?`<button class="btn sm" onclick="markReintegre('${c.id}')">Déclarer la réintégration achevée</button>`:""
  }</div><div class="pb">${
    c.statut==="rapatrie"?`<b style="color:#274B8F">Rapatrié le ${fmtD(c.fin)}</b> vers ${esc(c.rapatriement.pays)} — dossier clos au titre du rapatriement.`
    : c.statut==="reintegre"?`<b style="color:var(--ok)">Parcours achevé le ${fmtD(c.fin)}.</b> L'intéressé est considéré comme pleinement réintégré.`
    : c.statut==="abandon"?`<b style="color:var(--danger)">Abandon déclaré le ${fmtD(c.abandon.date)}.</b> Motif : ${esc(c.abandon.motif)}`
    : `<span class="muted">Le dossier sera clôturé au terme du parcours de réintégration.</span>`
  }</div></div>`;

  /* --- Chronologie complète --- */
  const ev=parcoursEvents(c);
  h += `<div class="panel"><div class="ph"><h3>Parcours complet — du désarmement à la fin de la réintégration (${ev.length} étape(s))</h3>
    <button class="btn sm sec" onclick="printParcours('${c.id}')">Imprimer le parcours</button></div>
    <div class="pb"><div class="chrono">${
      ev.map(e=>`<div class="ch-item"><span class="ch-dot st-${e.cls}"></span>
        <div class="ch-date">${fmtD(e.date)}</div>
        <div class="ch-body"><b>${esc(e.titre)}</b>${e.detail?`<div class="small muted">${esc(e.detail)}</div>`:""}</div></div>`).join("")
    }</div></div></div>`;
  $("view").innerHTML = h;
}
function printParcours(id){
  const c=DB.combattants.find(x=>x.id===id); const ev=parcoursEvents(c);
  doPrint(docWrap(`${docEntete("Relevé chronologique du parcours DDR")}
    <h2 class="titre">Parcours complet — dossier ${c.num}</h2>
    <p><b>${esc(c.nom)} ${esc(c.prenom)}</b>${c.alias?` (alias « ${esc(c.alias)} »)`:""}, ${c.sexe==="M"?"né":"née"} le ${fmtD(c.dn)}, groupe d'origine ${esc(c.groupe)}, ${esc(c.prefecture)}${c.vague?", vague "+esc(c.vague):""}. Statut actuel : <b>${STATUTS[c.statut].lbl}</b>. Relevé arrêté au ${new Date().toLocaleDateString("fr-FR")}.</p>
    <table class="dt"><tr><th style="width:90px">Date</th><th>Étape du processus</th><th>Détail</th></tr>${
      ev.map(e=>`<tr><td>${fmtD(e.date)}</td><td><b>${esc(e.titre)}</b></td><td>${esc(e.detail)||"—"}</td></tr>`).join("")}</table>
    <div class="sig"><div class="c"></div><div class="c">Fait à ${esc(cfg("villeSignature")||"Bangui")}, le ${new Date().toLocaleDateString("fr-FR")}<br>Pour le PNDDRR<div class="ligne">${esc(CUR.nom)}</div></div></div>`));
  log("Impression",`Relevé de parcours ${c.num}`);
}

/* ---------- Actions du circuit ---------- */
const UNITES_MUN=["cartouches","chargeurs","bandes","caisses","grenades","roquettes","obus","kg d'explosif","autre"];
function munRow(){
  return `<tr class="munRow"><td><input class="m_nature" placeholder="Nature / calibre (ex. : 7,62×39 mm)"></td>
  <td><input class="m_qte" type="number" min="0" style="width:90px" placeholder="Qté"></td>
  <td><select class="m_unite">${UNITES_MUN.map(u=>`<option>${u}</option>`).join("")}</select></td>
  <td><input class="m_obs" placeholder="Observations"></td>
  <td><button type="button" class="btn sm ghost" onclick="this.closest('tr').remove()">✕</button></td></tr>`;
}
function armeRow(i){
  return `<tr class="armeRow"><td><select class="a_type">${TYPES_ARMES.map(t=>`<option>${t}</option>`).join("")}</select></td>
  <td><input class="a_marque" placeholder="Marque / modèle"></td><td><input class="a_calibre" placeholder="Calibre" style="width:90px"></td>
  <td><input class="a_serie" placeholder="N° série"></td>
  <td><select class="a_etat"><option>Fonctionnelle</option><option>Défectueuse</option><option>Hors d'usage</option></select></td>
  <td><input class="a_mun" placeholder="Munitions" style="width:90px"></td>
  <td><button type="button" class="btn sm ghost" onclick="this.closest('tr').remove()">✕</button></td></tr>`;
}
function mDesarmement(id){
  openModal("Procès-verbal de désarmement", `
    <div class="grid2"><div class="field"><label>Date de remise</label><input type="date" id="d_date" value="${today()}"></div>
    <div class="field"><label>Lieu / site de collecte</label><input id="d_lieu"></div></div>
    <label>Armement et matériel remis</label>
    <table id="tArmes"><thead><tr><th>Type</th><th>Marque</th><th>Calibre</th><th>N° série</th><th>État</th><th>Munitions</th><th></th></tr></thead>
    <tbody>${armeRow(0)}</tbody></table>
    <button type="button" class="btn sm sec" style="margin-top:8px" onclick="document.querySelector('#tArmes tbody').insertAdjacentHTML('beforeend', armeRow())">+ Ajouter une arme</button>
    <h3 style="color:var(--teal-dark);margin:16px 0 8px;font-size:13px;text-transform:uppercase">Munitions et explosifs remis</h3>
    <table id="tMun"><thead><tr><th>Nature / calibre</th><th>Quantité</th><th>Unité</th><th>Observations</th><th></th></tr></thead>
    <tbody></tbody></table>
    <button type="button" class="btn sm sec" style="margin-top:8px" onclick="document.querySelector('#tMun tbody').insertAdjacentHTML('beforeend', munRow())">+ Ajouter des munitions</button>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveDesarmement('${id}')">Valider le désarmement</button>`);
}
function saveDesarmement(id){
  const c=DB.combattants.find(x=>x.id===id);
  const armes=[...document.querySelectorAll("#tArmes tbody tr")].map(tr=>({
    type:tr.querySelector(".a_type").value, marque:tr.querySelector(".a_marque").value.trim(),
    calibre:tr.querySelector(".a_calibre").value.trim(), serie:tr.querySelector(".a_serie").value.trim(),
    etat:tr.querySelector(".a_etat").value, mun:tr.querySelector(".a_mun").value.trim()
  }));
  const munitions=[...document.querySelectorAll("#tMun tbody tr")].map(tr=>({
    nature:tr.querySelector(".m_nature").value.trim(), qte:+tr.querySelector(".m_qte").value||0,
    unite:tr.querySelector(".m_unite").value, obs:tr.querySelector(".m_obs").value.trim()
  })).filter(m=>m.nature||m.qte);
  if(!armes.length&&!munitions.length){ toast("Ajoutez au moins une arme ou un lot de munitions."); return; }
  c.desarmement={date:$("d_date").value||today(), lieu:$("d_lieu").value.trim()||c.site||c.prefecture, agent:CUR.nom, armes, munitions};
  c.statut="desarme";
  log("Désarmement",`${c.num} — ${armes.length} arme(s) et ${munitions.length} lot(s) de munitions réceptionnés`);
  closeModal(); toast("Désarmement enregistré."); rFiche(id);
}
function mDemobilisation(id){
  const c=DB.combattants.find(x=>x.id===id);
  openModal("Démobilisation", `
    <p class="small muted" style="margin-bottom:12px">La validation attribue automatiquement un numéro de carte de démobilisé.</p>
    <div class="grid2"><div class="field"><label>Date de démobilisation</label><input type="date" id="dm_date" value="${today()}"></div>
    <div class="field"><label>Lieu de délivrance</label><input id="dm_lieu" value="${esc(c.prefecture)}"></div></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveDemob('${id}')">Prononcer la démobilisation</button>`);
}
function saveDemob(id){
  const c=DB.combattants.find(x=>x.id===id);
  c.demobilisation={date:$("dm_date").value||today(), lieu:$("dm_lieu").value.trim(), carte:numDem()};
  c.statut="demobilise";
  log("Démobilisation",`${c.num} — carte ${c.demobilisation.carte}`);
  closeModal(); toast(`Carte ${c.demobilisation.carte} délivrée.`); rFiche(id);
}
function estMineur(c){ const a=age(c.dn); return a!=="—" && a<18; }
function mReintMil(id){
  const cM=DB.combattants.find(x=>x.id===id);
  if(cM && estMineur(cM)){
    openModal("Orientation militaire impossible — mineur (EAFGA)", `
      <p><b>${esc(cM.nom)} ${esc(cM.prenom)}</b> a <b>${age(cM.dn)} ans</b>. Conformément aux standards du DDR et à la protection de l'enfance, un mineur (enfant associé aux forces et groupes armés — EAFGA) <b>ne peut pas être orienté vers la voie militaire</b>.</p>
      <p class="small muted" style="margin-top:8px">Orientez ce dossier vers la voie socio-économique (scolarisation, formation, réunification familiale), en liaison avec les services de protection de l'enfance.</p>`,
      `<button class="btn ghost" onclick="closeModal()">Fermer</button><button class="btn" onclick="closeModal();mReintSocio('${cM.id}')">Orientation socio-économique</button>`);
    return;
  }
  openModal("Orientation — réintégration militaire", `
    <div class="grid2">
    <div class="field"><label>Corps d'incorporation</label><select id="rm_corps">${CORPS.map(x=>`<option>${x}</option>`).join("")}</select></div>
    <div class="field"><label>Unité d'affectation</label><input id="rm_unite"></div>
    <div class="field"><label>Matricule attribué <span class="muted" style="font-weight:400">(optionnel)</span></label><input id="rm_mat" placeholder="Laissé vide en formation"></div>
    <div class="field"><label>Date d'incorporation</label><input type="date" id="rm_date" value="${today()}"></div>
    <div class="field"><label>Formation initiale prévue</label><input id="rm_form" placeholder="Ex. : formation commune de base — camp Kassaï"></div>
    <div class="field"><label>Promotion / vague de formation</label><input id="rm_promo" list="promoList" value="${esc((DB.combattants.find(x=>x.id===id)||{}).vague||"")}" placeholder="Ex. : Vague 2026-A"><datalist id="promoList">${promosConnues().map(p=>`<option>${esc(p)}</option>`).join("")}</datalist></div></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveReintMil('${id}')">Valider l'orientation</button>`);
}
function saveReintMil(id){
  const c=DB.combattants.find(x=>x.id===id);
  c.reintMil={corps:$("rm_corps").value, unite:$("rm_unite").value.trim(), matricule:$("rm_mat").value.trim(), date:$("rm_date").value||today(), formation:$("rm_form").value.trim(), promo:$("rm_promo").value.trim()||c.vague||""};
  c.statut="reintegration_militaire";
  log("Réintégration militaire",`${c.num} — ${c.reintMil.corps}${c.reintMil.matricule?", matricule "+c.reintMil.matricule:""}`);
  closeModal(); toast("Orientation militaire enregistrée."); rFiche(id);
}
function mReintSocio(id){
  openModal("Orientation — réintégration socio-économique", `
    <div class="grid2">
    <div class="field"><label>Filière</label><select id="rs_fil">${FILIERES.map(x=>`<option>${x}</option>`).join("")}</select></div>
    <div class="field"><label>Centre / structure de formation</label><input id="rs_centre"></div>
    <div class="field"><label>Durée de formation</label><input id="rs_duree" placeholder="Ex. : 6 mois"></div>
    <div class="field"><label>Début du parcours</label><input type="date" id="rs_date" value="${today()}"></div>
    <div class="field"><label>Kit de réinstallation remis ?</label><select id="rs_kit"><option value="">Non</option><option value="1">Oui</option></select></div>
    <div class="field"><label>Date de remise du kit</label><input type="date" id="rs_kitdate"></div>
    <div class="field"><label>Appui financier (FCFA)</label><input type="number" min="0" id="rs_appui"></div>
    <div class="field"><label>Promotion / vague de formation</label><input id="rs_promo" list="promoList" value="${esc((DB.combattants.find(x=>x.id===id)||{}).vague||"")}" placeholder="Ex. : Promotion Couture 2026-1"><datalist id="promoList">${promosConnues().map(p=>`<option>${esc(p)}</option>`).join("")}</datalist></div></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveReintSocio('${id}')">Valider l'orientation</button>`);
}
function saveReintSocio(id){
  const c=DB.combattants.find(x=>x.id===id);
  c.reintSocio={filiere:$("rs_fil").value, centre:$("rs_centre").value.trim(), duree:$("rs_duree").value.trim(),
    date:$("rs_date").value||today(), kit:!!$("rs_kit").value, kitDate:$("rs_kitdate").value, appui:$("rs_appui").value, promo:$("rs_promo").value.trim()||c.vague||"", visites:[]};
  c.statut="reintegration_socio";
  log("Réintégration socio-économique",`${c.num} — filière ${c.reintSocio.filiere}`);
  closeModal(); toast("Orientation socio-économique enregistrée."); rFiche(id);
}
function mRapatriement(id){
  const c=DB.combattants.find(x=>x.id===id);
  openModal("Rapatriement — combattant étranger", `
    <p class="small muted" style="margin-bottom:12px">Voie prévue pour les combattants étrangers : retour vers le pays d'origine, en liaison avec les autorités de ce pays et les partenaires (MINUSCA, OIM…). Nationalité déclarée : <b>${esc(c.nat)}</b>.</p>
    <div class="grid2">
      <div class="field"><label>Pays de retour *</label><input id="rp_pays" value="${normTxt(c.nat).includes("centrafric")?"":esc(c.nat)}" placeholder="Ex. : Tchad, Soudan…"></div>
      <div class="field"><label>Date de rapatriement</label><input type="date" id="rp_date" value="${today()}"></div>
      <div class="field"><label>Convoi / vol / point de passage</label><input id="rp_convoi" placeholder="Ex. : convoi OIM n° 12 — Am-Dafock"></div>
      <div class="field"><label>Autorités de remise</label><input id="rp_autorites" placeholder="Ex. : autorités tchadiennes — poste de Sido"></div>
    </div>
    <div class="field"><label>Observations</label><textarea id="rp_obs" rows="2"></textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveRapatriement('${id}')">Confirmer le rapatriement</button>`);
}
function saveRapatriement(id){
  const c=DB.combattants.find(x=>x.id===id);
  if(!$("rp_pays").value.trim()){ toast("Le pays de retour est obligatoire."); return; }
  c.rapatriement={pays:$("rp_pays").value.trim(), date:$("rp_date").value||today(), convoi:$("rp_convoi").value.trim(), autorites:$("rp_autorites").value.trim(), obs:$("rp_obs").value.trim()};
  c.fin=c.rapatriement.date; c.statut="rapatrie";
  log("Rapatriement",`${c.num} — vers ${c.rapatriement.pays}${c.rapatriement.convoi?" ("+c.rapatriement.convoi+")":""}`);
  closeModal(); toast("Rapatriement enregistré — dossier clos."); rFiche(id);
}
function mVisite(id){
  openModal("Visite de suivi", `
    <div class="grid2"><div class="field"><label>Date de la visite</label><input type="date" id="v_date" value="${today()}"></div>
    <div class="field"><label>Appréciation</label><select id="v_appr"><option>Satisfaisant</option><option>Moyen</option><option>Préoccupant</option></select></div></div>
    <div class="field"><label>Observations</label><textarea id="v_obs" rows="3"></textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveVisite('${id}')">Enregistrer la visite</button>`);
}
function saveVisite(id){
  const c=DB.combattants.find(x=>x.id===id);
  c.reintSocio.visites.push({date:$("v_date").value||today(), agent:CUR.nom, appr:$("v_appr").value, obs:$("v_obs").value.trim()});
  log("Visite de suivi",`${c.num} — appréciation : ${$("v_appr").value}`);
  closeModal(); toast("Visite enregistrée."); rFiche(id);
}
function reintOf(c){ return c.reintMil||c.reintSocio||null; }
function jalonsFiche(c){
  const r=reintOf(c); if(!r) return "";
  const mil=!!c.reintMil;
  const [bF,bV]=jalonBadge(c);
  const enCours=["reintegration_militaire","reintegration_socio"].includes(c.statut);
  const P=hasPerm("orienter");
  return `<h3 style="font-size:13px;color:var(--teal-dark);margin:14px 0 8px;text-transform:uppercase">Jalons du parcours</h3>
  <table style="background:transparent">
    ${r.promo?`<tr><td style="width:240px;color:var(--muted);font-weight:600">Promotion / vague</td><td colspan="2"><span class="tag">${esc(r.promo)}</span></td></tr>`:""}
    <tr><td style="width:240px;color:var(--muted);font-weight:600">Formation ${mil?"initiale":"professionnelle"}</td>
      <td>${bF}${r.formFin&&r.formNote?` <span class="small muted">${esc(r.formNote)}</span>`:""}</td>
      <td style="text-align:right">${enCours&&!r.formFin&&P?`<button class="btn sm sec" onclick="mFormationFin('${c.id}')">Valider la fin de formation</button>`:""}</td></tr>
    <tr><td style="color:var(--muted);font-weight:600">Intégration à la vie ${mil?"militaire":"civile"}</td>
      <td>${bV}${r.vieDate&&r.vieDetail?` <span class="small muted">${esc(r.vieDetail)}</span>`:""}</td>
      <td style="text-align:right">${enCours&&!r.vieDate&&P?`<button class="btn sm sec" onclick="mIntegration('${c.id}')">Confirmer l'intégration</button>`:""}</td></tr>
  </table>
  ${enCours&&(!r.formFin||!r.vieDate)?`<div class="small muted" style="margin-top:6px">La clôture du parcours est recommandée une fois la formation achevée et l'intégration à la vie ${mil?"militaire":"civile"} confirmée.</div>`:""}`;
}
function jalonBadge(c){
  const r=reintOf(c); if(!r) return ["",""];
  const mil=!!c.reintMil;
  const form=r.formFin?`<span class="badge st-reintegre" title="${esc(r.formNote||"")}">Achevée le ${fmtD(r.formFin)}</span>`:`<span class="badge st-demobilise">En cours</span>`;
  const vie=r.vieDate?`<span class="badge st-reintegre" title="${esc(r.vieDetail||"")}">${mil?"Vie militaire":"Vie civile"} · ${fmtD(r.vieDate)}</span>`:`<span class="badge st-enregistre">En attente</span>`;
  return [form,vie];
}
function mFormationFin(id){
  const c=DB.combattants.find(x=>x.id===id); const r=reintOf(c); const mil=!!c.reintMil;
  openModal("Fin de la formation", `
    <p class="small muted" style="margin-bottom:12px">${mil?`Formation initiale : ${esc(c.reintMil.formation)||"—"} (${esc(c.reintMil.corps)})`:`Formation professionnelle — filière ${esc(c.reintSocio.filiere)}${c.reintSocio.centre?" · "+esc(c.reintSocio.centre):""}`}</p>
    <div class="grid2">
      <div class="field"><label>Date d'achèvement</label><input type="date" id="ff_date" value="${today()}"></div>
      <div class="field"><label>Résultat</label><select id="ff_res"><option>Formation achevée avec succès</option><option>Formation achevée — attestation délivrée</option><option>Formation validée partiellement</option><option>Formation interrompue</option></select></div>
    </div>
    <div class="field"><label>Observations</label><textarea id="ff_obs" rows="2"></textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveFormationFin('${id}')">Valider la fin de formation</button>`);
}
function saveFormationFin(id){
  const c=DB.combattants.find(x=>x.id===id); const r=reintOf(c);
  r.formFin=$("ff_date").value||today();
  r.formNote=($("ff_res").value+($("ff_obs").value.trim()?" — "+$("ff_obs").value.trim():""));
  log("Fin de formation",`${c.num} — ${r.formNote}`);
  closeModal(); toast("Fin de formation enregistrée.");
  VIEW==="reintegration"?rReint():VIEW==="jalons"?rJalons():rFiche(id);
}
function mIntegration(id){
  const c=DB.combattants.find(x=>x.id===id); const mil=!!c.reintMil;
  openModal(mil?"Intégration à la vie militaire":"Intégration à la vie civile", `
    <div class="grid2">
      <div class="field"><label>Date d'intégration effective</label><input type="date" id="vi_date" value="${today()}"></div>
      <div class="field"><label>${mil?"Unité rejointe / affectation":"Activité exercée / installation"}</label><input id="vi_det" value="${mil?esc(c.reintMil.unite||""):esc(c.reintSocio.filiere||"")}"></div>
      ${mil?`<div class="field"><label>Matricule attribué</label><input id="vi_mat" value="${esc(c.reintMil.matricule||"")}" placeholder="Saisi à l'intégration, pas en formation"></div>`:""}
    </div>
    <p class="small muted">${mil?"Confirme que l'intéressé a effectivement rejoint son unité et sert au sein des forces. Le matricule peut être renseigné ici s'il n'avait pas été attribué en formation.":"Confirme que l'intéressé exerce effectivement son activité et est installé dans la vie civile."}</p>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveIntegration('${id}')">Confirmer l'intégration</button>`);
}
function saveIntegration(id){
  const c=DB.combattants.find(x=>x.id===id); const r=reintOf(c); const mil=!!c.reintMil;
  r.vieDate=$("vi_date").value||today();
  r.vieDetail=$("vi_det").value.trim();
  if(mil && $("vi_mat")) c.reintMil.matricule=$("vi_mat").value.trim();
  log("Intégration "+(mil?"vie militaire":"vie civile"),`${c.num}${r.vieDetail?" — "+r.vieDetail:""}${mil&&c.reintMil.matricule?" · matricule "+c.reintMil.matricule:""}`);
  closeModal(); toast("Intégration confirmée.");
  VIEW==="reintegration"?rReint():VIEW==="jalons"?rJalons():rFiche(id);
}
function markReintegre(id){
  const c=DB.combattants.find(x=>x.id===id);
  const r=reintOf(c);
  const alerte=r&&(!r.formFin||!r.vieDate)?`<div class="small" style="background:#FFF7E0;border:1px solid #E8D48A;border-radius:7px;padding:9px;margin-bottom:10px">⚠ ${!r.formFin?"La fin de formation n'est pas encore validée. ":""}${!r.vieDate?"L'intégration à la vie "+(c.reintMil?"militaire":"civile")+" n'est pas encore confirmée. ":""}La clôture les considérera comme atteintes à la date choisie.</div>`:"";
  openModal("Clôture du parcours", `${alerte}<p>Confirmer que <b>${esc(c.nom)} ${esc(c.prenom)}</b> (${c.num}) a achevé son parcours de réintégration ?</p>
    <div class="field" style="margin-top:12px"><label>Date d'achèvement</label><input type="date" id="fin_date" value="${today()}"></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveReintegre('${id}')">Confirmer</button>`);
}
function saveReintegre(id){
  const c=DB.combattants.find(x=>x.id===id);
  c.fin=$("fin_date").value||today(); c.statut="reintegre";
  const r=reintOf(c);
  if(r){ if(!r.formFin){ r.formFin=c.fin; r.formNote=r.formNote||"Considérée achevée à la clôture du parcours"; }
    if(!r.vieDate){ r.vieDate=c.fin; r.vieDetail=r.vieDetail||(c.reintMil?"Intégration confirmée à la clôture":"Intégration à la vie civile confirmée à la clôture"); } }
  log("Clôture",`${c.num} — réintégration achevée`);
  closeModal(); toast("Parcours clôturé — réintégré."); rFiche(id);
}
function markAbandon(id){
  const c=DB.combattants.find(x=>x.id===id);
  openModal("Déclaration d'abandon", `<p>Déclarer l'abandon du processus par <b>${esc(c.nom)} ${esc(c.prenom)}</b> (${c.num}) ?</p>
    <div class="field" style="margin-top:12px"><label>Motif</label><textarea id="ab_motif" rows="2" placeholder="Ex. : ne s'est plus présenté au site depuis 3 mois"></textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn danger" onclick="saveAbandon('${id}')">Déclarer l'abandon</button>`);
}
function saveAbandon(id){
  const c=DB.combattants.find(x=>x.id===id);
  c.abandon={date:today(), motif:$("ab_motif").value.trim()||"Non précisé"}; c.statut="abandon";
  log("Abandon",`${c.num} — ${c.abandon.motif}`);
  closeModal(); toast("Abandon enregistré."); rFiche(id);
}


