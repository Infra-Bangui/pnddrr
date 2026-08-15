/* module: admin/parametres.js — PNDDRR engine (classic globals) */
/* ================= PARAMÈTRES & CONFIGURATION ================= */
const OUTIL_DESC={
  recherche:["Recherche multicritère","Retrouver des dossiers par identité, statut, localisation, groupe, dates et tout autre critère combiné."],
  import:["Importer des données","Charger des fichiers CSV, Excel, Word ou PDF : dossiers d'ex-combattants et registres d'armes, avec contrôle et synchronisation."],
  referentiels:["Référentiels (groupes armés)","Ajouter, renommer ou supprimer les groupes armés proposés dans les formulaires et les filtres."],
  config:["Configuration du programme","Régler les seuils d'alerte, le verrouillage, la pagination, les documents officiels et les éléments de la carte de démobilisé."],
  comptes:["Gestion des comptes","Créer les comptes des agents et attribuer leurs autorisations, profil par profil."],
  journal:["Journal des opérations","Consulter l'historique horodaté de toutes les opérations effectuées dans l'application."],
  sauvegarde:["Sauvegarde & synchronisation","Fonctionnement hors ligne, enregistrement local, échanges JSON entre postes et fusion multi-postes."]
};
function outilRetour(){ return `<div class="toolbar"><button class="btn ghost" onclick="go('parametres')">← Retour aux paramètres</button></div>`; }
function rConfig(){
  const c=DB.config, num=(id,lbl,val,min,max,note)=>`<div class="field"><label>${lbl}</label><input type="number" id="${id}" value="${val}" min="${min}" max="${max}">${note?`<div class="small muted" style="margin-top:3px">${note}</div>`:""}</div>`;
  $("view").innerHTML = `
  ${outilRetour()}
  <div class="panel"><div class="ph"><h3>Alertes « À traiter » — seuils (jours)</h3></div><div class="pb"><div class="grid3">
    ${num("cf_orient","Orientation en retard après",c.seuilOrientation,15,720,"Jours depuis le désarmement sans orientation.")}
    ${num("cf_visite","Visite de suivi en retard après",c.seuilVisite,15,720,"Jours depuis la dernière visite socio-économique.")}
    ${num("cf_form","Formation anormalement longue après",c.seuilFormation,30,1080,"Jours depuis l'orientation sans fin de formation.")}
  </div></div></div>
  <div class="panel"><div class="ph"><h3>Sécurité & affichage</h3></div><div class="pb"><div class="grid3">
    ${num("cf_verrou","Verrouillage après inactivité (minutes)",c.verrouMin,0,240,"0 = verrouillage automatique désactivé.")}
    <div class="field"><label>Lignes par page (grands tableaux)</label><select id="cf_page">${[50,100,200,500].map(n=>`<option ${+c.pageTaille===n?"selected":""}>${n}</option>`).join("")}</select><div class="small muted" style="margin-top:3px">Registres et journal — « Afficher plus » au-delà.</div></div>
    ${num("cf_rappel","Rappel de sauvegarde après (jours)",c.rappelJours,0,90,"0 = rappel désactivé sur le tableau de bord.")}
  </div></div></div>
  <div class="panel"><div class="ph"><h3>Documents officiels</h3></div><div class="pb"><div class="grid2">
    <div class="field"><label>Ville de signature des documents</label><input id="cf_ville" value="${esc(c.villeSignature)}" placeholder="Bangui"></div>
    <div class="field"><label>Signataire de la carte de démobilisé</label><input id="cf_sign" value="${esc(c.signataireCarte)}" placeholder="Le Coordonnateur de l'UEPNDDR"></div>
  </div></div></div>
  <div class="panel"><div class="ph"><h3>Carte de démobilisé — éléments du verso</h3></div><div class="pb">
    <label style="display:flex;align-items:center;gap:8px;font-weight:400;text-transform:none;font-size:13.5px;color:var(--ink);margin-bottom:7px"><input type="checkbox" id="cf_qr" style="width:auto" ${c.carteQR!==false?"checked":""}> QR code (n° de carte + code d'authentification en un scan)</label>
    <label style="display:flex;align-items:center;gap:8px;font-weight:400;text-transform:none;font-size:13.5px;color:var(--ink)"><input type="checkbox" id="cf_cb" style="width:auto" ${c.carteCodeBarres!==false?"checked":""}> Code-barres Code 39 (n° de carte, lisible à la douchette)</label>
    <p class="small muted" style="margin-top:8px">S'applique aux cartes imprimées à partir de maintenant ; le code d'authentification du recto reste toujours présent.</p>
  </div></div>
  <div style="display:flex;gap:10px">
    <button class="btn" onclick="saveConfig()">Enregistrer la configuration</button>
    <button class="btn ghost" onclick="resetConfig()">Rétablir les valeurs par défaut</button>
  </div>
  <p class="small muted" style="margin-top:10px">La configuration est propre à cette installation, conservée dans les données locales et incluse dans les sauvegardes JSON (Restaurer la propage à un autre poste).</p>`;
}
function saveConfig(){
  if(CUR.role!=="admin"){ toast("Réservé à l'administrateur."); return; }
  const b=(v,min,max,d)=>{ v=+v; return isFinite(v)?Math.min(max,Math.max(min,v)):d; };
  DB.config.seuilOrientation=b($("cf_orient").value,15,720,90);
  DB.config.seuilVisite=b($("cf_visite").value,15,720,60);
  DB.config.seuilFormation=b($("cf_form").value,30,1080,270);
  DB.config.verrouMin=b($("cf_verrou").value,0,240,15);
  DB.config.pageTaille=+$("cf_page").value||100;
  DB.config.rappelJours=b($("cf_rappel").value,0,90,7);
  DB.config.villeSignature=$("cf_ville").value.trim()||"Bangui";
  DB.config.signataireCarte=$("cf_sign").value.trim()||"Le Coordonnateur de l'UEPNDDR";
  DB.config.carteQR=$("cf_qr").checked;
  DB.config.carteCodeBarres=$("cf_cb").checked;
  applyConfig(); persist();
  log("Configuration",`Seuils ${DB.config.seuilOrientation}/${DB.config.seuilVisite}/${DB.config.seuilFormation} j · verrou ${DB.config.verrouMin} min · page ${DB.config.pageTaille} · rappel ${DB.config.rappelJours} j · ville ${DB.config.villeSignature} · carte QR:${DB.config.carteQR?"oui":"non"} CB:${DB.config.carteCodeBarres?"oui":"non"}`);
  toast("Configuration enregistrée."); rConfig();
}
function resetConfig(){
  if(CUR.role!=="admin"){ toast("Réservé à l'administrateur."); return; }
  DB.config={}; migrateDB(); applyConfig(); persist();
  log("Configuration","Rétablissement des valeurs par défaut");
  toast("Valeurs par défaut rétablies."); rConfig();
}
function rParametres(){
  const items=OUTILS.filter(navAllowed);
  $("view").innerHTML = `
  <p class="small muted" style="margin-bottom:14px">Outils et administration du programme — l'accès à chaque option dépend des autorisations du compte connecté (${esc(CUR.nom)}).</p>
  <div class="panel"><div class="ph"><h3>Options du programme</h3><span class="muted small">${items.length} option(s) disponibles</span></div>
  <div class="pb nopad"><ul class="optList">${items.map((o,i)=>{
    const [t,dsc]=OUTIL_DESC[o.id]||[o.lbl,""];
    return `<li onclick="go('${o.id}')">
      <span class="num">${i+1}</span>
      <span class="lbl"><b>${t}</b><span class="small muted">${dsc}</span></span>
      <button class="btn sm sec" onclick="event.stopPropagation();go('${o.id}')">Ouvrir</button>
    </li>`;}).join("")}
  </ul></div></div>`;
}
