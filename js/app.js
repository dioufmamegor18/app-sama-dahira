/**
 * Fonction centrale pour afficher une section spécifique et masquer les autres.
 * Elle retire la classe 'active' de toutes les sections, puis l'ajoute uniquement à celle demandée.
 * @param {string} sectionId - L'id de la section à afficher (ex: 'dashboard-section')
 */
function showSection(sectionId) {
    // 1. Sélectionner toutes les sections de l'application
    const sections = document.querySelectorAll('.app-section');

    // 2. Parcourir toutes les sections pour retirer la classe 'active'
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // 3. Sélectionner la section cible grâce à son id
    const targetSection = document.getElementById(sectionId);

    // 4. Si la section existe, on lui ajoute la classe 'active' pour l'afficher
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error(`La section avec l'ID "${sectionId}" est introuvable.`);
    }
}

// Pour tester pour l'instant au chargement de la page : 
// Affichons la section de connexion par défaut.
document.addEventListener('DOMContentLoaded', () => {
    showSection('connexion-section');
});