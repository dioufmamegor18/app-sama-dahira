# SAMA DAHIRA — Plateforme de gestion administrative et financière d'un Dahira

Application web front-end (HTML5 / CSS3 / JavaScript / LocalStorage) développée pour le module
**Développement Web** — L3 Ingénierie Informatique, UAM Polytech Diamniadio.

---

## 1. Lancer l'application

L'application est 100% statique (aucun serveur, aucune dépendance externe), mais les navigateurs
restreignent parfois `localStorage` pour les pages ouvertes directement en double-clic (protocole
`file://`). **Pour une expérience fiable, servez le dossier via un petit serveur local** :

```bash
# Depuis le dossier SAMA-DAHIRA
python3 -m http.server 8000
# puis ouvrir http://localhost:8000 dans le navigateur
```

Ou avec l'extension **Live Server** de VS Code (clic droit sur `index.html` → "Open with Live Server").
Vous pouvez aussi ouvrir `index.html` directement : cela fonctionne dans la plupart des navigateurs,
mais un serveur local reste recommandé pour éviter toute limitation liée au protocole `file://`.

### Comptes de démonstration

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Responsable | `admin@samadahira.com` | `admin123` |
| Membre (Awa Diop, objectif déjà atteint — déclenche la célébration) | `DT00001` | `123456` |
| Membre (Fatou Sow, objectif en cours) | `DT00002` | `123456` |

Le bouton **↺ Réinitialiser aux données de démonstration** (section *Responsables*) permet de
repartir d'un jeu de données propre à tout moment.

---

## 2. Structure du projet

```
SAMA-DAHIRA/
├── index.html              Structure complète : vitrine, connexion, adhésion, application, modales
├── css/style.css           Design system (tokens, composants, responsive, impression)
└── js/
    ├── storage.js          Accès LocalStorage + données de démonstration
    ├── utils.js            Formatage, toasts, confirmation, modales génériques
    ├── auth.js              Connexion, demandes d'adhésion, multi-responsables
    ├── membres.js           Membres, fiches, statuts, bilan financier
    ├── sessions.js          Sessions & objectifs par sexe
    ├── caisses.js           Caisses & soldes automatiques
    ├── cotisations.js       Saisie simple / rapide / en lot, verrou d'édition 1h
    ├── depenses.js          Dépenses par catégorie, lien vers un événement
    ├── ziara.js             Déplacement + hadiya, impact automatique sur la caisse
    ├── evenements.js        Budget prévu vs réalisé, écarts dynamiques
    ├── charts.js            Graphiques canvas natifs (barres + donut), sans librairie
    ├── dashboard.js         KPIs, synthèse, valorisation
    ├── confetti.js          Animation de gamification
    ├── membre-espace.js     Espace personnel restreint du membre
    ├── public.js            Vitrine publique
    ├── rapports.js          Bilan imprimable
    └── router.js            Navigation, garde de rôle, démarrage unique
```

---

## 3. Correspondance avec le cahier des charges

