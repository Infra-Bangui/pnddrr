/* module: admin/journal.js — PNDDRR engine (classic globals) */
/* ================= JOURNAL ================= */
var JRN_LIM=PAGE_TAILLE;
function rJournal(){
  $("view").innerHTML = `${outilRetour()}<div class="panel"><div class="ph"><h3>Journal des opérations (${DB.journal.length})</h3><span style="display:flex;gap:7px"><button class="btn sm sec" onclick="mVerifJournal()">Vérifier l'intégrité</button><button class="btn sm sec" onclick="exportJournalCSV()">Exporter CSV</button></span></div><div class="pb nopad">${
    DB.journal.length?`<table><thead><tr><th>Horodatage</th><th>Utilisateur</th><th>Action</th><th>Détail</th><th title="Empreinte SHA-256 chaînée">⛓</th></tr></thead><tbody>${
      DB.journal.slice(0,JRN_LIM).map(j=>`<tr><td class="small">${new Date(j.date).toLocaleString("fr-FR")}</td><td><b>${esc(j.user)}</b></td><td>${esc(j.action)}</td><td class="small">${esc(j.detail)}</td><td class="small muted" title="${esc(j.h||"")}">${j.h?j.h.slice(0,8):"—"}</td></tr>`).join("")
    }${DB.journal.length>JRN_LIM?`<tr><td colspan="5" style="text-align:center;padding:11px;background:#FBFDFC"><span class="small muted">${JRN_LIM} sur ${DB.journal.length} — </span><button class="btn sm sec" onclick="JRN_LIM+=PAGE_TAILLE;rJournal()">Afficher plus</button> <button class="btn sm ghost" onclick="JRN_LIM=Infinity;rJournal()">Tout</button></td></tr>`:""}</tbody></table>`:`<div class="empty">Journal vide.</div>`}</div></div>`;
}

