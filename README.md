# PNDDRR — Suivi DDR (République Centrafricaine)

Application Next.js du **Programme national de désarmement, démobilisation, réintégration et rapatriement** (UEPNDDR / PNDDRR).

## Architecture modulaire

```
src/
  app/                 # Next.js App Router
  components/          # Shell React (hôte du moteur)
  styles/              # Design system PNDDRR
  modules/
    core/              # État, persistance, crypto, utilitaires
    referentials/      # Géographie, statuts, listes métier
    auth/              # Connexion, verrouillage, permissions
    shell/             # Navigation, modales
    dashboard/         # Tableau de bord & alertes
    combattants/       # Enregistrement, registre, fiche
    armes/             # Registre des armes & munitions
    reintegration/     # Suivi + formation / jalons
    cartographie/      # Zones de désarmement
    documents/         # Cartes & attestations
    admin/             # Comptes, journal, import, sauvegarde…
    stats/             # Statistiques
    demo/              # Jeu de données de simulation
```

Les modules métier sont découpés sous `src/modules/`. Le bundle navigateur est généré dans `public/engine/pnddrr.bundle.js` via :

```bash
npm run engine:build
```

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
