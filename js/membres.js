/**
 * ============================================================
 *  MEMBRES.JS — Gestion des membres et des demandes d'adhésion
 * ============================================================
 *  Le statut d'un membre porte à la fois le cycle de la demande
 *  d'adhésion et le cycle de vie du membre actif :
 *    en_attente -> actif (acceptée) | refuse (refusée)
 *    actif <-> inactif (suspension / réactivation par un responsable)
 */

const PREFIXE_MATRICULE = 'DT'; // 2 lettres du Dahira — à adapter si besoin

let filtreMembresStatut = 'actif';
let filtreMembresRecherche = '';

/**
 * Génère le prochain matricule au format [2 Lettres][5 Chiffres], ex: DT00007.
 * Se base sur le plus grand numéro déjà attribué (et non sur la taille du
 * tableau) pour rester valide même après suppression d'un membre.
 */
function genererMatricule() {
    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    let maxNumero = 0;
    membres.forEach(m => {
        if (m.matricule && m.matricule.startsWith(PREFIXE_MATRICULE)) {
            const numero = parseInt(m.matricule.slice(PREFIXE_MATRICULE.length), 10);
            if (!isNaN(numero) && numero > maxNumero) maxNumero = numero;
        }
    });
    return `${PREFIXE_MATRICULE}${String(maxNumero + 1).padStart(5, '0')}`;
}

function libelleStatutMembre(statut) {
    return { actif: 'Actif', en_attente: 'En attente', refuse: 'Refusée', inactif: 'Inactif' }[statut] || statut;
}

function classeStatutMembre(statut) {
    return { actif: 'succes', en_attente: 'attente', refuse: 'danger', inactif: 'neutre' }[statut] || 'neutre';
}

/**
 * Calcule le bilan financier d'un membre pour une session donnée :
 * objectif (selon le sexe), montant versé (caisses comptant dans l'objectif
 * uniquement), reste à payer et pourcentage de progression.
 */
function calculerBilanMembre(membre, session) {
    if (!session || !membre.matricule) return { objectif: 0, verse: 0, reste: 0, pourcentage: 0 };

    const objectif = membre.sexe === 'M' ? session.objectifHomme : session.objectifFemme;
    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const idsCaissesComptees = new Set(caisses.filter(c => c.compteDansObjectif).map(c => c.id));

    const cotisations = getData(CLES_STOCKAGE.COTISATIONS) || [];
    const verse = cotisations
        .filter(c => c.matriculeMembre === membre.matricule && c.sessionId === session.id && idsCaissesComptees.has(c.caisseId))
        .reduce((somme, c) => somme + Number(c.montant), 0);

    const reste = Math.max(0, objectif - verse);
    const pourcentage = objectif > 0 ? Math.round((verse / objectif) * 100) : 0;

    return { objectif, verse, reste, pourcentage };
}

/**
 * Construit le balisage du "chapelet de progression" (signature visuelle de
 * l'application) : une rangée de grains qui se remplissent avec le pourcentage
 * d'objectif atteint. 33 grains, en écho au chapelet traditionnel (tasbih).
 */
function genererChapeletHtml(pourcentage) {
    const NB_GRAINS = 33;
    const grainsRemplis = Math.min(NB_GRAINS, Math.round((Math.min(pourcentage, 100) / 100) * NB_GRAINS));
    let html = '<div class="chapelet" role="img" aria-label="Progression : ' + Math.min(pourcentage, 999) + ' pour cent">';
    for (let i = 0; i < NB_GRAINS; i++) {
        html += `<span class="chapelet-grain${i < grainsRemplis ? ' chapelet-grain-rempli' : ''}"></span>`;
    }
    html += '</div>';
    return html;
}

/* ---------- AFFICHAGE DE LA LISTE ---------- */

function definirFiltreMembresStatut(statut, boutonElement) {
    filtreMembresStatut = statut;
    document.querySelectorAll('.onglet-filtre').forEach(b => b.classList.remove('onglet-actif'));
    if (boutonElement) boutonElement.classList.add('onglet-actif');
    afficherMembres();
}

function filtrerMembres() {
    filtreMembresRecherche = document.getElementById('search-membre').value.toLowerCase().trim();
    afficherMembres();
}

