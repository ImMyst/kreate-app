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
**Commande principale** : `bunx kreate-app new <project-name>`.
**Argument positionnel** : `<project-name>` est obligatoire. `.` signifie "dossier courant" — le nom est dérivé du basename du dossier.
**Alias** : `create-kreate-app` pour compatibilité `npm create` / `bun create`.
**Commande secondaire** : `bunx kreate-app repos` — ajoute les dépôts vendus via `git subtree add --squash` dans le dossier courant. Liste interactive, skip si le dossier existe déjà.

## Validation du nom de projet

Le nom doit être un identifiant npm valide (lowercase, tirets autorisés, pas d'espaces). Si `.` est passé, le basename du dossier courant est normalisé (lowercase, espaces → tirets). Nom invalide → erreur claire.

## Mode de dossier cible

- Dossier inexistant → créé par le CLI
- Dossier existant vide → scaffold dedans
- Dossier existant non vide → erreur, pas de scaffold

## Prompt frontend

Interactif après validation du nom de projet. Sélecteur avec trois options : `none` (par défaut), `web` (Tanstack Start + Tailwind), `mobile` (Expo + Tamagui). Flag `--frontend=web|mobile|none` pour bypasser le prompt.

## Token replacement

Deux tokens uniquement : `{{projectName}}` et `{{scopeName}}`. Remplacement sur le contenu et les noms de fichiers des templates. Pas d'autres tokens en V1.

## Commande repos

Clone les dépôts depuis GitHub au moment de l'exécution. Liste en dur dans le CLI. Vérifie qu'on est dans un repo git. Demande confirmation avant d'exécuter. Skip les dossiers déjà existants dans `.repos/`.

## .gitignore

Minimum toujours présent : `node_modules/`, `.npm`, `bun.lockb`, `dist/`, `build/`, `.turbo/**`, `*.tsbuildinfo`, IDE, OS, logs, `.env*`, `.husky/_`, `.repos/`, `coverage/`, `tmp/`.
Ajouts dynamiques si frontend choisi :

- **web** : `.vinxi/`, `.nitro/`, `.tanstack/`, `.output/`, `dist-ssr/`, `*.local`
- **mobile** : `.expo/`, `.expo-shared/`, `dist/`, `web-build/`, `ios/`, `android/`

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
