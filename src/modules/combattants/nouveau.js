/* module: combattants/nouveau.js — PNDDRR engine (classic globals) */
/* ================= NOUVEL ENREGISTREMENT (assistant — biométrie, identité, désarmement) ================= */
var ENR_STEP = 1;
var ENR_EDIT_ID = null;
var ENR_DRAFT = { photo: null, empreinte: null, identity: null };

function enrSaveDraftStep1() {
  const phCap = $("phCapture");
  if (phCap && typeof phCap.getPhoto === "function") ENR_DRAFT.photo = phCap.getPhoto();
  else ENR_DRAFT.photo = window._enrPhotoData != null ? window._enrPhotoData : ENR_DRAFT.photo;
  const fpBox = $("fpBox");
  if (fpBox && typeof fpBox.getEmpreinte === "function") ENR_DRAFT.empreinte = fpBox.getEmpreinte();
}

function enrSaveDraftStep2() {
  if (!$("e_nom")) return;
  const locVal = (sel, libre) => {
    const v = $(sel).value;
    return v === "__autre" ? $(libre).value.trim() : v;
  };
  ENR_DRAFT.identity = {
    nom: $("e_nom").value.trim().toUpperCase(),
    prenom: $("e_prenom").value.trim(),
    alias: $("e_alias").value.trim(),
    sexe: $("e_sexe").value,
    dn: $("e_dn").value,
    ln: $("e_ln").value.trim(),
    nat: $("e_nat").value.trim(),
    tel: $("e_tel").value.trim(),
    fam: $("e_fam").value,
    region: $("e_region").value,
    prefecture: $("e_pref").value,
    sousPref: locVal("e_sp", "e_sp_libre"),
    commune: locVal("e_commune", "e_commune_libre"),
    site: $("e_site").value.trim(),
    vague: $("e_vague").value.trim(),
    obs: $("e_obs").value.trim(),
  };
}

function selOpts(arr, sel) {
  return arr.map((x) => `<option ${x === sel ? "selected" : ""}>${esc(x)}</option>`).join("");
}

function enrStepsHtml(step, showDesarm) {
  const s1 = step === 1 ? "now" : step > 1 ? "done" : "";
  const s2 = step === 2 ? "now" : step > 2 ? "done" : "";
  const s3 = showDesarm ? (step === 3 ? "now" : step > 3 ? "done" : "") : "";
  let h = `<div class="steps">
    <div class="step ${s1}">1. Biométrie</div>
    <div class="step ${s2}">2. Identité &amp; localisation</div>`;
  if (showDesarm) h += `<div class="step ${s3}">3. Désarmement</div>`;
  h += `</div>`;
  return h;
}

function enrShowDesarmStep(c) {
  if (c && c.desarmement) return false;
  return hasPerm("desarmer");
}

function enrGoStep(n) {
  if (ENR_STEP === 1 && n > 1) enrSaveDraftStep1();
  if (ENR_STEP === 2 && n > 2) enrSaveDraftStep2();
  if (ENR_STEP === 1 && n !== 1 && typeof photoCaptureStopAll === "function") photoCaptureStopAll();
  ENR_STEP = n;
  rNouveau(ENR_EDIT_ID || undefined);
}

