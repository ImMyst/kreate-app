# Effect CLI pour implémenter le scaffolder

Le CLI kreate-app est implémenté avec Effect CLI (`@effect/cli`) plutôt qu'avec une approche par templates AI ou un script shell/node vanilla.

Le pipeline de scaffolding (création de dossiers, écriture de fichiers, exécution de git) bénéficie de la composition typée d'Effect, des tests `@effect/vitest`, et d'un CLI typé déclaratif. L'approche AI aurait été plus rapide à prototyper mais non déterministe — un scaffold doit produire le même résultat à chaque exécution.

Considéré : script shell, templates AI prompting, Node.js vanilla avec `commander` + `fs-extra`. Rejetés pour manque de typage, de testabilité, ou de déterministe.

Conséquence : courbe d'apprentissage Effect CLI, mais dogfooding cohérent avec la stack du projet cible.
