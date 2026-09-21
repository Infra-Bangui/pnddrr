# PNDDRR — Suivi DDR (République Centrafricaine)

Application du **Programme national de désarmement, démobilisation, réintégration et rapatriement** (UEPNDDR / PNDDRR).

Le métier tourne en JavaScript classique. Next.js sert l’UI, l’API de session et le fichier registre.

## Où écrire le code

Une fonction = un dossier. **`src/modules/` est la source.** Le bundle navigateur est généré, on ne l’édite pas.

```
src/modules/     # métier (combattants, armes, réintégration…)
src/server/      # session, hash, stockage du registre (PostgreSQL ou fichier)
src/app/api/     # login, db, health
db/              # schema.sql (table registry) + views.sql (vues de consultation)
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

Le registre entier est **un seul document JSON**, lu et réécrit en bloc à chaque sauvegarde. Deux backends de stockage (`src/server/store.ts`) :

| Contexte | Backend | Sélection |
|---|---|---|
| Production Bangui | PostgreSQL sur `data01` — table `registry` (1 ligne, colonne `jsonb`) | `DATABASE_URL` défini |
| Dev local | fichier `DATA_DIR/pnddrr.json` | `DATABASE_URL` absent |

Une session httpOnly est exigée pour lire ou écrire. `localStorage` reste un cache navigateur.

### Consultation SQL

`db/views.sql` crée des vues relationnelles (`v_combattants`, `v_journal`, `v_users`, `v_desarmement_armes`) au-dessus du `jsonb` — pour CloudBeaver, Grafana et les exports. À rejouer après un changement de structure du registre.

### Migration fichier → PostgreSQL

```bash
# 1. Sauvegarde du fichier courant (sur la VM pnddrr)
docker exec pnddrr cat /data/pnddrr.json > backup-pnddrr-$(date +%F).json

# 2. Table + chargement du registre existant (depuis une machine qui atteint data01)
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -v reg="$(cat backup-pnddrr-AAAA-MM-JJ.json)" \
  -c "INSERT INTO registry (id, data) VALUES (1, :'reg'::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now();"

# 3. Vues de consultation
psql "$DATABASE_URL" -f db/views.sql

# 4. Déployer : ajouter DATABASE_URL à /opt/app/.env puis redéployer.
```

## Déploiement Bangui

Chaîne : `git push` (branche `main`, dépôt `Infra-Bangui/pnddrr`) → image `ghcr.io/infra-bangui/pnddrr:latest` → runner `ci01` → VM `pnddrr` (`192.168.10.181`) → Traefik → `https://pnddrr.datapr.org`.

Sur la VM, le compose lit `/opt/app/.env` (jamais dans git, jamais écrasé par le workflow) :

```
DATABASE_URL=postgresql://pnddrr:<mot-de-passe-vault>@192.168.10.151:5432/pnddrr
SESSION_SECRET=   # openssl rand -hex 32
ADMIN_PASSWORD=   # mot de passe du compte admin au premier boot (registre vide)
PNDDRR_DEMO=0
PNDDRR_SECURE_COOKIE=1   # derrière HTTPS
```

L’app écoute `8080` sur l’hôte → `3000` dans le conteneur. Le registre est la table `registry` de la base `pnddrr` sur `data01` (mot de passe : `vault_pnddrr_db_password`). Le volume Docker `pnddrr-data` ne sert plus que de secours si `DATABASE_URL` est retiré.

En local sans Docker : `npm run dev`. Pour une image locale : `docker build -t ghcr.io/infra-bangui/pnddrr:latest .`

## Déploiement alternatif

- Vercel : `npm run build` (prébuild = `engine:build`). Le store fichier `/data` n’est pas persistant sur Vercel — Docker/Proxmox est le mode prévu pour un registre partagé.
