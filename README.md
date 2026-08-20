# PNDDRR — Suivi DDR (République Centrafricaine)

Application du **Programme national de désarmement, démobilisation, réintégration et rapatriement** (UEPNDDR / PNDDRR).

Le métier tourne en JavaScript classique. Next.js sert l’UI, l’API de session et le fichier registre.

## Où écrire le code

Une fonction = un dossier. **`src/modules/` est la source.** Le bundle navigateur est généré, on ne l’édite pas.

```
src/modules/     # métier (combattants, armes, réintégration…)
src/server/      # session, hash, fichier /data/pnddrr.json
src/app/api/     # login, db, health
```

```bash
npm run engine:build
```

## Démarrage local

```bash
npm install
cp .env.example .env   # SESSION_SECRET + ADMIN_PASSWORD
npm run engine:build
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Compte initial : `admin` + la valeur de `ADMIN_PASSWORD` (en dev sans fichier data : `admin2026`).

Les comptes de démonstration (admin2026 / agent2026 / suivi2026) ne s’affichent que si `PNDDRR_DEMO=1`.

## Données

En production (Docker / VM) le registre est un fichier JSON dans le volume `/data`. Une session httpOnly est exigée pour lire ou écrire. `localStorage` reste un cache navigateur.

## Déploiement Bangui

Chaîne : `git push` (branche `main`, dépôt `Infra-Bangui/pnddrr`) → image `ghcr.io/infra-bangui/pnddrr:latest` → runner `ci01` → VM `pnddrr` (`192.168.10.181`) → Traefik → `https://pnddrr.datapr.org`.

Sur la VM, le compose lit `/opt/app/.env` (jamais dans git, jamais écrasé par le workflow) :

```
SESSION_SECRET=   # openssl rand -hex 32
ADMIN_PASSWORD=   # mot de passe du compte admin au premier boot
PNDDRR_DEMO=0
PNDDRR_SECURE_COOKIE=1   # derrière HTTPS
```

L’app écoute `8080` sur l’hôte → `3000` dans le conteneur. Le registre est le volume Docker `pnddrr-data`.

En local sans Docker : `npm run dev`. Pour une image locale : `docker build -t ghcr.io/infra-bangui/pnddrr:latest .`

## Déploiement alternatif

- Vercel : `npm run build` (prébuild = `engine:build`). Le store fichier `/data` n’est pas persistant sur Vercel — Docker/Proxmox est le mode prévu pour un registre partagé.
