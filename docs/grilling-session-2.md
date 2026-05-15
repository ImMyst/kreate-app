# Grilling Session 2 — Pré-développement CLI

Date : 2026-05-15

## Résumé

Deuxième session de grill avant le développement du CLI. Toutes les zones d'ombre ont été résolues. Le plan est maintenant complet et prêt pour l'implémentation.

## Décisions prises

### Q1 — Argument positionnel pour `new`

**Décision** : `<project-name>` est un argument positionnel obligatoire, pas un flag.

- `bunx kreate-app new my-app` → crée `./my-app/` et scaffold dedans
- `bunx kreate-app new .` → scaffold dans le dossier courant, nom dérivé du basename

### Q2 — Prompt frontend

**Décision** : Prompt interactif après validation du nom de projet.

- Sélecteur : `none` (par défaut), `web`, `mobile`
- Flag `--frontend=web|mobile|none` pour bypasser le prompt

### Q3 — Pas de rollback V1

**Décision** : Pas de rollback automatique en cas d'échec. Message d'erreur clair avec l'étape qui a échoué. L'utilisateur nettoie manuellement.

### Q4 — Commande `repos` séparée

**Décision** : Le vendoring est une commande distincte `bunx kreate-app repos`.

- Vérifie qu'on est dans un repo git
- Liste interactive des repos à ajouter
- Skip si le dossier existe déjà
- Clone depuis GitHub à l'exécution

### Q5 — Timing des templates

**Décision** : Templates créés après le pipeline de base (config, domain, git init). Le pipeline peut être validé sans frontend.

### Q6 — Contenu du package domain

**Décision** : Service Effect minimal (Tag + Layer + test qui passe). Assez concret pour montrer le pattern, pas trop pour ne pas surcharger.

### Q7 — Validation du nom de projet

**Décision** : Identifiant npm valide (lowercase, tirets autorisés, pas d'espaces). Si `.` : basename normalisé. Nom invalide → erreur claire.

### Q8 — Token replacement

**Décision** : Deux tokens uniquement : `{{projectName}}` et `{{scopeName}}`. Remplacement sur contenu ET noms de fichiers. Pas d'autres tokens en V1.

### Q9 — Source des repos

**Décision** : La commande `repos` clone depuis GitHub au moment de l'exécution. Les `.repos/` du CLI servent de référence locale pour le développement du CLI, pas pour le scaffolding.

### Q10 — Dossier cible existant

**Décision** :

- Dossier inexistant → créé
- Dossier existant vide → scaffold dedans
- Dossier existant non vide → erreur

Pas de flag `--force` en V1.

### Q11 — `bun install` et `git init`

**Décision** :

- `bun install` lancé dans le dossier scaffoldé
- Si échec → erreur, pas de commit
- `git init` + commit uniquement si `bun install` réussit

### Q12 — `.gitignore`

**Décision** : Minimum toujours présent (node_modules, bun.lockb, dist, .turbo, .repos/, etc.). Additions dynamiques si frontend choisi :

- **web** : `.vinxi/`, `.nitro/`, `.tanstack/`, `.output/`, `dist-ssr/`, `*.local`
- **mobile** : `.expo/`, `.expo-shared/`, `dist/`, `web-build/`, `ios/`, `android/`

## ADRs créés

- `docs/adr/0004-commande-repos-separee.md` — Séparation de la commande `repos` du pipeline `new`

## Prochaines étapes

1. Implémenter la commande `new` complète (validation, config, domain, git, bun install)
2. Implémenter la commande `repos` (clone, subtree, liste interactive)
3. Créer les templates frontend (web, mobile)
4. Intégrer le prompt frontend et le token replacement
5. Tester le rendu final (`bun install` + `bun test` doit passer)
