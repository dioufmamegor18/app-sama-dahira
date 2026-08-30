/**
 * ============================================================
 *  COTISATIONS.JS — Saisie et suivi des cotisations
 * ============================================================
 *  Trois façons d'enregistrer une cotisation :
 *   1. Formulaire complet (modale)
 *   2. Saisie rapide (une ligne à la fois, sans quitter la page)
 *   3. Saisie en lot (plusieurs membres en une seule validation)
 *  Toutes passent par creerCotisationDepuisFormulaire() pour rester
 *  cohérentes. Une cotisation reste modifiable 1h après sa création
 *  (estCotisationModifiable), au-delà elle est verrouillée et
 *  chaque modification autorisée est tracée dans historiqueModifications.
 */

function remplirSelectMembres(idSelect, placeholder = '-- Sélectionner un membre --') {
    const select = document.getElementById(idSelect);
    if (!select) return;
    const valeurPrecedente = select.value;
    const membres = (getData(CLES_STOCKAGE.MEMBRES) || []).filter(m => m.statut === 'actif');
    select.innerHTML = `<option value="">${placeholder}</option>`;
    membres.forEach(m => {
        select.innerHTML += `<option value="${m.matricule}">${m.matricule} — ${echapperHtml(m.prenom)} ${echapperHtml(m.nom)}</option>`;
    });
    if (valeurPrecedente) select.value = valeurPrecedente;
}

/* ---------- CRÉATION PARTAGÉE ---------- */

function creerCotisationDepuisFormulaire({ matricule, caisseId, montant }) {
    const sessionActive = getActiveSession();
    if (!sessionActive) {
        toast('Aucune session active. Activez une session avant de saisir une cotisation.', 'erreur');
        return false;
    }
    if (!matricule || !caisseId || !montant || montant <= 0) {
        toast('Veuillez renseigner un membre, une caisse et un montant valide.', 'erreur');
        return false;
    }

    const currentUser = getCurrentUser() || { nomComplet: 'Responsable' };
    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    cotisations.push({
        id: prochainId(cotisations),
        matriculeMembre: matricule,
        caisseId,
        montant,
        sessionId: sessionActive.id,
        date: dateDuJourIso(),
        heure: heureActuelle(),
        creeLe: Date.now(),
        responsable: currentUser.nomComplet,
        historiqueModifications: []
    });
    saveData(CLES_STOCKAGE.COTISATIONS, cotisations);

    afficherCotisations();
    if (typeof afficherCaisses === 'function') afficherCaisses();
    return true;
}

/* ---------- SAISIE COMPLÈTE (MODALE) ---------- */

function ouvrirModalCotisation() {
    remplirSelectMembres('cotisation-membre');
    remplirSelectCaisses('cotisation-caisse');
    ouvrirModal('modal-cotisation');
}

function fermerModalCotisation() {
    fermerModal('modal-cotisation');
}

function enregistrerCotisation(e) {
    e.preventDefault();
    const matricule = document.getElementById('cotisation-membre').value;
    const caisseId = Number(document.getElementById('cotisation-caisse').value);
    const montant = Number(document.getElementById('cotisation-montant').value);

    if (creerCotisationDepuisFormulaire({ matricule, caisseId, montant })) {
        document.getElementById('form-cotisation').reset();
        fermerModalCotisation();
        toast(`Cotisation de ${formaterMontant(montant)} enregistrée pour ${matricule}.`, 'succes');
    }
}

/* ---------- SAISIE RAPIDE ---------- */

function initSaisieRapideSelects() {
    remplirSelectMembres('rapide-membre', '-- Choisir membre --');
    remplirSelectCaisses('rapide-caisse');
}

function enregistrerSaisieRapide(e) {
    e.preventDefault();
    const matricule = document.getElementById('rapide-membre').value;
    const caisseId = Number(document.getElementById('rapide-caisse').value);
    const montant = Number(document.getElementById('rapide-montant').value);

    if (creerCotisationDepuisFormulaire({ matricule, caisseId, montant })) {
        document.getElementById('rapide-montant').value = '';
        toast(`Cotisation de ${formaterMontant(montant)} enregistrée.`, 'succes');
    }
}

/* ---------- SAISIE EN LOT ---------- */

function ouvrirSaisieEnLot() {
    remplirSelectCaisses('lot-caisse');
    document.getElementById('lot-recherche').value = '';
    construireTableauSaisieEnLot();
    ouvrirModal('modal-saisie-lot');
}

