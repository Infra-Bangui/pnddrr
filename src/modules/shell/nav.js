/* module: shell/nav.js — PNDDRR engine (classic globals) */
/* ---------- Navigation ---------- */
const NAV = [
  {grp:"Pilotage"},
  {id:"dashboard", lbl:"Tableau de bord", ic:"◫", roles:["admin","agent","suivi","superviseur"]},
  {id:"stats", lbl:"Statistiques", ic:"◔", roles:["admin","agent","suivi","superviseur"]},
  {grp:"1 · Désarmement"},
  {id:"nouveau", lbl:"Nouvel enregistrement", ic:"✚", perm:"enregistrer"},
  {id:"registre", lbl:"Registre des ex-combattants", ic:"☰", roles:["admin","agent","suivi","superviseur"]},
  {id:"armes", lbl:"Registre des armes", ic:"⌖", roles:["admin","agent","suivi","superviseur"]},
  {id:"docs", lbl:"Cartes & attestations", ic:"▤", roles:["admin","agent","suivi","superviseur"]},
  {grp:"2 · Réintégration"},
  {id:"reintegration", lbl:"Suivi des réintégrations", ic:"⇄", roles:["admin","agent","suivi","superviseur"]},
  {id:"jalons", lbl:"Formation & intégration", ic:"✓", roles:["admin","agent","suivi","superviseur"]},
  {grp:"3 · Cartographie"},
  {id:"carto", lbl:"Carte des zones de désarmement", ic:"◉", roles:["admin","agent","suivi","superviseur"]},
  {grp:"Administration"},
  {id:"parametres", lbl:"Paramètres", ic:"⚙", roles:["admin","agent","suivi","superviseur"]}
];
/* Outils regroupés dans la page Paramètres */
const OUTILS = [
  {id:"recherche", lbl:"Recherche", ic:"⌕", roles:["admin","agent","suivi","superviseur"]},
  {id:"import", lbl:"Importer", ic:"⇪", perm:"importer"},
  {id:"referentiels", lbl:"Référentiels", ic:"⚑", perm:"referentiels"},
  {id:"config", lbl:"Configuration", ic:"⚙", roles:["admin"]},
  {id:"comptes", lbl:"Comptes", ic:"♟", roles:["admin"]},
  {id:"journal", lbl:"Journal", ic:"✎", roles:["admin"]},
  {id:"sauvegarde", lbl:"Sauvegarde", ic:"⇆", roles:["admin","agent","suivi","superviseur"]}
];
function navAllowed(it){ return it.perm?hasPerm(it.perm):it.roles.includes(CUR.role); }
function buildNav(){
  let h="";
  for(const it of NAV){
    if(it.grp){ h+=`<div class="grp">${it.grp}</div>`; continue; }
    if(!navAllowed(it)) continue;
    h+=`<a href="#" data-v="${it.id}" onclick="go('${it.id}');return false;">${it.lbl}</a>`;
  }
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
  const titles={dashboard:"Tableau de bord",stats:"Statistiques du programme",nouveau:"Désarmement — nouvel enregistrement",registre:"Désarmement — registre des ex-combattants",armes:"Désarmement — registre des armes",docs:"Cartes de démobilisé & attestations de désarmement",import:"Désarmement — importation de données",referentiels:"Référentiels — groupes armés",reintegration:"Réintégration — suivi des parcours",jalons:"Réintégration — formation & intégration à la vie militaire ou civile",carto:"Cartographie des zones de désarmement",recherche:"Recherche multicritère",comptes:"Gestion des comptes utilisateurs",journal:"Journal des opérations",sauvegarde:"Sauvegarde & synchronisation",config:"Configuration du programme",parametres:"Paramètres",fiche:"Dossier individuel"};
  $("pageTitle").textContent = titles[v]||"";
  const R={dashboard:rDash,stats:rStats,nouveau:rNouveau,registre:()=>rRegistre(arg),armes:rArmes,docs:rDocs,import:()=>rImport(arg),referentiels:rReferentiels,reintegration:rReint,jalons:rJalons,carto:rCarto,recherche:rRecherche,comptes:rComptes,journal:rJournal,sauvegarde:rSauvegarde,config:rConfig,parametres:rParametres,fiche:()=>rFiche(arg)};
  (R[v]||rDash)();
  $("view").scrollTop=0;
}

