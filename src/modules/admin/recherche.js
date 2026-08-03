/* module: admin/recherche.js — PNDDRR engine (classic globals) */
/* ================= RECHERCHE MULTICRITÈRE ================= */
function rRecherche(){
  $("view").innerHTML = `
  ${outilRetour()}
  <div class="panel"><div class="ph"><h3>Critères de recherche</h3></div><div class="pb">
    <div class="grid4">
      <div class="field"><label>Nom / alias / n° dossier</label><input id="q_txt"></div>
      <div class="field"><label>Statut</label><select id="q_st"><option value="">Tous</option>${Object.entries(STATUTS).map(([k,v])=>`<option value="${k}">${v.lbl}</option>`).join("")}</select></div>
      <div class="field"><label>Groupe armé</label><select id="q_grp"><option value="">Tous</option>${GROUPES.map(g=>`<option>${g}</option>`).join("")}</select></div>
      <div class="field"><label>Préfecture</label><select id="q_pref"><option value="">Toutes</option>${PREFECTURES.map(p=>`<option>${p}</option>`).join("")}</select></div>
      <div class="field"><label>Sexe</label><select id="q_sexe"><option value="">Tous</option><option value="M">Masculin</option><option value="F">Féminin</option></select></div>
      <div class="field"><label>Type de réintégration</label><select id="q_reint"><option value="">Toutes</option><option value="mil">Militaire</option><option value="socio">Socio-économique</option></select></div>
      <div class="field"><label>Enregistré entre le</label><input type="date" id="q_d1"></div>
      <div class="field"><label>et le</label><input type="date" id="q_d2"></div>
    </div>
    <button class="btn" onclick="runRecherche()">Lancer la recherche</button>
  </div></div>
  <div id="qRes"></div>`;
}
function runRecherche(){
  const txt=$("q_txt").value.toLowerCase(), st=$("q_st").value, grp=$("q_grp").value, pref=$("q_pref").value,
    sexe=$("q_sexe").value, ri=$("q_reint").value, d1=$("q_d1").value, d2=$("q_d2").value;
  const rows=DB.combattants.filter(c=>
    (!txt||`${c.num} ${c.nom} ${c.prenom} ${c.alias||""}`.toLowerCase().includes(txt)) &&
    (!st||c.statut===st) && (!grp||c.groupe===grp) && (!pref||c.prefecture===pref) && (!sexe||c.sexe===sexe) &&
    (!ri||(ri==="mil"?!!c.reintMil:!!c.reintSocio)) &&
    (!d1||c.creele.slice(0,10)>=d1) && (!d2||c.creele.slice(0,10)<=d2)
  );
  $("qRes").innerHTML = `<div class="panel"><div class="ph"><h3>${rows.length} résultat(s)</h3>${rows.length?`<button class="btn sm sec" onclick="exportCombCSV(true)">Exporter ces résultats</button>`:""}</div><div class="pb nopad">${
    rows.length?`<table><thead><tr><th>N° dossier</th><th>Nom & prénom</th><th>Groupe</th><th>Préfecture</th><th>Statut</th><th></th></tr></thead><tbody>${
      rows.map(c=>`<tr><td><b>${c.num}</b></td><td>${esc(c.nom)} ${esc(c.prenom)}</td><td class="small">${esc(c.groupe)}</td><td class="small">${esc(c.prefecture)}</td><td><span class="badge st-${c.statut}">${STATUTS[c.statut].lbl}</span></td><td><span class="link" onclick="go('fiche','${c.id}')">Ouvrir</span></td></tr>`).join("")
    }</tbody></table>`:`<div class="empty">Aucun dossier ne correspond à ces critères.</div>`}</div></div>`;
  window._lastSearch = rows;
}

