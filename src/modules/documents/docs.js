/* module: documents/docs.js — PNDDRR engine (classic globals) */
/* ================= DOCUMENTS IMPRIMABLES ================= */
function docEntete(service){
  return `<div class="entete">
    <div class="rep">République Centrafricaine</div>
    <div class="devise">Unité — Dignité — Travail</div>
    <div class="armoiries">${ARM_SVG}</div>
    <div class="min">Unité d'exécution du Programme national de désarmement,<br>démobilisation, réintégration et rapatriement</div>
    ${service?`<div class="min" style="margin-top:3px;font-size:11.5px">${service}</div>`:""}
    <div class="trait"></div>
  </div>`;
}
function docWrap(inner){
  return `<div class="doc"><div class="wm">${ARM_SVG}</div><div class="inner">${inner}</div></div>`;
}
function doPrint(html, kind){
  document.body.classList.toggle("print-pvc", kind==="pvc");
  const zone=$("printZone");
  if(zone && zone.parentNode!==document.body) document.body.appendChild(zone);
  zone.innerHTML = html;
  zone.className = kind==="pvc" ? "pvc" : "";
  $("prevBody").innerHTML = html;
  $("prevBody").className = kind==="pvc" ? "pvc" : "";
  const ttl=document.querySelector("#printPrev .pp-bar b");
  if(ttl) ttl.textContent = kind==="pvc" ? "Aperçu carte PVC — 8,5 × 5,5 cm (une face par page)" : "Aperçu du document";
  $("printPrev").style.display = "flex";
  document.body.style.overflow = "hidden";
}
function prevClose(){
  $("printPrev").style.display="none";
  document.body.style.overflow="";
  document.body.classList.remove("print-pvc");
  $("prevBody").className="";
  $("printZone").innerHTML="";
  $("printZone").className="";
  const frame=document.getElementById("pnddrrPrintFrame");
  if(frame) frame.remove();
}
function prevPrint(){
  const pvc=document.body.classList.contains("print-pvc");
  const markup=($("printZone")&&$("printZone").innerHTML)||($("prevBody")&&$("prevBody").innerHTML);
  if(!markup){ toast("Rien à imprimer."); return; }
  let frame=document.getElementById("pnddrrPrintFrame");
  if(frame) frame.remove();
  frame=document.createElement("iframe");
  frame.id="pnddrrPrintFrame";
  frame.setAttribute("aria-hidden","true");
  frame.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none";
  document.body.appendChild(frame);
  const doc=frame.contentDocument;
  const headBits=[...document.querySelectorAll("link[rel='stylesheet'], style")].map(n=>n.outerHTML).join("");
  const page=pvc?"size:85mm 55mm;margin:0":"size:A4 portrait;margin:12mm";
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Impression PNDDRR</title>${headBits}
<style>
@page{${page}}
html,body{margin:0!important;padding:0!important;background:#fff!important;height:auto!important;overflow:visible!important}
body>*:not(#printZone){display:none!important}
#printZone{display:block!important;visibility:visible!important;position:static!important;left:auto!important;top:auto!important;width:${pvc?"85mm":"auto"}!important;height:auto!important}
#printZone *{visibility:visible!important}
</style></head>
<body class="${pvc?"print-pvc":""}"><div id="printZone" class="${pvc?"pvc":""}">${markup}</div></body></html>`);
  doc.close();
  let printed=false;
  const run=()=>{
    if(printed) return;
    printed=true;
    try{ frame.contentWindow.focus(); frame.contentWindow.print(); }
    catch(e){ toast("Impression indisponible dans cet aperçu — utilisez Chrome, Edge ou Firefox."); }
  };
  const links=[...doc.querySelectorAll("link[rel='stylesheet']")];
  if(!links.length){ setTimeout(run, 80); return; }
  let left=links.length;
  const one=()=>{ left-=1; if(left<=0) setTimeout(run, 80); };
  links.forEach(l=>{
    if(l.sheet){ one(); return; }
    l.addEventListener("load", one);
    l.addEventListener("error", one);
  });
  setTimeout(run, 1200);
}
function printFiche(id){
  const c=DB.combattants.find(x=>x.id===id);
  const arm = c.desarmement ? `<h3 style="font-size:13px;margin-top:14px;text-decoration:underline">Armement remis (${fmtD(c.desarmement.date)} — ${esc(c.desarmement.lieu)})</h3>
    <table class="dt"><tr><th>Type</th><th>Marque</th><th>Calibre</th><th>N° série</th><th>État</th><th>Munitions</th></tr>${
    c.desarmement.armes.map(a=>`<tr><td>${esc(a.type)}</td><td>${esc(a.marque)||"—"}</td><td>${esc(a.calibre)||"—"}</td><td>${esc(a.serie)||"—"}</td><td>${esc(a.etat)}</td><td>${esc(a.mun)||"—"}</td></tr>`).join("")}</table>${(c.desarmement.munitions||[]).length?`<p style="margin-top:4px"><b>Munitions et explosifs :</b> ${c.desarmement.munitions.map(m=>`${fmtN(m.qte)} ${esc(m.unite)}${m.nature?" ("+esc(m.nature)+")":""}`).join(" ; ")}</p>`:""}` : "";
  let reint="";
  if(c.reintMil) reint=`<h3 style="font-size:13px;margin-top:14px;text-decoration:underline">Réintégration militaire</h3>
    <table class="dt"><tr><th>Corps</th><td>${esc(c.reintMil.corps)}</td><th>Matricule</th><td>${esc(c.reintMil.matricule)||"—"}</td></tr>
    <tr><th>Unité</th><td>${esc(c.reintMil.unite)||"—"}</td><th>Incorporation</th><td>${fmtD(c.reintMil.date)}</td></tr></table>`;
  if(c.reintSocio) reint=`<h3 style="font-size:13px;margin-top:14px;text-decoration:underline">Réintégration socio-économique</h3>
    <table class="dt"><tr><th>Filière</th><td>${esc(c.reintSocio.filiere)}</td><th>Centre</th><td>${esc(c.reintSocio.centre)||"—"}</td></tr>
    <tr><th>Kit remis</th><td>${c.reintSocio.kit?"Oui — "+fmtD(c.reintSocio.kitDate):"Non"}</td><th>Appui</th><td>${c.reintSocio.appui?fmtN(c.reintSocio.appui)+" FCFA":"—"}</td></tr>
    <tr><th>Début</th><td>${fmtD(c.reintSocio.date)}</td><th>Visites de suivi</th><td>${c.reintSocio.visites.length}</td></tr></table>`;
  doPrint(docWrap(`${docEntete("Fiche individuelle d'ex-combattant")}
    <h2 class="titre">Fiche individuelle n° ${c.num}</h2>
    <table class="dt">
      <tr><th style="width:26%">Nom & prénom(s)</th><td>${esc(c.nom)} ${esc(c.prenom)}</td><th style="width:18%">Alias</th><td>${esc(c.alias)||"—"}</td></tr>
      <tr><th>Sexe</th><td>${c.sexe==="M"?"Masculin":"Féminin"}</td><th>Naissance</th><td>${fmtD(c.dn)} à ${esc(c.ln)||"—"}</td></tr>
      <tr><th>Nationalité</th><td>${esc(c.nat)}</td><th>Téléphone</th><td>${esc(c.tel)||"—"}</td></tr>
      <tr><th>Préfecture</th><td>${esc(c.prefecture)}</td><th>Site</th><td>${esc(c.site)||"—"}</td></tr>
      <tr><th>Groupe armé</th><td>${esc(c.groupe)}</td><th>Fonction</th><td>${esc(c.grade)||"—"}</td></tr>
      <tr><th>Statut actuel</th><td colspan="3"><b>${STATUTS[c.statut].lbl}</b>${c.demobilisation?` — carte de démobilisé n° ${c.demobilisation.carte}`:""}</td></tr>
    </table>
    ${arm}${reint}
    <div class="sig">
      <div class="c">L'intéressé(e)<div class="ligne">${esc(c.nom)} ${esc(c.prenom)}</div></div>
      <div class="c">Fait à ${esc(c.prefecture)}, le ${new Date().toLocaleDateString("fr-FR")}<br>L'agent du PNDDRR<div class="ligne">${esc(CUR.nom)}</div></div>
    </div>`));
  log("Impression",`Fiche individuelle ${c.num}`);
}
function attestationHtml(c){
  const d=c.desarmement;
  return docWrap(`${docEntete("")}
    <h2 class="titre">Attestation de désarmement</h2>
    <p>Le Programme National de Désarmement, Démobilisation, Réintégration et Rapatriement atteste que :</p>
    <p style="text-align:center;font-size:14.5px"><b>${esc(c.nom)} ${esc(c.prenom)}</b>${c.alias?`, alias « ${esc(c.alias)} »`:""},<br>
    né(e) le ${fmtD(c.dn)} à ${esc(c.ln)||"—"}, de nationalité ${esc(c.nat)},<br>
    anciennement membre du groupe <b>${esc(c.groupe)}</b>,</p>
    <p>a volontairement remis aux autorités du Programme, le <b>${fmtD(d.date)}</b> à <b>${esc(d.lieu)}</b>, l'armement et le matériel ci-après :</p>
    <table class="dt"><tr><th>Type</th><th>Marque</th><th>Calibre</th><th>N° série</th><th>État</th></tr>${
      d.armes.map(a=>`<tr><td>${esc(a.type)}</td><td>${esc(a.marque)||"—"}</td><td>${esc(a.calibre)||"—"}</td><td>${esc(a.serie)||"—"}</td><td>${esc(a.etat)}</td></tr>`).join("")}</table>
    ${(d.munitions||[]).length?`<p style="margin-top:6px"><b>Munitions et explosifs :</b></p>
    <table class="dt"><tr><th>Nature / calibre</th><th>Quantité</th><th>Unité</th><th>Observations</th></tr>${
      d.munitions.map(m=>`<tr><td>${esc(m.nature)||"—"}</td><td>${fmtN(m.qte)}</td><td>${esc(m.unite)}</td><td>${esc(m.obs)||"—"}</td></tr>`).join("")}</table>`:""}
    <p>En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit, dans le cadre du dossier n° <b>${c.num}</b>.</p>
    <div class="sig">
      <div class="c">L'intéressé(e)<div class="ligne">${esc(c.nom)} ${esc(c.prenom)}</div></div>
      <div class="c">Fait à ${esc(d.lieu)}, le ${new Date().toLocaleDateString("fr-FR")}<br>Pour le PNDDRR<div class="ligne">${esc(d.agent)}</div></div>
    </div>`);
}
function printAttestation(id){
  const c=DB.combattants.find(x=>x.id===id);
  doPrint(attestationHtml(c));
  log("Impression",`Attestation de désarmement ${c.num}`);
}
function authCode(c, legacy){
  const sel = legacy||!DB.secret ? "UEPNDDR-RCA" : DB.secret;
  const base=[c.num,c.demobilisation.carte,c.nom,c.prenom,c.dn||"",c.demobilisation.date,sel].join("|");
  let h1=5381, h2=0;
  for(let i=0;i<base.length;i++){ const ch=base.charCodeAt(i); h1=((h1<<5)+h1+ch)>>>0; h2=(ch+(h2<<6)+(h2<<16)-h2)>>>0; }
  const hex=(h1.toString(16)+h2.toString(16)+((h1^h2)>>>0).toString(16)).toUpperCase().padEnd(12,"0").slice(0,12);
  return hex.slice(0,4)+"-"+hex.slice(4,8)+"-"+hex.slice(8,12);
}
/* Générateur de QR code embarqué (qrcode-generator, licence MIT, minifié) */
var qrcode=function(){var t=function(t,r){var e=t,n=g[r],o=null,i=0,a=null,u=[],f={},c=function(t,r){o=function(t){for(var r=new Array(t),e=0;e<t;e+=1){r[e]=new Array(t);for(var n=0;n<t;n+=1)r[e][n]=null}return r}(i=4*e+17),l(0,0),l(i-7,0),l(0,i-7),s(),h(),d(t,r),e>=7&&v(t),null==a&&(a=p(e,n,u)),w(a,r)},l=function(t,r){for(var e=-1;e<=7;e+=1)if(!(t+e<=-1||i<=t+e))for(var n=-1;n<=7;n+=1)r+n<=-1||i<=r+n||(o[t+e][r+n]=0<=e&&e<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==e||6==e)||2<=e&&e<=4&&2<=n&&n<=4)},h=function(){for(var t=8;t<i-8;t+=1)null==o[t][6]&&(o[t][6]=t%2==0);for(var r=8;r<i-8;r+=1)null==o[6][r]&&(o[6][r]=r%2==0)},s=function(){for(var t=B.getPatternPosition(e),r=0;r<t.length;r+=1)for(var n=0;n<t.length;n+=1){var i=t[r],a=t[n];if(null==o[i][a])for(var u=-2;u<=2;u+=1)for(var f=-2;f<=2;f+=1)o[i+u][a+f]=-2==u||2==u||-2==f||2==f||0==u&&0==f}},v=function(t){for(var r=B.getBCHTypeNumber(e),n=0;n<18;n+=1){var a=!t&&1==(r>>n&1);o[Math.floor(n/3)][n%3+i-8-3]=a}for(n=0;n<18;n+=1){a=!t&&1==(r>>n&1);o[n%3+i-8-3][Math.floor(n/3)]=a}},d=function(t,r){for(var e=n<<3|r,a=B.getBCHTypeInfo(e),u=0;u<15;u+=1){var f=!t&&1==(a>>u&1);u<6?o[u][8]=f:u<8?o[u+1][8]=f:o[i-15+u][8]=f}for(u=0;u<15;u+=1){f=!t&&1==(a>>u&1);u<8?o[8][i-u-1]=f:u<9?o[8][15-u-1+1]=f:o[8][15-u-1]=f}o[i-8][8]=!t},w=function(t,r){for(var e=-1,n=i-1,a=7,u=0,f=B.getMaskFunction(r),c=i-1;c>0;c-=2)for(6==c&&(c-=1);;){for(var g=0;g<2;g+=1)if(null==o[n][c-g]){var l=!1;u<t.length&&(l=1==(t[u]>>>a&1)),f(n,c-g)&&(l=!l),o[n][c-g]=l,-1==(a-=1)&&(u+=1,a=7)}if((n+=e)<0||i<=n){n-=e,e=-e;break}}},p=function(t,r,e){for(var n=A.getRSBlocks(t,r),o=b(),i=0;i<e.length;i+=1){var a=e[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var u=0;for(i=0;i<n.length;i+=1)u+=n[i].dataCount;if(o.getLengthInBits()>8*u)throw"code length overflow. ("+o.getLengthInBits()+">"+8*u+")";for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(236,8),o.getLengthInBits()>=8*u));)o.put(17,8);return function(t,r){for(var e=0,n=0,o=0,i=new Array(r.length),a=new Array(r.length),u=0;u<r.length;u+=1){var f=r[u].dataCount,c=r[u].totalCount-f;n=Math.max(n,f),o=Math.max(o,c),i[u]=new Array(f);for(var g=0;g<i[u].length;g+=1)i[u][g]=255&t.getBuffer()[g+e];e+=f;var l=B.getErrorCorrectPolynomial(c),h=k(i[u],l.getLength()-1).mod(l);for(a[u]=new Array(l.getLength()-1),g=0;g<a[u].length;g+=1){var s=g+h.getLength()-a[u].length;a[u][g]=s>=0?h.getAt(s):0}}var v=0;for(g=0;g<r.length;g+=1)v+=r[g].totalCount;var d=new Array(v),w=0;for(g=0;g<n;g+=1)for(u=0;u<r.length;u+=1)g<i[u].length&&(d[w]=i[u][g],w+=1);for(g=0;g<o;g+=1)for(u=0;u<r.length;u+=1)g<a[u].length&&(d[w]=a[u][g],w+=1);return d}(o,n)};f.addData=function(t,r){var e=null;switch(r=r||"Byte"){case"Numeric":e=M(t);break;case"Alphanumeric":e=x(t);break;case"Byte":e=m(t);break;case"Kanji":e=L(t);break;default:throw"mode:"+r}u.push(e),a=null},f.isDark=function(t,r){if(t<0||i<=t||r<0||i<=r)throw t+","+r;return o[t][r]},f.getModuleCount=function(){return i},f.make=function(){if(e<1){for(var t=1;t<40;t++){for(var r=A.getRSBlocks(t,n),o=b(),i=0;i<u.length;i++){var a=u[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var g=0;for(i=0;i<r.length;i++)g+=r[i].dataCount;if(o.getLengthInBits()<=8*g)break}e=t}c(!1,function(){for(var t=0,r=0,e=0;e<8;e+=1){c(!0,e);var n=B.getLostPoint(f);(0==e||t>n)&&(t=n,r=e)}return r}())},f.createTableTag=function(t,r){t=t||2;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+(r=void 0===r?4*t:r)+"px;",e+='">',e+="<tbody>";for(var n=0;n<f.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<f.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+t+"px;",e+=" height: "+t+"px;",e+=" background-color: ",e+=f.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},f.createSvgTag=function(t,r,e,n){var o={};"object"==typeof arguments[0]&&(t=(o=arguments[0]).cellSize,r=o.margin,e=o.alt,n=o.title),t=t||2,r=void 0===r?4*t:r,(e="string"==typeof e?{text:e}:e||{}).text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,(n="string"==typeof n?{text:n}:n||{}).text=n.text||null,n.id=n.text?n.id||"qrcode-title":null;var i,a,u,c,g=f.getModuleCount()*t+2*r,l="";for(c="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",l+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',l+=o.scalable?"":' width="'+g+'px" height="'+g+'px"',l+=' viewBox="0 0 '+g+" "+g+'" ',l+=' preserveAspectRatio="xMinYMin meet"',l+=n.text||e.text?' role="img" aria-labelledby="'+y([n.id,e.id].join(" ").trim())+'"':"",l+=">",l+=n.text?'<title id="'+y(n.id)+'">'+y(n.text)+"</title>":"",l+=e.text?'<description id="'+y(e.id)+'">'+y(e.text)+"</description>":"",l+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',l+='<path d="',a=0;a<f.getModuleCount();a+=1)for(u=a*t+r,i=0;i<f.getModuleCount();i+=1)f.isDark(a,i)&&(l+="M"+(i*t+r)+","+u+c);return l+='" stroke="transparent" fill="black"/>',l+="</svg>"},f.createDataURL=function(t,r){t=t||2,r=void 0===r?4*t:r;var e=f.getModuleCount()*t+2*r,n=r,o=e-r;return I(e,e,function(r,e){if(n<=r&&r<o&&n<=e&&e<o){var i=Math.floor((r-n)/t),a=Math.floor((e-n)/t);return f.isDark(a,i)?0:1}return 1})},f.createImgTag=function(t,r,e){t=t||2,r=void 0===r?4*t:r;var n=f.getModuleCount()*t+2*r,o="";return o+="<img",o+=' src="',o+=f.createDataURL(t,r),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',e&&(o+=' alt="',o+=y(e),o+='"'),o+="/>"};var y=function(t){for(var r="",e=0;e<t.length;e+=1){var n=t.charAt(e);switch(n){case"<":r+="&lt;";break;case">":r+="&gt;";break;case"&":r+="&amp;";break;case'"':r+="&quot;";break;default:r+=n}}return r};return f.createASCII=function(t,r){if((t=t||1)<2)return function(t){t=void 0===t?2:t;var r,e,n,o,i,a=1*f.getModuleCount()+2*t,u=t,c=a-t,g={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},h="";for(r=0;r<a;r+=2){for(n=Math.floor((r-u)/1),o=Math.floor((r+1-u)/1),e=0;e<a;e+=1)i="█",u<=e&&e<c&&u<=r&&r<c&&f.isDark(n,Math.floor((e-u)/1))&&(i=" "),u<=e&&e<c&&u<=r+1&&r+1<c&&f.isDark(o,Math.floor((e-u)/1))?i+=" ":i+="█",h+=t<1&&r+1>=c?l[i]:g[i];h+="\n"}return a%2&&t>0?h.substring(0,h.length-a-1)+Array(a+1).join("▀"):h.substring(0,h.length-1)}(r);t-=1,r=void 0===r?2*t:r;var e,n,o,i,a=f.getModuleCount()*t+2*r,u=r,c=a-r,g=Array(t+1).join("██"),l=Array(t+1).join("  "),h="",s="";for(e=0;e<a;e+=1){for(o=Math.floor((e-u)/t),s="",n=0;n<a;n+=1)i=1,u<=n&&n<c&&u<=e&&e<c&&f.isDark(o,Math.floor((n-u)/t))&&(i=0),s+=i?g:l;for(o=0;o<t;o+=1)h+=s+"\n"}return h.substring(0,h.length-1)},f.renderTo2dContext=function(t,r){r=r||2;for(var e=f.getModuleCount(),n=0;n<e;n++)for(var o=0;o<e;o++)t.fillStyle=f.isDark(n,o)?"black":"white",t.fillRect(o*r,n*r,r,r)},f};t.stringToBytes=(t.stringToBytesFuncs={default:function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);r.push(255&n)}return r}}).default,t.createStringToBytes=function(t,r){var e=function(){for(var e=S(t),n=function(){var t=e.read();if(-1==t)throw"eof";return t},o=0,i={};;){var a=e.read();if(-1==a)break;var u=n(),f=n()<<8|n();i[String.fromCharCode(a<<8|u)]=f,o+=1}if(o!=r)throw o+" != "+r;return i}(),n="?".charCodeAt(0);return function(t){for(var r=[],o=0;o<t.length;o+=1){var i=t.charCodeAt(o);if(i<128)r.push(i);else{var a=e[t.charAt(o)];"number"==typeof a?(255&a)==a?r.push(a):(r.push(a>>>8),r.push(255&a)):r.push(n)}}return r}};var r,e,n,o,i,a=1,u=2,f=4,c=8,g={L:1,M:0,Q:3,H:2},l=0,h=1,s=2,v=3,d=4,w=5,p=6,y=7,B=(r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],e=1335,n=7973,i=function(t){for(var r=0;0!=t;)r+=1,t>>>=1;return r},(o={}).getBCHTypeInfo=function(t){for(var r=t<<10;i(r)-i(e)>=0;)r^=e<<i(r)-i(e);return 21522^(t<<10|r)},o.getBCHTypeNumber=function(t){for(var r=t<<12;i(r)-i(n)>=0;)r^=n<<i(r)-i(n);return t<<12|r},o.getPatternPosition=function(t){return r[t-1]},o.getMaskFunction=function(t){switch(t){case l:return function(t,r){return(t+r)%2==0};case h:return function(t,r){return t%2==0};case s:return function(t,r){return r%3==0};case v:return function(t,r){return(t+r)%3==0};case d:return function(t,r){return(Math.floor(t/2)+Math.floor(r/3))%2==0};case w:return function(t,r){return t*r%2+t*r%3==0};case p:return function(t,r){return(t*r%2+t*r%3)%2==0};case y:return function(t,r){return(t*r%3+(t+r)%2)%2==0};default:throw"bad maskPattern:"+t}},o.getErrorCorrectPolynomial=function(t){for(var r=k([1],0),e=0;e<t;e+=1)r=r.multiply(k([1,C.gexp(e)],0));return r},o.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case a:return 10;case u:return 9;case f:case c:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case a:return 12;case u:return 11;case f:return 16;case c:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case a:return 14;case u:return 13;case f:return 16;case c:return 12;default:throw"mode:"+t}}},o.getLostPoint=function(t){for(var r=t.getModuleCount(),e=0,n=0;n<r;n+=1)for(var o=0;o<r;o+=1){for(var i=0,a=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||r<=n+u))for(var f=-1;f<=1;f+=1)o+f<0||r<=o+f||0==u&&0==f||a==t.isDark(n+u,o+f)&&(i+=1);i>5&&(e+=3+i-5)}for(n=0;n<r-1;n+=1)for(o=0;o<r-1;o+=1){var c=0;t.isDark(n,o)&&(c+=1),t.isDark(n+1,o)&&(c+=1),t.isDark(n,o+1)&&(c+=1),t.isDark(n+1,o+1)&&(c+=1),0!=c&&4!=c||(e+=3)}for(n=0;n<r;n+=1)for(o=0;o<r-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(e+=40);for(o=0;o<r;o+=1)for(n=0;n<r-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(e+=40);var g=0;for(o=0;o<r;o+=1)for(n=0;n<r;n+=1)t.isDark(n,o)&&(g+=1);return e+=Math.abs(100*g/r/r-50)/5*10},o),C=function(){for(var t=new Array(256),r=new Array(256),e=0;e<8;e+=1)t[e]=1<<e;for(e=8;e<256;e+=1)t[e]=t[e-4]^t[e-5]^t[e-6]^t[e-8];for(e=0;e<255;e+=1)r[t[e]]=e;var n={glog:function(t){if(t<1)throw"glog("+t+")";return r[t]},gexp:function(r){for(;r<0;)r+=255;for(;r>=256;)r-=255;return t[r]}};return n}();function k(t,r){if(void 0===t.length)throw t.length+"/"+r;var e=function(){for(var e=0;e<t.length&&0==t[e];)e+=1;for(var n=new Array(t.length-e+r),o=0;o<t.length-e;o+=1)n[o]=t[o+e];return n}(),n={getAt:function(t){return e[t]},getLength:function(){return e.length},multiply:function(t){for(var r=new Array(n.getLength()+t.getLength()-1),e=0;e<n.getLength();e+=1)for(var o=0;o<t.getLength();o+=1)r[e+o]^=C.gexp(C.glog(n.getAt(e))+C.glog(t.getAt(o)));return k(r,0)},mod:function(t){if(n.getLength()-t.getLength()<0)return n;for(var r=C.glog(n.getAt(0))-C.glog(t.getAt(0)),e=new Array(n.getLength()),o=0;o<n.getLength();o+=1)e[o]=n.getAt(o);for(o=0;o<t.getLength();o+=1)e[o]^=C.gexp(C.glog(t.getAt(o))+r);return k(e,0).mod(t)}};return n}var A=function(){var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r=function(t,r){var e={};return e.totalCount=t,e.dataCount=r,e},e={};return e.getRSBlocks=function(e,n){var o=function(r,e){switch(e){case g.L:return t[4*(r-1)+0];case g.M:return t[4*(r-1)+1];case g.Q:return t[4*(r-1)+2];case g.H:return t[4*(r-1)+3];default:return}}(e,n);if(void 0===o)throw"bad rs block @ typeNumber:"+e+"/errorCorrectionLevel:"+n;for(var i=o.length/3,a=[],u=0;u<i;u+=1)for(var f=o[3*u+0],c=o[3*u+1],l=o[3*u+2],h=0;h<f;h+=1)a.push(r(c,l));return a},e}(),b=function(){var t=[],r=0,e={getBuffer:function(){return t},getAt:function(r){var e=Math.floor(r/8);return 1==(t[e]>>>7-r%8&1)},put:function(t,r){for(var n=0;n<r;n+=1)e.putBit(1==(t>>>r-n-1&1))},getLengthInBits:function(){return r},putBit:function(e){var n=Math.floor(r/8);t.length<=n&&t.push(0),e&&(t[n]|=128>>>r%8),r+=1}};return e},M=function(t){var r=a,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+2<r.length;)t.put(o(r.substring(n,n+3)),10),n+=3;n<r.length&&(r.length-n==1?t.put(o(r.substring(n,n+1)),4):r.length-n==2&&t.put(o(r.substring(n,n+2)),7))}},o=function(t){for(var r=0,e=0;e<t.length;e+=1)r=10*r+i(t.charAt(e));return r},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return n},x=function(t){var r=u,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+1<r.length;)t.put(45*o(r.charAt(n))+o(r.charAt(n+1)),11),n+=2;n<r.length&&t.put(o(r.charAt(n)),6)}},o=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return n},m=function(r){var e=f,n=t.stringToBytes(r),o={getMode:function(){return e},getLength:function(t){return n.length},write:function(t){for(var r=0;r<n.length;r+=1)t.put(n[r],8)}};return o},L=function(r){var e=c,n=t.stringToBytesFuncs.SJIS;if(!n)throw"sjis not supported.";!function(){var t=n("友");if(2!=t.length||38726!=(t[0]<<8|t[1]))throw"sjis not supported."}();var o=n(r),i={getMode:function(){return e},getLength:function(t){return~~(o.length/2)},write:function(t){for(var r=o,e=0;e+1<r.length;){var n=(255&r[e])<<8|255&r[e+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(e+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),e+=2}if(e<r.length)throw"illegal char at "+(e+1)}};return i},D=function(){var t=[],r={writeByte:function(r){t.push(255&r)},writeShort:function(t){r.writeByte(t),r.writeByte(t>>>8)},writeBytes:function(t,e,n){e=e||0,n=n||t.length;for(var o=0;o<n;o+=1)r.writeByte(t[o+e])},writeString:function(t){for(var e=0;e<t.length;e+=1)r.writeByte(t.charCodeAt(e))},toByteArray:function(){return t},toString:function(){var r="";r+="[";for(var e=0;e<t.length;e+=1)e>0&&(r+=","),r+=t[e];return r+="]"}};return r},S=function(t){var r=t,e=0,n=0,o=0,i={read:function(){for(;o<8;){if(e>=r.length){if(0==o)return-1;throw"unexpected end of file./"+o}var t=r.charAt(e);if(e+=1,"="==t)return o=0,-1;t.match(/^\s$/)||(n=n<<6|a(t.charCodeAt(0)),o+=6)}var i=n>>>o-8&255;return o-=8,i}},a=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return i},I=function(t,r,e){for(var n=function(t,r){var e=t,n=r,o=new Array(t*r),i={setPixel:function(t,r,n){o[r*e+t]=n},write:function(t){t.writeString("GIF87a"),t.writeShort(e),t.writeShort(n),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(e),t.writeShort(n),t.writeByte(0);var r=a(2);t.writeByte(2);for(var o=0;r.length-o>255;)t.writeByte(255),t.writeBytes(r,o,255),o+=255;t.writeByte(r.length-o),t.writeBytes(r,o,r.length-o),t.writeByte(0),t.writeString(";")}},a=function(t){for(var r=1<<t,e=1+(1<<t),n=t+1,i=u(),a=0;a<r;a+=1)i.add(String.fromCharCode(a));i.add(String.fromCharCode(r)),i.add(String.fromCharCode(e));var f,c,g,l=D(),h=(f=l,c=0,g=0,{write:function(t,r){if(t>>>r!=0)throw"length over";for(;c+r>=8;)f.writeByte(255&(t<<c|g)),r-=8-c,t>>>=8-c,g=0,c=0;g|=t<<c,c+=r},flush:function(){c>0&&f.writeByte(g)}});h.write(r,n);var s=0,v=String.fromCharCode(o[s]);for(s+=1;s<o.length;){var d=String.fromCharCode(o[s]);s+=1,i.contains(v+d)?v+=d:(h.write(i.indexOf(v),n),i.size()<4095&&(i.size()==1<<n&&(n+=1),i.add(v+d)),v=d)}return h.write(i.indexOf(v),n),h.write(e,n),h.flush(),l.toByteArray()},u=function(){var t={},r=0,e={add:function(n){if(e.contains(n))throw"dup key:"+n;t[n]=r,r+=1},size:function(){return r},indexOf:function(r){return t[r]},contains:function(r){return void 0!==t[r]}};return e};return i}(t,r),o=0;o<r;o+=1)for(var i=0;i<t;i+=1)n.setPixel(i,o,e(i,o));var a=D();n.write(a);for(var u=function(){var t=0,r=0,e=0,n="",o={},i=function(t){n+=String.fromCharCode(a(63&t))},a=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return o.writeByte=function(n){for(t=t<<8|255&n,r+=8,e+=1;r>=6;)i(t>>>r-6),r-=6},o.flush=function(){if(r>0&&(i(t<<6-r),t=0,r=0),e%3!=0)for(var o=3-e%3,a=0;a<o;a+=1)n+="="},o.toString=function(){return n},o}(),f=a.toByteArray(),c=0;c<f.length;c+=1)u.writeByte(f[c]);return u.flush(),"data:image/gif;base64,"+u};return t}();qrcode.stringToBytesFuncs["UTF-8"]=function(t){return function(t){for(var r=[],e=0;e<t.length;e++){var n=t.charCodeAt(e);n<128?r.push(n):n<2048?r.push(192|n>>6,128|63&n):n<55296||n>=57344?r.push(224|n>>12,128|n>>6&63,128|63&n):(e++,n=65536+((1023&n)<<10|1023&t.charCodeAt(e)),r.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return r}(t)},function(t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports&&(module.exports=t())}(function(){return qrcode});
function qrSvg(txt, taille){
  try{
    const qr=qrcode(0,"M"); qr.addData(String(txt)); qr.make();
    const n=qr.getModuleCount(), t=taille||96;
    let r="";
    for(let y=0;y<n;y++) for(let x=0;x<n;x++) if(qr.isDark(y,x)) r+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>';
    return '<svg class="cqr" viewBox="0 0 '+n+' '+n+'" width="'+t+'" height="'+t+'" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="'+n+'" height="'+n+'" fill="#fff"/><g fill="#000">'+r+"</g></svg>";
  }catch(e){ return ""; }
}
const C39={"0":"nnnwwnwnn","1":"wnnwnnnnw","2":"nnwwnnnnw","3":"wnwwnnnnn","4":"nnnwwnnnw","5":"wnnwwnnnn","6":"nnwwwnnnn","7":"nnnwnnwnw","8":"wnnwnnwnn","9":"nnwwnnwnn","A":"wnnnnwnnw","B":"nnwnnwnnw","C":"wnwnnwnnn","D":"nnnnwwnnw","E":"wnnnwwnnn","F":"nnwnwwnnn","G":"nnnnnwwnw","H":"wnnnnwwnn","I":"nnwnnwwnn","J":"nnnnwwwnn","K":"wnnnnnnww","L":"nnwnnnnww","M":"wnwnnnnwn","N":"nnnnwnnww","O":"wnnnwnnwn","P":"nnwnwnnwn","Q":"nnnnnnwww","R":"wnnnnnwwn","S":"nnwnnnwwn","T":"nnnnwnwwn","U":"wwnnnnnnw","V":"nwwnnnnnw","W":"wwwnnnnnn","X":"nwnnwnnnw","Y":"wwnnwnnnn","Z":"nwwnwnnnn","-":"nwnnnnwnw",".":"wwnnnnwnn"," ":"nwwnnnwnn","*":"nwnnwnwnn"};
function barcode39(txt, h){
  h=h||44;
  const chars=("*"+String(txt).toUpperCase().replace(/[^0-9A-Z\-\. ]/g,"")+"*").split("");
  let x=0, bars=[];
  for(const ch of chars){
    const pat=C39[ch]; if(!pat) continue;
    for(let i=0;i<9;i++){ const wdt=pat[i]==="w"?3:1; if(i%2===0) bars.push([x,wdt]); x+=wdt; }
    x+=1; /* espace inter-caractère */
  }
  const W=x-1;
  return `<svg class="cbar" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${
    bars.map(([bx,bw])=>`<rect x="${bx}" y="0" width="${bw}" height="${h}" fill="#000"/>`).join("")}</svg>`;
}
function carteHtml(c){
  const dm=c.demobilisation;
  const qr=cfg("carteQR")!==false?qrSvg("PNDDRR|"+dm.carte+"|"+authCode(c),48):"";
  const cb=cfg("carteCodeBarres")!==false?`${barcode39(dm.carte,22)}<div class="cbar-lbl">${esc(dm.carte)}</div>`:"";
  return `
    <div class="carte-pvc recto">
      <div class="ch chc"><div class="emb">${ARM_SVG}</div>
        <div class="tx">
          <b>RÉPUBLIQUE CENTRAFRICAINE</b>
          <small>UEPNDDR</small>
          <div class="ct">CARTE DE DÉMOBILISÉ</div>
          <small>N° ${esc(dm.carte)}</small>
        </div>
      </div>
      <div class="cb">
        <div class="ph">${c.photo?`<img src="${c.photo}">`:"PHOTO"}</div>
        <table>
          <tr><td>Nom</td><td>${esc(c.nom)}</td></tr>
          <tr><td>Prénom(s)</td><td>${esc(c.prenom)}</td></tr>
          <tr><td>Né(e) le</td><td>${fmtD(c.dn)}</td></tr>
          <tr><td>Sexe</td><td>${c.sexe==="M"?"M":"F"}</td></tr>
          <tr><td>Dossier</td><td>${esc(c.num)}</td></tr>
          <tr><td>Démobilisé</td><td>${fmtD(dm.date)}</td></tr>
        </table>
      </div>
      <div class="cauth">AUTH. <b>${authCode(c)}</b></div>
      <div class="cf"><span>${esc(dm.lieu)}</span><span>${esc(cfg("signataireCarte")||"Le Coordonnateur")}</span></div>
    </div>
    <div class="carte-pvc verso">
      <div class="ch"><b>DISPOSITIONS</b></div>
      <div class="cb verso-body">
        <p>Carte personnelle attestant la démobilisation officielle au titre du PNDDRR. En cas de perte, prévenir l'antenne la plus proche.</p>
        ${qr||cb?`<div class="cbar-box">${qr?`<div class="cqr-wrap">${qr}</div>`:""}${cb?`<div class="cbar-wrap">${cb}</div>`:""}</div>`:""}
      </div>
      <div class="cf"><span>N° ${esc(dm.carte)}</span><span>République Centrafricaine</span></div>
    </div>`;
}
function printCarte(id){
  const c=DB.combattants.find(x=>x.id===id);
  doPrint(carteHtml(c), "pvc");
  log("Impression",`Carte de démobilisé ${c.demobilisation.carte}`);
}
var DOC_Q="";
function docSearch(v){ DOC_Q=v; rDocs(); const el=$("doc_q"); if(el){ el.focus(); const n=el.value.length; try{el.setSelectionRange(n,n);}catch(e){} } }
function docMatch(c){
  const q=DOC_Q.trim().toLowerCase(); if(!q) return true;
  return [c.num,c.nom,c.prenom,c.alias,c.vague,c.prefecture,c.groupe,c.demobilisation?c.demobilisation.carte:""].join(" ").toLowerCase().includes(q);
}
function rDocs(){
  const cartes=DB.combattants.filter(c=>c.demobilisation&&docMatch(c)).sort((a,b)=>a.demobilisation.carte.localeCompare(b.demobilisation.carte));
  const attests=DB.combattants.filter(c=>c.desarmement&&docMatch(c)).sort((a,b)=>a.num.localeCompare(b.num));
  $("view").innerHTML = `
  <div class="toolbar">
    <div class="field" style="flex:1;max-width:520px"><label>Recherche</label><input id="doc_q" value="${esc(DOC_Q)}" oninput="docSearch(this.value)" placeholder="Nom, n° dossier, n° de carte, vague, préfecture…"></div>
    ${DOC_Q?`<button class="btn ghost" style="align-self:end" onclick="DOC_Q='';rDocs()">✕ Effacer</button>`:""}
  </div>
  <div class="cards">
    <div class="kpi c-dem"><div class="n">${cartes.length}</div><div class="l">Cartes de démobilisé délivrées</div></div>
    <div class="kpi c-des"><div class="n">${attests.length}</div><div class="l">Attestations de désarmement</div></div>
  </div>
  <div class="panel"><div class="ph"><h3>Vérifier l'authenticité d'une carte</h3></div><div class="pb">
    <div class="toolbar" style="margin-bottom:0">
      <div class="field" style="max-width:230px"><label>N° de carte</label><input id="ver_num" placeholder="DEM-2026-0001"></div>
      <div class="field" style="max-width:230px"><label>Code d'authentification</label><input id="ver_code" placeholder="XXXX-XXXX-XXXX"></div>
      <button class="btn" style="align-self:end" onclick="verifCarte()">Vérifier</button>
    </div>
    <div id="verRes" style="margin-top:12px"></div>
    <p class="small muted" style="margin-top:10px">Le code figure au recto de chaque carte. La vérification fonctionne hors ligne, sur tout poste disposant de l'application, et est consignée au journal.</p>
  </div></div>
  <div class="panel"><div class="ph"><h3>Partie 1 — Cartes de démobilisé (${cartes.length})</h3>
    <span style="display:flex;gap:7px">
      <button class="btn sm sec" onclick="exportCartesCSV()">Exporter CSV</button>
      <button class="btn sm sec" ${cartes.length?"":"disabled"} onclick="printToutesCartes()">Imprimer toutes les cartes</button>
    </span></div>
    <p class="small muted" style="margin:0;padding:10px 16px 0">Impression : <b>8,5 × 5,5 cm</b> (carte PVC, une face par page). Dans la boîte d'impression, choisir le format 85 × 55 mm et les marges à zéro.</p>
    <div class="pb nopad">${
    cartes.length?`<table><thead><tr><th>N° de carte</th><th>Titulaire</th><th>Dossier</th><th>Démobilisé le</th><th>Lieu</th><th>Vague</th><th>Actions</th></tr></thead><tbody>${
      cartes.map(c=>`<tr><td><b>${esc(c.demobilisation.carte)}</b></td>
      <td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
      <td>${c.num}</td><td>${fmtD(c.demobilisation.date)}</td><td class="small">${esc(c.demobilisation.lieu)}</td>
      <td class="small">${c.vague?`<span class="tag">${esc(c.vague)}</span>`:"—"}</td>
      <td class="actions-cell"><button class="btn sm sec" onclick="printCarte('${c.id}')">Voir / imprimer la carte</button></td></tr>`).join("")
    }</tbody></table>`:`<div class="empty">Aucune carte de démobilisé${DOC_Q?" ne correspond à la recherche":" délivrée pour le moment"}.</div>`}</div></div>
  <div class="panel"><div class="ph"><h3>Partie 2 — Attestations de désarmement (${attests.length})</h3>
    <span style="display:flex;gap:7px">
      <button class="btn sm sec" onclick="exportAttestsCSV()">Exporter CSV</button>
      <button class="btn sm sec" ${attests.length?"":"disabled"} onclick="printToutesAttests()">Imprimer toutes les attestations</button>
    </span></div><div class="pb nopad">${
    attests.length?`<table><thead><tr><th>Dossier</th><th>Titulaire</th><th>Désarmé le</th><th>Lieu</th><th>Armes</th><th>Munitions</th><th>Vague</th><th>Actions</th></tr></thead><tbody>${
      attests.map(c=>`<tr><td><b>${c.num}</b></td>
      <td><span class="link" onclick="go('fiche','${c.id}')">${esc(c.nom)} ${esc(c.prenom)}</span></td>
      <td>${fmtD(c.desarmement.date)}</td><td class="small">${esc(c.desarmement.lieu)}</td>
      <td>${c.desarmement.armes.length}</td><td>${(c.desarmement.munitions||[]).length}</td>
      <td class="small">${c.vague?`<span class="tag">${esc(c.vague)}</span>`:"—"}</td>
      <td class="actions-cell"><button class="btn sm sec" onclick="printAttestation('${c.id}')">Voir / imprimer l'attestation</button></td></tr>`).join("")
    }</tbody></table>`:`<div class="empty">Aucune attestation${DOC_Q?" ne correspond à la recherche":" — les attestations sont produites au désarmement"}.</div>`}</div></div>`;
}
function savePoste(){
  DB.poste=$("posteNom").value.trim();
  DB.posteCode=$("posteCodeInp").value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5);
  persist(); log("Synchronisation",`Poste : ${DB.poste||"(vide)"} — code ${DB.posteCode||"(aucun)"}`);
  toast("Identification du poste enregistrée."); rSauvegarde();
}
function genSecret(){
  openModal(DB.secret?"Renouveler le secret d'installation":"Générer le secret d'installation", `
    <p>Le secret est une clé aléatoire propre à votre installation. ${DB.secret?"Le renouveler change les codes des <b>futures</b> cartes ; les cartes déjà imprimées restent vérifiables (repli sur les codes antérieurs au secret).":"Une fois généré, les nouveaux codes d'authentification en dépendent."}</p>
    <p class="small muted" style="margin-top:8px">Pensez à exporter une sauvegarde JSON vers les autres postes après cette opération, afin qu'ils vérifient les mêmes codes.</p>`,
    `<button class="btn ghost" onclick="closeModal()">Annuler</button><button class="btn" onclick="doGenSecret()">Générer</button>`);
}
function doGenSecret(){
  if(CUR.role!=="admin"){ toast("Réservé à l'administrateur."); return; }
  let al="ABCDEFGHJKLMNPQRSTUVWXYZ23456789", sec="";
  const rnd=new Uint32Array(24);
  try{ crypto.getRandomValues(rnd); }catch(e){ for(let i=0;i<24;i++) rnd[i]=Math.floor(Math.random()*4294967296); }
  for(let i=0;i<24;i++) sec+=al[rnd[i]%al.length];
  DB.secret=sec; persist();
  log("Sécurité","Secret d'installation "+(DB.secret?"renouvelé":"généré"));
  closeModal(); toast("Secret d'installation enregistré."); rSauvegarde();
}
function verifCarte(){
  const num=$("ver_num").value.trim().toUpperCase();
  const code=$("ver_code").value.trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(!num||!code){ toast("Saisissez le n° de carte et le code d'authentification."); return; }
  const c=DB.combattants.find(x=>x.demobilisation&&x.demobilisation.carte.toUpperCase()===num);
  /* accepte le code du secret courant, ou l'ancien pour les cartes imprimées avant sa définition */
  const ok = c && (authCode(c).replace(/-/g,"")===code || authCode(c,true).replace(/-/g,"")===code);
  if(!c){
    $("verRes").innerHTML=`<div style="background:#FDF1F1;border:1px solid #E3B4B4;border-radius:8px;padding:12px"><b style="color:var(--danger)">✘ Carte inconnue.</b> Aucune carte n° <b>${esc(num)}</b> n'existe dans ce registre. Vérifiez le numéro ou synchronisez les données du poste émetteur.</div>`;
  } else if(!ok){
    $("verRes").innerHTML=`<div style="background:#FDF1F1;border:1px solid #E3B4B4;border-radius:8px;padding:12px"><b style="color:var(--danger)">✘ Code invalide.</b> Le code saisi ne correspond pas à la carte n° <b>${esc(num)}</b>. La carte présentée est susceptible d'être falsifiée — retenir la carte et en référer à l'UEPNDDR.</div>`;
  } else {
    $("verRes").innerHTML=`<div style="background:#EAF7EE;border:1px solid #9ED0AC;border-radius:8px;padding:12px;display:flex;gap:14px;align-items:center">
      <div style="width:64px;height:76px;border:1px solid var(--line);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;color:var(--muted);overflow:hidden">${c.photo?`<img src="${c.photo}" style="width:100%;height:100%;object-fit:cover">`:"Photo"}</div>
      <div><b style="color:var(--ok)">✔ Carte authentique.</b><br>
      <b>${esc(c.nom)} ${esc(c.prenom)}</b>${c.alias?` — alias « ${esc(c.alias)} »`:""}, ${c.sexe==="M"?"né":"née"} le ${fmtD(c.dn)}<br>
      <span class="small">Dossier ${c.num} · démobilisé(e) le ${fmtD(c.demobilisation.date)} à ${esc(c.demobilisation.lieu)} · statut actuel : <span class="badge st-${c.statut}">${STATUTS[c.statut].lbl}</span></span><br>
      <span class="link small" onclick="go('fiche','${c.id}')">Ouvrir le dossier complet</span></div></div>`;
  }
  log("Vérification de carte",`${num} — ${!c?"carte inconnue":ok?"authentique ("+c.num+")":"code invalide"}`);
}
function exportCartesCSV(){
  const rows=[["N° de carte","Nom","Prénom","N° dossier","Démobilisé le","Lieu","Vague","Groupe armé","Préfecture"]];
  DB.combattants.filter(c=>c.demobilisation&&docMatch(c)).forEach(c=>rows.push([c.demobilisation.carte,c.nom,c.prenom,c.num,c.demobilisation.date,c.demobilisation.lieu,c.vague||"",c.groupe,c.prefecture]));
  dl(`pnddrr_cartes_demobilise_${today()}.csv`, csv(rows), "text/csv"); log("Export CSV","Cartes de démobilisé");
}
function exportAttestsCSV(){
  const rows=[["N° dossier","Nom","Prénom","Désarmé le","Lieu","Armes","Lots de munitions","Vague","Groupe armé","Préfecture"]];
  DB.combattants.filter(c=>c.desarmement&&docMatch(c)).forEach(c=>rows.push([c.num,c.nom,c.prenom,c.desarmement.date,c.desarmement.lieu,c.desarmement.armes.length,(c.desarmement.munitions||[]).length,c.vague||"",c.groupe,c.prefecture]));
  dl(`pnddrr_attestations_desarmement_${today()}.csv`, csv(rows), "text/csv"); log("Export CSV","Attestations de désarmement");
}
function printToutesCartes(){
  const L=DB.combattants.filter(c=>c.demobilisation&&docMatch(c));
  doPrint(L.map(c=>carteHtml(c)).join(""), "pvc");
  log("Impression",`${L.length} carte(s) de démobilisé (lot)`);
}
function printToutesAttests(){
  const L=DB.combattants.filter(c=>c.desarmement&&docMatch(c));
  doPrint(L.map(c=>attestationHtml(c)).join('<div style="page-break-after:always"></div>'));
  log("Impression",`${L.length} attestation(s) de désarmement (lot)`);
}
function printRegArmes(){
  const A=allArmes(), MU=allMunitions();
  doPrint(docWrap(`${docEntete("Registre des armes et matériels collectés")}
    <h2 class="titre">Registre des armes collectées</h2>
    <p class="small">Arrêté au ${new Date().toLocaleDateString("fr-FR")} — ${A.length} arme(s) et lot(s) enregistrés.</p>
    <table class="dt"><tr><th>N°</th><th>Type</th><th>Marque</th><th>N° série</th><th>État</th><th>Garde</th><th>Remise par</th><th>Dossier</th><th>Date</th></tr>${
      A.map((a,i)=>`<tr><td>${i+1}</td><td>${esc(a.type)}</td><td>${esc(a.marque)||"—"}</td><td>${esc(a.serie)||"—"}</td><td>${esc(a.etat)}</td><td>${GARDE_LBL[(a.garde&&a.garde.etat)||"depot"]}${a.garde&&a.garde.scelle?" · "+esc(a.garde.scelle):""}${a.garde&&a.garde.destruction&&a.garde.destruction.pv?" · "+esc(a.garde.destruction.pv):""}</td><td>${esc(a.nom)}</td><td>${a.num}</td><td>${fmtD(a.date)}</td></tr>`).join("")}</table>
    ${MU.length?`<h3 style="font-size:13px;margin-top:14px;text-decoration:underline">Munitions et explosifs collectés (${MU.length} lot(s))</h3>
    <table class="dt"><tr><th>N°</th><th>Nature / calibre</th><th>Quantité</th><th>Unité</th><th>Remise par</th><th>Dossier</th><th>Date</th></tr>${
      MU.map((m,i)=>`<tr><td>${i+1}</td><td>${esc(m.nature)||"—"}</td><td>${fmtN(m.qte)}</td><td>${esc(m.unite)}</td><td>${esc(m.nom)}</td><td>${m.num}</td><td>${fmtD(m.date)}</td></tr>`).join("")}</table>`:""}
    <div class="sig"><div class="c"></div><div class="c">Fait à ${esc(cfg("villeSignature")||"Bangui")}, le ${new Date().toLocaleDateString("fr-FR")}<br>Pour le PNDDRR<div class="ligne">${esc(CUR.nom)}</div></div></div>`));
  log("Impression","Registre des armes");
}


