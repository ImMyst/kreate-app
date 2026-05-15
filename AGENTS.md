# Kreate-app Project Instructions

## Task Completion Requirements

- All of bun format, bun lint, and bun typecheck must pass before considering tasks completed.
- NEVER run bun test. Always use bun run test (runs Vitest).

## Vendored Repositories

This project will vendor external repositories under .repos/ once scaffolding is implemented.

- Use vendored repositories as read-only reference material when working with related libraries
- Prefer examples and patterns from the vendored source code over generated guesses or web search results
- Do not edit files under .repos/ unless explicitly asked
- Do not import from .repos/ - application code should continue importing from normal package dependencies

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `ImMyst/kreate-app`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Testing conventions

Règles pour les tests Effect / `@effect/vitest` dans ce repo.

**Règles**

- `it.effect("...", () => ...)` par défaut pour tout code qui retourne un `Effect`
- `it("...", () => ...)` pour les fonctions pures sans Effect
- `assert` (`@effect/vitest`) pour les tests Effect, pas `expect`. Utiliser `expect` uniquement pour les tests purs
- `it.layer(layer)(name, (it) => ...)` quand plusieurs tests partagent le même graphe de dépendances
- Jamais `Effect.runSync` / `Effect.runPromise` dans un test
- `TestClock` pour figer le temps dans les calculs dépendants du temps

**Anti-patterns**

- Helpers `withXxx(...)` custom qui appellent `Layer.build()`. Remplacer par `it.layer(...)`
- `expect` dans un test `it.effect(...)`. Utiliser `assert` à la place
- Docs API complètes de `@effect/vitest` en aval. Voir `.repos/effect/` pour la doc de référence
- Mock couvre-tout : préférer des implémentations in-memory à des mocks profonds

**Exemple minimal**

```ts
it.effect("scaffold un nouveau projet", () =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* Effect.promise(() => fs.mkdir("/tmp/test-project").execute());
    const exists = yield* Effect.promise(() => fs.exists("/tmp/test-project").execute());
    assert.strictEqual(exists, true);
  })
);

it.layer(makeTestLayer())("ScaffoldPipeline", (it) => {
  it.effect("crée la structure de fichiers", () =>
    Effect.gen(function* () {
      // ...
    })
  );
});
```