| Cahier des charges | Statut | Où |
|---|---|---|
| Socle HTML5/CSS3/JS/LocalStorage uniquement | ✅ | Tout le projet — aucune librairie externe |
| Espace Responsables multi-gestionnaires | ✅ | `responsables-section` (ajout/retrait de comptes) |
| Espace Membre restreint et personnel | ✅ | `espace-membre-section` (bilan, historique, gamification) |
| Matricule auto `[2 Lettres][5 Chiffres]` | ✅ | `genererMatricule()` dans `membres.js`, robuste aux suppressions |
| Demandes d'adhésion (En attente/Acceptée/Refusée) + ajout direct | ✅ | Modélisées via le champ `statut` de `membres[]` (voir §5) |
| Sessions, une seule active à la fois | ✅ | `sessions.js` |
| Objectifs par sexe, attribution automatique | ✅ | Objectifs rattachés à chaque session, calcul dynamique dans `calculerBilanMembre()` |
| Caisses multiples + solde auto | ✅ | `caisses.js`, soldes recalculés en temps réel |
| Caisse Sociale sans objectif obligatoire | ✅ | Indicateur `compteDansObjectif` par caisse |
| Cotisations : saisie simple, rapide, **en lot** | ✅ | Trois formulaires, une seule fonction de création partagée |
| Verrou d'édition 1h + historique des modifications | ✅ | `estCotisationModifiable()` / `historiqueModifications[]` |
| Dépenses ventilées par catégorie | ✅ | `depenses.js` |
| Ziara : déplacement / hadiya distincts, impact caisse | ✅ | `ziara.js`, dépense liée générée automatiquement |
| Événements (Thiantes, Magal, Set Setal, Conférences), budget prévu/réalisé | ✅ | `evenements.js`, écart calculé à partir des dépenses liées |
| Valorisation 100% + animation festive | ✅ | Liste dashboard (`dashboard.js`) + confettis au 1er franchissement (`membre-espace.js`) |
| Dashboard : KPIs + graphiques dynamiques | ✅ | `canvas-evolution` (barres) et `canvas-repartition` (donut), 100% Canvas natif |
| Interface publique (vitrine, annonces/événements sans données privées) | ✅ | `vitrine-section`, alimentée uniquement par les champs publics des événements |
| Traçabilité (nom du responsable sur chaque action) | ✅ | Champ `responsable` sur cotisations, dépenses, ziaras, événements |

---

## 4. Choix de conception à connaître

- **Pas de tableau `demandes[]` séparé.** Le cahier des charges liste 8 collections en section 7
  (`members, sessions, caisses, cotisations, depenses, ziaras, evenements, users`) et mentionne
  "Statut" à la fois pour les demandes d'adhésion et pour les attributs du membre. Les demandes sont
  donc des `membres[]` avec `statut: 'en_attente'`, qui deviennent `'actif'` (matricule attribué) ou
  `'refuse'` — cela respecte le schéma de données tel que défini sans le déborder.
- **Graphiques en Canvas natif, sans librairie.** Le socle technique n'énumère que HTML5/CSS3/JS ;
  les graphiques (barres empilées, donut) sont donc dessinés à la main avec l'API Canvas 2D, ce qui
  garantit un fonctionnement 100% hors-ligne et reste fidèle à l'esprit du cahier des charges.
  `charts.js` peut servir de base si vous préférez migrer vers Chart.js plus tard.
- **`users[]` ne contient que les responsables.** Les membres s'authentifient directement via leur
  matricule et un champ `motDePasse` porté par leur propre fiche dans `membres[]`, ce qui évite de
  dupliquer leur identité dans deux tableaux différents.
- **Identifiants séquentiels (`prochainId`)**, calculés à partir du plus grand ID existant plutôt que
  de la taille du tableau ou de `Date.now()` : robustes aux suppressions et à la saisie en lot (où
  plusieurs enregistrements peuvent être créés dans la même milliseconde).
- **Signature visuelle : le "chapelet de progression".** La barre de progression de l'objectif annuel
  est représentée par un chapelet de 33 grains (écho au tasbih), qui se remplissent en or à mesure que
  le membre cotise — un clin d'œil direct à l'univers du Dahira plutôt qu'une barre générique.

---

## 5. Hors scope (comme précisé dans le cahier des charges V1)

Serveur backend, base de données MySQL, paiement en ligne, intégrations SMS/WhatsApp et application
mobile native ne sont volontairement pas traités dans cette version — conformément au périmètre défini
en section 8 du cahier des charges.

---

## 6. Suite possible

- Brancher `js/storage.js` sur une vraie API REST (le découpage `getData`/`saveData` a été pensé
  pour être facilement remplacé par des appels `fetch`).
- Remplacer le hachage de mot de passe absent (démonstration uniquement) par un vrai hachage
  (bcrypt côté serveur) lors du passage à un backend réel.
- Exporter les rapports en PDF (actuellement : impression navigateur uniquement).
