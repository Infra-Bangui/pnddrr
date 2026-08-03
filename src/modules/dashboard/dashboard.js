/* module: dashboard/dashboard.js — PNDDRR engine (classic globals) */
/* ================= TABLEAU DE BORD ================= */
function countBy(arr, fn){ const m={}; arr.forEach(x=>{ const k=fn(x)||"—"; m[k]=(m[k]||0)+1; }); return Object.entries(m).sort((a,b)=>b[1]-a[1]); }
function barChart(pairs, clickFn){
  if(!pairs.length) return `<div class="empty">Aucune donnée.</div>`;
  const max=Math.max(...pairs.map(p=>p[1]));
  return pairs.map(([k,v])=>`<div class="bar-row${clickFn?" click":""}" ${clickFn?`onclick="${clickFn(k)}" title="Cliquer pour voir les dossiers"`:""}><span class="lbl">${esc(k)}</span><div class="bar" style="width:${Math.round(v/max*100)*0.7}%"></div><span class="val">${v}</span></div>`).join("");
}
var DASH_F={reg:"",pref:"",grp:"",sexe:"",d1:"",d2:""};
function joursDepuis(d){ if(!d) return 0; return Math.floor((Date.now()-new Date(String(d).slice(0,10)).getTime())/86400000); }
function alertesATraiter(){
  const al=[];
  for(const c of DB.combattants){
    if(["desarme","demobilise"].includes(c.statut)){
      const ref=(c.desarmement&&c.desarmement.date)||c.creele.slice(0,10);
      const j=joursDepuis(ref);
      if(j>(+cfg("seuilOrientation")||90)) al.push({c, type:"Orientation en retard", detail:`désarmé depuis ${j} jours sans orientation (souhait : ${c.souhait})`, grav:2});
    }
    if(c.statut==="reintegration_socio"&&c.reintSocio){
      const v=c.reintSocio.visites||[];
      const derniere=v.length?v.map(x=>x.date).sort().pop():null;
      const j=joursDepuis(derniere||c.reintSocio.date);
      if(j>(+cfg("seuilVisite")||60)) al.push({c, type:"Visite de suivi en retard", detail:`${derniere?`dernière visite il y a ${j} jours`:`aucune visite depuis l'orientation (${j} jours)`}`, grav:derniere?1:2});
    }
    if(["reintegration_militaire","reintegration_socio"].includes(c.statut)){
      const r=reintOf(c);
      if(r&&!r.formFin){
        const j=joursDepuis(r.date);
        if(j>(+cfg("seuilFormation")||270)) al.push({c, type:"Formation anormalement longue", detail:`en formation depuis ${j} jours sans validation de fin`, grav:1});
      }
    }
  }
  return al.sort((a,b)=>b.grav-a.grav);
}
function dashFiltered(){
  return DB.combattants.filter(c=>
    (!DASH_F.reg||regionOf(c.prefecture)===DASH_F.reg)&&
    (!DASH_F.pref||c.prefecture===DASH_F.pref)&&
    (!DASH_F.grp||c.groupe===DASH_F.grp)&&
    (!DASH_F.sexe||c.sexe===DASH_F.sexe)&&
    (!DASH_F.d1||c.creele.slice(0,10)>=DASH_F.d1)&&
    (!DASH_F.d2||c.creele.slice(0,10)<=DASH_F.d2));
}
function dashSet(k,v){ DASH_F[k]=v; if(k==="reg") DASH_F.pref=""; rDash(); }
function dashReset(){ DASH_F={reg:"",pref:"",grp:"",sexe:"",d1:"",d2:""}; rDash(); }
function rappelSauvegarde(){
  if(!DB.combattants.length) return "";
  const dernierExport=(DB.syncs||[]).find(x=>x.type==="Export");
  const j=dernierExport?Math.floor((Date.now()-new Date(dernierExport.date).getTime())/86400000):null;
  const freq=+cfg("rappelJours");
  if(!freq) return "";
  if(j!==null&&j<freq) return "";
  return `<div class="small" style="background:#EFF4FB;border:1px solid #B9CCE8;border-radius:8px;padding:9px 13px;margin-bottom:13px">⇆ <b>Rappel de sauvegarde :</b> ${j===null?"aucun fichier de synchronisation JSON n'a encore été exporté depuis ce poste":"le dernier export de synchronisation date de "+j+" jour(s)"}. Exportez régulièrement le fichier JSON (clé USB) pour consolider les données au niveau central. <span class="link" onclick="go('sauvegarde')">Ouvrir la sauvegarde</span></div>`;
}
function rDash(){
  const C=dashFiltered();
  const n=s=>C.filter(c=>c.statut===s).length;
  const armes=C.reduce((a,c)=>a+(c.desarmement?c.desarmement.armes.length:0),0);
  const enCours=C.filter(c=>["reintegration_militaire","reintegration_socio"].includes(c.statut)).length;
  const actif=Object.values(DASH_F).some(x=>x);
  const kpi=(cls,val,lbl,click)=>`<div class="kpi ${cls} ${click?"click":""}" ${click?`onclick="${click}" title="Cliquer pour ouvrir la liste"`:""}><div class="n">${val}</div><div class="l">${lbl}</div></div>`;
  const goReg=(st)=>`go('registre',{st:'${st}',pref:DASH_F.pref,grp:DASH_F.grp})`;
  const prefList=DASH_F.reg?REGIONS[DASH_F.reg].prefs:PREFECTURES;
  const demoN=DB.combattants.filter(x=>x.agent==="Poste de démonstration").length;
  $("view").innerHTML = `
  ${rappelSauvegarde()}
  ${demoN?`<div class="small" style="background:#FFF9E6;border:1px solid #E8D48A;border-radius:8px;padding:9px 13px;margin-bottom:13px">▸ <b>Mode simulation :</b> ${demoN} dossier(s) fictifs de démonstration sont chargés pour découvrir le programme. Pour repartir de zéro : ${CUR.role==="admin"?`onglet Sauvegarde → « Effacer les données locales »`:`demandez à l'administrateur d'effacer les données locales`}.</div>`:""}
  <div class="toolbar">
    <div class="field"><label>Région</label><select onchange="dashSet('reg',this.value)"><option value="">Toutes</option>${Object.entries(REGIONS).map(([r,v])=>`<option value="${esc(r)}" ${DASH_F.reg===r?"selected":""}>${v.num}. ${esc(r)}</option>`).join("")}</select></div>
    <div class="field"><label>Préfecture</label><select onchange="dashSet('pref',this.value)"><option value="">Toutes</option>${prefList.map(p=>`<option ${DASH_F.pref===p?"selected":""}>${esc(p)}</option>`).join("")}</select></div>
    <div class="field"><label>Groupe armé</label><select onchange="dashSet('grp',this.value)"><option value="">Tous</option>${GROUPES.map(g=>`<option ${DASH_F.grp===g?"selected":""}>${esc(g)}</option>`).join("")}</select></div>
    <div class="field"><label>Sexe</label><select onchange="dashSet('sexe',this.value)"><option value="">Tous</option><option value="M" ${DASH_F.sexe==="M"?"selected":""}>Masculin</option><option value="F" ${DASH_F.sexe==="F"?"selected":""}>Féminin</option></select></div>
    <div class="field"><label>Enregistrés du</label><input type="date" value="${DASH_F.d1}" onchange="dashSet('d1',this.value)"></div>
    <div class="field"><label>au</label><input type="date" value="${DASH_F.d2}" onchange="dashSet('d2',this.value)"></div>
    ${actif?`<button class="btn ghost" onclick="dashReset()">✕ Réinitialiser (${C.length}/${DB.combattants.length})</button>`:""}
  </div>
  <div class="cards">
    ${kpi("",C.length,"Ex-combattants enrôlés","go('registre',{pref:DASH_F.pref,grp:DASH_F.grp})")}
    ${kpi("c-des",n("desarme")+n("demobilise")+enCours+n("reintegre"),"Désarmés",goReg("desarme"))}
    ${kpi("c-dem",n("demobilise")+enCours+n("reintegre"),"Démobilisés",goReg("demobilise"))}
    ${kpi("c-rm",n("reintegration_militaire"),"Réint. militaire en cours",goReg("reintegration_militaire"))}
    ${kpi("c-rs",n("reintegration_socio"),"Réint. socio-éco. en cours",goReg("reintegration_socio"))}
    ${kpi("c-ok",n("reintegre"),"Réintégrés (achevé)",goReg("reintegre"))}
    ${n("rapatrie")?kpi("c-des",n("rapatrie"),"Rapatriés",goReg("rapatrie")):""}
    ${kpi("c-ab",n("abandon"),"Abandons",goReg("abandon"))}
    ${kpi("",armes,"Armes & lots collectés","go('armes')")}
  </div>
  ${(()=>{ const AL=alertesATraiter().filter(a=>C.includes(a.c)); if(!AL.length) return "";
    return `<div class="panel" style="border-left:4px solid var(--warn)"><div class="ph"><h3>⚠ À traiter (${AL.length})</h3><span class="muted small">orientations &gt; ${cfg("seuilOrientation")} j · visites &gt; ${cfg("seuilVisite")} j · formations &gt; ${cfg("seuilFormation")} j — seuils réglables dans Paramètres → Configuration</span></div><div class="pb nopad" style="max-height:230px;overflow-y:auto"><table><thead><tr><th>Signalement</th><th>Dossier</th><th>Détail</th><th></th></tr></thead><tbody>${
      AL.map(a=>`<tr><td><span class="badge ${a.grav>1?"st-abandon":"st-demobilise"}">${a.type}</span></td>
      <td><b>${a.c.num}</b> — ${esc(a.c.nom)} ${esc(a.c.prenom)}</td>
      <td class="small">${esc(a.detail)}</td>
      <td><span class="link" onclick="go('fiche','${a.c.id}')">Ouvrir</span></td></tr>`).join("")
    }</tbody></table></div></div>`; })()}
  <div class="grid2">
    <div class="panel"><div class="ph"><h3>Répartition par statut</h3><span class="muted small">cliquable</span></div><div class="pb">${
      barChart(countBy(C,c=>STATUTS[c.statut].lbl), k=>{const key=Object.keys(STATUTS).find(x=>STATUTS[x].lbl===k);return `go('registre',{st:'${key}',pref:DASH_F.pref,grp:DASH_F.grp})`;})}</div></div>
    <div class="panel"><div class="ph"><h3>Répartition par groupe armé d'origine</h3><span class="muted small">cliquable</span></div><div class="pb">${
      barChart(countBy(C,c=>c.groupe), k=>`go('registre',{grp:'${String(k).replace(/'/g,"\\'")}',pref:DASH_F.pref})`)}</div></div>
    <div class="panel"><div class="ph"><h3>Répartition par préfecture</h3><span class="muted small">cliquable</span></div><div class="pb">${
      barChart(countBy(C,c=>c.prefecture), k=>`go('registre',{pref:'${String(k).replace(/'/g,"\\'")}',grp:DASH_F.grp})`)}</div></div>
    <div class="panel"><div class="ph"><h3>Derniers dossiers ${actif?"(sélection filtrée)":""}</h3></div><div class="pb nopad">${C.length?`<table><thead><tr><th>N° dossier</th><th>Nom & prénom</th><th>Statut</th><th></th></tr></thead><tbody>${
      [...C].sort((a,b)=>b.creele.localeCompare(a.creele)).slice(0,8).map(c=>`<tr><td><b>${c.num}</b></td><td>${esc(c.nom)} ${esc(c.prenom)}</td><td><span class="badge st-${c.statut}">${STATUTS[c.statut].lbl}</span></td><td><span class="link" onclick="go('fiche','${c.id}')">Ouvrir</span></td></tr>`).join("")
    }</tbody></table>`:DB.combattants.length?`<div class="empty">Aucun dossier ne correspond aux filtres.<br><span class="link" onclick="dashReset()">Réinitialiser les filtres</span></div>`:`<div class="empty">Aucun ex-combattant enregistré pour le moment.<br>Utilisez « Nouvel enregistrement » pour ouvrir un premier dossier.${CUR&&CUR.role==="admin"?`<br><br><button class="btn sec" onclick="askSeedDemo()">Charger des données de démonstration</button>`:""}</div>`}</div></div>
  </div>`;
}

