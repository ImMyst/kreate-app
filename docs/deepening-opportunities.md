# Deepening Opportunities — kreate-app

Date : 2026-05-15

## 1. `config.ts` — module pass-through, pas de profondeur

**Fichiers** : `src/scaffold/config.ts` (423 lignes)

**Problème** : 15 fonctions exportées, chacune appelée une seule fois par `writeRootConfig` ou `writeDomainPackage`. L'interface est aussi large que l'implémentation — si on supprime ce module, la complexité disparaît (pas de réapparition chez les callers). C'est un module pass-through. Les getters triviaux (`JSON.stringify({...})`) sont mélangés avec les effets FileSystem.

**Solution** : Séparer en deux modules :

- `templates/` — fichiers statiques bruts avec tokens `{{projectName}}` / `{{scopeName}}`, un par fichier de config. Plus de getters JS, juste du texte.
- `config.ts` — ne garde que `writeRootConfig` et `writeDomainPackage`, qui lisent les templates et font le token replacement.

**Bénéfices** :

- Localité — changer un template = éditer un fichier, pas une fonction JS
- Profondeur — l'interface se réduit à 2 fonctions + un mécanisme de token replacement
- Tests — "le fichier X contient le token Y" au lieu de parser du JSON dans 24 tests unitaires

**Conflit ADR** : ADR-0003 dit "templates embarqués dans le CLI" — cette proposition va dans ce sens, pas de conflit.

---

## 2. `pipeline.ts` — `runCommand` sans seam testable

**Fichiers** : `src/scaffold/pipeline.ts`

**Problème** : `scaffold()` appelle directement `Bun.spawn` via `runCommand`. Pas de seam pour le process spawning — impossible de tester le pipeline sans lancer de vrais processus git/bun. Le test actuel de `validateDirectory` est isolé mais ne touche jamais `scaffold()`. Compare avec Effect : ils utilisent `ChildProcessSpawner` comme service, mockable en test.

**Solution** : Introduire un service `ProcessRunner` (ou utiliser `ChildProcessSpawner` d'Effect) derrière un seam. `scaffold()` dépend de l'interface, pas de `Bun.spawn` directement. L'adapter Bun est fourni via `Effect.provide`.

**Bénéfices** :

- Testabilité — le pipeline entier se teste avec un mock qui capture les commandes invoquées
- Localité — les bugs de spawn sont concentrés dans un seul adapter
- Le test `pipeline.test.ts` actuel ne couvre que `validateDirectory` ; avec un seam, on peut tester tout le flow

---

## 3. `repos.ts` — logique métier noyée dans le handler CLI

**Fichiers** : `src/commands/repos.ts`

**Problème** : La logique de vendoring (clone → add → subtree → cleanup) est directement dans le handler `Command.make`. Pas de module séparé. Si on veut tester "ajoute un repo sans le prompt", on ne peut pas — tout est couplé au CLI. Le pattern Effect sépare la logique métier du parsing CLI (voir `TestActions` dans `.repos/effect`).

**Solution** : Extraire un module `vendoring.ts` avec une fonction `addRepo(repo: RepoDefinition): Effect<void, Error, FileSystem | ProcessRunner>` testable indépendamment. Le handler CLI ne fait que : prompt → appelle `addRepo` pour chaque sélection.

**Bénéfices** :

- Profondeur — `addRepo` a une interface petite (un `RepoDefinition` en entrée) et cache toute la complexité git
- Tests — on teste `addRepo` avec un mock FileSystem + mock ProcessRunner, sans toucher au CLI
- Le test `repos.test.ts` actuel ne vérifie que `expect(command).toBeDefined()`

---

## 4. Tests de commandes CLI — coverage superficielle

**Fichiers** : `src/commands/new.test.ts`, `src/commands/repos.test.ts`

**Problème** : Les tests vérifient juste `expect(command).toBeDefined()`. Aucune vérification du parsing, des flags, des prompts, ou des erreurs. Compare avec `.repos/effect` : ils testent le parsing, les erreurs, l'aide, les suggestions, et capturent les actions via `TestActions` + `TestConsole` + `MockTerminal`.

**Solution** : Utiliser `Command.runWith` + `TestConsole` + `MockTerminal` pour tester :

- `new` : parsing de l'argument positionnel, flag `--frontend`, erreur nom invalide
- `repos` : détection "pas dans un repo git", sélection interactive

**Bénéfices** :

- L'interface des commandes est la surface de test — c'est là que les bugs apparaissent
- Couvrir le parsing et les prompts donne confiance que le CLI se comporte correctement
- Les tests de commande dans Effect montrent que c'est faisable sans lancer le CLI réel

---

## 5. `validation.ts` — erreurs non typées

**Fichiers** : `src/scaffold/validation.ts`

**Problème** : Retourne `Error` générique avec un message string. Le caller ne peut pas distinguer "nom invalide" d'autres erreurs. Pas de type d'erreur dédié. Le caller dans `pipeline.ts` fait un `Effect.fail(new Error(...))` pour le dossier non vide — même pattern, même problème.

**Solution** : Définir un type `ScaffoldError` avec des tags (`InvalidName`, `DirectoryNotEmpty`, etc.) et utiliser `Effect.fail` avec des erreurs typées. Le caller peut `catchTag`.

**Bénéfices** :

- L'interface gagne en précision — le type d'erreur fait partie de l'interface
- Les tests peuvent vérifier le tag, pas parser le message
- Le caller peut réagir différemment selon le type d'erreur (ex: afficher un message différent)

---

## Ordre recommandé

1. **#5** (erreurs typées) — petit changement, fondation pour le reste
2. **#1** (templates statiques) — réduit `config.ts` de 423 → ~50 lignes
3. **#2** (seam ProcessRunner) — permet de tester le pipeline
4. **#3** (module vendoring) — sépare logique métier du CLI
5. **#4** (tests CLI) — dépend de #2 et #3 pour être efficace
