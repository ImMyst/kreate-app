# kreate-app

CLI de scaffolding de projets prêts à développer. Usage personnel (V1).

## Stack du projet cible

| Couche          | Technologie             |
| --------------- | ----------------------- |
| Package manager | bun                     |
| Monorepo        | bun workspaces + turbo  |
| Langage         | TypeScript ~6.x         |
| Linter          | oxlint                  |
| Formateur       | oxfmt                   |
| Runtime effect  | Effect 4                |
| Tests           | vitest + @effect/vitest |

## CLI (kreate-app lui-même)

- **Stack** : Effect 4 + Effect CLI + vitest + oxfmt + oxlint (dogfooding)
- **Commande principale** : `bunx kreate-app new <project-name>`
- **Argument positionnel** : `<project-name>` obligatoire. `.` = dossier courant (nom dérivé du basename)
- **Alias** : `create-kreate-app` pour `bun create`
- **Commande secondaire** : `bunx kreate-app repos` — ajoute les dépôts vendus
- **Approche** : Effect CLI (déterministe, typé, testable)
- **Packages** : mono-package en V1 (refactor en packages séparés si le CLI grossit)

## Validation du nom de projet

- Doit être un identifiant npm valide (lowercase, tirets autorisés, pas d'espaces)
- Si `.` est passé : basename du dossier courant, normalisé (lowercase, espaces → tirets)
- Nom invalide → erreur claire

## Mode de dossier cible

- Dossier inexistant → créé par le CLI
- Dossier existant vide → scaffold dedans
- Dossier existant non vide → erreur, pas de scaffold

## Prompt frontend

- Interactif après validation du nom de projet
- Sélecteur : `none` (par défaut), `web` (Tanstack Start + Tailwind), `mobile` (Expo + Tamagui)
- Flag `--frontend=web|mobile|none` pour bypasser le prompt

## Architecture du projet cible

```
<project-name>/
├── apps/
│   ├── web/              # (si frontend web choisi) Tanstack Start + Tailwind
│   └── mobile/           # (si frontend mobile choisi) Expo + Tamagui
├── packages/
│   └── domain/           # @<project-name>/domain — seul package pré-créé
├── .github/
│   └── workflows/
│       └── ci.yml        # typecheck + lint + format:check + test
├── .husky/
│   └── pre-commit        # bun lint + bun format:check
├── .vscode/
│   └── settings.json     # exclut .repos/ du search/watcher
├── package.json
├── tsconfig.base.json
├── turbo.json
├── .oxlintrc.json
├── .oxfmtrc.json
├── vitest.config.ts
└── .gitignore
```

Note : `.repos/` n'est PAS créé par `new`. Il est ajouté par la commande `repos`.

## Conventions du projet cible

- **Namespace** : `@<project-name>/<package>` (scope dérivé du nom de projet)
- **Dossier source** : chaque package/app a `src/` + entrée `src/index.ts`
- **Tests** : co-localisés dans `src/` (`src/**/*.test.ts`)
- **Package domain** : contient un service Effect d'exemple (Tag + Layer) avec un test `@effect/vitest` qui passe
- **Frontend** : templates embarqués, fixes (`web` ou `mobile`)
  - Tanstack Start : structure officielle + un exemple de pont Effect → route (appel du service domain)
  - Expo : structure officielle minimale

## Pipeline de scaffolding (`new`)

1. Valider le nom de projet (npm valide, normaliser si `.`)
2. Vérifier le dossier cible (inexistant → créer, vide → ok, non vide → erreur)
3. Écrire la config racine (package.json, tsconfig, turbo, oxlint, oxfmt, vitest, gitignore, vscode)
4. Prompt frontend (interactif ou via `--frontend`)
5. Si frontend choisi : copier le template dans `apps/<name>/` et ajouter les entrées gitignore correspondantes
6. Créer `packages/domain/` avec le starter Effect
7. Initialiser git → `git init`
8. `bun install` (si échec → erreur, pas de commit)
9. `git add .` → `git commit -m "Initial scaffold"`
10. Afficher "Prêt ! cd <project-name> && bun dev"

**Pas de rollback en cas d'échec V1.** Message d'erreur clair avec l'étape qui a échoué.

## Pipeline de vendoring (`repos`)

1. Vérifier qu'on est dans un repo git (sinon erreur)
2. Afficher la liste des repos disponibles (effect-smol, opencode, t3code)
3. Sélection interactive de quels repos ajouter
4. Pour chaque repo sélectionné :
   - Si `.repos/<name>/` existe déjà → skip avec warning
   - Sinon : clone depuis GitHub → `git subtree add --squash`
5. Afficher le résumé des repos ajoutés

## Templates de frontend

Les templates sont des dossiers statiques dans le repo du CLI (`templates/web/`, `templates/mobile/`).
Tokens remplacés pendant le scaffolding : `{{projectName}}`, `{{scopeName}}`.
Remplacement sur le contenu ET les noms de fichiers.

## .gitignore

**Toujours présent** :

```
node_modules/
.npm
bun.lockb
dist/
build/
.turbo/**
*.tsbuildinfo
tsconfig.tsbuildinfo
*.swp
*.swo
*~
.DS_Store
Thumbs.db
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env
.env.local
.env.*.local
.husky/_
.repos/
coverage/
*.lcov
tmp/
temp/
```

**Ajouts si web** :

```
.vinxi/
.nitro/
.tanstack/
.output/
dist-ssr/
*.local
```

**Ajouts si mobile** :

```
.expo/
.expo-shared/
dist/
web-build/
ios/
android/
```
