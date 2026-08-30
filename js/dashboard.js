/**
 * ============================================================
 *  DASHBOARD.JS — Tableau de bord & indicateurs clés
 * ============================================================
 */

function setTexte(id, valeur) {
    const el = document.getElementById(id);
    if (el) el.textContent = valeur;
}

function derniersMoisIso(nombreMois) {
    const resultats = [];
    const maintenant = new Date();
    for (let i = nombreMois - 1; i >= 0; i--) {
        const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
        resultats.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return resultats;
}

function mettreAJourBadgeSession() {
    const badge = document.getElementById('topbar-session-active');
    if (!badge) return;
    const session = getActiveSession();
    badge.textContent = session ? `Session : ${session.nom}` : 'Aucune session active';
    badge.classList.toggle('badge-succes', !!session);
    badge.classList.toggle('badge-neutre', !session);
}

function chargerDashboard() {
    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    const depenses = getData(CLES_STOCKAGE.DEPENSES) || [];
    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const session = getActiveSession();

    const totalCotisations = cotisations.reduce((s, c) => s + Number(c.montant), 0);
    const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant), 0);
    const soldeGlobal = totalCotisations - totalDepenses;
    const membresActifs = membres.filter(m => m.statut === 'actif');
    const demandesEnAttente = membres.filter(m => m.statut === 'en_attente').length;

    setTexte('dash-total-cotisations', formaterMontant(totalCotisations));
    setTexte('dash-total-depenses', formaterMontant(totalDepenses));
    setTexte('dash-solde-global', formaterMontant(soldeGlobal));
    setTexte('dash-effectif-actif', String(membresActifs.length));
    setTexte('dash-effectif-total', `${membres.length} au total`);

    const elSolde = document.getElementById('dash-solde-global');
    if (elSolde) elSolde.classList.toggle('texte-alerte', soldeGlobal < 0);

    const elAlerteDemandes = document.getElementById('dash-alerte-demandes');
    if (elAlerteDemandes) {
        elAlerteDemandes.style.display = demandesEnAttente > 0 ? 'flex' : 'none';
        elAlerteDemandes.querySelector('span') && (elAlerteDemandes.querySelector('span').textContent =
            `${demandesEnAttente} demande${demandesEnAttente > 1 ? 's' : ''} d'adhésion en attente de traitement.`);
    }

    const elSynthese = document.getElementById('dash-synthese-texte');
    if (elSynthese) {
        elSynthese.innerHTML = `
            Le Dahira compte <strong>${membresActifs.length} membres actifs</strong> (${membres.length} au total, session en cours : ${session ? echapperHtml(session.nom) : 'aucune'}).
            Les cotisations cumulées s'élèvent à <strong>${formaterMontant(totalCotisations)}</strong> pour <strong>${formaterMontant(totalDepenses)}</strong> de dépenses,
            soit un solde net de <strong class="${soldeGlobal >= 0 ? 'texte-positif' : 'texte-alerte'}">${formaterMontant(soldeGlobal)}</strong>.
            ${soldeGlobal >= 0 ? 'Les caisses se portent bien.' : 'Le solde global est négatif : une vigilance est nécessaire.'}
        `;
    }

    const mois = derniersMoisIso(8);
    const labelsMois = mois.map(m => moisAbregeFr(m + '-01'));
    const recettesParMois = mois.map(m => cotisations.filter(c => c.date.startsWith(m)).reduce((s, c) => s + Number(c.montant), 0));
    const depensesParMois = mois.map(m => depenses.filter(d => d.date.startsWith(m)).reduce((s, d) => s + Number(d.montant), 0));
    dessinerGraphiqueBarresGroupees('canvas-evolution', labelsMois, recettesParMois, depensesParMois);

    const itemsRepartition = caisses.map(c => ({ label: c.nom, valeur: calculerSoldeCaisse(c.id) }));
    dessinerGraphiqueDonut('canvas-repartition', 'legende-repartition', itemsRepartition);

    afficherValorisation(session, membresActifs);
}

function afficherValorisation(session, membresActifs) {
    const conteneur = document.getElementById('valorisation-liste');
    if (!conteneur) return;

    if (!session) {
        conteneur.innerHTML = '<p class="etat-vide">Aucune session active pour le moment.</p>';
        return;
    }

    const realises = membresActifs
        .map(m => ({ membre: m, bilan: calculerBilanMembre(m, session) }))
        .filter(x => x.bilan.pourcentage >= 100)
        .sort((a, b) => b.bilan.pourcentage - a.bilan.pourcentage);

    if (realises.length === 0) {
        conteneur.innerHTML = '<p class="etat-vide">Aucun membre n\u2019a encore atteint 100% de son objectif pour cette session.</p>';
        return;
    }

    conteneur.innerHTML = realises.map(({ membre, bilan }) => `
        <div class="valorisation-carte">
            <span class="valorisation-trophee" aria-hidden="true">🏆</span>
            <div>
                <strong>${echapperHtml(membre.prenom)} ${echapperHtml(membre.nom)}</strong>
                <div class="texte-discret">${membre.matricule} · ${bilan.pourcentage}% de l'objectif (${formaterMontant(bilan.verse)})</div>
            </div>
        </div>
    `).join('');
}
