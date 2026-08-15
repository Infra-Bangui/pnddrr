# PNDDRR — Suivi DDR (République Centrafricaine)

Application du **Programme national de désarmement, démobilisation, réintégration et rapatriement** (UEPNDDR / PNDDRR).

Le métier tourne en JavaScript classique (hors ligne, `localStorage`). Next.js sert de véhicule de déploiement.

## Où écrire le code

Une fonction = un dossier. **`src/modules/` est la source.** Le bundle navigateur est généré, on ne l’édite pas.

```
src/modules/
  core/              # État, persistance, utilitaires
  referentials/      # Géographie, statuts, listes métier
  auth/              # Connexion, verrouillage, permissions
  shell/             # Navigation, modales
  dashboard/         # Tableau de bord
  combattants/       # Enregistrement, registre, fiche
  armes/             # Registre des armes
  reintegration/     # Suivi + jalons de formation
  cartographie/      # Carte des zones de désarmement
  documents/         # Cartes & attestations
  admin/             # Import, comptes, journal, paramètres, sauvegarde
  stats/             # Statistiques
  demo/              # Jeu de données de simulation
```

```bash
npm run engine:build
```

Produit `public/engine/pnddrr.bundle.js`. Le `prebuild` Next.js le lance tout seul.

## Démarrage local

```bash
npm install
npm run engine:build
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Comptes démo

| Identifiant | Mot de passe | Rôle |
|-------------|--------------|------|
| admin | admin2026 | Administrateur |
| agent | agent2026 | Agent DDR |
| suivi | suivi2026 | Chargé de suivi |

## Données

Persistance locale (`localStorage`) + export/import JSON multi-postes. Aucune base distante n’est requise pour la démonstration.

## Déploiement

- GitHub : dépôt source
- Vercel : `npm run build` (prébuild = `engine:build`)
