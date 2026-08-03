/* module: combattants/registre.js — PNDDRR engine (classic globals) */
/* ================= REGISTRE ================= */
function rRegistre(preset){
  preset=preset||{};
  $("view").innerHTML = `
  <div class="toolbar">
    <div class="field"><label>Filtrer par statut</label><select id="fSt" onchange="filtRegistre()"><option value="">Tous</option>${Object.entries(STATUTS).map(([k,v])=>`<option value="${k}" ${preset.st===k?"selected":""}>${v.lbl}</option>`).join("")}</select></div>
    <div class="field"><label>Préfecture</label><select id="fPref" onchange="filtRegistre()"><option value="">Toutes</option>${PREFECTURES.map(p=>`<option ${preset.pref===p?"selected":""}>${esc(p)}</option>`).join("")}</select></div>
    <div class="field"><label>Groupe armé</label><select id="fGrp" onchange="filtRegistre()"><option value="">Tous</option>${GROUPES.map(g=>`<option ${preset.grp===g?"selected":""}>${esc(g)}</option>`).join("")}</select></div>
    <div class="field"><label>Vague</label><select id="fVague" onchange="filtRegistre()"><option value="">Toutes</option>${promosConnues().map(v=>`<option ${preset.vague===v?"selected":""}>${esc(v)}</option>`).join("")}</select></div>
    <div class="field" style="flex:1"><label>Recherche rapide</label><input id="fTxt" placeholder="Nom, alias, n° dossier…" oninput="filtRegistre()"></div>
    <button class="btn sec" onclick="exportCombCSV()">Exporter CSV</button>
    <button class="btn sec" onclick="exportXLSX()">Exporter Excel</button>
    <button class="btn sec" onclick="go('import')">Importer…</button>
  </div>
  <div class="panel"><div class="pb nopad"><table><thead><tr><th>N° dossier</th><th>Nom & prénom</th><th>Sexe</th><th>Groupe armé</th><th>Préfecture</th><th>Statut</th><th>Actions</th></tr></thead><tbody id="tbReg"></tbody></table></div></div>`;
  REG_LIM=PAGE_TAILLE;
  filtRegistre();
}
var PAGE_TAILLE=100; try{ applyConfig(); }catch(e){}
var REG_LIM=PAGE_TAILLE;
function regPlus(tout){ REG_LIM=tout?Infinity:REG_LIM+PAGE_TAILLE; filtRegistre(); }
function filtRegistre(resetLim){
  if(resetLim!==false) {} 
  const st=$("fSt").value, gr=$("fGrp").value, pref=$("fPref").value, vg=$("fVague").value, q=$("fTxt").value.toLowerCase();
  const rows = DB.combattants.filter(c=>
    (!st||c.statut===st)&&(!gr||c.groupe===gr)&&(!pref||c.prefecture===pref)&&(!vg||c.vague===vg||(reintOf(c)&&reintOf(c).promo===vg))&&
    (!q||`${c.num} ${c.nom} ${c.prenom} ${c.alias||""}`.toLowerCase().includes(q))
  ).sort((a,b)=>a.num.localeCompare(b.num));
  const tronq=rows.length>REG_LIM;
  $("tbReg").innerHTML = (rows.length ? rows.slice(0,REG_LIM).map(c=>`<tr>
    <td><b>${c.num}</b></td><td>${esc(c.nom)} ${esc(c.prenom)}${c.alias?` <span class="muted small">« ${esc(c.alias)} »</span>`:""}</td>
    <td>${c.sexe}</td><td class="small">${esc(c.groupe)}</td><td class="small">${esc(c.prefecture)}</td>
    <td><span class="badge st-${c.statut}">${STATUTS[c.statut].lbl}</span></td>
    <td><span class="link" onclick="go('fiche','${c.id}')">Ouvrir le dossier</span></td></tr>`).join("")
  : `<tr><td colspan="7" class="empty">Aucun dossier ne correspond aux critères.</td></tr>`)
  + (tronq?`<tr><td colspan="7" style="text-align:center;padding:11px;background:#FBFDFC"><span class="small muted">${REG_LIM} affiché(s) sur ${rows.length} — </span><button class="btn sm sec" onclick="regPlus()">Afficher ${Math.min(PAGE_TAILLE,rows.length-REG_LIM)} de plus</button> <button class="btn sm ghost" onclick="regPlus(true)">Tout afficher</button></td></tr>`:"");
}


