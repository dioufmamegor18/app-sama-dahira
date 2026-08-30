/**
 * ============================================================
 *  CAISSES.JS — Gestion des caisses et calcul dynamique des soldes
 * ============================================================
 *  Chaque caisse porte un indicateur "compteDansObjectif" : les
 *  cotisations versées dans une caisse marquée false (ex. la Caisse
 *  Sociale) restent libres et ne comptent pas dans l'objectif annuel
 *  des membres (cf. cahier des charges §4 — "Régime spécifique
 *  sans objectif obligatoire").
 */

/**
 * Calcule le solde d'une caisse à partir de son identifiant.
 */
function calculerSoldeCaisse(caisseId) {
    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    const depenses = getData(CLES_STOCKAGE.DEPENSES) || [];

    const totalCotisations = cotisations
        .filter(c => c.caisseId === caisseId)
        .reduce((somme, c) => somme + Number(c.montant), 0);

    const totalDepenses = depenses
        .filter(d => d.caisseId === caisseId)
        .reduce((somme, d) => somme + Number(d.montant), 0);

    return totalCotisations - totalDepenses;
}

function afficherCaisses() {
    const tbody = document.getElementById('liste-caisses-tbody');
    if (!tbody) return;

    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    tbody.innerHTML = '';

    if (caisses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="etat-vide">Aucune caisse enregistrée.</td></tr>`;
        return;
    }

    caisses.forEach(caisse => {
        const solde = calculerSoldeCaisse(caisse.id);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${echapperHtml(caisse.nom)}</strong></td>
            <td>${echapperHtml(caisse.description) || 'N/A'}</td>
            <td>${caisse.compteDansObjectif ? '<span class="badge badge-succes">Compte dans l\u2019objectif</span>' : '<span class="badge badge-neutre">Cotisations libres</span>'}</td>
            <td><strong class="${solde >= 0 ? 'texte-positif' : 'texte-alerte'}">${formaterMontant(solde)}</strong></td>
            <td><span class="badge badge-${caisse.statut === 'active' ? 'succes' : 'neutre'}">${caisse.statut === 'active' ? 'Active' : 'Inactive'}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function ajouterCaisse(e) {
    e.preventDefault();

    const nom = document.getElementById('caisse-nom').value.trim();
    const description = document.getElementById('caisse-desc').value.trim();
    const compteDansObjectif = document.getElementById('caisse-compte-objectif').checked;

    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];

    if (caisses.some(c => c.nom.toLowerCase() === nom.toLowerCase())) {
        toast('Une caisse portant ce nom existe déjà.', 'erreur');
        return;
    }

    caisses.push({
        id: prochainId(caisses),
        nom, description,
        statut: 'active',
        compteDansObjectif
    });
    saveData(CLES_STOCKAGE.CAISSES, caisses);

    document.getElementById('form-caisse').reset();
    document.getElementById('caisse-compte-objectif').checked = true;
    afficherCaisses();
    toast(`Caisse "${nom}" créée avec succès.`, 'succes');
}

/**
 * Remplit une liste déroulante <select> avec les caisses actives.
 * Utilisé par les modules cotisations, dépenses et ziara.
 */
function remplirSelectCaisses(idSelect, placeholder = '-- Choisir une caisse --') {
    const select = document.getElementById(idSelect);
    if (!select) return;

    const caisses = (getData(CLES_STOCKAGE.CAISSES) || []).filter(c => c.statut === 'active');
    const valeurPrecedente = select.value;
    select.innerHTML = `<option value="">${placeholder}</option>`;
    caisses.forEach(caisse => {
        select.innerHTML += `<option value="${caisse.id}">${echapperHtml(caisse.nom)}${caisse.compteDansObjectif ? '' : ' (libre)'}</option>`;
    });
    if (valeurPrecedente) select.value = valeurPrecedente;
}
