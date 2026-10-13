/* module: operations/aptitude.js — PNDDRR engine (classic globals) */
/* Aptitude : parcours combattant et première orientation (Militaire / Socio-économique) */
var APT_Q = "";

function aptSearch(v) {
  APT_Q = v;
  rAptitude();
  const el = $("apt_q");
  if (el) {
    el.focus();
    const n = el.value.length;
    try {
      el.setSelectionRange(n, n);
    } catch (e) {}
  }
}

function aptMatch(c) {
  const q = APT_Q.trim().toLowerCase();
  if (!q) return true;
  return [c.num, c.nom, c.prenom, c.alias, c.vague, c.prefecture].join(" ").toLowerCase().includes(q);
}

function aptComplete(c) {
  return !!(c.aptitude && c.aptitude.date);
}

function aptEligible(c) {
  return ["desarme", "demobilise", "reintegration_militaire", "reintegration_socio", "reintegre"].includes(c.statut) || c.desarmement;
}

function rAptitude() {
  const pending = DB.combattants.filter((c) => aptEligible(c) && !aptComplete(c) && aptMatch(c));
  const done = DB.combattants.filter((c) => aptComplete(c) && aptMatch(c)).sort((a, b) => (b.aptitude.date || "").localeCompare(a.aptitude.date || ""));

  $("view").innerHTML = `
  <div class="panel"><div class="ph"><h3>Aptitude</h3><span class="muted small">Opération</span></div>
  <div class="pb">
    <p>Première décision d'orientation et saisie du parcours dans le groupe armé : fonction, niveau d'instruction, années de service et zone d'opération.</p>
  </div></div>
  <div class="toolbar">
    <div class="field" style="flex:1;max-width:480px"><label>Recherche</label><input id="apt_q" value="${esc(APT_Q)}" oninput="aptSearch(this.value)" placeholder="Nom, n° dossier, vague…"></div>
  </div>
  <div class="cards">
    <div class="kpi c-dem"><div class="n">${pending.length}</div><div class="l">En attente de saisie aptitude</div></div>
    <div class="kpi c-ok"><div class="n">${done.length}</div><div class="l">Aptitudes enregistrées</div></div>
  </div>
  <div class="panel"><div class="ph"><h3>À traiter (${pending.length})</h3></div><div class="pb nopad">${
    pending.length
      ? `<table><thead><tr><th>Dossier</th><th>Nom &amp; prénom</th><th>Statut</th><th>Préfecture</th><th>Actions</th></tr></thead><tbody>${pending
          .map(
            (c) => `<tr><td><b>${c.num}</b></td>
      <td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
      <td><span class="badge st-${c.statut}">${STATUTS[c.statut].lbl}</span></td>
      <td class="small">${esc(c.prefecture)}</td>
      <td><button class="btn sm" onclick="mAptitude('${c.id}')">Saisir l'aptitude</button></td></tr>`
          )
          .join("")}</tbody></table>`
      : `<div class="empty">Aucun dossier en attente${APT_Q ? " pour cette recherche" : " — les dossiers apparaissent après enregistrement et désarmement"}.</div>`
  }</div></div>
  <div class="panel"><div class="ph"><h3>Historique récent (${Math.min(done.length, 25)})</h3></div><div class="pb nopad">${
    done.length
      ? `<table><thead><tr><th>Dossier</th><th>Titulaire</th><th>Orientation</th><th>Groupe</th><th>Saisi le</th><th></th></tr></thead><tbody>${done
          .slice(0, 25)
          .map(
            (c) => `<tr><td><b>${c.num}</b></td><td>${esc(c.nom)} ${esc(c.prenom)}</td>
      <td>${esc(c.souhait || c.aptitude.orientation || "—")}</td><td class="small">${esc(c.groupe)}</td>
      <td>${fmtD(c.aptitude.date)}</td>
      <td><button class="btn sm ghost" onclick="mAptitude('${c.id}')">Modifier</button></td></tr>`
          )
          .join("")}</tbody></table>`
      : `<div class="empty">Aucune aptitude enregistrée.</div>`
  }</div></div>`;
}

function mAptitude(id) {
  const c = DB.combattants.find((x) => x.id === id);
  if (!c) return;
  const a = c.aptitude || {};
  openModal(
    `Aptitude — ${c.num}`,
    `
    <p class="small muted" style="margin-bottom:12px">Décision d'orientation et parcours combattant (profil aptitude).</p>
    <div class="grid2">
      <div class="field"><label>Orientation *</label><select id="apt_orient">${selOpts(["Socio-économique", "Militaire", "Indécis"], c.souhait || a.orientation || "Indécis")}</select></div>
      <div class="field"><label>Groupe armé d'origine *</label><div style="display:flex;gap:6px"><select id="apt_grp" style="flex:1">${selOpts(GROUPES, c.groupe || "Autre")}</select>${hasPerm("referentiels") ? `<button type="button" class="btn sec sm" onclick="quickAddGroupe()">+</button>` : ""}</div></div>
      <div class="field"><label>Fonction / grade dans le groupe</label><input id="apt_grade" value="${esc(c.grade || a.grade || "")}"></div>
      <div class="field"><label>Années passées dans le groupe</label><input type="number" min="0" id="apt_annees" value="${esc(c.annees || a.annees || "")}"></div>
      <div class="field"><label>Zone d'opération principale</label><input id="apt_zone" value="${esc(c.zone || a.zone || "")}"></div>
      <div class="field"><label>Niveau d'instruction</label><select id="apt_instr">${selOpts(["Aucun", "Primaire", "Secondaire", "Supérieur", "Coranique"], c.instr || a.instr || "Aucun")}</select></div>
    </div>
    <div class="field"><label>Observations aptitude</label><textarea id="apt_obs" rows="2">${esc(a.obs || "")}</textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveAptitude('${id}')">Enregistrer l'aptitude</button>`
  );
}

function saveAptitude(id) {
  const c = DB.combattants.find((x) => x.id === id);
  if (!c) return;
  const orientation = $("apt_orient").value;
  const groupe = $("apt_grp").value;
  if (!groupe) {
    toast("Le groupe armé est obligatoire.");
    return;
  }
  const grade = $("apt_grade").value.trim();
  const annees = $("apt_annees").value;
  const zone = $("apt_zone").value.trim();
  const instr = $("apt_instr").value;
  const obs = $("apt_obs").value.trim();
  c.aptitude = {
    date: today(),
    agent: CUR.nom,
    orientation,
    groupe,
    grade,
    annees,
    zone,
    instr,
    obs,
  };
  c.groupe = groupe;
  c.grade = grade;
  c.annees = annees;
  c.zone = zone;
  c.instr = instr;
  c.souhait = orientation;
  log("Aptitude", `${c.num} — orientation ${orientation}, ${groupe}`);
  closeModal();
  toast("Aptitude enregistrée.");
  rAptitude();
}
