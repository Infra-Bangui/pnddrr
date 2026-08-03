/* module: admin/referentiels.js — PNDDRR engine (classic globals) */
/* ================= RÉFÉRENTIELS — GROUPES ARMÉS ================= */
function groupeUsage(g){ return DB.combattants.filter(c=>c.groupe===g).length; }
function quickAddGroupe(){
  openModal("Ajouter un groupe armé", `<div class="field"><label>Nom du groupe</label><input id="g_quick" placeholder="Ex. : CPC"></div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveQuickGroupe()">Ajouter</button>`);
}
function saveQuickGroupe(){
  const name=$("g_quick").value.trim();
  if(addGroupe(name, nv=>{
    closeModal();
    const sel=$("e_grp");
    if(sel){ const opt=document.createElement("option"); opt.textContent=nv;
      sel.insertBefore(opt, [...sel.options].find(o=>o.value==="Autre")||null); sel.value=nv; }
  })===false){}
}
function rReferentiels(){
  $("view").innerHTML = `
  ${outilRetour()}
  <div class="panel"><div class="ph"><h3>Groupes armés (${GROUPES.length})</h3></div><div class="pb">
    <div class="toolbar" style="margin-bottom:14px">
      <div class="field" style="flex:1;max-width:380px"><label>Nouveau groupe armé</label><input id="g_new" placeholder="Ex. : CPC, Wagner Ti Azandé…"></div>
      <button class="btn" onclick="addGroupe()">+ Ajouter le groupe</button>
    </div>
    <table><thead><tr><th>Groupe armé</th><th>Dossiers rattachés</th><th>Actions</th></tr></thead><tbody>${
      GROUPES.map(g=>`<tr><td><b>${esc(g)}</b>${g==="Autre"?' <span class="muted small">(catégorie système)</span>':""}</td>
      <td>${groupeUsage(g)}</td>
      <td class="actions-cell">${g==="Autre"?"":`<button class="btn sm sec" onclick="renameGroupe('${esc(g).replace(/'/g,"\\'")}')">Renommer</button>
      <button class="btn sm ghost" ${groupeUsage(g)?'disabled title="Des dossiers utilisent ce groupe"':`onclick="delGroupe('${esc(g).replace(/'/g,"\\'")}')"`}>Supprimer</button>`}</td></tr>`).join("")
    }</tbody></table>
    <p class="small muted" style="margin-top:10px">Les groupes ajoutés sont immédiatement disponibles dans le formulaire d'enregistrement, les filtres, la recherche et l'importation, et sont conservés dans la sauvegarde JSON. Un groupe utilisé par des dossiers doit d'abord être renommé ou ses dossiers réaffectés avant suppression.</p>
  </div></div>`;
}
function addGroupe(nameArg, after){
  const name=(nameArg!==undefined?nameArg:$("g_new").value).trim();
  if(!name){ toast("Saisissez le nom du groupe."); return false; }
  if(GROUPES.some(g=>normTxt(g)===normTxt(name))){ toast("Ce groupe existe déjà."); return false; }
  GROUPES.splice(GROUPES.indexOf("Autre"),0,name);
  log("Référentiel",`Groupe armé ajouté : ${name}`);
  toast(`Groupe « ${name} » ajouté.`);
  if(after) after(name); else rReferentiels();
  return true;
}
function renameGroupe(g){
  openModal("Renommer le groupe armé", `<div class="field"><label>Nouveau nom</label><input id="g_ren" value="${esc(g)}"></div>
    <p class="small muted">${groupeUsage(g)} dossier(s) seront mis à jour automatiquement.</p>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveRenameGroupe('${esc(g).replace(/'/g,"\\'")}')">Renommer</button>`);
}
function saveRenameGroupe(g){
  const nv=$("g_ren").value.trim();
  if(!nv){ toast("Nom requis."); return; }
  if(nv!==g&&GROUPES.some(x=>normTxt(x)===normTxt(nv))){ toast("Ce nom existe déjà."); return; }
  GROUPES[GROUPES.indexOf(g)]=nv;
  DB.combattants.forEach(c=>{ if(c.groupe===g) c.groupe=nv; });
  log("Référentiel",`Groupe armé renommé : ${g} → ${nv}`);
  closeModal(); toast("Groupe renommé."); rReferentiels();
}
function delGroupe(g){
  if(groupeUsage(g)){ toast("Des dossiers utilisent ce groupe."); return; }
  GROUPES.splice(GROUPES.indexOf(g),1);
  log("Référentiel",`Groupe armé supprimé : ${g}`);
  toast("Groupe supprimé."); rReferentiels();
}

