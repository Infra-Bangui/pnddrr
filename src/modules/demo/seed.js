/* module: demo/seed.js — PNDDRR engine (classic globals) */
/* ================= DONNÉES DE DÉMONSTRATION (SIMULATION) ================= */
function seedRng(seed){ let a=seed>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function seedDemo(n, silent){
  n=n||60;
  const rnd=seedRng(2026), pick=a=>a[Math.floor(rnd()*a.length)], chance=p=>rnd()<p;
  const NOMS=["NGOUMBA","SANZE","YAKA","DOKO","GBAZALE","KOSSI","MOKO","BAILA","WILI","MANDJEKA","KPENGO","OUAMBI","YAMBELE","NDOUBA","SEREMALE","BANGA","MBOLI","DEKO","PAMBA","GREKOMBO","NAKOMBO","ZOUNGOULA","BEFIO","MAZANGUE","KONGBO"];
  const PM=["Jean","Pierre","Fidèle","Marcel","Ghislain","Rodrigue","Éric","Serge","Boris","Aristide","Dieudonné","Christian","Armel","Brice","Sylvain","Parfait","Igor","Junior"];
  const PF=["Marie","Rosine","Alice","Chantal","Nadège","Grâce","Paméla","Sandrine","Élodie","Clarisse","Mireille","Olga"];
  const iso=j=>{ const dte=new Date(Date.now()-j*86400000); return dte.toISOString(); };
  const jour=j=>iso(j).slice(0,10);
  const grpChoix=GROUPES.filter(g=>g!=="Autre");
  let serie=1000;
  const cibles=[]; for(let i=0;i<n;i++){ const r=rnd();
    cibles.push(r<.14?"enregistre":r<.34?"desarme":r<.48?"demobilise":r<.60?"reintegration_militaire":r<.78?"reintegration_socio":r<.93?"reintegre":"abandon"); }
  let crees=0;
  for(const cible of cibles){
    const sexe=chance(.86)?"M":"F";
    const pref=pick(PREFECTURES);
    const sp=(SOUS_PREFS[pref]&&SOUS_PREFS[pref].length)?pick(SOUS_PREFS[pref]):"";
    const com=(COMMUNES[pref]&&COMMUNES[pref].length)?pick(COMMUNES[pref]):"";
    const j0=30+Math.floor(rnd()*330);   /* enregistrement : entre 1 et 12 mois */
    const c={ id:"demo"+Date.now()+"_"+(crees++)+Math.floor(rnd()*1e4), num:numDossier(), statut:"enregistre",
      creele:iso(j0), agent:"Poste de démonstration",
      nom:pick(NOMS), prenom:sexe==="M"?pick(PM):pick(PF), alias:chance(.3)?pick(["Cobra","Tigre","Rambo","Delta","Sultan","Fantôme","Scorpion","Colonel"]):"",
      sexe, dn:`${1975+Math.floor(rnd()*32)}-${String(1+Math.floor(rnd()*12)).padStart(2,"0")}-${String(1+Math.floor(rnd()*28)).padStart(2,"0")}`,
      ln:sp||pref, nat:"Centrafricaine", tel:chance(.6)?"7"+String(2000000+Math.floor(rnd()*7999999)):"",
      fam:pick(["Célibataire","Marié(e)","Marié(e)","Veuf(ve)","Union libre"]), prefecture:pref, sousPref:sp, commune:com, site:sp||pref,
      vague:pick(["Vague Bambari 2026-1","Vague Bouar 2026-2","Vague Kaga-Bandoro 2026-1","Vague Bria 2025-4","Vague Berbérati 2026-1"]),
      groupe:pick(grpChoix), grade:pick(["","","Combattant","Chef d'équipe","Chef de groupe","Commandant de zone"]),
      annees:String(1+Math.floor(rnd()*10)), zone:sp||pref, souhait:pick(["Militaire","Socio-économique","Indécis"]),
      instr:pick(["Aucun","Primaire","Primaire","Secondaire","Coranique"]), obs:"Dossier de démonstration (simulation)", photo:null,
      desarmement:null, demobilisation:null, reintMil:null, reintSocio:null, fin:null, abandon:null };
    const ordre=["enregistre","desarme","demobilise","reintegration_militaire","reintegration_socio","reintegre","abandon"];
    const avance=ordre.indexOf(cible);
    let j=j0;
    if(avance>=1&&cible!=="abandon"||cible==="abandon"&&chance(.7)){
      j-=3+Math.floor(rnd()*10);
      const armes=[]; const na=chance(.12)?0:1+Math.floor(rnd()*2);
      for(let a=0;a<na;a++){ const t=pick(TYPES_ARMES.filter(x=>x!=="Munitions (lot)"));
        armes.push({type:t, marque:t.includes("AK")?pick(["Type 56","AKM","Zastava M70"]):chance(.5)?pick(["Norinco","Baïkal","Artisanale","MAT-49"]):"", calibre:t.includes("AK")||t.includes("PKM")?"7,62 mm":chance(.5)?pick(["9 mm","12 mm","5,45 mm"]):"", serie:chance(.75)?"SN-"+(serie++):"", etat:pick(["Fonctionnelle","Fonctionnelle","Fonctionnelle","Défectueuse","Hors d'usage"]), mun:""}); }
      const munitions=[]; if(chance(.45)) munitions.push({nature:pick(["7,62×39 mm","5,45 mm","9 mm","12,7 mm"]), qte:10+Math.floor(rnd()*290), unite:"cartouches", obs:""});
      if(chance(.15)) munitions.push({nature:"Grenades défensives", qte:1+Math.floor(rnd()*5), unite:"grenades", obs:""});
      c.desarmement={date:jour(j), lieu:sp||pref, agent:"Poste de démonstration", armes, munitions};
      c.statut="desarme";
    }
    if(avance>=2&&avance<=5&&cible!=="reintegration_socio"||cible==="reintegration_socio"&&chance(.6)||cible==="reintegre"&&true){
      if(c.desarmement&&(avance>=2)&&cible!=="abandon"&&!(cible==="reintegration_socio"&&chance(.3))){
        j-=5+Math.floor(rnd()*20);
        c.demobilisation={date:jour(j), lieu:pick(["Bangui","Bouar","Bambari","Kaga-Bandoro","Bria"]), carte:numDem()};
        c.statut="demobilise";
      }
    }
    if(["reintegration_militaire","reintegration_socio","reintegre"].includes(cible)&&c.desarmement){
      j-=5+Math.floor(rnd()*25);
      const mil=cible==="reintegration_militaire"||cible==="reintegre"&&chance(.4);
      if(mil){
        c.reintMil={corps:pick(CORPS), unite:pick(["1er BIT","2e BIT","BSS","Zone de défense n°3","Compagnie de Bouar","Escadron de Bambari"]), matricule:"FACA-"+(1000+Math.floor(rnd()*9000)), date:jour(j), formation:pick(["Formation initiale de 3 mois","Recyclage militaire","Formation commune de base"])};
        c.statut="reintegration_militaire";
      } else {
        c.reintSocio={filiere:pick(FILIERES.filter(f=>f!=="Autre")), centre:pick(["Centre de Bangui","Centre de Bouar","Centre de Bambari","Centre de Berbérati","ONG partenaire"]), duree:pick(["3 mois","6 mois","9 mois"]), date:jour(j), kit:chance(.7), kitDate:chance(.7)?jour(j-20):"", appui:chance(.8)?String(50000+Math.floor(rnd()*9)*25000):"", visites:[]};
        c.statut="reintegration_socio";
        const nv=Math.floor(rnd()*3);
        for(let v=0;v<nv;v++) c.reintSocio.visites.push({date:jour(Math.max(2,j-10-v*25)), agent:"Chargé de suivi & évaluation", appr:pick(["Satisfaisant","Satisfaisant","Moyen","Préoccupant"]), obs:pick(["Activité en progression","Assiduité correcte","Difficultés d'approvisionnement","Bonne insertion dans la communauté"])});
      }
      const r=reintOf(c);
      r.promo=c.vague;
      if(chance(.6)){ r.formFin=jour(Math.max(2,j-15)); r.formNote="Formation achevée avec succès"+(r.promo?` (promotion ${r.promo})`:""); }
      if(r.formFin&&chance(.6)){ r.vieDate=jour(Math.max(1,j-30)); r.vieDetail=c.reintMil?c.reintMil.unite:("Activité : "+c.reintSocio.filiere); }
      if(cible==="reintegre"){
        c.fin=jour(Math.max(1,j-35)); c.statut="reintegre";
        if(!r.formFin){ r.formFin=c.fin; r.formNote="Considérée achevée à la clôture du parcours"; }
        if(!r.vieDate){ r.vieDate=c.fin; r.vieDetail=c.reintMil?"Intégration confirmée à la clôture":"Intégration à la vie civile confirmée à la clôture"; }
      }
    }
    if(cible==="abandon"){ c.statut="abandon"; c.abandon={date:jour(Math.max(1,j-10)), motif:pick(["Départ volontaire du site","Absence prolongée non justifiée","Retour dans la zone d'origine","Refus de l'orientation proposée"])}; }
    DB.combattants.push(c);
  }
  if(silent){ persist(); return; }
  log("Simulation",`${n} dossier(s) de démonstration générés`);
  toast(`${n} dossiers de démonstration ajoutés — la simulation est prête.`);
  go('dashboard');
}
/* Premier démarrage : pré-charger la simulation (60 ex-combattants fictifs) pour découvrir le programme.
   L'effacement des données locales laisse ensuite l'appareil vierge (marqueur pnddrr_skip_demo). */
try{
  if(DB.combattants.length===0 && !(HAS_LS&&localStorage.getItem("pnddrr_skip_demo"))){
    seedDemo(60,true); DEMO_PRELOADED=true;
  }
}catch(e){}
function askSeedDemo(){
  openModal("Charger des données de démonstration", `
    <p>Cette action va générer <b>60 dossiers fictifs</b> couvrant tout le circuit — enregistrements, désarmements (armes et munitions), démobilisations, réintégrations militaires et socio-économiques avec jalons et visites, parcours clôturés et abandons — répartis sur les préfectures et les 12 derniers mois.</p>
    <p class="small muted" style="margin-top:8px">Les dossiers portent la mention « Dossier de démonstration (simulation) » et s'ajoutent aux données existantes${DB.combattants.length?` (${DB.combattants.length} dossier(s) actuellement)`:""}. Pour repartir à zéro ensuite : Sauvegarde → Effacer les données locales.</p>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="closeModal();seedDemo(60)">Générer la simulation</button>`);
}

