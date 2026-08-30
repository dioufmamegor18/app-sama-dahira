# Script de présentation — SAMA DAHIRA

## 1. Introduction

Bonjour monsieur, je vous présente le projet SAMA DAHIRA, une application web de gestion administrative et financière destinée à une association religieuse ou à un dahira. L’objectif principal est de centraliser la gestion des membres, des cotisations, des caisses, des dépenses, des ziaras et des événements dans une interface simple et fonctionnelle.

## 2. Problème que le projet résout

Avant cette application, la gestion du dahira pouvait être dispersée entre plusieurs supports : carnets, feuilles de calcul, messagerie et échanges informels. Cela rendait le suivi des cotisations, l’état des membres et les dépenses difficiles à contrôler.

SAMA DAHIRA permet de :
- gérer les membres et leurs statuts ;
- suivre les cotisations et les objectifs financiers ;
- organiser plusieurs caisses ;
- enregistrer les dépenses ;
- gérer les ziaras et les événements ;
- visualiser les performances grâce à un tableau de bord.

## 3. Objectifs du projet

Le projet a pour objectifs :
- mettre en place une plateforme moderne, accessible et ergonomique ;
- faciliter le suivi administratif et financier du dahira ;
- sécuriser l’accès via un système de connexion simple ;
- offrir une expérience de gestion pour les responsables et les membres ;
- rester entièrement front-end, sans base de données externe, pour un usage de démonstration ou de prototype.

## 4. Fonctionnalités principales

### Gestion des membres

L’application permet d’ajouter des membres, d’accepter ou de refuser des demandes d’adhésion, de retrouver les informations de chaque membre et de suivre leur statut : actif, en attente, suspendu ou refusé.

### Sessions et objectifs

Chaque session a des objectifs financiers définis selon le sexe. Cela permet de mesurer la progression de chaque membre dans le cadre de la session en cours.

### Caisses et cotisations

Le système gère plusieurs caisses avec des soldes calculés automatiquement. Les cotisations sont enregistrées avec une date, un montant, un membre et une caisse. La logique permet aussi de détecter si les cotisations sont encore modifiables.

### Dépenses et événements

Les responsables peuvent enregistrer des dépenses par catégorie et les rattacher à un événement ou à un contexte précis. Les événements eux-mêmes sont répertoriés avec leur budget prévu et leur état.

### Ziara

Le module de ziara permet de distinguer les frais de déplacement et la hadiya, puis d’impacter automatiquement la caisse concernée.

### Tableau de bord

Le tableau de bord présente des indicateurs clés : effectif, cotisations globales, dépenses cumulées, solde net ainsi que des graphiques dynamiques pour suivre l’évolution financière.

### Espace membre

Chaque membre dispose d’un espace personnel qui lui donne accès à son profil, à son bilan financier, à son progression par rapport à ses objectifs et à une célébration visuelle lorsqu’il atteint 100 %.

## 5. Technologies utilisées

Le projet est développé avec :
- HTML5
- CSS3
- JavaScript
- LocalStorage pour simuler la persistance des données

La stratégie a été de rester simple, portable et sans dépendances externes, ce qui facilite le déploiement local.

## 6. Structure du projet

Le projet est organisé en plusieurs fichiers JavaScript spécialisés :
- auth.js : connexion et gestion des responsables ;
- membres.js : gestion des membres et demandes ;
- sessions.js : création et gestion des sessions ;
- caisses.js : soldes et gestion des caisses ;
- cotisations.js : enregistrement des cotisations ;
- depenses.js : gestion des dépenses ;
- ziara.js : gestion des ziaras ;
- evenements.js : organisation des événements ;
- dashboard.js : synthèse financière ;
- router.js : navigation et contrôle d’accès ;
- storage.js : données de démonstration et persistance locale.

## 7. Données de démonstration

Le projet contient des données d’exemple chargées automatiquement au premier lancement. Cela permet de tester le système sans avoir à saisir toutes les données manuellement.

Comptes disponibles :
- Responsable : admin@samadahira.com / admin123
- Membre Awa Diop : DT00001 / 123456
- Membre Fatou Sow : DT00002 / 123456

Les données incluent aussi plusieurs membres actifs, des demandes d’adhésion, des cotisations, des événements et des dépenses afin de simuler un vrai fonctionnement.

## 8. Points forts du projet

- interface moderne et lisible ;
- gestion complète du cycle de vie du membre ;
- suivi financier en temps réel ;
- visualisation des performances ;
- respect du cahier des charges de gestion d’un dahira ;
- autonomie totale du projet sans backend.

## 9. Limites et perspectives

Le projet est un prototype fonctionnel. Il ne couvre pas encore une vraie base de données, un vrai système d’authentification sécurisé ni un backend REST. Les prochaines évolutions possibles seraient :
- migration vers une base de données ;
- ajout d’un backend avec API ;
- export de rapports PDF ;
- intégration mobile ;
- authentification sécurisée avec mots de passe hachés.

## 10. Conclusion

SAMA DAHIRA est un projet complet de gestion administrative et financière pour un dahira. Il montre une bonne compréhension des besoins d’une organisation communautaire, de la gestion des membres et de la transparence financière. C’est un projet utile, fonctionnel et très bien adapté à une démonstration devant un professeur ou un jury.

Merci.
