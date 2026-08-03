/* module: reintegration/jalons.js — PNDDRR engine (classic globals) */
/* ================= FORMATION & INTÉGRATION (JALONS) ================= */
var JAL_F={voie:"",etat:"",promo:"",q:""};
function jalSearch(v){
  JAL_F.q=v; rJalons();
  const el=$("jal_q"); if(el){ el.focus(); const n=el.value.length; try{el.setSelectionRange(n,n);}catch(e){} }
}
function promosConnues(){
  const set=new Set();
  DB.combattants.forEach(c=>{ if(c.vague) set.add(c.vague); const r=reintOf(c); if(r&&r.promo) set.add(r.promo); });
  return [...set].sort();
}
function jalCoches(){ return [...document.querySelectorAll(".jal_ck:checked")].map(cb=>cb.value); }
function affecterPromo(){
  const ids=jalCoches();
  const nom=$("jal_promo_nom").value.trim();
  if(!ids.length){ toast("Cochez au moins un ex-combattant."); return; }
  if(!nom){ toast("Saisissez le nom de la promotion / vague."); return; }
  ids.forEach(id=>{ const c=DB.combattants.find(x=>x.id===id); const r=reintOf(c); if(r) r.promo=nom; });
  log("Promotion",`${ids.length} parcours affecté(s) à « ${nom} »`);
  toast(`${ids.length} parcours affecté(s) à la promotion « ${nom} ».`);
  rJalons();
}
function mPromoValider(promo){
  const membres=DB.combattants.filter(c=>["reintegration_militaire","reintegration_socio"].includes(c.statut)&&reintOf(c).promo===promo);
  const attente=membres.filter(c=>!reintOf(c).formFin);
  openModal(`Valider la formation — ${esc(promo)}`, `
    <p class="small muted" style="margin-bottom:10px">${membres.length} parcours dans cette promotion, dont <b>${attente.length}</b> en attente de validation de la formation${membres.length-attente.length?` (${membres.length-attente.length} déjà validé(s), inchangés)`:""}.</p>
    <div class="pb nopad" style="max-height:180px;overflow:auto;border:1px solid var(--line);border-radius:8px;margin-bottom:12px">
      <table><tbody>${attente.map(c=>`<tr><td><b>${c.num}</b></td><td>${esc(c.nom)} ${esc(c.prenom)}</td><td class="small">${c.reintMil?"Militaire":"Socio-éco. — "+esc(c.reintSocio.filiere)}</td></tr>`).join("")||'<tr><td class="empty">Aucun parcours en attente.</td></tr>'}</tbody></table></div>
    <div class="grid2">
      <div class="field"><label>Date d'achèvement</label><input type="date" id="pv_date" value="${today()}"></div>
      <div class="field"><label>Résultat</label><select id="pv_res"><option>Formation achevée avec succès</option><option>Formation achevée — attestation délivrée</option><option>Formation validée partiellement</option></select></div>
    </div>
    <div class="field"><label>Observations</label><textarea id="pv_obs" rows="2" placeholder="Ex. : cérémonie de fin de formation du ${new Date().toLocaleDateString("fr-FR")}"></textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" ${attente.length?"":"disabled"} onclick="savePromoValider('${esc(promo).replace(/'/g,"\\'")}')">Valider la formation des ${attente.length} parcours</button>`);
}
function savePromoValider(promo){
  const date=$("pv_date").value||today();
  const note=$("pv_res").value+(($("pv_obs").value.trim())?" — "+$("pv_obs").value.trim():"")+` (promotion ${promo})`;
  let n=0;
  DB.combattants.forEach(c=>{
    if(!["reintegration_militaire","reintegration_socio"].includes(c.statut)) return;
    const r=reintOf(c);
    if(r&&r.promo===promo&&!r.formFin){ r.formFin=date; r.formNote=note; n++; }
  });
  log("Validation par promotion",`« ${promo} » — ${n} formation(s) validée(s) le ${fmtD(date)}`);
  closeModal(); toast(`Formation validée pour ${n} parcours de la promotion « ${promo} ».`);
  rJalons();
}
function jalSet(k,v){ JAL_F[k]=v; rJalons(); }
function rJalons(){
  const enCours=DB.combattants.filter(c=>["reintegration_militaire","reintegration_socio"].includes(c.statut));
  const acheves=DB.combattants.filter(c=>c.statut==="reintegre"&&reintOf(c));
  const fForm=enCours.filter(c=>reintOf(c).formFin);
  const fVie=enCours.filter(c=>reintOf(c).vieDate);
  const P=hasPerm("orienter");
  const q=JAL_F.q.trim().toLowerCase();
  const filt=list=>list.filter(c=>{
    const r=reintOf(c), mil=!!c.reintMil;
    if(q){
      const txt=[c.num,c.nom,c.prenom,c.alias,c.vague,r.promo,c.prefecture,
        mil?c.reintMil.corps:"",mil?c.reintMil.unite:"",mil?c.reintMil.matricule:"",
        !mil&&c.reintSocio?c.reintSocio.filiere:"",!mil&&c.reintSocio?c.reintSocio.centre:""].join(" ").toLowerCase();
      if(!txt.includes(q)) return false;
    }
    if(JAL_F.promo&&r.promo!==JAL_F.promo) return false;
    if(JAL_F.voie==="mil"&&!mil) return false;
    if(JAL_F.voie==="socio"&&mil) return false;
    if(JAL_F.etat==="formEnCours"&&r.formFin) return false;
    if(JAL_F.etat==="formOk"&&!r.formFin) return false;
    if(JAL_F.etat==="vieAttente"&&r.vieDate) return false;
    if(JAL_F.etat==="vieOk"&&!r.vieDate) return false;
    return true;
  });
  const ligne=(c,fini)=>{
    const mil=!!c.reintMil, r=reintOf(c);
    const [bF,bV]=jalonBadge(c);
    const det=mil?`${esc(c.reintMil.corps||"")}${c.reintMil.unite?" · "+esc(c.reintMil.unite):""}`:`Filière ${esc(c.reintSocio.filiere||"")}${c.reintSocio.centre?" · "+esc(c.reintSocio.centre):""}`;
    return `<tr>${fini?"":`<td>${P?`<input type="checkbox" class="jal_ck" value="${c.id}" style="width:auto">`:""}</td>`}<td><b>${c.num}</b></td>
    <td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
    <td><span class="badge st-${mil?"reintegration_militaire":"reintegration_socio"}">${mil?"Militaire":"Socio-éco."}</span></td>
    <td class="small">${det}</td>
    <td class="small">${r.promo?`<span class="tag">${esc(r.promo)}</span>`:'<span class="muted">—</span>'}</td>
    <td>${bF}${r.formFin&&r.formNote?`<div class="small muted">${esc(r.formNote)}</div>`:""}</td>
    <td>${bV}${r.vieDate&&r.vieDetail?`<div class="small muted">${esc(r.vieDetail)}</div>`:""}</td>
    ${fini?`<td>${fmtD(c.fin)}</td>`:`<td class="actions-cell">${!r.formFin&&P?`<button class="btn sm sec" onclick="mFormationFin('${c.id}')">Valider la fin de formation</button>`:""}${r.formFin&&!r.vieDate&&P?`<button class="btn sm" onclick="mIntegration('${c.id}')">Confirmer l'intégration</button>`:""}${r.formFin&&r.vieDate?`<span class="small muted">Jalons atteints — clôture possible depuis le suivi</span>`:""}</td>`}</tr>`;
  };
  const eC=filt(enCours), aC=filt(acheves);
  $("view").innerHTML = `
  <div class="cards">
    <div class="kpi"><div class="n">${enCours.length}</div><div class="l">Parcours en cours</div></div>
    <div class="kpi c-dem"><div class="n">${enCours.length-fForm.length}</div><div class="l">En formation</div></div>
    <div class="kpi c-ok"><div class="n">${fForm.length}</div><div class="l">Formations achevées</div></div>
    <div class="kpi c-rm"><div class="n">${fForm.length-fVie.length}</div><div class="l">En attente d'intégration</div></div>
    <div class="kpi c-rs"><div class="n">${fVie.length}</div><div class="l">Intégrés vie militaire / civile</div></div>
    <div class="kpi"><div class="n">${acheves.length}</div><div class="l">Parcours clôturés</div></div>
  </div>
  <div class="toolbar">
    <div class="field"><label>Voie de réintégration</label><select onchange="jalSet('voie',this.value)"><option value="">Toutes</option><option value="mil" ${JAL_F.voie==="mil"?"selected":""}>Militaire</option><option value="socio" ${JAL_F.voie==="socio"?"selected":""}>Socio-économique</option></select></div>
    <div class="field" style="flex:1;min-width:220px"><label>Recherche</label><input id="jal_q" value="${esc(JAL_F.q)}" oninput="jalSearch(this.value)" placeholder="Nom, n° dossier, matricule, filière, unité, vague…"></div>
    <div class="field"><label>Promotion / vague</label><select onchange="jalSet('promo',this.value)"><option value="">Toutes</option>${promosConnues().map(p=>`<option ${JAL_F.promo===p?"selected":""}>${esc(p)}</option>`).join("")}</select></div>
    <div class="field"><label>État des jalons</label><select onchange="jalSet('etat',this.value)"><option value="">Tous</option>
      <option value="formEnCours" ${JAL_F.etat==="formEnCours"?"selected":""}>Formation en cours</option>
      <option value="formOk" ${JAL_F.etat==="formOk"?"selected":""}>Formation achevée</option>
      <option value="vieAttente" ${JAL_F.etat==="vieAttente"?"selected":""}>Intégration en attente</option>
      <option value="vieOk" ${JAL_F.etat==="vieOk"?"selected":""}>Intégrés</option></select></div>
    ${(JAL_F.voie||JAL_F.etat||JAL_F.promo||JAL_F.q)?`<button class="btn ghost" style="align-self:end" onclick="JAL_F={voie:'',etat:'',promo:'',q:''};rJalons()">✕ Réinitialiser</button>`:""}
  </div>
  ${(()=>{ const promos={}; enCours.forEach(c=>{const p=reintOf(c).promo; if(p){(promos[p]=promos[p]||[]).push(c);} });
    const noms=Object.keys(promos).sort();
    return `<div class="panel"><div class="ph"><h3>Validation par promotion / vague</h3></div><div class="pb">
    ${P?`<div class="toolbar" style="margin-bottom:${noms.length?"13px":"0"}">
      <div class="field" style="max-width:320px"><label>Affecter les parcours cochés à une promotion</label><input id="jal_promo_nom" list="promoList" placeholder="Ex. : Vague 2026-A"><datalist id="promoList">${promosConnues().map(p=>`<option>${esc(p)}</option>`).join("")}</datalist></div>
      <button class="btn sec" style="align-self:end" onclick="affecterPromo()">Affecter la sélection</button>
      <div class="small muted" style="align-self:end;padding-bottom:9px">Cochez des parcours dans le tableau ci-dessous, nommez la vague, puis validez la formation de toute la promotion en une fois.</div>
    </div>`:""}
    ${noms.length?`<table><thead><tr><th>Promotion / vague</th><th>Parcours</th><th>Formations validées</th><th>En attente</th><th>Actions</th></tr></thead><tbody>${
      noms.map(p=>{const L=promos[p], ok=L.filter(c=>reintOf(c).formFin).length, att=L.length-ok;
        return `<tr><td><b>${esc(p)}</b></td><td>${L.length}</td><td>${ok}</td><td>${att?`<span class="badge st-demobilise">${att}</span>`:'<span class="badge st-reintegre">0</span>'}</td>
        <td class="actions-cell">${att&&P?`<button class="btn sm" onclick="mPromoValider('${esc(p).replace(/'/g,"\\'")}')">Valider la formation de la promotion</button>`:att?"":'<span class="small muted">Promotion validée</span>'}</td></tr>`;}).join("")
    }</tbody></table>`:`<div class="small muted">${P?"Aucune promotion constituée pour l'instant — cochez des parcours ci-dessous et affectez-les à une vague.":"Aucune promotion constituée pour l'instant."}</div>`}
  </div></div>`; })()}
  <div class="panel"><div class="ph"><h3>Parcours en cours — avancement des jalons (${eC.length})</h3></div><div class="pb nopad">${
    eC.length?`<table><thead><tr>${P?"<th></th>":"<th></th>"}<th>N° dossier</th><th>Nom & prénom</th><th>Voie</th><th>Détail</th><th>Promotion</th><th>Formation</th><th>Intégration</th><th>Actions</th></tr></thead><tbody>${eC.map(c=>ligne(c,false)).join("")}</tbody></table>`
    :`<div class="empty">Aucun parcours ne correspond aux critères.</div>`}</div></div>
  <div class="panel"><div class="ph"><h3>Parcours clôturés — jalons atteints (${aC.length})</h3></div><div class="pb nopad">${
    aC.length?`<table><thead><tr><th>N° dossier</th><th>Nom & prénom</th><th>Voie</th><th>Détail</th><th>Promotion</th><th>Formation</th><th>Intégration</th><th>Clôturé le</th></tr></thead><tbody>${aC.map(c=>ligne(c,true)).join("")}</tbody></table>`
    :`<div class="empty">Aucun parcours clôturé.</div>`}</div></div>`;
}

