/**
 * Gestion du Tableau de Bord pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
  chargerDashboard();
});

/**
 * Calcule et affiche les indicateurs statistiques du tableau de bord.
 */
function chargerDashboard() {
  const cotisations = getData('cotisations') || [];
  const depenses = getData('depenses') || [];
  const membres = getData('membres') || [];

  const totalCotisations = cotisations.reduce((sum, cotisation) => sum + Number(cotisation.montant), 0);
  const totalDepenses = depenses.reduce((sum, depense) => sum + Number(depense.montant), 0);
  const soldeGlobal = totalCotisations - totalDepenses;
  const totalMembres = membres.length;

  const elCotisations = document.getElementById('dash-total-cotisations');
  const elDepenses = document.getElementById('dash-total-depenses');
  const elSolde = document.getElementById('dash-solde-global');
  const elMembres = document.getElementById('dash-total-membres');
  const elSynthese = document.getElementById('dash-synthese-texte');

  if (elCotisations) elCotisations.textContent = `${totalCotisations.toLocaleString()} FCFA`;
  if (elDepenses) elDepenses.textContent = `${totalDepenses.toLocaleString()} FCFA`;
  if (elSolde) {
    elSolde.textContent = `${soldeGlobal.toLocaleString()} FCFA`;
    elSolde.style.color = soldeGlobal >= 0 ? '#1b4d3e' : '#dc3545';
  }
  if (elMembres) elMembres.textContent = totalMembres;

  if (elSynthese) {
    elSynthese.innerHTML = `
      Le Dahira compte actuellement <strong>${totalMembres} membres</strong> enregistrés.
      Les entrées totales s'élèvent à <strong>${totalCotisations.toLocaleString()} FCFA</strong> pour
      <strong>${totalDepenses.toLocaleString()} FCFA</strong> de sorties.
      La santé financière globale est de <strong>${soldeGlobal.toLocaleString()} FCFA</strong>.
      ${soldeGlobal >= 0 ? 'Les caisses se portent bien.' : 'Attention : Le solde global est négatif.'}
    `;
  }
}
