# 0004 — Commande `repos` séparée du pipeline `new`

Date : 2026-05-15

## Contexte

Le pipeline de scaffolding original incluait l'ajout des dépôts vendus (`.repos/`) via `git subtree add --squash` pendant la commande `new`. Cela couplait deux responsabilités distinctes : créer la structure du projet et ajouter les références locales pour les IAs.

## Décision

Le vendoring est extrait dans une commande séparée `bunx kreate-app repos`. Le `new` ne crée pas les `.repos/`.

## Raisons

- **Simplicité du pipeline `new`** : moins d'étapes, moins de points de défaillance
- **Flexibilité** : l'utilisateur peut scaffold sans vendoring, ou ajouter des repos plus tard
- **Pas de rollback nécessaire** : `git subtree add` est l'opération la plus complexe et la plus lente du pipeline. La séparer réduit le risque d'échec pendant `new`
- **Usage sélectif** : l'utilisateur peut choisir quels repos ajouter via une liste interactive

## Alternatives considérées

1. **Tout dans `new` avec flag `--vend`** : ajoute de la complexité au pipeline pour un cas d'usage marginal
2. **Bundler les repos dans le package npm** : gonfle considérablement la taille du package, contraire à l'usage personnel

## Conséquences

- L'utilisateur doit lancer deux commandes pour un projet complet : `new` puis `repos`
- Les `.repos/` ne sont pas poussés sur Git (ignorés dans `.gitignore`)
- La commande `repos` clone depuis GitHub à chaque exécution