function construireTableauSaisieEnLot(filtre = '') {
    const tbody = document.getElementById('lot-membres-tbody');
    if (!tbody) return;

    const membres = (getData(CLES_STOCKAGE.MEMBRES) || []).filter(m => m.statut === 'actif');
    const filtres = filtre
        ? membres.filter(m => m.nom.toLowerCase().includes(filtre) || m.prenom.toLowerCase().includes(filtre) || m.matricule.toLowerCase().includes(filtre))
        : membres;

    if (filtres.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="etat-vide">Aucun membre actif trouvé.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    filtres.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${m.matricule}</strong></td>
            <td>${echapperHtml(m.prenom)} ${echapperHtml(m.nom)}</td>
            <td><input type="number" min="0" step="500" class="lot-montant-input form-control" data-matricule="${m.matricule}" placeholder="0"></td>
        `;
        tbody.appendChild(tr);
    });
}

function filtrerSaisieEnLot() {
    const q = document.getElementById('lot-recherche').value.toLowerCase().trim();
    construireTableauSaisieEnLot(q);
}

function enregistrerSaisieEnLot(e) {
    e.preventDefault();

    const caisseId = Number(document.getElementById('lot-caisse').value);
    if (!caisseId) { toast('Veuillez choisir une caisse pour le lot.', 'erreur'); return; }

    const sessionActive = getActiveSession();
    if (!sessionActive) { toast('Aucune session active.', 'erreur'); return; }

    const currentUser = getCurrentUser() || { nomComplet: 'Responsable' };
    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    let prochainIdentifiant = prochainId(cotisations);
    const maintenant = Date.now();
    const aujourdHui = dateDuJourIso();
    const heure = heureActuelle();

    let nombreAjoutes = 0;
    document.querySelectorAll('.lot-montant-input').forEach(input => {
        const montant = Number(input.value);
        if (montant > 0) {
            cotisations.push({
                id: prochainIdentifiant++,
                matriculeMembre: input.dataset.matricule,
                caisseId,
                montant,
                sessionId: sessionActive.id,
                date: aujourdHui,
                heure,
                creeLe: maintenant,
                responsable: currentUser.nomComplet,
                historiqueModifications: []
            });
            nombreAjoutes++;
        }
    });

    if (nombreAjoutes === 0) {
        toast('Aucun montant saisi.', 'erreur');
        return;
    }

    saveData(CLES_STOCKAGE.COTISATIONS, cotisations);
    fermerModal('modal-saisie-lot');
    afficherCotisations();
    if (typeof afficherCaisses === 'function') afficherCaisses();
    toast(`${nombreAjoutes} cotisation(s) enregistrée(s) en une seule saisie en lot.`, 'succes');
}

/* ---------- VERROU D'ÉDITION (1H) ---------- */

function estCotisationModifiable(cotisation) {
    const UNE_HEURE_MS = 60 * 60 * 1000;
    return (Date.now() - cotisation.creeLe) <= UNE_HEURE_MS;
}

function ouvrirEditionCotisation(id) {
    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    const cotisation = cotisations.find(c => c.id === id);
    if (!cotisation) return;

    if (!estCotisationModifiable(cotisation)) {
        toast("Modification impossible : le délai d'une heure après la saisie est dépassé.", 'erreur');
        return;
    }

    document.getElementById('edition-cotisation-id').value = cotisation.id;
    document.getElementById('edition-cotisation-montant').value = cotisation.montant;
    ouvrirModal('modal-edition-cotisation');
}

function modifierCotisation(e) {
    e.preventDefault();

    const id = Number(document.getElementById('edition-cotisation-id').value);
    const nouveauMontant = Number(document.getElementById('edition-cotisation-montant').value);

    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    const index = cotisations.findIndex(c => c.id === id);
    if (index === -1) return;

    const cotisation = cotisations[index];
    if (!estCotisationModifiable(cotisation)) {
        toast("MODIFICATION VERROUILLÉE : le délai d'une heure est dépassé.", 'erreur');
        fermerModal('modal-edition-cotisation');
        afficherCotisations();
        return;
    }

    const currentUser = getCurrentUser() || { nomComplet: 'Responsable' };
    if (!cotisation.historiqueModifications) cotisation.historiqueModifications = [];
    cotisation.historiqueModifications.push({
        ancienMontant: cotisation.montant,
        nouveauMontant,
        modifiePar: currentUser.nomComplet,
        date: dateDuJourIso(),
        heure: heureActuelle()
    });
    cotisation.montant = nouveauMontant;
    cotisations[index] = cotisation;
    saveData(CLES_STOCKAGE.COTISATIONS, cotisations);

    fermerModal('modal-edition-cotisation');
    afficherCotisations();
    if (typeof afficherCaisses === 'function') afficherCaisses();
    toast('Cotisation modifiée avec succès. La modification a été tracée.', 'succes');
}

/* ---------- HISTORIQUE ---------- */

function afficherCotisations() {
    const tbody = document.getElementById('liste-cotisations-tbody');
    if (!tbody) return;

    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const sessions = getData(CLES_STOCKAGE.SESSIONS) || [];

    const nomMembre = (matricule) => {
        const m = membres.find(x => x.matricule === matricule);
        return m ? `${m.prenom} ${m.nom}` : 'Membre inconnu';
    };
    const nomCaisse = (id) => (caisses.find(c => c.id === id) || {}).nom || '—';
    const nomSession = (id) => (sessions.find(s => s.id === id) || {}).nom || '—';

    tbody.innerHTML = '';

    if (cotisations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="etat-vide">Aucune cotisation enregistrée pour le moment.</td></tr>`;
        return;
    }

    [...cotisations].sort((a, b) => b.creeLe - a.creeLe).forEach(cotisation => {
        const modifiable = estCotisationModifiable(cotisation);
        const aHistorique = cotisation.historiqueModifications && cotisation.historiqueModifications.length > 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formaterDateFr(cotisation.date)} à ${cotisation.heure}</td>
            <td><strong>${cotisation.matriculeMembre}</strong> — ${echapperHtml(nomMembre(cotisation.matriculeMembre))}</td>
            <td>${echapperHtml(nomCaisse(cotisation.caisseId))}</td>
            <td><strong class="texte-positif">${formaterMontant(cotisation.montant)}</strong>${aHistorique ? ` <span class="badge badge-neutre" title="${cotisation.historiqueModifications.length} modification(s) tracée(s)">modifié</span>` : ''}</td>
            <td>${echapperHtml(nomSession(cotisation.sessionId))}</td>
            <td><small>${echapperHtml(cotisation.responsable)}</small></td>
            <td>${modifiable ? `<button class="btn-sm btn-info" onclick="ouvrirEditionCotisation(${cotisation.id})">Modifier</button>` : '<span class="texte-discret" title="Modification verrouillée après 1h">🔒 verrouillé</span>'}</td>
        `;
        tbody.appendChild(tr);
    });
}
