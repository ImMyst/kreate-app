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
- **Commande** : `bunx kreate-app new <project-name>`
- **Alias** : `create-kreate-app` pour `bun create`
- **Approche** : Effect CLI (déterministe, typé, testable)
- **Packages** : mono-package en V1 (refactor en packages séparés si le CLI grossit)

## Architecture du projet cible

```
<project-name>/
├── apps/
│   ├── web/              # (si frontend web choisi) Tanstack Start + Tailwind
│   └── mobile/           # (si frontend mobile choisi) Expo + Tamagui
├── packages/
│   └── domain/           # @<project-name>/domain — seul package pré-créé
├── .repos/
│   ├── effect-smol/      # git subtree --squash
│   ├── opencode/         # git subtree --squash
│   └── t3code/           # git subtree --squash
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

## Conventions du projet cible

- **Namespace** : `@<project-name>/<package>` (scope dérivé du nom de projet)
- **Dossier source** : chaque package/app a `src/` + entrée `src/index.ts`
- **Tests** : co-localisés dans `src/` (`src/**/*.test.ts`)
- **Package domain** : contient un service Effect d'exemple (Tag + Layer) avec un test `@effect/vitest` qui passe
- **Frontend** : templates embarqués, fixes (`web` ou `mobile`)
  - Tanstack Start : structure officielle + un exemple de pont Effect → route (appel du service domain)
  - Expo : structure officielle minimale

## Pipeline de scaffolding

1. Créer le dossier `/<project-name>`
2. Écrire la config racine (package.json, tsconfig, turbo, oxlint, oxfmt, vitest, gitignore, vscode)
3. Option : demander le template de frontend (web / mobile / aucun)
4. Copier le template frontend dans `apps/<name>/`
5. Créer `packages/domain/` avec le starter Effect
6. Initialiser git → `git init`
7. Ajouter les dépôts vendus → `git subtree add --squash` pour effect-smol, opencode, t3code
8. `bun install`
9. `git add .` → `git commit -m "Initial scaffold"`
10. Afficher "Prêt ! cd <project-name> && bun dev"

## Templates de frontend

Les templates sont des dossiers statiques dans le repo du CLI (`templates/web/`, `templates/mobile/`).
Tokens remplacés pendant le scaffolding : `{{projectName}}`, `{{scopeName}}`.
