/* module: operations/medecine.js — PNDDRR engine (classic globals) */
var MED_Q = "";

function medMatch(c) {
  const q = MED_Q.trim().toLowerCase();
  if (!q) return true;
  return [c.num, c.nom, c.prenom, c.vague, c.prefecture].join(" ").toLowerCase().includes(q);
}

function medEligible(c) {
  return aptComplete(c);
}

function medVerdictLbl(c) {
  if (!c.medecine || !c.medecine.verdict) return "—";
  return c.medecine.verdict === "apte" ? "Apte physique et biologiquement" : "Inapte physique et biologiquement";
}

function rMedecine() {
  const pending = DB.combattants.filter((c) => medEligible(c) && !(c.medecine && c.medecine.date) && medMatch(c));
  const done = DB.combattants.filter((c) => c.medecine && c.medecine.date && medMatch(c)).sort((a, b) => b.medecine.date.localeCompare(a.medecine.date));

  $("view").innerHTML = `
  <div class="panel"><div class="ph"><h3>Médecine</h3><span class="muted small">Opération</span></div>
  <div class="pb"><p>Le médecin signifie si le combattant est <b>apte</b> ou <b>inapte</b>, physiquement et biologiquement, avant la suite du circuit.</p></div></div>
  <div class="toolbar">
    <div class="field" style="flex:1;max-width:480px"><label>Recherche</label><input id="med_q" value="${esc(MED_Q)}" oninput="MED_Q=this.value;rMedecine()" placeholder="Nom, n° dossier…"></div>
  </div>
  <div class="cards">
    <div class="kpi c-dem"><div class="n">${pending.length}</div><div class="l">En attente d'avis médical</div></div>
    <div class="kpi c-ok"><div class="n">${done.filter((c) => c.medecine.verdict === "apte").length}</div><div class="l">Apters</div></div>
    <div class="kpi c-des"><div class="n">${done.filter((c) => c.medecine.verdict === "inapte").length}</div><div class="l">Inaptes</div></div>
  </div>
  <div class="panel"><div class="ph"><h3>Consultations à signer (${pending.length})</h3></div><div class="pb nopad">${
    pending.length
      ? `<table><thead><tr><th>Dossier</th><th>Nom</th><th>Orientation</th><th>Actions</th></tr></thead><tbody>${pending
          .map(
            (c) => `<tr><td><b>${c.num}</b></td><td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
      <td>${esc(c.souhait || "—")}</td><td><button class="btn sm" onclick="mMedecine('${c.id}')">Saisir l'avis</button></td></tr>`
          )
          .join("")}</tbody></table>`
      : `<div class="empty">Aucun dossier en attente — l'aptitude doit être saisie au préalable.</div>`
  }</div></div>
  <div class="panel"><div class="ph"><h3>Avis enregistrés (${done.length})</h3></div><div class="pb nopad">${
    done.length
      ? `<table><thead><tr><th>Dossier</th><th>Nom</th><th>Avis</th><th>Date</th><th>Médecin / agent</th><th></th></tr></thead><tbody>${done
          .slice(0, 40)
          .map(
            (c) => `<tr><td><b>${c.num}</b></td><td>${esc(c.nom)} ${esc(c.prenom)}</td>
      <td>${c.medecine.verdict === "apte" ? '<span class="badge st-reintegre">Apte</span>' : '<span class="badge st-abandon">Inapte</span>'}</td>
      <td>${fmtD(c.medecine.date)}</td><td class="small">${esc(c.medecine.agent || "—")}</td>
      <td><button class="btn sm ghost" onclick="mMedecine('${c.id}')">Modifier</button></td></tr>`
          )
          .join("")}</tbody></table>`
      : `<div class="empty">Aucun avis médical.</div>`
  }</div></div>`;
}

function mMedecine(id) {
  const c = DB.combattants.find((x) => x.id === id);
  if (!c) return;
  const v = (c.medecine && c.medecine.verdict) || "apte";
  openModal(
    `Avis médical — ${c.num}`,
    `
    <p><b>${esc(c.nom)} ${esc(c.prenom)}</b> — dossier ${c.num}</p>
    <div class="field" style="margin-top:14px"><label>Verdict *</label>
    <select id="med_verdict">
      <option value="apte" ${v === "apte" ? "selected" : ""}>Apte physique et biologiquement</option>
      <option value="inapte" ${v === "inapte" ? "selected" : ""}>Inapte physique et biologiquement</option>
    </select></div>
    <div class="field"><label>Observations</label><textarea id="med_obs" rows="2">${esc((c.medecine && c.medecine.obs) || "")}</textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveMedecine('${id}')">Valider l'avis</button>`
  );
}

function saveMedecine(id) {
  const c = DB.combattants.find((x) => x.id === id);
  if (!c) return;
  c.medecine = {
    date: today(),
    agent: CUR.nom,
    verdict: $("med_verdict").value,
    obs: $("med_obs").value.trim(),
  };
  log("Médecine", `${c.num} — ${medVerdictLbl(c)}`);
  closeModal();
  toast("Avis médical enregistré.");
  rMedecine();
}
