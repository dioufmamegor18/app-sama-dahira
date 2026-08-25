/**
 * Gestion des événements pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
    afficherEvenements();
});

/**
 * Enregistre un nouvel événement dans le système.
 */
function enregistrerEvenement(e) {
    e.preventDefault();

    const titre = document.getElementById('evenement-titre').value.trim();
    const date = document.getElementById('evenement-date').value;
    const lieu = document.getElementById('evenement-lieu').value.trim();
    const description = document.getElementById('evenement-desc').value.trim();
    const currentUser = sessionStorage.getItem('currentUser')
        ? JSON.parse(sessionStorage.getItem('currentUser'))
        : { nomComplet: 'Administrateur' };

    const nouvelEvenement = {
        id: Date.now(),
        titre,
        date,
        lieu,
        description,
        statut: 'Planifié',
        responsable: currentUser.nomComplet
    };

    const evenements = getData('evenements') || [];
    evenements.push(nouvelEvenement);
    saveData('evenements', evenements);

    document.getElementById('form-evenement').reset();
    afficherEvenements();
    alert(`Événement "${titre}" créé avec succès !`);
}

/**
 * Affiche la liste des événements dans le tableau.
 */
function afficherEvenements() {
    const tbody = document.getElementById('liste-evenements-tbody');
    if (!tbody) return;

    const evenements = getData('evenements') || [];
    tbody.innerHTML = '';

    if (evenements.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Aucun événement enregistré.</td></tr>`;
        return;
    }

    [...evenements].reverse().forEach(evenement => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${evenement.date}</td>
            <td><strong>${evenement.titre}</strong></td>
            <td>${evenement.lieu}</td>
            <td>${evenement.description || 'N/A'}</td>
            <td><span class="badge" style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">${evenement.statut}</span></td>
            <td><small>${evenement.responsable}</small></td>
        `;
        tbody.appendChild(tr);
    });
}
