"use client";

import { useEffect, useRef, useState } from "react";

const SHELL_HTML = `
<div id="printZone"></div>
<div id="printPrev">
  <div class="pp-bar">
    <b>Aperçu du document</b>
    <span style="display:flex;gap:8px">
      <button class="btn" onclick="prevPrint()">Imprimer / PDF</button>
      <button class="btn ghost" onclick="prevClose()">Fermer</button>
    </span>
  </div>
  <div class="pp-scroll"><div id="prevBody"></div></div>
</div>
<div id="toast"></div>
<div id="lockScreen">
  <div class="box">
    <div class="head"><h1>Session verrouillée</h1><p>Inactivité prolongée — saisissez votre mot de passe pour reprendre.</p></div>
    <div style="padding:22px 26px 26px">
      <p class="small" style="margin-bottom:10px">Utilisateur : <b id="lockName"></b></p>
      <div class="field"><label>Mot de passe</label><input type="password" id="lockPass" onkeydown="if(event.key==='Enter')unlockSession()"></div>
      <button class="btn" style="width:100%;margin-top:6px" type="button" onclick="unlockSession()">Déverrouiller</button>
      <div id="lockErr" style="display:none;color:var(--danger);font-size:13px;margin-top:10px">Mot de passe incorrect.</div>
      <button class="btn ghost sm" style="width:100%;margin-top:10px" onclick="$('lockScreen').style.display='none';LOCKED=false;logout()">Changer d'utilisateur (déconnexion)</button>
    </div>
  </div>
</div>
<div id="loginScreen">
  <div class="box">
    <div class="head">
      <div class="emb" id="embLogin"></div>
      <div class="flagbar" style="margin:-22px -26px 14px;position:relative;top:22px">
        <span class="b"></span><span class="w"></span><span class="g"></span><span class="j"></span><span class="r"></span>
      </div>
      <h1>République Centrafricaine</h1>
      <p style="letter-spacing:1.4px;text-transform:uppercase;color:var(--jaune);font-weight:700">Unité — Dignité — Travail</p>
      <p style="margin-top:8px"><b>Unité d'exécution du Programme national de désarmement,<br>démobilisation, réintégration et rapatriement</b></p>
      <p style="opacity:.75">UEPNDDR</p>
    </div>
    <form id="loginForm" autocomplete="off" onsubmit="return false">
      <div class="field"><label>Identifiant</label><input id="loginUser" required autofocus></div>
      <div class="field"><label>Mot de passe</label><input id="loginPass" type="password" required></div>
      <button class="btn" style="width:100%;margin-top:6px" type="button" id="loginBtn" onclick="doLogin()">Se connecter</button>
      <div class="err" id="loginErr">Identifiant ou mot de passe incorrect.</div>
      <div class="demo-hint" id="demoHint" style="display:none">
        <b>Comptes de démonstration :</b><br>
        admin / admin2026 — Administrateur<br>
        agent / agent2026 — Agent DDR (opérations)<br>
        suivi / suivi2026 — Chargé de suivi (consultation, visites)
      </div>
    </form>
  </div>
</div>
<div id="app">
  <aside>
    <div class="brand">
      <div class="emb" id="embSide"></div>
      <div><b>PNDDRR</b><small>Suivi du désarmement · RCA</small></div>
    </div>
    <nav id="mainNav"></nav>
    <div class="userbox">
      <b id="uName"></b><span class="role" id="uRole"></span>
      <button onclick="mMonPass()">Mon mot de passe</button>
      <button onclick="logout()">Se déconnecter</button>
    </div>
  </aside>
  <main>
    <header class="top">
      <div class="flagbar"><span class="b"></span><span class="w"></span><span class="g"></span><span class="j"></span><span class="r"></span></div>
      <div id="bannerRCA" class="banner"></div>
      <div class="inner"><h2 id="pageTitle">Tableau de bord</h2><div style="display:flex;gap:16px;align-items:center;flex-shrink:0"><div class="small" id="netBadge"></div><div class="date" id="todayLbl"></div></div></div>
    </header>
    <div id="view"></div>
  </main>
</div>
<div class="modal-back" id="modalBack"><div class="modal" id="modalBox"></div></div>
`;

/**
 * Hosts the modular PNDDRR engine.
 * Shell DOM is owned outside React reconciliation so classic listeners stay valid.
 */
export function PnddrrApp() {
  const hostRef = useRef<HTMLDivElement>(null);
  const booted = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (booted.current || !hostRef.current) return;
    booted.current = true;
    hostRef.current.innerHTML = SHELL_HTML;

    const onReady = () => setStatus("ready");
    document.addEventListener("pnddrr-ready", onReady);

    if (window.__PNDDRR_READY) {
      document.dispatchEvent(new Event("pnddrr-bind"));
      setStatus("ready");
      return () => document.removeEventListener("pnddrr-ready", onReady);
    }

    const script = document.createElement("script");
    script.src = "/engine/pnddrr.bundle.js?v=session-3";
    script.dataset.pnddrrEngine = "1";
    script.onerror = () => setStatus("error");
    document.body.appendChild(script);

    return () => document.removeEventListener("pnddrr-ready", onReady);
  }, []);

  return (
    <>
      {status === "loading" && (
        <div className="pnddrr-boot">Chargement de PNDDRR…</div>
      )}
      {status === "error" && (
        <div className="pnddrr-boot pnddrr-boot-error">
          Impossible de charger le moteur PNDDRR.
        </div>
      )}
      <div ref={hostRef} id="pnddrr-root" />
    </>
  );
}

declare global {
  interface Window {
    __PNDDRR_READY?: boolean;
    __PNDDRR_SERVER?: boolean;
    __PNDDRR_DEMO?: boolean;
    __PNDDRR_SYNCED?: boolean;
  }
}
