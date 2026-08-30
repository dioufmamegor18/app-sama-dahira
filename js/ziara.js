/**
 * ============================================================
 *  ZIARA.JS — Visites pieuses : déplacement + hadiya
 * ============================================================
 *  Chaque Ziara distingue clairement les frais logistiques
 *  (déplacement) du montant d'hadiya remis au dignitaire visité,
 *  et génère automatiquement une dépense liée (catégorie "ziara")
 *  qui impacte le solde de la caisse choisie.
 */

function initZiaraCaissesSelect() {
    remplirSelectCaisses('ziara-caisse');
}

function enregistrerZiara(e) {
    e.preventDefault();

    const date = document.getElementById('ziara-date').value;
    const lieu = document.getElementById('ziara-lieu').value.trim();
    const personne = document.getElementById('ziara-personne').value.trim();
    const fraisDeplacement = Number(document.getElementById('ziara-deplacement').value);
    const montantHadiya = Number(document.getElementById('ziara-hadiya').value);
    const caisseId = Number(document.getElementById('ziara-caisse').value);

    if (!caisseId) { toast('Veuillez choisir une caisse à débiter.', 'erreur'); return; }

    const totalSortie = fraisDeplacement + montantHadiya;
    const currentUser = getCurrentUser() || { nomComplet: 'Responsable' };

    const ziaras = getData(CLES_STOCKAGE.ZIARAS) || [];
    ziaras.push({
        id: prochainId(ziaras),
        date, lieu, personne, fraisDeplacement, montantHadiya, totalSortie, caisseId,
        responsable: currentUser.nomComplet
    });
    saveData(CLES_STOCKAGE.ZIARAS, ziaras);

    // Impact automatique sur la caisse via une dépense liée (traçabilité comprise)
    const depenses = getData(CLES_STOCKAGE.DEPENSES) || [];
    depenses.push({
        id: prochainId(depenses),
        caisseId,
        categorie: 'ziara',
        montant: totalSortie,
        description: `Ziara à ${lieu} auprès de ${personne} — déplacement ${formaterMontant(fraisDeplacement)}, hadiya ${formaterMontant(montantHadiya)}`,
        evenementId: null,
        date,
        heure: heureActuelle(),
        responsable: currentUser.nomComplet
    });
    saveData(CLES_STOCKAGE.DEPENSES, depenses);

    document.getElementById('form-ziara').reset();
    initZiaraCaissesSelect();
    afficherZiaras();
    if (typeof afficherCaisses === 'function') afficherCaisses();
    if (typeof afficherDepenses === 'function') afficherDepenses();
    toast(`Ziara enregistrée — sortie totale de ${formaterMontant(totalSortie)}.`, 'succes');
}

function afficherZiaras() {
    const tbody = document.getElementById('liste-ziaras-tbody');
    if (!tbody) return;

    const ziaras = getData(CLES_STOCKAGE.ZIARAS) || [];
    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const nomCaisse = (id) => (caisses.find(c => c.id === id) || {}).nom || '—';

    tbody.innerHTML = '';

    if (ziaras.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="etat-vide">Aucune Ziara enregistrée.</td></tr>`;
        return;
    }

    [...ziaras].sort((a, b) => b.id - a.id).forEach(ziara => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formaterDateFr(ziara.date)}</td>
            <td><strong>${echapperHtml(ziara.lieu)}</strong><br><small class="texte-discret">auprès de ${echapperHtml(ziara.personne)}</small></td>
            <td>${formaterMontant(ziara.fraisDeplacement)}</td>
            <td>${formaterMontant(ziara.montantHadiya)}</td>
            <td><strong class="texte-alerte">${formaterMontant(ziara.totalSortie)}</strong></td>
            <td>${echapperHtml(nomCaisse(ziara.caisseId))}</td>
            <td><small>${echapperHtml(ziara.responsable)}</small></td>
        `;
        tbody.appendChild(tr);
    });
}
