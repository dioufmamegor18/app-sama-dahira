/**
 * ============================================================
 *  ROUTER.JS — Navigation & démarrage de l'application
 * ============================================================
 *  Point d'entrée unique : une seule fonction de changement de
 *  section, une garde d'accès par rôle, un seul écouteur
 *  DOMContentLoaded. Remplace les anciens app.js / main.js qui
 *  déclaraient chacun leur propre showSection() concurrente.
 */

const RENDUS_PAR_SECTION = {
    'vitrine-section': () => chargerVitrine(),
    'dashboard-section': () => chargerDashboard(),
    'membres-section': () => afficherMembres(),
    'sessions-section': () => afficherSessions(),
    'caisses-section': () => afficherCaisses(),
    'cotisations-section': () => { afficherCotisations(); initSaisieRapideSelects(); },
    'depenses-section': () => { afficherDepenses(); initDepenseCaissesSelect(); initDepenseEvenementsSelect(); },
    'ziara-section': () => { afficherZiaras(); initZiaraCaissesSelect(); },
    'evenements-section': () => afficherEvenements(),
    'rapports-section': () => genererRapportApercu(),
    'responsables-section': () => afficherResponsables(),
    'espace-membre-section': () => chargerEspaceMembre()
};

const SECTIONS_RESPONSABLE = ['dashboard-section', 'membres-section', 'sessions-section', 'caisses-section', 'cotisations-section', 'depenses-section', 'ziara-section', 'evenements-section', 'rapports-section', 'responsables-section'];
const SECTIONS_MEMBRE = ['espace-membre-section'];

/**
 * Affiche une section applicative et masque les autres. Applique une garde
 * de rôle simple : un membre ne peut jamais atterrir sur une section
 * responsable, et inversement.
 */
function afficherSection(sectionId) {
    const utilisateur = getCurrentUser();

    if (SECTIONS_RESPONSABLE.includes(sectionId) && (!utilisateur || utilisateur.type !== 'RESPONSABLE')) {
        sectionId = utilisateur ? 'espace-membre-section' : 'vitrine-section';
    }
    if (SECTIONS_MEMBRE.includes(sectionId) && (!utilisateur || utilisateur.type !== 'MEMBRE')) {
        sectionId = utilisateur ? 'dashboard-section' : 'vitrine-section';
    }

    document.querySelectorAll('.app-section').forEach(section => section.classList.remove('section-active'));
    const cible = document.getElementById(sectionId);
    if (cible) cible.classList.add('section-active');

    document.body.dataset.role = utilisateur ? utilisateur.type : 'PUBLIC';
    document.querySelectorAll('[data-nav-cible]').forEach(lien => {
        lien.classList.toggle('nav-lien-actif', lien.dataset.navCible === sectionId);
    });
    if (typeof mettreAJourBadgeSession === 'function') mettreAJourBadgeSession();

    const rendu = RENDUS_PAR_SECTION[sectionId];
    if (typeof rendu === 'function') rendu();

    window.scrollTo(0, 0);

    // Referme le tiroir de navigation mobile après tout changement de section
    document.body.classList.remove('nav-mobile-ouverte');
}

/**
 * Raccourci utilisé par le badge "demandes en attente" : ouvre directement
 * l'onglet des demandes d'adhésion dans la gestion des membres.
 */
function allerAuxDemandesAdhesion() {
    afficherSection('membres-section');
    const boutonDemandes = document.querySelector('.onglet-filtre[data-statut="en_attente"]');
    if (boutonDemandes) definirFiltreMembresStatut('en_attente', boutonDemandes);
}

function basculerNavMobile() {
    document.body.classList.toggle('nav-mobile-ouverte');
}

document.addEventListener('DOMContentLoaded', () => {
    initialiserApplication();
    afficherUtilisateurConnecte();

    const formulaireConnexion = document.getElementById('login-form');
    if (formulaireConnexion) formulaireConnexion.addEventListener('submit', handleLogin);

    const utilisateur = getCurrentUser();
    if (utilisateur && utilisateur.type === 'RESPONSABLE') {
        afficherSection('dashboard-section');
    } else if (utilisateur && utilisateur.type === 'MEMBRE') {
        afficherSection('espace-membre-section');
    } else {
        afficherSection('vitrine-section');
    }
});
