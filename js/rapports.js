/**
 * Gestion des rapports et de l'impression pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
    genererRapportApercu();
});

/**
 * Génère l'aperçu du rapport financier.
 */
function genererRapportApercu() {
    const conteneur = document.getElementById('contenu-rapport-dynamique');
    if (!conteneur) return;

    const cotisations = getData('cotisations') || [];
    const depenses = getData('depenses') || [];
    const membres = getData('membres') || [];
    const caisses = getData('caisses') || [];

    const totalCotisations = cotisations.reduce((sum, cotisation) => sum + Number(cotisation.montant), 0);
    const totalDepenses = depenses.reduce((sum, depense) => sum + Number(depense.montant), 0);
    const soldeGlobal = totalCotisations - totalDepenses;

    let htmlCaisses = '';
    caisses.forEach(caisse => {
        const soldeCaisse = typeof calculerSoldeCaisse === 'function' ? calculerSoldeCaisse(caisse.nom) : 0;
        htmlCaisses += `<li><strong>${caisse.nom}</strong> : ${soldeCaisse.toLocaleString()} FCFA</li>`;
    });

    conteneur.innerHTML = `
        <p><strong>Date d'édition :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        <h3 style="margin-top: 20px; color: #1b4d3e; border-bottom: 1px solid #eee; padding-bottom: 5px;">1. Statistiques Générales</h3>
        <ul>
            <li>Nombre total de membres : <strong>${membres.length}</strong></li>
            <li>Total des cotisations encaissées : <strong style="color: #1b4d3e;">${totalCotisations.toLocaleString()} FCFA</strong></li>
            <li>Total des dépenses effectuées : <strong style="color: #dc3545;">${totalDepenses.toLocaleString()} FCFA</strong></li>
            <li>Solde global net : <strong style="color: ${soldeGlobal >= 0 ? '#1b4d3e' : '#dc3545'};">${soldeGlobal.toLocaleString()} FCFA</strong></li>
        </ul>
        <h3 style="margin-top: 20px; color: #1b4d3e; border-bottom: 1px solid #eee; padding-bottom: 5px;">2. Situation par Caisse</h3>
        <ul>${htmlCaisses || '<li>Aucune caisse enregistrée.</li>'}</ul>
    `;
}

/**
 * Lance la boîte de dialogue d'impression du bilan.
 */
function imprimerBilanGeneral() {
    genererRapportApercu();
    window.print();
}
