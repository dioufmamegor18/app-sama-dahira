/**
 * Gestion des caisses et calcul dynamique des soldes pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
    afficherCaisses();
});

/**
 * Calcule le solde d'une caisse spécifique en fonction des cotisations et dépenses.
 * @param {string} nomCaisse - Le nom de la caisse
 * @returns {number} Le solde calculé
 */
function calculerSoldeCaisse(nomCaisse) {
    const cotisations = getData('cotisations') || [];
    const depenses = getData('depenses') || [];

    const totalCotisations = cotisations
        .filter(c => c.caisse === nomCaisse)
        .reduce((sum, c) => sum + Number(c.montant), 0);

    const totalDepenses = depenses
        .filter(d => d.caisse === nomCaisse)
        .reduce((sum, d) => sum + Number(d.montant), 0);

    return totalCotisations - totalDepenses;
}

/**
 * Affiche la liste des caisses et leurs soldes dynamiques dans le tableau.
 */
function afficherCaisses() {
    const tbody = document.getElementById('liste-caisses-tbody');
    if (!tbody) return;

    const caisses = getData('caisses') || [];
    tbody.innerHTML = '';

    if (caisses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Aucune caisse enregistrée.</td></tr>`;
        return;
    }

    caisses.forEach(caisse => {
        const solde = calculerSoldeCaisse(caisse.nom);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${caisse.nom}</strong></td>
            <td>${caisse.description || 'N/A'}</td>
            <td><strong style="color: ${solde >= 0 ? '#1b4d3e' : '#dc3545'};">${solde.toLocaleString()} FCFA</strong></td>
            <td><span class="badge" style="background: #28a745; color: white; padding: 4px 8px; border-radius: 4px;">${caisse.statut}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Ajoute une nouvelle caisse dans le système.
 */
function ajouterCaisse(e) {
    e.preventDefault();

    const nom = document.getElementById('caisse-nom').value.trim();
    const description = document.getElementById('caisse-desc').value.trim();

    let caisses = getData('caisses') || [];

    const existe = caisses.some(c => c.nom.toLowerCase() === nom.toLowerCase());
    if (existe) {
        alert("Une caisse portant ce nom existe déjà !");
        return;
    }

    const nouvelleCaisse = {
        id: Date.now(),
        nom: nom,
        description: description,
        statut: 'active'
    };

    caisses.push(nouvelleCaisse);
    saveData('caisses', caisses);

    document.getElementById('form-caisse').reset();
    afficherCaisses();
    alert(`Caisse "${nom}" créée avec succès !`);
}