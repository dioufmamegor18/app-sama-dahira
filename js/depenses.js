/**
 * Gestion des dépenses pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
    afficherDepenses();
    initDepenseCaissesSelect();
});

/**
 * Remplit la liste déroulante des caisses dans le formulaire de dépenses.
 */
function initDepenseCaissesSelect() {
    const select = document.getElementById('depense-caisse');
    if (!select) return;

    const caisses = getData('caisses') || [];
    select.innerHTML = '<option value="">-- Choisir une caisse --</option>';
    caisses.forEach(caisse => {
        select.innerHTML += `<option value="${caisse.nom}">${caisse.nom}</option>`;
    });
}

/**
 * Enregistre une nouvelle dépense et actualise le solde de la caisse.
 */
function enregistrerDepense(e) {
    e.preventDefault();

    const caisse = document.getElementById('depense-caisse').value;
    const categorie = document.getElementById('depense-categorie').value;
    const montant = Number(document.getElementById('depense-montant').value);
    const description = document.getElementById('depense-desc').value.trim();
    const soldeActuel = typeof calculerSoldeCaisse === 'function' ? calculerSoldeCaisse(caisse) : 0;

    if (montant > soldeActuel && !confirm(`Attention : Le montant demandé (${montant.toLocaleString()} FCFA) dépasse le solde actuel de la caisse (${soldeActuel.toLocaleString()} FCFA). Voulez-vous continuer quand même ?`)) {
        return;
    }

    const currentUser = sessionStorage.getItem('currentUser')
        ? JSON.parse(sessionStorage.getItem('currentUser'))
        : { nomComplet: 'Administrateur' };
    const now = new Date();
    const nouvelleDepense = {
        id: Date.now(),
        caisse,
        categorie,
        montant,
        description,
        date: now.toISOString().split('T')[0],
        heure: now.toTimeString().split(' ')[0].substring(0, 5),
        responsable: currentUser.nomComplet
    };

    const depenses = getData('depenses') || [];
    depenses.push(nouvelleDepense);
    saveData('depenses', depenses);

    document.getElementById('form-depense').reset();
    initDepenseCaissesSelect();
    afficherDepenses();

    if (typeof afficherCaisses === 'function') {
        afficherCaisses();
    }

    alert(`Dépense de ${montant.toLocaleString()} FCFA enregistrée avec succès.`);
}

/**
 * Affiche l'historique des dépenses dans le tableau.
 */
function afficherDepenses() {
    const tbody = document.getElementById('liste-depenses-tbody');
    if (!tbody) return;

    const depenses = getData('depenses') || [];
    tbody.innerHTML = '';

    if (depenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Aucune dépense enregistrée.</td></tr>`;
        return;
    }

    [...depenses].reverse().forEach(depense => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${depense.date} à ${depense.heure}</td>
            <td><strong>${depense.caisse}</strong></td>
            <td><span class="badge" style="background: #6c757d; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${depense.categorie}</span></td>
            <td>${depense.description}</td>
            <td><strong style="color: #dc3545;">-${Number(depense.montant).toLocaleString()} FCFA</strong></td>
            <td><small>${depense.responsable}</small></td>
        `;
        tbody.appendChild(tr);
    });
}
