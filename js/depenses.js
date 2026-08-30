/**
 * ============================================================
 *  DEPENSES.JS — Sorties de caisse ventilées par catégorie
 * ============================================================
 *  Une dépense peut être rattachée à un événement (evenementId)
 *  pour permettre le calcul du budget réalisé et de l'écart
 *  dans le module evenements.js.
 */

function initDepenseCaissesSelect() {
    remplirSelectCaisses('depense-caisse');
}

function initDepenseEvenementsSelect() {
    const select = document.getElementById('depense-evenement');
    if (!select) return;
    const evenements = getData(CLES_STOCKAGE.EVENEMENTS) || [];
    select.innerHTML = '<option value="">Aucun (dépense générale)</option>';
    evenements.forEach(ev => {
        select.innerHTML += `<option value="${ev.id}">${echapperHtml(ev.titre)} (${formaterDateFr(ev.date)})</option>`;
    });
}

function enregistrerDepense(e) {
    e.preventDefault();

    const caisseId = Number(document.getElementById('depense-caisse').value);
    const categorie = document.getElementById('depense-categorie').value;
    const montant = Number(document.getElementById('depense-montant').value);
    const description = document.getElementById('depense-desc').value.trim();
    const evenementBrut = document.getElementById('depense-evenement').value;
    const evenementId = evenementBrut ? Number(evenementBrut) : null;

    if (!caisseId) { toast('Veuillez choisir une caisse à débiter.', 'erreur'); return; }

    const soldeActuel = calculerSoldeCaisse(caisseId);
    if (montant > soldeActuel) {
        // Un confirm() natif reste acceptable ici : action rare, message long, décision binaire immédiate.
        if (!confirm(`Attention : ce montant (${formaterMontant(montant)}) dépasse le solde actuel de la caisse (${formaterMontant(soldeActuel)}). Continuer quand même ?`)) {
            return;
        }
    }

    const currentUser = getCurrentUser() || { nomComplet: 'Responsable' };
    const depenses = getData(CLES_STOCKAGE.DEPENSES) || [];
    depenses.push({
        id: prochainId(depenses),
        caisseId, categorie, montant, description, evenementId,
        date: dateDuJourIso(),
        heure: heureActuelle(),
        responsable: currentUser.nomComplet
    });
    saveData(CLES_STOCKAGE.DEPENSES, depenses);

    document.getElementById('form-depense').reset();
    initDepenseCaissesSelect();
    afficherDepenses();
    if (typeof afficherCaisses === 'function') afficherCaisses();
    toast(`Dépense de ${formaterMontant(montant)} enregistrée.`, 'succes');
}

function afficherDepenses() {
    const tbody = document.getElementById('liste-depenses-tbody');
    if (!tbody) return;

    const depenses = getData(CLES_STOCKAGE.DEPENSES) || [];
    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const evenements = getData(CLES_STOCKAGE.EVENEMENTS) || [];
    const nomCaisse = (id) => (caisses.find(c => c.id === id) || {}).nom || '—';
    const nomEvenement = (id) => (evenements.find(ev => ev.id === id) || {}).titre || null;

    tbody.innerHTML = '';

    if (depenses.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="etat-vide">Aucune dépense enregistrée.</td></tr>`;
        return;
    }

    [...depenses].sort((a, b) => b.id - a.id).forEach(depense => {
        const libelleEvenement = depense.evenementId ? nomEvenement(depense.evenementId) : null;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formaterDateFr(depense.date)} à ${depense.heure}</td>
            <td><strong>${echapperHtml(nomCaisse(depense.caisseId))}</strong></td>
            <td><span class="badge badge-neutre">${echapperHtml(depense.categorie)}</span></td>
            <td>${echapperHtml(depense.description)}${libelleEvenement ? `<br><small class="texte-discret">↳ ${echapperHtml(libelleEvenement)}</small>` : ''}</td>
            <td><strong class="texte-alerte">-${formaterMontant(depense.montant)}</strong></td>
            <td><small>${echapperHtml(depense.responsable)}</small></td>
        `;
        tbody.appendChild(tr);
    });
}