function afficherMembres() {
    const tbody = document.getElementById('liste-membres-tbody');
    if (!tbody) return;

    const tousLesMembres = getData(CLES_STOCKAGE.MEMBRES) || [];

    const compteurs = { actif: 0, en_attente: 0, autres: 0 };
    tousLesMembres.forEach(m => {
        if (m.statut === 'actif') compteurs.actif++;
        else if (m.statut === 'en_attente') compteurs.en_attente++;
        else compteurs.autres++;
    });
    document.querySelectorAll('[data-compteur-statut]').forEach(el => {
        el.textContent = el.dataset.compteurStatut === 'tous' ? tousLesMembres.length : (compteurs[el.dataset.compteurStatut] ?? 0);
    });

    const badgeNav = document.getElementById('badge-demandes-nav');
    if (badgeNav) {
        badgeNav.style.display = compteurs.en_attente > 0 ? 'inline-flex' : 'none';
        badgeNav.textContent = compteurs.en_attente;
    }

    let affiches = tousLesMembres.filter(m => {
        if (filtreMembresStatut === 'tous') return true;
        if (filtreMembresStatut === 'autres') return m.statut === 'refuse' || m.statut === 'inactif';
        return m.statut === filtreMembresStatut;
    });

    if (filtreMembresRecherche) {
        affiches = affiches.filter(m =>
            m.nom.toLowerCase().includes(filtreMembresRecherche) ||
            m.prenom.toLowerCase().includes(filtreMembresRecherche) ||
            (m.matricule || '').toLowerCase().includes(filtreMembresRecherche)
        );
    }

    tbody.innerHTML = '';

    if (affiches.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="etat-vide">Aucun membre ne correspond à ce filtre.</td></tr>`;
        return;
    }

    affiches.forEach(membre => {
        const tr = document.createElement('tr');
        const sexeLabel = membre.sexe === 'M' ? 'Homme' : 'Femme';

        if (membre.statut === 'en_attente') {
            tr.innerHTML = `
                <td class="texte-discret">—</td>
                <td><strong>${echapperHtml(membre.prenom)} ${echapperHtml(membre.nom)}</strong></td>
                <td>${sexeLabel}</td>
                <td>${echapperHtml(membre.telephone)}</td>
                <td>${formaterDateFr(membre.dateAdhesion)}</td>
                <td><span class="badge badge-attente">En attente</span></td>
                <td class="cellule-actions">
                    <button class="btn-sm btn-succes" onclick="accepterDemande(${membre.id})">Accepter</button>
                    <button class="btn-sm btn-danger-ghost" onclick="refuserDemande(${membre.id})">Refuser</button>
                </td>`;
        } else {
            tr.innerHTML = `
                <td><strong>${membre.matricule}</strong></td>
                <td>${echapperHtml(membre.prenom)} ${echapperHtml(membre.nom)}</td>
                <td>${sexeLabel}</td>
                <td>${echapperHtml(membre.telephone)}</td>
                <td>${formaterDateFr(membre.dateAdhesion)}</td>
                <td><span class="badge badge-${classeStatutMembre(membre.statut)}">${libelleStatutMembre(membre.statut)}</span></td>
                <td class="cellule-actions">
                    <button class="btn-sm btn-info" onclick="voirFicheMembre(${membre.id})">Fiche</button>
                    <button class="btn-sm btn-danger-ghost" onclick="supprimerMembre(${membre.id})">Supprimer</button>
                </td>`;
        }
        tbody.appendChild(tr);
    });
}

/* ---------- AJOUT DIRECT PAR LE RESPONSABLE ---------- */

function ouvrirModalAjoutMembre() {
    document.getElementById('form-ajout-membre').reset();
    ouvrirModal('modal-ajout-membre');
}

function ajouterMembreDirect(e) {
    e.preventDefault();

    const nom = document.getElementById('membre-nom').value.trim();
    const prenom = document.getElementById('membre-prenom').value.trim();
    const sexe = document.getElementById('membre-sexe').value;
    const telephone = document.getElementById('membre-telephone').value.trim();
    const motDePasseSaisi = document.getElementById('membre-motdepasse').value.trim();

    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const matricule = genererMatricule();

    const nouveauMembre = {
        id: prochainId(membres),
        matricule, nom, prenom, sexe, telephone,
        dateAdhesion: dateDuJourIso(),
        statut: 'actif',
        motDePasse: motDePasseSaisi || matricule,
        celebrationsSessions: []
    };

    membres.push(nouveauMembre);
    saveData(CLES_STOCKAGE.MEMBRES, membres);

    fermerModal('modal-ajout-membre');
    afficherMembres();
    toast(`Membre ajouté avec succès — matricule ${matricule} attribué automatiquement.`, 'succes');
}

/* ---------- DEMANDES D'ADHÉSION ---------- */

function accepterDemande(id) {
    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const index = membres.findIndex(m => m.id === id);
    if (index === -1) return;

    membres[index].matricule = genererMatricule();
    membres[index].statut = 'actif';
    membres[index].dateAdhesion = dateDuJourIso();
    saveData(CLES_STOCKAGE.MEMBRES, membres);
    afficherMembres();
    toast(`Demande acceptée — matricule ${membres[index].matricule} attribué.`, 'succes');
}

async function refuserDemande(id) {
    const ok = await confirmerAction("Refuser cette demande d'adhésion ?", 'Refuser');
    if (!ok) return;

    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const index = membres.findIndex(m => m.id === id);
    if (index === -1) return;

    membres[index].statut = 'refuse';
    saveData(CLES_STOCKAGE.MEMBRES, membres);
    afficherMembres();
    toast('Demande refusée.', 'info');
}

/* ---------- FICHE DÉTAILLÉE D'UN MEMBRE ---------- */

function voirFicheMembre(id) {
    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const membre = membres.find(m => m.id === id);
    if (!membre) return;

    const session = getActiveSession();
    const caisses = getData(CLES_STOCKAGE.CAISSES) || [];
    const nomCaisse = (caisseId) => (caisses.find(c => c.id === caisseId) || {}).nom || '—';

    const cotisations = (getData(CLES_STOCKAGE.COTISATIONS) || [])
        .filter(c => c.matriculeMembre === membre.matricule)
        .sort((a, b) => b.creeLe - a.creeLe);

    let blocBilan = '';
    if (session && membre.statut === 'actif') {
        const bilan = calculerBilanMembre(membre, session);
        blocBilan = `
            <div class="fiche-bilan">
                <h4>Bilan — ${echapperHtml(session.nom)}</h4>
                ${genererChapeletHtml(bilan.pourcentage)}
                <div class="fiche-bilan-chiffres">
                    <div><span class="texte-discret">Objectif</span><strong>${formaterMontant(bilan.objectif)}</strong></div>
                    <div><span class="texte-discret">Versé</span><strong class="texte-positif">${formaterMontant(bilan.verse)}</strong></div>
                    <div><span class="texte-discret">Reste à payer</span><strong class="${bilan.reste > 0 ? 'texte-alerte' : 'texte-positif'}">${formaterMontant(bilan.reste)}</strong></div>
                    <div><span class="texte-discret">Progression</span><strong>${bilan.pourcentage}%</strong></div>
                </div>
            </div>`;
    }

    document.getElementById('fiche-membre-corps').innerHTML = `
        <div class="fiche-entete">
            <div>
                <h3>${echapperHtml(membre.prenom)} ${echapperHtml(membre.nom)}</h3>
                <p class="texte-discret">Matricule <strong>${membre.matricule || 'en attente d\u2019attribution'}</strong> · ${membre.sexe === 'M' ? 'Homme' : 'Femme'} · ${echapperHtml(membre.telephone)} · adhésion le ${formaterDateFr(membre.dateAdhesion)}</p>
            </div>
            <span class="badge badge-${classeStatutMembre(membre.statut)}">${libelleStatutMembre(membre.statut)}</span>
        </div>

        ${blocBilan}

        <h4>Historique des versements</h4>
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>Date</th><th>Caisse</th><th>Montant</th></tr></thead>
                <tbody>
                    ${cotisations.length ? cotisations.map(c => `<tr><td>${formaterDateFr(c.date)}</td><td>${echapperHtml(nomCaisse(c.caisseId))}</td><td>${formaterMontant(c.montant)}</td></tr>`).join('') : '<tr><td colspan="3" class="etat-vide">Aucun versement enregistré.</td></tr>'}
                </tbody>
            </table>
        </div>

        <div class="fiche-actions">
            ${membre.statut === 'actif' ? `<button class="btn-secondaire" onclick="basculerStatutMembre(${membre.id})">Suspendre l'adhésion</button>` : ''}
            ${membre.statut === 'inactif' ? `<button class="btn-secondaire" onclick="basculerStatutMembre(${membre.id})">Réactiver l'adhésion</button>` : ''}
        </div>
    `;

    ouvrirModal('modal-fiche-membre');
}

async function basculerStatutMembre(id) {
    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    const index = membres.findIndex(m => m.id === id);
    if (index === -1) return;

    const nouveauStatut = membres[index].statut === 'actif' ? 'inactif' : 'actif';
    const ok = await confirmerAction(
        `${nouveauStatut === 'inactif' ? 'Suspendre' : 'Réactiver'} l'adhésion de ${membres[index].prenom} ${membres[index].nom} ?`,
        nouveauStatut === 'inactif' ? 'Suspendre' : 'Réactiver'
    );
    if (!ok) return;

    membres[index].statut = nouveauStatut;
    saveData(CLES_STOCKAGE.MEMBRES, membres);
    afficherMembres();
    fermerModal('modal-fiche-membre');
    toast('Statut du membre mis à jour.', 'succes');
}

async function supprimerMembre(id) {
    const ok = await confirmerAction('Voulez-vous vraiment supprimer ce membre ? Cette action est définitive.', 'Supprimer');
    if (!ok) return;

    let membres = getData(CLES_STOCKAGE.MEMBRES) || [];
    membres = membres.filter(m => m.id !== id);
    saveData(CLES_STOCKAGE.MEMBRES, membres);
    afficherMembres();
    toast('Membre supprimé.', 'succes');
}
