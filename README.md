# Management de l'innovation — Capsules vidéo (projet AIH)

Site statique bilingue (FR / EN) présentant les cinq capsules vidéo du cours **Management de l'innovation** de Benoît Tézenas du Montcel, Institut Mines-Télécom Business School. Réalisé par le service PracTice.

Pour chaque capsule : la vidéo (Médiaserveur IP Paris), un résumé, les points clés, le script à télécharger en PDF et quatre questions de vérification corrigées immédiatement. Aucune donnée n'est collectée : les réponses restent dans le navigateur.

## Structure

```
index.html            page unique
assets/data.js        tout le contenu (FR et EN) : titres, vidéos, résumés, points clés, questions
assets/app.js         rendu, bascule de langue (?lang=fr|en), capsule active (#capsule-N), quiz
assets/style.css      charte IMT-BS (violet #AD1D89, bleu #00B8DE)
assets/vignettes/     vignettes des capsules (960×540)
scripts/              scripts en PDF, AIH_Capsule<N>_Script_<FR|EN>.pdf
tools/build_pdfs.py   génération des PDF (FR lus dans ../03_Scripts-capsules, EN dans tools/scripts_en.json)
```

## Mettre à jour

- **Contenu du site** : modifier `assets/data.js`.
- **Scripts PDF** : depuis ce dossier, `python3 tools/build_pdfs.py` (nécessite `reportlab`). Les scripts anglais sont des traductions des scripts français validés par l'enseignant.
- **Ajouter une capsule** : ajouter une entrée dans `capsules` de `data.js`, sa vignette dans `assets/vignettes/` et ses PDF dans `scripts/`.

## Aperçu local

```bash
python3 -m http.server 8765
```

puis ouvrir http://localhost:8765.

## Mentions

Les vidéos sont réalisées à partir des enregistrements du cours ; l'image et la voix de l'enseignant sont générées par un avatar IA. Les textes ont été relus et validés par l'enseignant. Les vidéos sont hébergées sur le Médiaserveur IP Paris.
