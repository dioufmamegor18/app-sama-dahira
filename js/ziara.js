/**
 * Gestion des Ziara pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
    afficherZiaras();
    initZiaraCaissesSelect();
});

/**
 * Remplit la liste déroulante des caisses pour le formulaire Ziara.
 */
function initZiaraCaissesSelect() {
    const select = document.getElementById('ziara-caisse');
    if (!select) return;

    const caisses = getData('caisses') || [];
    select.innerHTML = '<option value="">-- Choisir une caisse --</option>';
    caisses.forEach(caisse => {
        select.innerHTML += `<option value="${caisse.nom}">${caisse.nom}</option>`;
    });
}

/**
 * Enregistre une Ziara et sa sortie dans les dépenses globales.
 */
function enregistrerZiara(e) {
    e.preventDefault();

    const date = document.getElementById('ziara-date').value;
    const lieu = document.getElementById('ziara-lieu').value.trim();
    const personne = document.getElementById('ziara-personne').value.trim();
    const fraisDeplacement = Number(document.getElementById('ziara-deplacement').value);
    const montantRemis = Number(document.getElementById('ziara-remise').value);
    const caisse = document.getElementById('ziara-caisse').value;
    const totalSortie = fraisDeplacement + montantRemis;
    const currentUser = sessionStorage.getItem('currentUser')
        ? JSON.parse(sessionStorage.getItem('currentUser'))
        : { nomComplet: 'Administrateur' };
    const now = new Date();

    const nouvelleZiara = {
        id: Date.now(),
        date,
        lieu,
        personne,
        fraisDeplacement,
        montantRemis,
        totalSortie,
        caisse,
        responsable: currentUser.nomComplet
    };

    const ziaras = getData('ziaras') || [];
    ziaras.push(nouvelleZiara);
    saveData('ziaras', ziaras);

    const depenses = getData('depenses') || [];
    depenses.push({
        id: Date.now() + 1,
        caisse,
        categorie: 'ziara',
        montant: totalSortie,
        description: `Ziara à ${lieu} (${personne}) - Déplacement: ${fraisDeplacement}F, Hadaya: ${montantRemis}F`,
        date,
        heure: now.toTimeString().split(' ')[0].substring(0, 5),
        responsable: currentUser.nomComplet
    });
    saveData('depenses', depenses);

    document.getElementById('form-ziara').reset();
    initZiaraCaissesSelect();
    afficherZiaras();

    if (typeof afficherCaisses === 'function') {
        afficherCaisses();
    }

    alert(`Ziara enregistrée avec succès ! Total sortie : ${totalSortie.toLocaleString()} FCFA.`);
}

/**
 * Affiche la liste des Ziara dans le tableau.
 */
function afficherZiaras() {
    const tbody = document.getElementById('liste-ziaras-tbody');
    if (!tbody) return;

    const ziaras = getData('ziaras') || [];
    tbody.innerHTML = '';

    if (ziaras.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Aucune Ziara enregistrée.</td></tr>`;
        return;
    }

    [...ziaras].reverse().forEach(ziara => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ziara.date}</td>
            <td><strong>${ziara.lieu}</strong><br><small>auprès de ${ziara.personne}</small></td>
            <td>${Number(ziara.fraisDeplacement).toLocaleString()} FCFA</td>
            <td>${Number(ziara.montantRemis).toLocaleString()} FCFA</td>
            <td><strong style="color: #dc3545;">${Number(ziara.totalSortie).toLocaleString()} FCFA</strong></td>
            <td>${ziara.caisse}</td>
            <td><small>${ziara.responsable}</small></td>
        `;
        tbody.appendChild(tr);
    });
}
