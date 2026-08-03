/* module: referentials/data.js — PNDDRR engine (classic globals) */
/* ---------- Référentiels ---------- */
/* Découpage administratif issu de la loi 21-001 du 21 janvier 2021 :
   7 régions, 20 préfectures, 85 sous-préfectures. */
const PREFECTURES = ["Bangui","Bamingui-Bangoran","Basse-Kotto","Haut-Mbomou","Haute-Kotto","Kémo","Lim-Pendé","Lobaye","Mambéré","Mambéré-Kadéï","Mbomou","Nana-Grébizi","Nana-Mambéré","Ombella-M'Poko","Ouaka","Ouham","Ouham-Fafa","Ouham-Pendé","Sangha-Mbaéré","Vakaga"];
const CHEF_LIEUX = {"Bangui":"Bangui","Bamingui-Bangoran":"Ndélé","Basse-Kotto":"Mobaye","Haut-Mbomou":"Obo","Haute-Kotto":"Bria","Kémo":"Sibut","Lim-Pendé":"Paoua","Lobaye":"Mbaïki","Mambéré":"Carnot","Mambéré-Kadéï":"Berbérati","Mbomou":"Bangassou","Nana-Grébizi":"Kaga-Bandoro","Nana-Mambéré":"Bouar","Ombella-M'Poko":"Boali","Ouaka":"Bambari","Ouham":"Bossangoa","Ouham-Fafa":"Batangafo","Ouham-Pendé":"Bozoum","Sangha-Mbaéré":"Nola","Vakaga":"Birao"};
const REGIONS = {
  "Plateaux":       {chef:"Boali",     coord:[18.12,4.80], prefs:["Ombella-M'Poko","Lobaye"], num:1},
  "Équateur":       {chef:"Berbérati", coord:[15.79,4.26], prefs:["Nana-Mambéré","Mambéré","Mambéré-Kadéï","Sangha-Mbaéré"], num:2},
  "Yadé":           {chef:"Bossangoa", coord:[17.45,6.49], prefs:["Ouham","Ouham-Fafa","Ouham-Pendé","Lim-Pendé"], num:3},
  "Kagas":          {chef:"Sibut",     coord:[19.08,5.72], prefs:["Kémo","Nana-Grébizi","Ouaka"], num:4},
  "Fertit":         {chef:"Bria",      coord:[21.99,6.54], prefs:["Vakaga","Bamingui-Bangoran","Haute-Kotto"], num:5},
  "Haut-Oubangui":  {chef:"Bangassou", coord:[22.82,4.74], prefs:["Basse-Kotto","Mbomou","Haut-Mbomou"], num:6},
  "Bas-Oubangui":   {chef:"Bangui",    coord:[18.55,4.36], prefs:["Bangui"], num:7}
};
function regionOf(pref){ for(const [r,v] of Object.entries(REGIONS)) if(v.prefs.includes(pref)) return r; return "—"; }
/* Référentiel des sous-préfectures et communes — d'après la carte officielle
   « Découpage administratif - Centrafrique », Laboratoire de Cartographie, ICASEES. */
