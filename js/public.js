/**
 * ============================================================
 *  PUBLIC.JS — Vitrine publique du Dahira
 * ============================================================
 *  Présente le Dahira et les prochains événements sans exposer
 *  aucune donnée privée (finances, budgets, liste des membres).
 */

function chargerVitrine() {
    const conteneur = document.getElementById('vitrine-evenements-liste');
    if (!conteneur) return;

    const aujourdHui = new Date();
    aujourdHui.setHours(0, 0, 0, 0);

    const evenements = (getData(CLES_STOCKAGE.EVENEMENTS) || [])
        .filter(ev => new Date(ev.date) >= aujourdHui)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4);

    conteneur.innerHTML = evenements.length
        ? evenements.map(ev => `
            <div class="vitrine-evenement-carte">
                <div class="vitrine-evenement-date">${formaterDateFr(ev.date)}</div>
                <h4>${echapperHtml(ev.titre)}</h4>
                <p class="texte-discret">📍 ${echapperHtml(ev.lieu)}</p>
            </div>
        `).join('')
        : '<p class="etat-vide">Aucun événement public à venir pour le moment.</p>';
}

function ouvrirDemandeAdhesion() {
    reouvrirFormulaireDemande();
    afficherSection('demande-adhesion-section');
}
