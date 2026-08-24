/**
 * Gestion des sessions pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
    afficherSessions();
});

/**
 * Affiche la liste des sessions dans le tableau HTML.
 */
function afficherSessions() {
    const tbody = document.getElementById('liste-sessions-tbody');
    if (!tbody) return;

    const sessions = getData('sessions') || [];
    tbody.innerHTML = '';

    if (sessions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Aucune session enregistrée.</td></tr>`;
        return;
    }

    sessions.forEach(session => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${session.nom}</strong></td>
            <td>${session.dateOuverture}</td>
            <td>${session.dateFermeture}</td>
            <td>
                <span class="badge ${session.active ? 'badge-success' : 'badge-secondary'}" style="padding: 4px 8px; border-radius: 4px; background: ${session.active ? '#28a745' : '#6c757d'}; color: white;">
                    ${session.active ? 'Active' : 'Fermée'}
                </span>
            </td>
            <td>
                ${!session.active ? `<button class="btn-sm" onclick="activerSession(${session.id})" style="padding: 5px 10px; background: #1b4d3e; color: white; border: none; border-radius: 4px; cursor: pointer;">Activer</button>` : '<em>En cours</em>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Ajoute une nouvelle session et la définit comme active (en désactivant les autres).
 */
function ajouterSession(e) {
    e.preventDefault();

    const nom = document.getElementById('session-nom').value.trim();
    const dateOuverture = document.getElementById('session-debut').value;
    const dateFermeture = document.getElementById('session-fin').value;

    let sessions = getData('sessions') || [];

    // Désactiver toutes les sessions existantes puisqu'il ne peut y en avoir qu'une seule active
    sessions.forEach(s => s.active = false);

    // Créer la nouvelle session active
    const nouvelleSession = {
        id: Date.now(),
        nom: nom,
        dateOuverture: dateOuverture,
        dateFermeture: dateFermeture,
        active: true
    };

    sessions.push(nouvelleSession);
    saveData('sessions', sessions);
    
    // Réinitialiser le formulaire
    document.getElementById('form-session').reset();
    
    afficherSessions();
    alert(`Session "${nom}" créée et activée avec succès !`);
}

/**
 * Permet de basculer l'état actif d'une session.
 */
function activerSession(id) {
    let sessions = getData('sessions') || [];

    sessions.forEach(s => {
        s.active = (s.id === id); // Active uniquement celle qui correspond à l'id cliqué
    });

    saveData('sessions', sessions);
    afficherSessions();
    alert("La session active a été mise à jour.");
}

/**
 * Fonction utilitaire pour récupérer la session active actuelle.
 * @returns {object|null} La session active
 */
function getActiveSession() {
    const sessions = getData('sessions') || [];
    return sessions.find(s => s.active) || null;
}
