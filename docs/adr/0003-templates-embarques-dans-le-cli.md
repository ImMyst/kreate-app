# Templates de frontend embarqués dans le CLI

Les templates de frontend (Tanstack Start + Tailwind pour `web`, Expo + Tamagui pour `mobile`) sont embarqués comme dossiers statiques dans le repo du CLI (`templates/`), copiés mot-à-mot pendant le scaffolding.

Alternatives considérées : dépôts GitHub séparés (versionnage indépendant des templates, contributions externes possibles, mais dépendance réseau au scaffolding et désynchronisation CLI/template possible), génération programmatique (flexible mais beaucoup de code pour reproduire des structures de fichiers standard).

L'approche embarquée garantit que le CLI et ses templates sont toujours versionnés ensemble, que le scaffolding fonctionne hors-ligne, et que les templates peuvent être modifiés sans publier sur GitHub. Le prix : les templates ne peuvent pas être mis à jour indépendamment du CLI, et le repo du CLI grossit avec des fichiers statiques.

Conséquence : ajouter un nouveau template = PR dans le repo du CLI. Pas de dépendance réseau pendant `kreate-app new`.
