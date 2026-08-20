/* module: admin/comptes.js — PNDDRR engine (classic globals) */
/* ================= COMPTES ================= */
function rComptes(){
  $("view").innerHTML = `
  ${["admin2026","agent2026","suivi2026"].some(p=>DB.users.some(u=>u.actif&&u.pass===hashPwd(p)))?`<div class="small" style="background:#FDF1F1;border:1px solid #E3B4B4;border-radius:8px;padding:10px 13px;margin-bottom:13px"><b style="color:var(--danger)">⚠ Sécurité :</b> des comptes utilisent encore les mots de passe de démonstration (admin2026, agent2026, suivi2026). Changez-les avant toute mise en service réelle — via « Modifier » ci-dessous ou « Mon mot de passe » dans la barre latérale.</div>`:""}
  <div class="toolbar"><button class="btn ghost" onclick="go('parametres')">← Retour aux paramètres</button><div style="flex:1"></div><button class="btn" onclick="mCompte()">+ Nouveau compte</button></div>
  <div class="panel"><div class="pb nopad"><table><thead><tr><th>Identifiant</th><th>Nom</th><th>Profil</th><th>Autorisations</th><th>État</th><th>Actions</th></tr></thead><tbody>${
    DB.users.map(u=>`<tr><td><b>${esc(u.login)}</b></td><td>${esc(u.nom)}</td><td>${ROLES[u.role]}</td>
    <td class="small">${u.role==="admin"?'<span class="tag">Toutes</span>':userPerms(u).length?userPerms(u).map(p=>`<span class="tag" title="${esc(PERMS[p])}">${p}</span>`).join(" "):'<span class="muted">Aucune</span>'}${u.perms?' <span class="muted small">(personnalisées)</span>':""}</td>
    <td>${u.actif?'<span class="badge st-reintegre">Actif</span>':'<span class="badge st-abandon">Désactivé</span>'}</td>
    <td class="actions-cell"><button class="btn sm sec" onclick="mCompte('${u.id}')">Modifier</button>${u.login!==CUR.login?`<button class="btn sm ghost" onclick="toggleCompte('${u.id}')">${u.actif?"Désactiver":"Réactiver"}</button>`:""}</td></tr>`).join("")
  }</tbody></table></div></div>`;
}
function permBoxes(u){
  const cur=u?userPerms(u):ROLE_PERMS[u?u.role:"agent"];
  return Object.entries(PERMS).map(([k,lbl])=>`<label style="display:flex;align-items:center;gap:8px;font-weight:400;text-transform:none;font-size:13px;color:var(--ink);margin:0 0 6px"><input type="checkbox" class="c_perm" value="${k}" style="width:auto" ${cur.includes(k)?"checked":""}> ${lbl}</label>`).join("");
}
function presetPerms(){
  const role=$("c_role").value;
  $("c_permBox").style.display=role==="admin"?"none":"block";
  $("c_permAdmin").style.display=role==="admin"?"block":"none";
  document.querySelectorAll(".c_perm").forEach(cb=>cb.checked=ROLE_PERMS[role].includes(cb.value));
}
function mCompte(id){
  const u=id?DB.users.find(x=>x.id===id):null;
  openModal(u?"Modifier le compte":"Nouveau compte", `
    <div class="grid2">
    <div class="field"><label>Identifiant</label><input id="c_login" value="${u?esc(u.login):""}" ${u?"disabled":""}></div>
    <div class="field"><label>Nom complet</label><input id="c_nom" value="${u?esc(u.nom):""}"></div>
    <div class="field"><label>Profil</label><select id="c_role" onchange="presetPerms()">${Object.entries(ROLES).map(([k,v])=>`<option value="${k}" ${u&&u.role===k?"selected":""}>${v}</option>`).join("")}</select></div>
    <div class="field"><label>${u?"Nouveau mot de passe (laisser vide pour conserver)":"Mot de passe"}</label><input id="c_pass" type="password"></div></div>
    <div id="c_permBox" style="${(u?u.role:"agent")==="admin"?"display:none":""}">
      <label style="margin-bottom:8px">Autorisations du compte</label>
      <div class="small muted" style="margin-bottom:8px">Le profil pré-remplit les autorisations ; l'administrateur peut ensuite les ajuster individuellement.</div>
      <div style="border:1px solid var(--line);border-radius:8px;padding:12px;columns:2">${permBoxes(u)}</div>
    </div>
    <div id="c_permAdmin" class="small muted" style="${(u?u.role:"agent")==="admin"?"":"display:none"}">Le profil Administrateur dispose de toutes les autorisations, y compris la gestion des comptes et le journal.</div>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="saveCompte('${id||""}')">Enregistrer</button>`);
}
function saveCompte(id){
  if(CUR.role!=="admin"){ toast("Réservé à l'administrateur."); return; }
  const role=$("c_role").value;
  const perms=role==="admin"?null:[...document.querySelectorAll(".c_perm:checked")].map(cb=>cb.value);
  if(id){
    const u=DB.users.find(x=>x.id===id);
    u.nom=$("c_nom").value.trim()||u.nom; u.role=role; u.perms=perms||undefined;
    if(role==="admin") delete u.perms;
    if($("c_pass").value){ u.pass=hashPwd($("c_pass").value); u.passUpdated=true; }
    log("Compte modifié",`${u.login} — autorisations : ${role==="admin"?"toutes":perms.join(", ")||"aucune"}`);
  } else {
    const login=$("c_login").value.trim();
    if(!login||!$("c_pass").value){ toast("Identifiant et mot de passe requis."); return; }
    if(DB.users.some(x=>x.login===login)){ toast("Cet identifiant existe déjà."); return; }
    const nu={id:"u"+Date.now(),login,pass:hashPwd($("c_pass").value),nom:$("c_nom").value.trim()||login,role,actif:true,passUpdated:true};
    if(role!=="admin") nu.perms=perms;
    DB.users.push(nu);
    log("Compte créé",`${login} (${ROLES[role]}) — autorisations : ${role==="admin"?"toutes":perms.join(", ")||"aucune"}`);
  }
  closeModal(); toast("Compte enregistré."); rComptes();
}
function toggleCompte(id){
  const u=DB.users.find(x=>x.id===id); u.actif=!u.actif;
  log(u.actif?"Compte réactivé":"Compte désactivé",u.login); rComptes();
}

