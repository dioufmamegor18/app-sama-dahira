/**
 * ============================================================
 *  SESSIONS.JS — Gestion des sessions & objectifs financiers
 * ============================================================
 *  Une seule session peut être active à la fois. Les objectifs
 *  annuels par sexe sont définis à la création de chaque session
 *  (et modifiables ensuite), puis utilisés automatiquement pour
 *  calculer le bilan de chaque membre (voir membres.js).
 */

function afficherSessions() {
    const tbody = document.getElementById('liste-sessions-tbody');
    if (!tbody) return;

    const sessions = getData(CLES_STOCKAGE.SESSIONS) || [];
    tbody.innerHTML = '';

    if (sessions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="etat-vide">Aucune session enregistrée.</td></tr>`;
        return;
    }

    [...sessions].reverse().forEach(session => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${echapperHtml(session.nom)}</strong></td>
            <td>${formaterDateFr(session.dateOuverture)} → ${formaterDateFr(session.dateFermeture)}</td>
            <td>${formaterMontant(session.objectifHomme)}</td>
            <td>${formaterMontant(session.objectifFemme)}</td>
            <td><span class="badge badge-${session.active ? 'succes' : 'neutre'}">${session.active ? 'Active' : 'Fermée'}</span></td>
            <td class="cellule-actions">
                <button class="btn-sm btn-info" onclick="ouvrirModalObjectifs(${session.id})">Objectifs</button>
                ${!session.active ? `<button class="btn-sm btn-succes" onclick="activerSession(${session.id})">Activer</button>` : '<em class="texte-discret">En cours</em>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function ajouterSession(e) {
    e.preventDefault();

    const nom = document.getElementById('session-nom').value.trim();
    const dateOuverture = document.getElementById('session-debut').value;
    const dateFermeture = document.getElementById('session-fin').value;
    const objectifHomme = Number(document.getElementById('session-objectif-homme').value);
    const objectifFemme = Number(document.getElementById('session-objectif-femme').value);

    if (new Date(dateFermeture) < new Date(dateOuverture)) {
        toast('La date de fermeture doit être postérieure à la date d\u2019ouverture.', 'erreur');
        return;
    }

    const sessions = getData(CLES_STOCKAGE.SESSIONS) || [];
    sessions.forEach(s => { s.active = false; });

    sessions.push({
        id: prochainId(sessions),
        nom, dateOuverture, dateFermeture,
        active: true,
        objectifHomme, objectifFemme
    });
    saveData(CLES_STOCKAGE.SESSIONS, sessions);

    document.getElementById('form-session').reset();
    afficherSessions();
    toast(`Session "${nom}" créée et activée.`, 'succes');
}

function activerSession(id) {
    const sessions = getData(CLES_STOCKAGE.SESSIONS) || [];
    sessions.forEach(s => { s.active = (s.id === id); });
    saveData(CLES_STOCKAGE.SESSIONS, sessions);
    afficherSessions();
    toast('Session active mise à jour.', 'succes');
}

function getActiveSession() {
    const sessions = getData(CLES_STOCKAGE.SESSIONS) || [];
    return sessions.find(s => s.active) || null;
}

/* ---------- MODIFICATION DES OBJECTIFS D'UNE SESSION ---------- */

function ouvrirModalObjectifs(id) {
    const sessions = getData(CLES_STOCKAGE.SESSIONS) || [];
    const session = sessions.find(s => s.id === id);
    if (!session) return;

    document.getElementById('objectifs-session-id').value = session.id;
    document.getElementById('objectifs-session-titre').textContent = session.nom;
    document.getElementById('objectifs-homme').value = session.objectifHomme;
    document.getElementById('objectifs-femme').value = session.objectifFemme;
    ouvrirModal('modal-objectifs-session');
}

function enregistrerObjectifsSession(e) {
    e.preventDefault();

    const id = Number(document.getElementById('objectifs-session-id').value);
    const objectifHomme = Number(document.getElementById('objectifs-homme').value);
    const objectifFemme = Number(document.getElementById('objectifs-femme').value);

    const sessions = getData(CLES_STOCKAGE.SESSIONS) || [];
    const index = sessions.findIndex(s => s.id === id);
    if (index === -1) return;

    sessions[index].objectifHomme = objectifHomme;
    sessions[index].objectifFemme = objectifFemme;
    saveData(CLES_STOCKAGE.SESSIONS, sessions);

    fermerModal('modal-objectifs-session');
    afficherSessions();
    toast('Objectifs de la session mis à jour.', 'succes');
}
