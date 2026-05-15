# Grilling Session 1 — Design du projet kreate-app

Date : 2026-05-15

## Résumé

Première session de grill sur la conception de `kreate-app`, un CLI de scaffolding de projets prêts à développer, basé sur Effect 4 + bun + oxlint/oxfmt + vitest + turbo.

## Arbre de décision

### Q1 — Usage personnel vs public

**Décision** : Personnel (V1). Pas de distribution npm publique, pas de doc site, pas de CI complexe.
_Conséquence : scope simplifié, publiable plus tard si le projet matured._

### Q2 — Effect CLI vs AI approach

**Décision** : Effect CLI.
_Raison : déterministe, typé, testable, dogfooding cohérent. Voir ADR-0001._

### Q3 — Frontends supportés

**Décision** : Choix multiples. Tanstack Start + Tailwind (web) ou Expo + Tamagui (mobile), ou aucun.
_Conséquence : le CLI pose la question pendant le scaffolding._

### Q4 — Package naming

**Décision** : `@<project-name>/<package>`. Ex: `@mon-app/domain`.
_Conséquence : le CLI dérive le scope du nom de projet fourni._

### Q5 — Packages pré-scaffoldés

**Décision** : Un seul — `packages/domain/`. Les autres (persistence, application, runtime, integrations) sont ajoutés manuellement.
_Conséquence : structure minimale, pas de sur-engineering._

### Q6 — Dépôts vendus (.repos/)

**Décision** : effect-smol, opencode, t3code. Git subtree --squash.
_Raison : référence locale sans dépendre de GitHub. Voir ADR-0002._

### Q7 — Commande CLI

**Décision** : `bunx kreate-app new <project-name>`.
_Alias secondaire : `create-kreate-app` pour compatibilité bun create._

### Q8 — Contenu du starter domain

**Décision** : Pattern Effect.Tag + Layer avec un test @effect/vitest qui passe. Smoke test de la stack.
_Emplacement : `packages/domain/src/` + `src/index.ts`._

### Q9 — Organisation du code

**Décision** : `src/` pour tout le code, tests co-localisés (`src/**/*.test.ts`). Entrée `src/index.ts`.
_Pattern kuest._

### Q10 — Turbo

**Décision** : Inclus dans tout projet scaffoldé.
_Tâches : typecheck, lint, format, test, dev._

### Q11 — Git

**Décision** : Auto-init + premier commit "Initial scaffold" après bun install réussi.
_Inclut : config + domain + frontend + repos vendus._

### Q12 — Husky

**Décision** : Inclus. Pre-commit hook : `bun lint` + `bun format:check`.

### Q13 — CI

**Décision** : GitHub Actions. `.github/workflows/ci.yml` : typecheck + lint + format:check + test sur push/PR.

### Q14 — Templates de frontend

**Décision** : Fichiers embarqués dans le CLI (`templates/web/`, `templates/mobile/`).
_Noms d'apps fixes : `web` et `mobile`. Voir ADR-0003._

### Q15 — Contenu des templates

- **Tanstack Start** : structure officielle (src/routes, src/components, src/styles, src/utils, router.tsx, routeTree.gen.ts, Tailwind v4) + un exemple de pont Effect → route (appel du service domain).
- **Expo** : structure officielle de `create-expo-app` minimale.

### Q16 — Stack du CLI lui-même

**Décision** : Effect 4 + Effect CLI + vitest + oxfmt + oxlint + TypeScript + bun.
_Dogfooding : le CLI utilise la même stack qu'il scaffold._

### Q17 — Conventions de configuration

- `.vscode/settings.json` inspiré de kuest (oxc formatter, .repos/ exclu du search/watcher/explorer)
- `.gitignore` inspiré de kuest, adapté au frontend choisi

### Q18 — Nom du package npm

**Décision** : `kreate-app`.

## ADRs créés

- `docs/adr/0001-effect-cli-pour-le-scaffolder.md`
- `docs/adr/0002-git-subtree-squash-pour-vendoring.md`
- `docs/adr/0003-templates-embarques-dans-le-cli.md`

## Prochaines étapes

- Implémenter le CLI (Effect CLI)
- Créer les templates de fichiers (package.json, tsconfig, oxlint, oxfmt, turbo, vitest, gitignore, vscode)
- Créer les templates frontend (web, mobile)
- Implémenter le pipeline de scaffolding (création, copie, git init, git subtree, bun install, commit)
- Tester le rendu final (bun install + bun test doit passer)
