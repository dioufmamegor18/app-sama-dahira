/**
 * ============================================================
 *  EVENEMENTS.JS — Thiantes, Magal, Set Setal, Conférences...
 * ============================================================
 *  Le budget réalisé de chaque événement est calculé dynamiquement
 *  à partir des dépenses qui lui sont liées (depense.evenementId),
 *  ce qui permet d'afficher l'écart budgétaire en temps réel.
 */

function budgetRealiseEvenement(evenementId) {
    const depenses = getData(CLES_STOCKAGE.DEPENSES) || [];
    return depenses
        .filter(d => d.evenementId === evenementId)
        .reduce((somme, d) => somme + Number(d.montant), 0);
}

function enregistrerEvenement(e) {
    e.preventDefault();

    const titre = document.getElementById('evenement-titre').value.trim();
    const type = document.getElementById('evenement-type').value;
    const date = document.getElementById('evenement-date').value;
    const lieu = document.getElementById('evenement-lieu').value.trim();
    const description = document.getElementById('evenement-desc').value.trim();
    const budgetPrevu = Number(document.getElementById('evenement-budget').value) || 0;
    const currentUser = getCurrentUser() || { nomComplet: 'Responsable' };

    const evenements = getData(CLES_STOCKAGE.EVENEMENTS) || [];
    evenements.push({
        id: prochainId(evenements),
        titre, type, date, lieu, description, budgetPrevu,
        statut: 'Planifié',
        responsable: currentUser.nomComplet
    });
    saveData(CLES_STOCKAGE.EVENEMENTS, evenements);

    document.getElementById('form-evenement').reset();
    afficherEvenements();
    toast(`Événement "${titre}" créé avec succès.`, 'succes');
}

function afficherEvenements() {
    const tbody = document.getElementById('liste-evenements-tbody');
    if (!tbody) return;

    const evenements = getData(CLES_STOCKAGE.EVENEMENTS) || [];
    tbody.innerHTML = '';

    if (evenements.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="etat-vide">Aucun événement enregistré.</td></tr>`;
        return;
    }

    [...evenements].sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(evenement => {
        const realise = budgetRealiseEvenement(evenement.id);
        const ecart = evenement.budgetPrevu - realise;
        const pourcentageConsomme = evenement.budgetPrevu > 0 ? Math.min(100, Math.round((realise / evenement.budgetPrevu) * 100)) : 0;
        const depassement = ecart < 0;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formaterDateFr(evenement.date)}</td>
            <td><strong>${echapperHtml(evenement.titre)}</strong><br><span class="badge badge-neutre">${echapperHtml(evenement.type || 'Autre')}</span></td>
            <td>${echapperHtml(evenement.lieu)}</td>
            <td>
                <div class="mini-barre-budget"><div class="mini-barre-budget-remplissage${depassement ? ' mini-barre-depassement' : ''}" style="width:${pourcentageConsomme}%"></div></div>
                <small>${formaterMontant(realise)} / ${formaterMontant(evenement.budgetPrevu)}</small><br>
                <small class="${depassement ? 'texte-alerte' : 'texte-positif'}">${depassement ? 'Dépassement de ' + formaterMontant(Math.abs(ecart)) : 'Écart favorable de ' + formaterMontant(ecart)}</small>
            </td>
            <td><span class="badge badge-${evenement.statut === 'Terminé' ? 'neutre' : 'succes'}">${echapperHtml(evenement.statut)}</span></td>
            <td><small>${echapperHtml(evenement.responsable)}</small></td>
        `;
        tbody.appendChild(tr);
    });
}
