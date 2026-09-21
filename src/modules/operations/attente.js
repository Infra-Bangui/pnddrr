/* module: operations/attente.js — PNDDRR engine (classic globals) */
/* Aptitude, médecine et kits : structure validée, contenu en attente des documents de référence. */
const OPERATION_ATTENTE = {
  aptitude:{
    titre:"Aptitude",
    intro:"Ce module accueillera le contrôle d'aptitude des personnes enregistrées (critères médicaux et opérationnels).",
    docs:"grille d'aptitude, critères d'admission et circuit de validation"
  },
  medecine:{
    titre:"Médecine",
    intro:"Ce module accueillera le suivi médical lié aux opérations de désarmement (consultations, soins, orientation sanitaire).",
    docs:"protocole médical, fiches de consultation et listes de médicaments"
  },
  kits:{
    titre:"Distribution de kits",
    intro:"Ce module accueillera la remise des kits aux personnes prises en charge (composition, stocks, accusés de réception).",
    docs:"nomenclature des kits, seuils de stock et bordereaux de distribution"
  }
};
function rOperationAttente(kind){
  const m=OPERATION_ATTENTE[kind]||OPERATION_ATTENTE.aptitude;
  $("view").innerHTML = `
  <div class="panel"><div class="ph"><h3>${esc(m.titre)}</h3><span class="muted small">Opération</span></div>
  <div class="pb">
    <p>${esc(m.intro)}</p>
    <p class="small muted" style="margin-top:10px">Le contenu détaillé sera saisi dès réception des documents de référence (${esc(m.docs)}). La rubrique est déjà en place dans le menu pour ne pas retarder la structuration validée.</p>
  </div></div>`;
}
