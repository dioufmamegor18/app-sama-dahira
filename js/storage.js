/**
 * Initialise les données de démonstration au premier lancement si elles n'existent pas.
 */
function initDemoData() {
    // Vérifier si les membres existent déjà pour éviter d'écraser à chaque rechargement
    if (!getData('membres')) {
        const demoMembres = [
            { id: 1, matricule: 'DT00001', nom: 'Diop', prenom: 'Awa', sexe: 'F', telephone: '771234567', dateAdhesion: '2025-01-10', statut: 'actif' },
            { id: 2, matricule: 'DT00002', nom: 'Sow', prenom: 'Fatou', sexe: 'F', telephone: '772345678', dateAdhesion: '2025-01-12', statut: 'actif' },
            { id: 3, matricule: 'DT00003', nom: 'Ndiaye', prenom: 'Moustapha', sexe: 'M', telephone: '773456789', dateAdhesion: '2025-01-15', statut: 'actif' },
            { id: 4, matricule: 'DT00004', nom: 'Ba', prenom: 'Ousmane', sexe: 'M', telephone: '774567890', dateAdhesion: '2025-01-20', statut: 'actif' }
        ];
        saveData('membres', demoMembres);
    }

    // Initialiser les caisses
    if (!getData('caisses')) {
        const demoCaisses = [
            { id: 1, nom: 'Caisse principale', description: 'Caisse centrale du Dahira', statut: 'active' },
            { id: 2, nom: 'Caisse sociale', description: 'Aide aux membres', statut: 'active' },
            { id: 3, nom: 'Caisse Thiantes', description: 'Organisation des thiantes', statut: 'active' },
            { id: 4, nom: 'Caisse 18 Safar', description: 'Préparation du Magal', statut: 'active' }
        ];
        saveData('caisses', demoCaisses);
    }

    // Initialiser la session active
    if (!getData('sessions')) {
        const demoSessions = [
            { id: 1, nom: 'Session Annuelle 2026', dateOuverture: '2026-01-01', dateFermeture: '2026-12-31', active: true }
        ];
        saveData('sessions', demoSessions);
    }

    // Initialiser les objectifs par défaut
    if (!getData('objectifs')) {
        const demoObjectifs = { homme: 120000, femme: 60000 };
        saveData('objectifs', demoObjectifs);
    }

    // Initialiser les comptes utilisateurs (Responsable et Membre de démo)
    if (!getData('users')) {
        const demoUsers = [
            { email: 'admin@samadahira.com', password: 'admin123', role: 'RESPONSABLE', nomComplet: 'Responsable Principal' },
            { matricule: 'DT00001', password: '123456', role: 'MEMBRE', nomComplet: 'Awa Diop' }
        ];
        saveData('users', demoUsers);
    }

    console.log("Données de démonstration initialisées avec succès !");
}

/**
 * Fonction pour réinitialiser complètement le LocalStorage (Remet les données de démo à zéro).
 */
function resetLocalStorage() {
    if (confirm("Voulez-vous vraiment réinitialiser toutes les données de l'application ?")) {
        localStorage.clear();
        initDemoData();
        alert("Application réinitialisée avec succès !");
        window.location.reload();
    }
}