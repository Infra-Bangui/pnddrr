/* module: stats/stats.js — PNDDRR engine (classic globals) */
/* ================= STATISTIQUES DU PROGRAMME ================= */
function trancheAge(c){
  const a=age(c.dn);
  if(a==="—") return "Âge inconnu";
  if(a<18) return "Moins de 18 ans";
  if(a<=25) return "18–25 ans";
  if(a<=35) return "26–35 ans";
  if(a<=45) return "36–45 ans";
  return "46 ans et plus";
}
function moisFR(k){ const [a,m]=k.split("-"); return ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."][+m-1]+" "+a; }
function statsData(){
  const C=DB.combattants, A=allArmes(), MU=allMunitions();
  const ord=c=>STATUTS[c.statut].ord;
  const desTot=C.filter(c=>c.desarmement||ord(c)>=2&&c.statut!=="abandon").length;
  const demTot=C.filter(c=>c.demobilisation).length;
  const enReint=C.filter(c=>["reintegration_militaire","reintegration_socio"].includes(c.statut)).length;
  const reint=C.filter(c=>c.statut==="reintegre").length;
  const aband=C.filter(c=>c.statut==="abandon").length;
  const appui=C.reduce((a,c)=>a+(c.reintSocio&&c.reintSocio.appui?+c.reintSocio.appui:0),0);
  const visites=C.reduce((a,c)=>a+(c.reintSocio?c.reintSocio.visites.length:0),0);
  const pct=(n,d)=>d?Math.round(n/d*1000)/10:0;
  const parMois=(fn)=>{ const m={}; C.forEach(c=>{ const v=fn(c); if(v) m[v.slice(0,7)]=(m[v.slice(0,7)]||0)+1; }); return Object.entries(m).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>[moisFR(k),v]); };
  return {C,A,MU,desTot,demTot,enReint,reint,aband,appui,visites,pct,
    sexe:countBy(C,c=>c.sexe==="M"?"Hommes":"Femmes"),
    ages:countBy(C,trancheAge),
    groupes:countBy(C,c=>c.groupe),
    regions:countBy(C,c=>regionOf(c.prefecture)),
    prefs:countBy(C,c=>c.prefecture),
    statuts:countBy(C,c=>STATUTS[c.statut].lbl),
    voies:countBy(C.filter(c=>c.reintMil||c.reintSocio),c=>c.reintMil?"Militaire":"Socio-économique"),
    filieres:countBy(C.filter(c=>c.reintSocio),c=>c.reintSocio.filiere),
    corps:countBy(C.filter(c=>c.reintMil),c=>c.reintMil.corps),
    armesType:countBy(A,a=>a.type),
    armesEtat:countBy(A,a=>a.etat),
    munUnites:(()=>{const m={};MU.forEach(x=>m[x.unite]=(m[x.unite]||0)+x.qte);return Object.entries(m).sort((a,b)=>b[1]-a[1]);})(),
    moisEnr:parMois(c=>c.creele),
    moisDes:parMois(c=>c.desarmement&&c.desarmement.date)};
}
function rStats(){
  const S=statsData(); const T=S.C.length;
  $("view").innerHTML = `
  <div class="toolbar">
    <div class="muted small" style="flex:1;align-self:center">Statistiques calculées en temps réel sur ${T} dossier(s) — arrêtées au ${new Date().toLocaleDateString("fr-FR")}.</div>
    <button class="btn sec" onclick="exportStatsCSV()">Exporter CSV</button>
    <button class="btn sec" onclick="printStats()">Imprimer le rapport / PDF</button>
  </div>
  <div class="cards">
    <div class="kpi"><div class="n">${T}</div><div class="l">Ex-combattants enrôlés</div></div>
    <div class="kpi c-des"><div class="n">${S.desTot}</div><div class="l">Désarmés (${S.pct(S.desTot,T)} %)</div></div>
    <div class="kpi c-dem"><div class="n">${S.demTot}</div><div class="l">Démobilisés (${S.pct(S.demTot,T)} %)</div></div>
    <div class="kpi c-rm"><div class="n">${S.enReint}</div><div class="l">Réintégration en cours</div></div>
    <div class="kpi c-ok"><div class="n">${S.reint}</div><div class="l">Réintégrés (${S.pct(S.reint,T)} %)</div></div>
    <div class="kpi c-ab"><div class="n">${S.aband}</div><div class="l">Abandons (${S.pct(S.aband,T)} %)</div></div>
    <div class="kpi"><div class="n">${S.A.length}</div><div class="l">Armes collectées</div></div>
    <div class="kpi c-dem"><div class="n">${S.MU.length}</div><div class="l">Lots de munitions</div></div>
    <div class="kpi c-rs"><div class="n">${fmtN(S.appui)}</div><div class="l">Appui financier (FCFA)</div></div>
    <div class="kpi"><div class="n">${S.visites}</div><div class="l">Visites de suivi</div></div>
  </div>
  <div class="grid2">
    <div class="panel"><div class="ph"><h3>Répartition par statut</h3></div><div class="pb">${barChart(S.statuts)}</div></div>
    <div class="panel"><div class="ph"><h3>Répartition par sexe</h3></div><div class="pb">${barChart(S.sexe)}</div></div>
    <div class="panel"><div class="ph"><h3>Répartition par tranche d'âge</h3></div><div class="pb">${barChart(S.ages)}</div></div>
    <div class="panel"><div class="ph"><h3>Répartition par groupe armé</h3></div><div class="pb">${barChart(S.groupes)}</div></div>
    <div class="panel"><div class="ph"><h3>Répartition par région</h3></div><div class="pb">${barChart(S.regions)}</div></div>
    <div class="panel"><div class="ph"><h3>Répartition par préfecture</h3></div><div class="pb">${barChart(S.prefs)}</div></div>
    <div class="panel"><div class="ph"><h3>Voies de réintégration</h3></div><div class="pb">${barChart(S.voies)}</div></div>
    <div class="panel"><div class="ph"><h3>Filières socio-économiques</h3></div><div class="pb">${barChart(S.filieres)}</div></div>
    <div class="panel"><div class="ph"><h3>Corps d'incorporation (voie militaire)</h3></div><div class="pb">${barChart(S.corps)}</div></div>
    <div class="panel"><div class="ph"><h3>Armes par type</h3></div><div class="pb">${barChart(S.armesType)}</div></div>
    <div class="panel"><div class="ph"><h3>Armes par état</h3></div><div class="pb">${barChart(S.armesEtat)}</div></div>
    <div class="panel"><div class="ph"><h3>Munitions par unité (quantités)</h3></div><div class="pb">${barChart(S.munUnites)}</div></div>
    <div class="panel"><div class="ph"><h3>Enregistrements par mois</h3></div><div class="pb">${barChart(S.moisEnr)}</div></div>
    <div class="panel"><div class="ph"><h3>Désarmements par mois</h3></div><div class="pb">${barChart(S.moisDes)}</div></div>
  </div>`;
}
function statsSections(){
  const S=statsData();
  return [["Statuts",S.statuts],["Sexe",S.sexe],["Tranches d'âge",S.ages],["Groupes armés",S.groupes],
    ["Régions",S.regions],["Préfectures",S.prefs],["Voies de réintégration",S.voies],
    ["Filières socio-économiques",S.filieres],["Corps d'incorporation",S.corps],
    ["Armes par type",S.armesType],["Armes par état",S.armesEtat],["Munitions par unité",S.munUnites],
    ["Enregistrements par mois",S.moisEnr],["Désarmements par mois",S.moisDes]];
}
function exportStatsCSV(){
  const S=statsData();
  const rows=[["Section","Catégorie","Valeur"]];
  rows.push(["Indicateurs","Ex-combattants enrôlés",S.C.length],["Indicateurs","Désarmés",S.desTot],
    ["Indicateurs","Démobilisés",S.demTot],["Indicateurs","Réintégration en cours",S.enReint],
    ["Indicateurs","Réintégrés",S.reint],["Indicateurs","Abandons",S.aband],
    ["Indicateurs","Armes collectées",S.A.length],["Indicateurs","Lots de munitions",S.MU.length],
    ["Indicateurs","Appui financier (FCFA)",S.appui],["Indicateurs","Visites de suivi",S.visites]);
  statsSections().forEach(([sec,pairs])=>pairs.forEach(([k,v])=>rows.push([sec,k,v])));
  dl(`pnddrr_statistiques_${today()}.csv`, csv(rows), "text/csv");
  log("Export CSV","Statistiques du programme"); toast("Statistiques CSV téléchargées.");
}
function printStats(){
  const S=statsData(); const T=S.C.length;
  const tbl=(titre,pairs)=>pairs.length?`<h3 style="font-size:13px;margin-top:12px;text-decoration:underline">${titre}</h3>
    <table class="dt"><tr><th>Catégorie</th><th style="text-align:right">Effectif</th></tr>${
    pairs.map(([k,v])=>`<tr><td>${esc(String(k))}</td><td style="text-align:right">${fmtN(v)}</td></tr>`).join("")}</table>`:"";
  doPrint(docWrap(`${docEntete("Rapport statistique du programme")}
    <h2 class="titre">Rapport statistique</h2>
    <p>Arrêté au ${new Date().toLocaleDateString("fr-FR")}, le programme compte <b>${T}</b> ex-combattant(s) enrôlé(s), dont
    <b>${S.desTot}</b> désarmé(s) (${S.pct(S.desTot,T)} %), <b>${S.demTot}</b> démobilisé(s), <b>${S.enReint}</b> en parcours de réintégration,
    <b>${S.reint}</b> réintégré(s) (${S.pct(S.reint,T)} %) et <b>${S.aband}</b> abandon(s). <b>${S.A.length}</b> arme(s) et <b>${S.MU.length}</b> lot(s)
    de munitions ont été collectés. L'appui financier versé s'élève à <b>${fmtN(S.appui)} FCFA</b> et <b>${S.visites}</b> visite(s) de suivi ont été réalisées.</p>
    ${statsSections().map(([t,p])=>tbl(t,p)).join("")}
    <div class="sig"><div class="c"></div><div class="c">Fait à ${esc(cfg("villeSignature")||"Bangui")}, le ${new Date().toLocaleDateString("fr-FR")}<br>Pour le PNDDRR<div class="ligne">${esc(CUR.nom)}</div></div></div>`));
  log("Impression","Rapport statistique");
}
