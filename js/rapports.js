/**
 * ============================================================
 *  RAPPORTS.JS — Bilan financier imprimable
 * ============================================================
 */

function genererRapportApercu() {
    const conteneur = document.getElementById('contenu-rapport-dynamique');
    if (!conteneur) return;

    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    const depenses = getData(CLES_STOCKAGE.DEPENSES) || [];
    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const session = getActiveSession();

    const totalCotisations = cotisations.reduce((s, c) => s + Number(c.montant), 0);
    const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0);
    const soldeGlobal = totalCotisations - totalDepenses;
    const membresActifs = membres.filter(m => m.statut === 'actif').length;

    const htmlCaisses = caisses.map(c => `<li><strong>${echapperHtml(c.nom)}</strong> : ${formaterMontant(calculerSoldeCaisse(c.id))}</li>`).join('');

    const parCategorie = {};
    depenses.forEach(d => { parCategorie[d.categorie] = (parCategorie[d.categorie] || 0) + Number(d.montant); });
    const htmlCategories = Object.keys(parCategorie).length
        ? Object.entries(parCategorie).map(([cat, montant]) => `<li><strong>${echapperHtml(cat)}</strong> : ${formaterMontant(montant)}</li>`).join('')
        : '<li>Aucune dépense enregistrée.</li>';

    conteneur.innerHTML = `
        <p><strong>Date d'édition :</strong> ${new Date().toLocaleDateString('fr-FR')} — <strong>Session :</strong> ${session ? echapperHtml(session.nom) : 'aucune'}</p>
        <h3>1. Statistiques générales</h3>
        <ul>
            <li>Membres actifs : <strong>${membresActifs}</strong> (${membres.length} au total)</li>
            <li>Total des cotisations encaissées : <strong class="texte-positif">${formaterMontant(totalCotisations)}</strong></li>
            <li>Total des dépenses effectuées : <strong class="texte-alerte">${formaterMontant(totalDepenses)}</strong></li>
            <li>Solde global net : <strong class="${soldeGlobal >= 0 ? 'texte-positif' : 'texte-alerte'}">${formaterMontant(soldeGlobal)}</strong></li>
        </ul>
        <h3>2. Situation par caisse</h3>
        <ul>${htmlCaisses || '<li>Aucune caisse enregistrée.</li>'}</ul>
        <h3>3. Dépenses par catégorie</h3>
        <ul>${htmlCategories}</ul>
    `;
}

function imprimerBilanGeneral() {
    genererRapportApercu();
    window.print();
}
