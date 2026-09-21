/* module: shell/nav.js — PNDDRR engine (classic globals) */
/* ---------- Navigation — 4 rubriques validées (opération, prise en charge, tableau de bord, administration) ---------- */
const NAV = [
  {grp:"Opération"},
  {id:"nouveau", lbl:"Enregistrement", perm:"enregistrer"},
  {id:"aptitude", lbl:"Aptitude", perm:"enregistrer"},
  {id:"medecine", lbl:"Médecine", perm:"enregistrer"},
  {id:"kits", lbl:"Distribution de kits", perm:"enregistrer"},
  {grp:"Prise en charge"},
  {id:"registre", lbl:"Registre des ex-combattants", roles:["admin","agent","suivi","superviseur"]},
  {id:"armes", lbl:"Registre des armes", roles:["admin","agent","suivi","superviseur"]},
  {id:"docs", lbl:"Cartes & attestations", roles:["admin","agent","suivi","superviseur"]},
  {id:"reintegration", lbl:"Suivi des réintégrations", roles:["admin","agent","suivi","superviseur"]},
  {id:"jalons", lbl:"Formation & intégration", roles:["admin","agent","suivi","superviseur"]},
  {grp:"Tableau de bord"},
  {id:"dashboard", lbl:"Récapitulatif des tours", roles:["admin","agent","suivi","superviseur"]},
  {id:"stats", lbl:"Statistiques", roles:["admin","agent","suivi","superviseur"]},
  {id:"carto", lbl:"Carte des zones", roles:["admin","agent","suivi","superviseur"]},
  {grp:"Administration"},
  {id:"parametres", lbl:"Paramètres", roles:["admin","agent","suivi","superviseur"]}
];
/* Outils regroupés dans la page Paramètres */
const OUTILS = [
  {id:"recherche", lbl:"Recherche", roles:["admin","agent","suivi","superviseur"]},
  {id:"import", lbl:"Importer", perm:"importer"},
  {id:"referentiels", lbl:"Référentiels", perm:"referentiels"},
  {id:"config", lbl:"Configuration", roles:["admin"]},
  {id:"comptes", lbl:"Comptes", roles:["admin"]},
  {id:"journal", lbl:"Journal", roles:["admin"]},
  {id:"sauvegarde", lbl:"Sauvegarde", roles:["admin","agent","suivi","superviseur"]}
];
function navAllowed(it){ return it.perm?hasPerm(it.perm):it.roles.includes(CUR.role); }
function buildNav(){
  let h="", pending=null, buf=[];
  function flush(){
    if(pending&&buf.length) h+=`<div class="grp">${pending}</div>`+buf.join("");
    pending=null; buf=[];
  }
  for(const it of NAV){
    if(it.grp){ flush(); pending=it.grp; continue; }
    if(!navAllowed(it)) continue;
    buf.push(`<a href="#" data-v="${it.id}" onclick="go('${it.id}');return false;">${it.lbl}</a>`);
  }
  flush();
  $("mainNav").innerHTML = h;
  $("bannerRCA").innerHTML = `<div class="b-emb">${ARM_SVG}</div>
    <div class="b-tx">
      <div class="r">RÉPUBLIQUE CENTRAFRICAINE</div>
      <div class="d">Unité — Dignité — Travail</div>
      <div class="u">Unité d'exécution du Programme national de désarmement, démobilisation, réintégration et rapatriement</div>
    </div>`;
}
function viewAllowed(v){
  if(!CUR) return false;
  if(v==="fiche"||v==="parametres") return true;
  const it=[...NAV,...OUTILS].find(x=>x.id===v);
  return it?navAllowed(it):true;
}
function go(v, arg){
  if(!viewAllowed(v)){ toast("Accès non autorisé pour ce compte."); return; }
  VIEW=v;
  const OUTIL_IDS=OUTILS.map(o=>o.id);
  document.querySelectorAll("#mainNav a").forEach(a=>a.classList.toggle("on",a.dataset.v===v||(a.dataset.v==="parametres"&&OUTIL_IDS.includes(v))));
  const titles={
    dashboard:"Tableau de bord — récapitulatif des tours",
    stats:"Statistiques du programme",
    nouveau:"Opération — enregistrement",
    aptitude:"Opération — aptitude",
    medecine:"Opération — médecine",
    kits:"Opération — distribution de kits",
    registre:"Prise en charge — registre des ex-combattants",
    armes:"Prise en charge — registre des armes",
    docs:"Prise en charge — cartes & attestations",
    reintegration:"Prise en charge — suivi des réintégrations",
    jalons:"Prise en charge — formation & intégration",
    import:"Administration — importation de données",
    referentiels:"Administration — groupes armés",
    carto:"Tableau de bord — carte des zones de désarmement",
    recherche:"Recherche multicritère",
    comptes:"Gestion des comptes utilisateurs",
    journal:"Journal des opérations",
    sauvegarde:"Sauvegarde & synchronisation",
    config:"Configuration du programme",
    parametres:"Administration — paramètres",
    fiche:"Dossier individuel"
  };
  $("pageTitle").textContent = titles[v]||"";
  const R={
    dashboard:rDash,stats:rStats,nouveau:rNouveau,registre:()=>rRegistre(arg),armes:rArmes,docs:rDocs,
    aptitude:()=>rOperationAttente("aptitude"),medecine:()=>rOperationAttente("medecine"),kits:()=>rOperationAttente("kits"),
    import:()=>rImport(arg),referentiels:rReferentiels,reintegration:rReint,jalons:rJalons,carto:rCarto,
    recherche:rRecherche,comptes:rComptes,journal:rJournal,sauvegarde:rSauvegarde,config:rConfig,parametres:rParametres,
    fiche:()=>rFiche(arg)
  };
  (R[v]||rDash)();
  $("view").scrollTop=0;
}
