/**
 * ============================================================
 *  MEMBRE-ESPACE.JS — Espace personnel restreint du membre
 * ============================================================
 *  Un membre ne voit que ses propres informations : nom, matricule,
 *  session active, bilan financier (objectif / versé / reste /
 *  progression) et son historique de versements. La toute première
 *  fois qu'il franchit 100% de son objectif pour une session donnée,
 *  une animation de félicitations se déclenche.
 */

function chargerEspaceMembre() {
    const utilisateur = getCurrentUser();
    if (!utilisateur || utilisateur.type !== 'MEMBRE') return;

    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const indexMembre = membres.findIndex(m => m.id === utilisateur.id);
    if (indexMembre === -1) return;
    const membre = membres[indexMembre];

    const session = getActiveSession();
    const bilan = calculerBilanMembre(membre, session);

    setTexte('espace-membre-nom', `${membre.prenom} ${membre.nom}`);
    setTexte('espace-membre-matricule', membre.matricule);
    setTexte('espace-membre-session', session ? session.nom : 'Aucune session active pour le moment');

    const chapeletConteneur = document.getElementById('espace-membre-chapelet');
    if (chapeletConteneur) chapeletConteneur.innerHTML = genererChapeletHtml(bilan.pourcentage);

    setTexte('espace-membre-objectif', formaterMontant(bilan.objectif));
    setTexte('espace-membre-verse', formaterMontant(bilan.verse));
    setTexte('espace-membre-reste', formaterMontant(bilan.reste));
    setTexte('espace-membre-pourcentage', `${bilan.pourcentage}%`);

    const messageFelicitations = document.getElementById('espace-membre-felicitations');
    if (messageFelicitations) messageFelicitations.style.display = bilan.pourcentage >= 100 ? 'flex' : 'none';

    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const nomCaisse = (id) => (caisses.find(c => c.id === id) || {}).nom || '—';
    const cotisations = (getData(CLES_STOCKAGE.COTISATIONS) || [])
        .filter(c => c.matriculeMembre === membre.matricule)
        .sort((a, b) => b.creeLe - a.creeLe);

    const tbody = document.getElementById('espace-membre-historique-tbody');
    if (tbody) {
        tbody.innerHTML = cotisations.length
            ? cotisations.map(c => `<tr><td>${formaterDateFr(c.date)}</td><td>${echapperHtml(nomCaisse(c.caisseId))}</td><td>${formaterMontant(c.montant)}</td></tr>`).join('')
            : `<tr><td colspan="3" class="etat-vide">Aucun versement enregistré pour le moment.</td></tr>`;
    }

    // Gamification : anime les confettis une seule fois par session, au premier franchissement de 100%.
    if (session && bilan.pourcentage >= 100) {
        const dejaFete = (membre.celebrationsSessions || []).includes(session.id);
        if (!dejaFete) {
            lancerConfetti('confetti-conteneur');
            if (!membres[indexMembre].celebrationsSessions) membres[indexMembre].celebrationsSessions = [];
            membres[indexMembre].celebrationsSessions.push(session.id);
            saveData(CLES_STOCKAGE.MEMBRES, membres);
        }
    }
}
