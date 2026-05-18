# 🔨 kreate-app

Scaffolding CLI pour projets TypeScript modernes, prêts à développer.

`bunx kreate-app new mon-projet` → stack Effect 4 + oxlint/oxfmt + vitest + turbo, avec ou sans frontend, et les dépôts de référence en git subtree.

## Stack générée

| Couche          | Technologie                                  |
| --------------- | -------------------------------------------- |
| Runtime         | Effect 4                                     |
| Langage         | TypeScript 6                                 |
| Linter          | oxlint                                       |
| Formateur       | oxfmt                                        |
| Tests           | vitest + @effect/vitest                      |
| Monorepo        | bun workspaces + turbo                       |
| Frontend (opt.) | Tanstack Start + Tailwind, ou Expo + Tamagui |

## Usage

```bash
bunx kreate-app new mon-projet
```

Le CLI demande :

- Template de frontend (web / mobile / aucun)
- Puis scaffold, git init, git subtree, bun install, premier commit

## Architecture du projet généré

```
mon-projet/
├── apps/
│   ├── web/              # Tanstack Start + Tailwind (si choisi)
│   └── mobile/           # Expo + Tamagui (si choisi)
├── packages/
│   └── domain/           # @mon-projet/domain — starter Effect
├── .repos/
│   ├── effect-smol/      # référence locale Effect
│   ├── opencode/         # référence locale agents
│   └── t3code/           # référence locale t3
├── .github/workflows/ci.yml
├── .husky/pre-commit
├── .vscode/settings.json
├── package.json
├── tsconfig.base.json
├── turbo.json
├── .oxlintrc.json
├── .oxfmtrc.json
└── vitest.config.ts
```

## Stack du CLI lui-même

kreate-app est écrit en Effect 4 + Effect CLI — dogfooding : le CLI utilise la même stack qu'il scaffold.

```
kreate-app/
├── src/
│   ├── commands/        # sous-commandes Effect CLI
│   ├── templates/       # templates de frontend embarqués
│   └── main.ts          # entry point
├── package.json
└── ...
```

## Développement

```bash
git clone <repo>
bun install
bun dev              # mode dev du CLI
bun run test         # tests
bun lint             # oxlint
bun format           # oxfmt
bun typecheck        # tsc
```

## Roadmap

- [x] CLI de base (Effect CLI, commande `new`)
- [x] Templates de fichiers (package.json, tsconfig, oxlint, oxfmt, turbo, vitest, git)
- [ ] Template frontend web (Tanstack Start + Tailwind)
- [ ] Template frontend mobile (Expo + Tamagui)
- [x] Pipeline complet (scaffold → git init → subtree → install → commit)
- [ ] Tests end-to-end du rendu
