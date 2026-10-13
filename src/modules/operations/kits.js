/* module: operations/kits.js — PNDDRR engine (classic globals) */
/* Distribution de kits + cartes et attestations (audit photo avant impression) */
var KIT_Q = "";

function kitMatch(c) {
  const q = KIT_Q.trim().toLowerCase();
  if (!q) return true;
  return [c.num, c.nom, c.prenom, c.vague, c.prefecture].join(" ").toLowerCase().includes(q);
}

function rKits() {
  const eligible = DB.combattants.filter((c) => c.demobilisation && c.medecine && c.medecine.verdict === "apte" && kitMatch(c));
  const withAudit = eligible.filter((c) => c.auditRemise && c.auditRemise.photo);
  const sansAudit = eligible.filter((c) => !c.auditRemise || !c.auditRemise.photo);

  $("view").innerHTML = `
  <div class="panel"><div class="ph"><h3>Distribution de kits</h3><span class="muted small">Opération</span></div>
  <div class="pb">
    <p>Remise des kits et délivrance des cartes. <b>Avant toute impression de carte</b>, enregistrez la photo d'audit : le combattant filmé avec l'argent reçu (preuve de perception).</p>
  </div></div>
  <div class="toolbar">
    <div class="field" style="flex:1;max-width:480px"><label>Recherche</label><input id="kit_q" value="${esc(KIT_Q)}" oninput="KIT_Q=this.value;rKits()" placeholder="Nom, n° dossier, n° carte…"></div>
  </div>
  <div class="cards">
    <div class="kpi c-rm"><div class="n">${sansAudit.length}</div><div class="l">Cartes sans photo d'audit</div></div>
    <div class="kpi c-ok"><div class="n">${withAudit.length}</div><div class="l">Prêts à imprimer la carte</div></div>
  </div>
  <div class="panel"><div class="ph"><h3>Photo d'audit — remise d'argent (${sansAudit.length})</h3></div><div class="pb nopad">${
    sansAudit.length
      ? `<table><thead><tr><th>Carte</th><th>Titulaire</th><th>Démobilisé le</th><th>Actions</th></tr></thead><tbody>${sansAudit
          .map(
            (c) => `<tr><td><b>${esc(c.demobilisation.carte)}</b></td>
      <td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
      <td>${fmtD(c.demobilisation.date)}</td>
      <td><button class="btn sm" onclick="mAuditRemise('${c.id}')">Enregistrer la photo d'audit</button></td></tr>`
          )
          .join("")}</tbody></table>`
      : `<div class="empty">Toutes les cartes éligibles disposent d'une photo d'audit, ou aucune carte en attente.</div>`
  }</div></div>
  <div class="panel"><div class="ph"><h3>Cartes &amp; attestations</h3></div><div class="pb">${docsContenuHtml()}</div></div>`;
}

function mAuditRemise(id) {
  const c = DB.combattants.find((x) => x.id === id);
  if (!c) return;
  openModal(
    `Photo d'audit — ${c.num}`,
    `
    <p class="small muted">Photographiez ou importez l'image du combattant <b>avec l'argent reçu</b> avant d'imprimer sa carte.</p>
    <div class="field"><label>Montant perçu (FCFA)</label><input type="number" min="0" id="aud_montant" value="${c.auditRemise && c.auditRemise.montant ? c.auditRemise.montant : ""}"></div>
    <div id="audCapture" style="margin:0 auto"></div>
    <div class="field" style="margin-top:10px"><label>Observations</label><textarea id="aud_obs" rows="2">${esc((c.auditRemise && c.auditRemise.obs) || "")}</textarea></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveAuditRemise('${id}')">Enregistrer</button>`
  );
  window._auditPhoto = (c.auditRemise && c.auditRemise.photo) || null;
  if (typeof uiPhotoCapture === "function") {
    uiPhotoCapture("audCapture", window._auditPhoto, {
      maxPx: 480,
      onChange: (data) => {
        window._auditPhoto = data;
      },
    });
  }
}

function saveAuditRemise(id) {
  const c = DB.combattants.find((x) => x.id === id);
  if (!c) return;
  const cap = $("audCapture");
  if (cap && typeof cap.getPhoto === "function") window._auditPhoto = cap.getPhoto();
  if (!window._auditPhoto) {
    toast("La photo d'audit est obligatoire.");
    return;
  }
  c.auditRemise = {
    date: today(),
    agent: CUR.nom,
    photo: window._auditPhoto,
    montant: $("aud_montant").value ? +$("aud_montant").value : null,
    obs: $("aud_obs").value.trim(),
  };
  log("Audit remise", `${c.num} — photo d'audit enregistrée${c.auditRemise.montant ? " (" + fmtN(c.auditRemise.montant) + " FCFA)" : ""}`);
  closeModal();
  toast("Photo d'audit enregistrée — la carte peut être imprimée.");
  rKits();
}
