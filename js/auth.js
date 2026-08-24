/**
 * Gestion de l'authentification simulée pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
    // S'assurer que les données de démo sont initialisées
    if (typeof initDemoData === 'function') {
        initDemoData();
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

/**
 * Gère la soumission du formulaire de connexion.
 * @param {Event} e - L'événement de soumission du formulaire
 */
function handleLogin(e) {
    e.preventDefault(); // Empêcher le rechargement de la page par défaut

    const identifierInput = document.getElementById('login-identifier').value.trim();
    const passwordInput = document.getElementById('login-password').value.trim();

    // Récupérer les utilisateurs stockés
    const users = getData('users');
    if (!users) {
        alert("Erreur : Aucun utilisateur trouvé dans le système.");
        return;
    }

    // Chercher un utilisateur correspondant (soit par email, soit par matricule)
    const foundUser = users.find(user => 
        (user.email && user.email.toLowerCase() === identifierInput.toLowerCase()) || 
        (user.matricule && user.matricule.toLowerCase() === identifierInput.toLowerCase())
    );

    if (foundUser && foundUser.password === passwordInput) {
        // Authentification réussie : stocker l'utilisateur connecté dans sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(foundUser));
        
        alert(`Connexion réussie ! Bienvenue, ${foundUser.nomComplet}`);

        // Rediriger selon le rôle
        if (foundUser.role === 'RESPONSABLE') {
            showSection('dashboard-section');
            // TODO: Charger les données du dashboard plus tard
        } else if (foundUser.role === 'MEMBRE') {
            showSection('espace-membre-section');
            // TODO: Charger les données de l'espace membre plus tard
        }
    } else {
        alert("Identifiant ou mot de passe incorrect.");
    }
}

/**
 * Permet de récupérer l'utilisateur actuellement connecté.
 * @returns {object|null} L'objet utilisateur ou null
 */
function getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Déconnecte l'utilisateur.
 */
function logout() {
    sessionStorage.removeItem('currentUser');
    showSection('connexion-section');
}