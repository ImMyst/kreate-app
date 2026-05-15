# Git subtree --squash pour le vendoring des dépendances de référence

Les dépôts de référence (effect-smol, opencode, t3code) sont vendus dans `.repos/` via `git subtree add --squash`.

Alternatives considérées : `git submodule` (versionnage précis mais UX complexe — `git submodule update`, détachement, confusion), script `git clone` dans `.repos/` (simple mais pas de lien avec l'historique du projet, pas de versionnage).

Le subtree --squash donne des fichiers versionnés dans le repo principal (accessibles hors-ligne dès le clone, sans étape supplémentaire) sans polluer l'historique avec l'historique complet des dépôts vendus. Le prix : les `git subtree pull` sont plus lents qu'un `git submodule update`, et le `--squash` perd l'historique fin des dépôts amont.

Conséquence : les repos vendus sont toujours disponibles après un clone nu, mais les mises à jour passent par un script `repos:update` dédié.
