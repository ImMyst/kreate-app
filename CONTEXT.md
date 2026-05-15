# kreate-app

Outil de scaffolding de projets prêts à développer. Usage personnel (pas de distribution publique en V1).

## Language

**Projet cible** (scaffoldé / generated project) :
Le projet produit par le CLI. Contient la stack complète — monorepo, Effect 4, oxlint/oxfmt, vitest, frontend optionnel, et arborescence `apps/` / `packages` / `.repos`.

**Template de frontend** :
Une combinaison framework + UI proposée lors du scaffolding. Parmi lesquels : Tanstack Start + Tailwind, Expo + Tamagui.

**Dépôt vendu** (vendored repo) :
Un dépôt externe cloné via git subtree dans `.repos/`. Sert de référence locale sans dépendre de GitHub. Les dépôts vendus par défaut : effect-smol, opencode, t3code.

**Package de domaine** :
Le seul package pré-scaffoldé dans `packages/` (`@<project-name>/domain`). Contient un service Effect d'exemple (pattern `Effect.Tag` + `Layer`) avec son test `@effect/vitest` (`it.effect` + `assert`) qui passe, servant de smoke test à la stack. Les autres packages (persistence, application, runtime, integrations) sont ajoutés manuellement par l'utilisateur.

**Dossier source `src/`** :
Chaque package et chaque app dans le projet cible contient son code dans `src/`. Les tests sont co-localisés (`src/**/*.test.ts`) comme dans kuest. Les entrées sont dans `src/index.ts`.

## Relationships

- Le **CLI** (kreate-app lui-même) produit un **Projet cible**
- Un **Projet cible** peut inclure zéro ou un **Template de frontend**
- Un **Projet cible** inclut toujours zéro ou plusieurs **Dépôts vendus**
- Un **Projet cible** inclut toujours un **Package de domaine**

## Flagged ambiguities

- Aucune pour l'instant.

## CLI

**Nom du package npm** : `kreate-app`.
**Commande** : `bunx kreate-app new <project-name>`.
**Alias** : `create-kreate-app` pour compatibilité `npm create` / `bun create`.

## Templates de frontend

Les templates sont embarqués dans le CLI (fichiers statiques copiés). Noms d'apps fixes :

- `web` → Tanstack Start + Tailwind
- `mobile` → Expo + Tamagui

## Projet scaffoldé

**Git** : auto-init + premier commit "Initial scaffold" après succès du `bun install`.
**Premier commit** : inclut la config monorepo, le package domain, le .gitignore, le frontend choisi, et les dépôts vendus.

**Dépôts vendus** : installés via `git subtree add --squash` pendant le scaffolding. Script `repos:update` dans package.json pour les mises à jour.

**Husky** : présent avec un hook pre-commit qui lance `bun lint` et `bun format:check`.

**CI (GitHub Actions)** : workflow `.github/workflows/ci.yml` qui lance `typecheck + lint + format:check + test` sur push et PR.

## Outils d'orchestration

**Turbo** : Inclus dans tout projet scaffoldé. Présent dans la racine (`turbo.json`) avec les tâches : `typecheck`, `lint`, `format`, `test`, `dev`.