const SOUS_PREFS={"Ombella-M'Poko":["Boali","Damara","Bogangolo","Yaloké","Bossembélé"],"Lobaye":["Mbaïki","Mongoumba","Boda","Boganangone","Boganda","Moboma"],"Mambéré-Kadéï":["Berbérati","Gamboula","Sosso-Nakombo","Dédé-Mokouba"],"Nana-Mambéré":["Bouar","Baoro","Baboua","Abba"],"Sangha-Mbaéré":["Nola","Bambio","Bayanga"],"Mambéré":["Carnot","Amada-Gaza","Gadzi","Senkpa-Mbaéré"],"Ouham-Pendé":["Bozoum","Bocaranga","Koui","Bossemptélé"],"Ouham":["Bossangoa","Nana-Bakassa","Markounda","Nanga-Boguila"],"Ouham-Fafa":["Batangafo","Bouca","Kabo","Sido"],"Lim-Pendé":["Paoua","Ndim","Ngaoundaye","Kodi"],"Kémo":["Sibut","Dékoa","Mala","Ndjoukou"],"Nana-Grébizi":["Kaga-Bandoro","Mbrès","Nana-Outa"],"Ouaka":["Bambari","Bakala","Grimari","Kouango","Ippy"],"Bamingui-Bangoran":["Ndélé","Bamingui"],"Haute-Kotto":["Bria","Ouadda","Yalinga","Ouandja-Kotto"],"Vakaga":["Birao","Ouanda-Djallé","Ouandja","Am-Dafock"],"Basse-Kotto":["Mobaye","Alindao","Kembé","Mingala","Zangba","Satéma"],"Mbomou":["Bangassou","Ouango","Gambo","Rafaï","Bakouma"],"Haut-Mbomou":["Obo","Bambouti","Zémio","Djémah","Mboki"],"Bangui":["Bangui-Rapides","Bangui-Fleuve","Bangui-Centre","Bangui-Kagas"]};
const COMMUNES={"Vakaga":["Am-Dafock","Ouandja","Ridina","Vokouma"],"Haute-Kotto":["Daba-Nydou","Daho-Mboutou","Ouadda","Ouandja-Kotto","Samba-Boungou","Yalinga"],"Haut-Mbomou":["Djémah","Zémio"],"Kémo":["Dékoa","Galabadja","Galafondo","Guifa","Mala","Ngoumbélé","Sibut","Tilo"],"Ouaka":["Azéngué-Mindou","Baïdou-Ngoumbrou","Cochio-Toulou","Danga-Gboudou","Haute-Baïdou","Ippy","Kobadja","Kouango","Koudoubégo","Lissa","Ngougbia","Pladama-Ouaka","Pouyamba","Yéngou"],"Basse-Kotto":["Bakou","Bangui-Ketté","Guiligui","Kotto","Kotto-Oubangui","Kémbé","M'boui","Mbélima","Mobaye","Ouambe","Siriki","Séliba","Yabongo","Yambélé"],"Mbomou":["Bakouma","Bazouma","Gambo","Ngandou","Ouango","Ouara","Rafaï/Chinko","Sayo-Niakari","Vougba-Balifondo","Zangandou-Mada"],"Ombella-M'Poko":["Boali","Bogangolo","Bossembélé","Damara","Guézéli","La Mbi","Yaloké"],"Bangui":["Arrondissement 1","Arrondissement 2","Arrondissement 3","Arrondissement 4","Arrondissement 5","Arrondissement 6","Arrondissement 7","Arrondissement 8","Arrondissement 9","Bimbo","Bégoua"],"Lobaye":["Baléloko","Boganda","Bogongo-Gaza","Boutélossi","Lessé","Lobaye","Mbaiki","Mbata","Moboma","Mongoumba","Nola","Pissa"],"Bamingui-Bangoran":["Dar-El-Kouti","Mbolo-Kpata","Vassako"],"Ouham":["Bakassa","Ben-Zambé","Bouca-Bobo","Bédé","Hama","Koro-M'poko","Nana-Bakassa","Nana-Markounda","Nanga-Boguila","Ndoro-Mboli","Ouham-Bac","Soumbe"],"Ouham-Pendé":["Binon","Birvan-Bolé","Bocaranga","Dan-Gbabiri","Daneyérin","Kouazo","Koui","Malé"],"Sangha-Mbaéré":["Basse-Kadéï","Bilolo","Mbaéré","Nola","Salo"],"Nana-Mambéré":["Abba","Baboua","Bawi-Tédoua","Bingué","Béa-Nana","Doaka-Koursou","Goudrot","Herman-Brousse","Nadziboro","Niem-Yéléwa","Yenga","Yoro-Samba-Bougoulou","Zotoua-Banguérèm"],"Mambéré-Kadéï":["Basse-Batouri","Basse-Boumbé","Basse-Mambéré","Haute-Batouri","Haute-Kadéï","Ouakanga","Senkpa-M'baéré"],"Nana-Grébizi":["Botto","Grevaï","M'brès","Nana","Ndenga"],"Lim-Pendé":["Bah-Bessar","Banh","Bimbi","Dilouki","Kodi","Loura","Mbili","Mia-Péndé","Nana-Barya","Paoua","Péndé","Yémé"],"Ouham-Fafa":["Fafa-Boungou","Kabo","Ladi-Gbawi","Ouaki","Ouassi","Ouham-Fafa","Sido"],"Mambéré":["Carnot","Haute-Boumbé","Mbali","Topia"]};

const DEFAULT_GROUPES = ["Ex-Séléka / FPRC","UPC","MPC","3R","Anti-Balaka (aile Mokom)","Anti-Balaka (aile Ngaïssona)","RJ (Révolution et Justice)","MLCJ","Siriri","Autre"];
var GROUPES = DEFAULT_GROUPES.slice();  /* pointe vers DB.groupes après initialisation */
const CORPS = ["Forces Armées Centrafricaines (FACA)","Gendarmerie Nationale","Police Nationale","Douanes","Eaux et Forêts","Protection Civile"];
const FILIERES = ["Agriculture","Élevage","Pêche / pisciculture","Menuiserie","Maçonnerie","Couture","Mécanique","Soudure","Coiffure","Commerce / AGR","Boulangerie","Conduite / transport","Autre"];
const TYPES_ARMES = ["Fusil d'assaut AK-47 / dérivés","Fusil PMAK","Fusil de chasse artisanal","Pistolet automatique","Pistolet mitrailleur","Fusil mitrailleur (PKM…)","Lance-roquettes RPG-7","Grenade","Munitions (lot)","Machette / arme blanche","Autre"];
const STATUTS = {
  enregistre:{lbl:"Enregistré",ord:1},
  desarme:{lbl:"Désarmé",ord:2},
  demobilise:{lbl:"Démobilisé",ord:3},
  reintegration_militaire:{lbl:"Réintégration militaire",ord:4},
  reintegration_socio:{lbl:"Réintégration socio-éco.",ord:4},
  reintegre:{lbl:"Réintégré",ord:5},
  rapatrie:{lbl:"Rapatrié",ord:5},
  abandon:{lbl:"Abandon",ord:0}
};