function rNouveau(edit) {
  ENR_EDIT_ID = edit || null;
  const c = edit ? DB.combattants.find((x) => x.id === edit) : null;
  const idDraft = ENR_DRAFT.identity;
  const showDes = enrShowDesarmStep(c);
  const maxStep = showDes ? 3 : 2;
  if (!edit && ENR_STEP > maxStep) ENR_STEP = maxStep;
  if (c && c.desarmement && ENR_STEP > 2) ENR_STEP = 2;

  const lock = regionVerrouillee();
  const regProfil = regionAgent();
  const sansZone = lock && !regProfil;
  const regInit = (idDraft && idDraft.region) || regProfil || (c ? regionOf(c.prefecture) : "") || Object.keys(REGIONS)[0];
  const step = ENR_STEP;

  let body = "";
  if (step === 1) {
    body = `
    <p class="small muted" style="margin-bottom:14px">Capturez la photo d'identité et l'empreinte digitale sur un écran dédié, avant les informations administratives.</p>
    <div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap;justify-content:center">
      <div id="phCapture"></div>
      <div><div id="fpBox" class="fp-box"></div></div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
      ${c ? `<button type="button" class="btn ghost" onclick="go('fiche','${c.id}')">Annuler</button>` : ""}
      <button class="btn" type="button" onclick="enrGoStep(2)">Suivant — identité</button>
    </div>`;
  } else if (step === 2) {
    body = `
    <div class="grid3">
      <div class="field"><label>Nom *</label><input id="e_nom" required value="${idDraft ? esc(idDraft.nom) : c ? esc(c.nom) : ""}"></div>
      <div class="field"><label>Prénom(s) *</label><input id="e_prenom" required value="${idDraft ? esc(idDraft.prenom) : c ? esc(c.prenom) : ""}"></div>
      <div class="field"><label>Alias / nom de guerre</label><input id="e_alias" value="${idDraft ? esc(idDraft.alias) : c ? esc(c.alias || "") : ""}"></div>
      <div class="field"><label>Sexe *</label><select id="e_sexe"><option ${(idDraft ? idDraft.sexe : c && c.sexe) === "M" ? "selected" : ""} value="M">Masculin</option><option ${(idDraft ? idDraft.sexe : c && c.sexe) === "F" ? "selected" : ""} value="F">Féminin</option></select></div>
      <div class="field"><label>Date de naissance</label><input type="date" id="e_dn" value="${idDraft ? idDraft.dn || "" : c ? c.dn || "" : ""}"></div>
      <div class="field"><label>Lieu de naissance</label><input id="e_ln" value="${idDraft ? esc(idDraft.ln) : c ? esc(c.ln || "") : ""}"></div>
      <div class="field"><label>Nationalité</label><input id="e_nat" value="${idDraft ? esc(idDraft.nat) : c ? esc(c.nat) : "Centrafricaine"}"></div>
      <div class="field"><label>Téléphone</label><input id="e_tel" value="${idDraft ? esc(idDraft.tel) : c ? esc(c.tel || "") : ""}"></div>
      <div class="field"><label>Situation familiale</label><select id="e_fam">${selOpts(["Célibataire", "Marié(e)", "Veuf(ve)", "Divorcé(e)"], idDraft ? idDraft.fam : c ? c.fam : "")}</select></div>
    </div>
    <h3 style="color:var(--teal-dark);margin:16px 0 10px;font-size:13.5px;text-transform:uppercase">Localisation</h3>
    <p class="small muted" style="margin:-4px 0 10px">${lock ? "Région issue du profil agent — elle ne se choisit pas à l'enregistrement." : "La région par défaut peut être renseignée sur chaque compte agent."}</p>
    <div class="grid3">
      <div class="field${lock ? " locked" : ""}"><label>Région</label><select id="e_region" ${lock || sansZone ? "disabled" : ""} onchange="fillPref()">${Object.entries(REGIONS)
        .map(
          ([r, v]) =>
            `<option value="${esc(r)}" ${r === regInit ? "selected" : ""}>${v.num}. ${esc(r)}${r === "Bas-Oubangui" ? " (Bangui)" : ""}</option>`
        )
        .join("")}</select></div>
      <div class="field"><label>Préfecture *</label><select id="e_pref" onchange="fillLoc()"></select></div>
      <div class="field"><label>Sous-préfecture</label><select id="e_sp"></select><input id="e_sp_libre" placeholder="Préciser la sous-préfecture" style="display:none;margin-top:5px"></div>
      <div class="field"><label>Commune</label><select id="e_commune"></select><input id="e_commune_libre" placeholder="Préciser la commune" style="display:none;margin-top:5px"></div>
      <div class="field"><label>Site de regroupement / cantonnement</label><input id="e_site" value="${idDraft ? esc(idDraft.site) : c ? esc(c.site || "") : ""}"></div>
      <div class="field"><label>Vague d'enregistrement</label>
      <div style="display:flex;gap:6px"><input id="e_vague" list="vagueList" style="flex:1" value="${idDraft ? esc(idDraft.vague) : c ? esc(c.vague || "") : ""}" oninput="this.dataset.man='1'" placeholder="Générée selon la préfecture"><button type="button" class="btn sec sm" title="Nouvelle vague" onclick="$('e_vague').dataset.man='';majVague(true)">↻ Nouvelle</button></div>
      <datalist id="vagueList">${promosConnues()
        .map((p) => `<option>${esc(p)}</option>`)
        .join("")}</datalist></div>
    </div>
    <div class="field" style="margin-top:10px"><label>Observations</label><textarea id="e_obs" rows="2">${idDraft ? esc(idDraft.obs) : c ? esc(c.obs || "") : ""}</textarea></div>
    <p class="small muted" style="margin-top:8px">Le parcours combattant (groupe, orientation, instruction…) est saisi au module <b>Aptitude</b>, après l'enregistrement et le désarmement sur le terrain.</p>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">
      <button type="button" class="btn ghost" onclick="enrGoStep(1)">← Biométrie</button>
      ${c ? `<button type="button" class="btn ghost" onclick="go('fiche','${c.id}')">Annuler</button>` : ""}
      ${showDes && !c ? `<button class="btn" type="button" onclick="enrGoStep(3)">Suivant — désarmement</button>` : `<button class="btn" type="button" onclick="submitEnr()">${c ? "Enregistrer les modifications" : "Ouvrir le dossier"}</button>`}
    </div>`;
  } else {
    body = `
    <p class="small muted" style="margin-bottom:12px">Sur le terrain, l'agent d'enregistrement procède au désarmement dans la foulée de l'ouverture du dossier. Saisissez le procès-verbal de remise des armes et munitions.</p>
    <div class="grid2"><div class="field"><label>Date de remise</label><input type="date" id="d_date" value="${today()}"></div>
    <div class="field"><label>Lieu / site de collecte</label><input id="d_lieu" value="${c ? esc(c.site || c.prefecture || "") : ""}"></div></div>
    <label>Armement et matériel remis</label>
    <table id="tArmes"><thead><tr><th>Type</th><th>Marque</th><th>Calibre</th><th>N° série</th><th>État</th><th>Munitions</th><th></th></tr></thead>
    <tbody>${armeRow(0)}</tbody></table>
    <button type="button" class="btn sm sec" style="margin-top:8px" onclick="document.querySelector('#tArmes tbody').insertAdjacentHTML('beforeend', armeRow())">+ Ajouter une arme</button>
    <h3 style="color:var(--teal-dark);margin:16px 0 8px;font-size:13px;text-transform:uppercase">Munitions et explosifs remis</h3>
    <table id="tMun"><thead><tr><th>Nature / calibre</th><th>Quantité</th><th>Unité</th><th>Observations</th><th></th></tr></thead><tbody></tbody></table>
    <button type="button" class="btn sm sec" style="margin-top:8px" onclick="document.querySelector('#tMun tbody').insertAdjacentHTML('beforeend', munRow())">+ Ajouter des munitions</button>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px">
      <button type="button" class="btn ghost" onclick="enrGoStep(2)">← Identité</button>
      <button class="btn" type="button" onclick="submitEnr()">${c ? "Enregistrer" : "Valider l'enregistrement et le désarmement"}</button>
    </div>`;
  }

  $("view").innerHTML = `
  ${sansZone ? `<div class="panel" style="border-color:#E3B4B4"><div class="pb"><b style="color:var(--danger)">Zone non paramétrée.</b> Demandez à l'administrateur de renseigner votre région dans Paramètres → Comptes.</div></div>` : ""}
  <div class="panel"><div class="ph"><h3>${c ? `Modification du dossier ${c.num}` : "Fiche d'enregistrement individuel"}</h3></div><div class="pb">
  ${enrStepsHtml(step, showDes)}
  <form id="fEnr" onsubmit="return false">${body}</form>
  </div></div>`;

  window.vagueAuto = function (pref, fresh) {
    const an = new Date().getFullYear(),
      jour = today();
    if (!fresh) {
      const rec = [...DB.combattants].reverse().find((x) => x.prefecture === pref && x.vague && x.creele && x.creele.slice(0, 10) === jour);
      if (rec) return rec.vague;
    }
    const rx = new RegExp("^Vague " + pref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + " " + an + "-(\\d+)$");
    let max = 0;
    DB.combattants.forEach((x) => {
      const m = x.vague && x.vague.match(rx);
      if (m) max = Math.max(max, +m[1]);
    });
    return `Vague ${pref} ${an}-${max + 1}`;
  };
  window.majVague = function (force) {
    const v = $("e_vague");
    if (!v) return;
    if (c && !force) return;
    if (v.dataset.man === "1" && !force) return;
    v.value = vagueAuto($("e_pref").value, force === true);
    v.dataset.man = "";
  };
  window.fillPref = function () {
    const reg = $("e_region").value;
    const list = (REGIONS[reg] && REGIONS[reg].prefs) || [];
    if (!list.length) {
      $("e_pref").innerHTML = "";
      return;
    }
    const cur =
      idDraft && list.includes(idDraft.prefecture)
        ? idDraft.prefecture
        : c && list.includes(c.prefecture)
          ? c.prefecture
          : !c && CUR && CUR.prefecture && list.includes(CUR.prefecture)
            ? CUR.prefecture
            : list[0];
    $("e_pref").innerHTML = list.map((p) => `<option ${p === cur ? "selected" : ""}>${esc(p)}</option>`).join("");
    fillLoc();
  };
  window.fillLoc = function () {
    const pref = $("e_pref").value;
    const mk = (sel, libre, list, cur) => {
      const el = $(sel),
        lb = $(libre);
      const inList = cur && list.includes(cur);
      el.innerHTML =
        '<option value="">— Non précisée —</option>' +
        list.map((x) => `<option ${x === cur ? "selected" : ""}>${esc(x)}</option>`).join("") +
        `<option value="__autre" ${cur && !inList ? "selected" : ""}>Autre (préciser)…</option>`;
      lb.style.display = cur && !inList ? "block" : "none";
      if (cur && !inList) lb.value = cur;
      el.onchange = () => {
        lb.style.display = el.value === "__autre" ? "block" : "none";
      };
    };
    mk("e_sp", "e_sp_libre", SOUS_PREFS[pref] || [], idDraft ? idDraft.sousPref : c ? c.sousPref : "");
    mk("e_commune", "e_commune_libre", COMMUNES[pref] || [], idDraft ? idDraft.commune : c ? c.commune : "");
    majVague();
  };

  if (step >= 2) fillPref();
  if (step === 1 || step === 2) {
    if (typeof uiEmpreinte === "function") uiEmpreinte("fpBox", ENR_DRAFT.empreinte || (c && c.empreinte));
  }

  window._enrPhotoData = ENR_DRAFT.photo != null ? ENR_DRAFT.photo : c ? c.photo || null : null;
  if (step === 1 && typeof uiPhotoCapture === "function") {
    uiPhotoCapture("phCapture", window._enrPhotoData, {
      maxPx: 300,
      onChange: (data) => {
        window._enrPhotoData = data;
        ENR_DRAFT.photo = data;
      },
    });
  }

  const locVal = (sel, libre) => {
    const v = $(sel).value;
    return v === "__autre" ? $(libre).value.trim() : v;
  };

  window.submitEnr = function () {
    if (sansZone) {
      toast("Impossible d'enregistrer : votre zone géographique n'est pas paramétrée.");
      return;
    }
    if (ENR_STEP === 2) enrSaveDraftStep2();
    if (ENR_STEP === 3 && !ENR_DRAFT.identity) enrSaveDraftStep2();
    const id = ENR_DRAFT.identity;
    if (ENR_STEP < 2 && !id) {
      toast("Complétez d'abord l'écran identité & localisation.");
      enrGoStep(2);
      return;
    }
    const nom = id ? id.nom : $("e_nom").value.trim().toUpperCase();
    const prenom = id ? id.prenom : $("e_prenom").value.trim();
    if (!nom || !prenom) {
      toast("Le nom et le prénom sont obligatoires.");
      enrGoStep(2);
      return;
    }
    const vague = id ? id.vague : $("e_vague").value.trim();
    if (!vague) {
      toast("La vague d'enregistrement est obligatoire.");
      enrGoStep(2);
      return;
    }
    const prefVal = id ? id.prefecture : $("e_pref").value;
    if (lock && regProfil && regionOf(prefVal) !== regProfil) {
      toast("La préfecture doit appartenir à votre région de travail (" + regionLabel(regProfil) + ").");
      return;
    }
    const fpBox = $("fpBox");
    const photoData =
      window._enrPhotoData != null
        ? window._enrPhotoData
        : ENR_DRAFT.photo != null
          ? ENR_DRAFT.photo
          : c && c.photo
            ? c.photo
            : null;
    const empreinte =
      ENR_DRAFT.empreinte ||
      (fpBox && typeof fpBox.getEmpreinte === "function" ? fpBox.getEmpreinte() : null) ||
      (c && c.empreinte) ||
      null;

    const d = id
      ? Object.assign({}, id, { nom, prenom, vague, photo: photoData, empreinte })
      : {
          nom,
          prenom,
          alias: $("e_alias").value.trim(),
          sexe: $("e_sexe").value,
          dn: $("e_dn").value,
          ln: $("e_ln").value.trim(),
          nat: $("e_nat").value.trim(),
          tel: $("e_tel").value.trim(),
          fam: $("e_fam").value,
          prefecture: prefVal,
          sousPref: locVal("e_sp", "e_sp_libre"),
          commune: locVal("e_commune", "e_commune_libre"),
          site: $("e_site").value.trim(),
          vague,
          obs: $("e_obs").value.trim(),
          photo: photoData,
          empreinte,
        };

    const needDes = !c && showDes && ENR_STEP === 3;
    let desData = null;
    if (needDes) {
      desData = typeof readDesarmementForm === "function" ? readDesarmementForm(true) : null;
      if (!desData) {
        toast("Ajoutez au moins une arme ou un lot de munitions au procès-verbal.");
        return;
      }
    }

    if (c) {
      Object.assign(c, d);
      if (!c.groupe) c.groupe = c.groupe || "Autre";
      if (!c.souhait) c.souhait = c.souhait || "Indécis";
      if (!c.instr) c.instr = c.instr || "Aucun";
      log("Modification dossier", `${c.num} — ${c.nom} ${c.prenom}`);
      toast("Dossier mis à jour.");
      go("fiche", c.id);
    } else {
      const nc = Object.assign(
        {
          id: "c" + Date.now(),
          num: numDossier(),
          statut: desData ? "desarme" : "enregistre",
          creele: new Date().toISOString(),
          agent: CUR.login,
          desarmement: desData,
          demobilisation: null,
          reintMil: null,
          reintSocio: null,
          fin: null,
          abandon: null,
          groupe: "Autre",
          grade: "",
          annees: "",
          zone: "",
          souhait: "Indécis",
          instr: "Aucun",
        },
        d
      );
      if (desData && !showDes) {
        toast("Désarmement non saisi — dossier ouvert au statut enregistré.");
      }
      if (!desData && showDes && ENR_STEP < 3) {
        toast("Le désarmement doit être saisi dans la foulée — complétez l'étape 3.");
        enrGoStep(3);
        return;
      }
      DB.combattants.push(nc);
      log(
        "Enregistrement",
        desData
          ? `Dossier ${nc.num} — ${nc.nom} ${nc.prenom} (enregistré et désarmé)`
          : `Ouverture du dossier ${nc.num} — ${nc.nom} ${nc.prenom} (${nc.vague})`
      );
      if (desData) log("Désarmement", `${nc.num} — procès-verbal saisi à l'enregistrement`);
      toast(desData ? `Dossier ${nc.num} ouvert et désarmé.` : `Dossier ${nc.num} ouvert.`);
      ENR_DRAFT = { photo: null, empreinte: null, identity: null };
      ENR_STEP = 1;
      go("fiche", nc.id);
    }
  };

  $("fEnr").addEventListener("submit", (e) => {
    e.preventDefault();
    submitEnr();
  });
}
