/**
 * Script principal de SAMA DAHIRA.
 * Gère la navigation par sections et l'initialisation globale.
 */

document.addEventListener('DOMContentLoaded', () => {
    initialiserDonneesParDefaut();
    afficherUtilisateurConnecte();

    const utilisateurConnecte = sessionStorage.getItem('currentUser');
    basculerSection(utilisateurConnecte ? 'dashboard-section' : 'connexion-section');
});

/**
 * Initialise les données minimales nécessaires au premier lancement.
 */
function initialiserDonneesParDefaut() {
    if (!localStorage.getItem('caisses')) {
        const caissesDefaut = [
            { id: 1, nom: 'Caisse Principale', description: 'Caisse générale du Dahira', statut: 'active' },
            { id: 2, nom: 'Caisse Sociale', description: 'Aide aux membres et urgences', statut: 'active' },
            { id: 3, nom: 'Caisse Ziara', description: 'Financement des déplacements pieux', statut: 'active' }
        ];
        localStorage.setItem('caisses', JSON.stringify(caissesDefaut));
    }

    if (!localStorage.getItem('objectifs')) {
        localStorage.setItem('objectifs', JSON.stringify({ homme: 120000, femme: 60000 }));
    }
}

/**
 * Masque les sections et affiche uniquement celle demandée.
 * @param {string} sectionId - L'identifiant de la section à afficher
 */
function basculerSection(sectionId) {
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active-section');
    });

    const cible = document.getElementById(sectionId);
    if (cible) {
        cible.style.display = 'block';
        cible.classList.add('active-section');
    }

    if (sectionId === 'dashboard-section' && typeof chargerDashboard === 'function') {
        chargerDashboard();
    } else if (sectionId === 'membres-section' && typeof afficherMembres === 'function') {
        afficherMembres();
    } else if (sectionId === 'cotisations-section' && typeof afficherCotisations === 'function') {
        afficherCotisations();
    } else if (sectionId === 'caisses-section' && typeof afficherCaisses === 'function') {
        afficherCaisses();
    } else if (sectionId === 'depenses-section' && typeof afficherDepenses === 'function') {
        afficherDepenses();
    } else if (sectionId === 'ziara-section' && typeof afficherZiaras === 'function') {
        afficherZiaras();
    } else if (sectionId === 'evenements-section' && typeof afficherEvenements === 'function') {
        afficherEvenements();
    } else if (sectionId === 'rapports-section' && typeof genererRapportApercu === 'function') {
        genererRapportApercu();
    }
}

/**
 * Affiche le nom de l'utilisateur connecté.
 */
function afficherUtilisateurConnecte() {
    const userSession = sessionStorage.getItem('currentUser');
    const elementUtilisateur = document.getElementById('user-connected-name');
    if (elementUtilisateur && userSession) {
        const utilisateur = JSON.parse(userSession);
        elementUtilisateur.textContent = utilisateur.nomComplet || 'Responsable';
    }
}

/**
 * Déconnecte l'utilisateur et affiche la connexion.
 */
function deconnecter() {
    sessionStorage.removeItem('currentUser');
    basculerSection('connexion-section');
}

// Compatibilité avec les modules existants qui utilisent encore showSection().
function showSection(sectionId) {
    basculerSection(sectionId);
}
