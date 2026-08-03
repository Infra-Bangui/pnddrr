/* module: combattants/nouveau.js — PNDDRR engine (classic globals) */
/* ================= NOUVEL ENREGISTREMENT ================= */
function selOpts(arr,sel){ return arr.map(x=>`<option ${x===sel?"selected":""}>${esc(x)}</option>`).join(""); }
function rNouveau(edit){
  const c = edit ? DB.combattants.find(x=>x.id===edit) : null;
  $("view").innerHTML = `
  <div class="panel"><div class="ph"><h3>${c?`Modification du dossier ${c.num}`:"Fiche d'enregistrement individuel"}</h3></div><div class="pb">
  <form id="fEnr" onsubmit="return false">
    <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:14px">
      <div>
        <div class="photo-box" id="phBox">${c&&c.photo?`<img src="${c.photo}">`:"Photo<br>d'identité"}</div>
        <input type="file" id="phFile" accept="image/*" capture="environment" style="margin-top:7px;font-size:11.5px;border:none;padding:0">
        <div class="small muted" style="margin-top:3px">La photo est automatiquement compressée (≈300 px) pour préserver la capacité de stockage.</div>
      </div>
      <div style="flex:1">
        <div class="grid3">
          <div class="field"><label>Nom *</label><input id="e_nom" required value="${c?esc(c.nom):""}"></div>
          <div class="field"><label>Prénom(s) *</label><input id="e_prenom" required value="${c?esc(c.prenom):""}"></div>
          <div class="field"><label>Alias / nom de guerre</label><input id="e_alias" value="${c?esc(c.alias||""):""}"></div>
          <div class="field"><label>Sexe *</label><select id="e_sexe"><option ${c&&c.sexe==="M"?"selected":""} value="M">Masculin</option><option ${c&&c.sexe==="F"?"selected":""} value="F">Féminin</option></select></div>
          <div class="field"><label>Date de naissance</label><input type="date" id="e_dn" value="${c?c.dn||"":""}"></div>
          <div class="field"><label>Lieu de naissance</label><input id="e_ln" value="${c?esc(c.ln||""):""}"></div>
          <div class="field"><label>Nationalité</label><input id="e_nat" value="${c?esc(c.nat):"Centrafricaine"}"></div>
          <div class="field"><label>Téléphone</label><input id="e_tel" value="${c?esc(c.tel||""):""}"></div>
          <div class="field"><label>Situation familiale</label><select id="e_fam">${selOpts(["Célibataire","Marié(e)","Veuf(ve)","Divorcé(e)"],c?c.fam:"")}</select></div>
        </div>
      </div>
    </div>
    <h3 style="color:var(--teal-dark);margin:8px 0 10px;font-size:13.5px;text-transform:uppercase">Localisation</h3>
    <div class="grid3">
      <div class="field"><label>Région</label><select id="e_region" onchange="fillPref()">${Object.entries(REGIONS).map(([r,v])=>`<option value="${esc(r)}" ${c&&regionOf(c.prefecture)===r?"selected":""}>${v.num}. ${esc(r)}${r==="Bas-Oubangui"?" (Bangui)":""}</option>`).join("")}</select></div>
      <div class="field"><label>Préfecture *</label><select id="e_pref" onchange="fillLoc()"></select></div>
      <div class="field"><label>Sous-préfecture</label><select id="e_sp"></select><input id="e_sp_libre" placeholder="Préciser la sous-préfecture" style="display:none;margin-top:5px"></div>
      <div class="field"><label>Commune</label><select id="e_commune"></select><input id="e_commune_libre" placeholder="Préciser la commune" style="display:none;margin-top:5px"></div>
      <div class="field"><label>Site de regroupement / cantonnement</label><input id="e_site" value="${c?esc(c.site||""):""}"></div>
      <div class="field"><label>Vague d'enregistrement (générée automatiquement)</label>
      <div style="display:flex;gap:6px"><input id="e_vague" list="vagueList" style="flex:1" value="${c?esc(c.vague||""):""}" oninput="this.dataset.man='1'" placeholder="Générée selon la préfecture"><button type="button" class="btn sec sm" title="Ouvrir une nouvelle vague pour cette préfecture" onclick="$('e_vague').dataset.man='';majVague(true)">↻ Nouvelle</button></div>
      <datalist id="vagueList">${promosConnues().map(p=>`<option>${esc(p)}</option>`).join("")}</datalist>
      <div class="small muted" style="margin-top:3px">Format automatique : Vague &lt;Préfecture&gt; &lt;Année&gt;-&lt;n°&gt; — les enregistrements du jour dans la même préfecture rejoignent la même vague. Modifiable si besoin, suivie jusqu'à la formation.</div></div>
    </div>
    <h3 style="color:var(--teal-dark);margin:8px 0 10px;font-size:13.5px;text-transform:uppercase">Parcours combattant</h3>
    <div class="grid3">
      <div class="field"><label>Groupe armé d'origine *</label><div style="display:flex;gap:6px"><select id="e_grp" style="flex:1">${selOpts(GROUPES,c?c.groupe:"")}</select>${hasPerm("referentiels")?`<button type="button" class="btn sec sm" title="Ajouter un groupe armé au référentiel" onclick="quickAddGroupe()">+</button>`:""}</div></div>
      <div class="field"><label>Fonction / grade dans le groupe</label><input id="e_grade" value="${c?esc(c.grade||""):""}"></div>
      <div class="field"><label>Années passées dans le groupe</label><input type="number" min="0" id="e_annees" value="${c?c.annees||"":""}"></div>
      <div class="field"><label>Zone d'opération principale</label><input id="e_zone" value="${c?esc(c.zone||""):""}"></div>
      <div class="field"><label>Souhait de réintégration</label><select id="e_souhait">${selOpts(["Socio-économique","Militaire","Indécis"],c?c.souhait:"")}</select></div>
      <div class="field"><label>Niveau d'instruction</label><select id="e_instr">${selOpts(["Aucun","Primaire","Secondaire","Supérieur","Coranique"],c?c.instr:"")}</select></div>
    </div>
    <div class="field"><label>Observations</label><textarea id="e_obs" rows="2">${c?esc(c.obs||""):""}</textarea></div>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      ${c?`<button type="button" class="btn ghost" onclick="go('fiche','${c.id}')">Annuler</button>`:""}
      <button class="btn" type="button" onclick="submitEnr()">${c?"Enregistrer les modifications":"Ouvrir le dossier"}</button>
    </div>
  </form></div></div>`;
  window.vagueAuto = function(pref, fresh){
    const an=new Date().getFullYear(), jour=today();
    /* Même opération : réutiliser la vague des enregistrements du jour dans la même préfecture */
    if(!fresh){
      const rec=[...DB.combattants].reverse().find(x=>x.prefecture===pref&&x.vague&&x.creele&&x.creele.slice(0,10)===jour);
      if(rec) return rec.vague;
    }
    /* Sinon : numéro suivant pour la préfecture et l'année */
    const rx=new RegExp("^Vague "+pref.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+" "+an+"-(\\d+)$");
    let max=0;
    DB.combattants.forEach(x=>{ const m=x.vague&&x.vague.match(rx); if(m) max=Math.max(max,+m[1]); });
    return `Vague ${pref} ${an}-${max+1}`;
  };
  window.majVague = function(force){
    const v=$("e_vague"); if(!v) return;
    if(c&&!force) return;                       /* modification d'un dossier : conserver la vague existante */
    if(v.dataset.man==="1"&&!force) return;     /* saisie manuelle : ne pas écraser */
    v.value=vagueAuto($("e_pref").value, force===true); v.dataset.man="";
  };
  window.fillPref = function(){
    const reg=$("e_region").value;
    const list=REGIONS[reg].prefs;
    const cur=(c&&list.includes(c.prefecture))?c.prefecture:list[0];
    $("e_pref").innerHTML=list.map(p=>`<option ${p===cur?"selected":""}>${esc(p)}</option>`).join("");
    fillLoc();
  };
  window.fillLoc = function(){
    const pref=$("e_pref").value;
    const mk=(sel,libre,list,cur)=>{
      const el=$(sel), lb=$(libre);
      const inList=cur&&list.includes(cur);
      el.innerHTML='<option value="">— Non précisée —</option>'
        +list.map(x=>`<option ${x===cur?"selected":""}>${esc(x)}</option>`).join("")
        +`<option value="__autre" ${cur&&!inList?"selected":""}>Autre (préciser)…</option>`;
      lb.style.display=(cur&&!inList)?"block":"none";
      if(cur&&!inList) lb.value=cur;
      el.onchange=()=>{ lb.style.display=el.value==="__autre"?"block":"none"; };
    };
    mk("e_sp","e_sp_libre",SOUS_PREFS[pref]||[], c?c.sousPref:"");
    mk("e_commune","e_commune_libre",COMMUNES[pref]||[], c?c.commune:"");
    majVague();
  };
  fillPref();
  const locVal=(sel,libre)=>{ const v=$(sel).value; return v==="__autre"?$(libre).value.trim():v; };
  let photoData = c?c.photo||null:null;
  $("phFile").addEventListener("change",e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader();
    r.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        try{
          const MAX=300, k=Math.min(1, MAX/Math.max(img.width,img.height));
          const cv=document.createElement("canvas");
          cv.width=Math.max(1,Math.round(img.width*k)); cv.height=Math.max(1,Math.round(img.height*k));
          cv.getContext("2d").drawImage(img,0,0,cv.width,cv.height);
          const out=cv.toDataURL("image/jpeg",0.82);
          photoData = out && out.length>50 ? out : r.result;
        }catch(err){ photoData=r.result; }
        $("phBox").innerHTML=`<img src="${photoData}">`;
      };
      img.onerror=()=>{ photoData=r.result; $("phBox").innerHTML=`<img src="${photoData}">`; };
      img.src=r.result;
    };
    r.readAsDataURL(f);
  });
  window.submitEnr = function(){
    if(!$("e_nom").value.trim()||!$("e_prenom").value.trim()){ toast("Le nom et le prénom sont obligatoires."); return; }
    if(!$("e_vague").value.trim()){ toast("La vague d'enregistrement est obligatoire — elle permet le suivi jusqu'à la formation."); return; }
    const d={
      nom:$("e_nom").value.trim().toUpperCase(), prenom:$("e_prenom").value.trim(), alias:$("e_alias").value.trim(),
      sexe:$("e_sexe").value, dn:$("e_dn").value, ln:$("e_ln").value.trim(), nat:$("e_nat").value.trim(), tel:$("e_tel").value.trim(),
      fam:$("e_fam").value, prefecture:$("e_pref").value, sousPref:locVal("e_sp","e_sp_libre"), commune:locVal("e_commune","e_commune_libre"), site:$("e_site").value.trim(), vague:$("e_vague").value.trim(),
      groupe:$("e_grp").value, grade:$("e_grade").value.trim(), annees:$("e_annees").value, zone:$("e_zone").value.trim(),
      souhait:$("e_souhait").value, instr:$("e_instr").value, obs:$("e_obs").value.trim(), photo:photoData
    };
    if(c){ Object.assign(c,d); log("Modification dossier",`${c.num} — ${c.nom} ${c.prenom}`); toast("Dossier mis à jour."); go("fiche",c.id); }
    else{
      const nc = Object.assign({ id:"c"+Date.now(), num:numDossier(), statut:"enregistre", creele:new Date().toISOString(), agent:CUR.login,
        desarmement:null, demobilisation:null, reintMil:null, reintSocio:null, fin:null, abandon:null }, d);
      DB.combattants.push(nc);
      log("Enregistrement",`Ouverture du dossier ${nc.num} — ${nc.nom} ${nc.prenom} (${nc.groupe}, ${nc.vague})`);
      toast(`Dossier ${nc.num} ouvert.`); go("fiche",nc.id);
    }
  };
  $("fEnr").addEventListener("submit",e=>{ e.preventDefault(); submitEnr(); });
}

