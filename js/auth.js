/**
 * ============================================================
 *  AUTH.JS — Authentification simulée (Responsables & Membres)
 * ============================================================
 *  - Les RESPONSABLES se connectent par email (collection users[])
 *  - Les MEMBRES se connectent par matricule (collection membres[],
 *    uniquement s'ils ont le statut "actif")
 *  - Gère aussi les demandes d'adhésion publiques et la création
 *    de comptes responsables supplémentaires (multi-gestionnaires)
 */

/**
 * Gère la soumission du formulaire de connexion.
 */
function handleLogin(e) {
    e.preventDefault();

    const identifiant = document.getElementById('login-identifier').value.trim();
    const motDePasse = document.getElementById('login-password').value;

    if (identifiant.includes('@')) {
        // Tentative de connexion RESPONSABLE
        const users = getData(CLES_STOCKAGE.USERS) || [];
        const utilisateur = users.find(u => u.email.toLowerCase() === identifiant.toLowerCase());

        if (utilisateur && utilisateur.password === motDePasse) {
            connecter({ type: 'RESPONSABLE', id: utilisateur.id, email: utilisateur.email, nomComplet: utilisateur.nomComplet });
            return;
        }
    } else {
        // Tentative de connexion MEMBRE (par matricule)
        const membres = getData(CLES_STOCKAGE.MEMBRES) || [];
        const membre = membres.find(m => m.matricule && m.matricule.toLowerCase() === identifiant.toLowerCase());

        if (membre && membre.motDePasse === motDePasse) {
            if (membre.statut !== 'actif') {
                toast("Votre compte n'est pas encore actif. Contactez un responsable du Dahira.", 'erreur');
                return;
            }
            connecter({ type: 'MEMBRE', id: membre.id, matricule: membre.matricule, nomComplet: `${membre.prenom} ${membre.nom}`, sexe: membre.sexe });
            return;
        }
    }

    toast('Identifiant ou mot de passe incorrect.', 'erreur');
}

/**
 * Ouvre la session applicative pour l'utilisateur authentifié et redirige
 * vers l'espace qui lui correspond.
 */
function connecter(utilisateur) {
    sessionStorage.setItem('currentUser', JSON.stringify(utilisateur));
    document.getElementById('login-form').reset();
    afficherUtilisateurConnecte();
    toast(`Bienvenue, ${utilisateur.nomComplet} !`, 'succes');

    if (utilisateur.type === 'RESPONSABLE') {
        afficherSection('dashboard-section');
    } else {
        afficherSection('espace-membre-section');
    }
}

function getCurrentUser() {
    const brut = sessionStorage.getItem('currentUser');
    return brut ? JSON.parse(brut) : null;
}

function logout() {
    sessionStorage.removeItem('currentUser');
    afficherSection('vitrine-section');
}

/**
 * Met à jour le bandeau applicatif avec le nom et le rôle de l'utilisateur connecté.
 */
function afficherUtilisateurConnecte() {
    const utilisateur = getCurrentUser();
    const elNom = document.getElementById('utilisateur-nom-affiche');
    const elRole = document.getElementById('utilisateur-role-affiche');
    if (!utilisateur) return;
    if (elNom) elNom.textContent = utilisateur.nomComplet;
    if (elRole) elRole.textContent = utilisateur.type === 'RESPONSABLE' ? 'Responsable' : `Membre · ${utilisateur.matricule}`;
}

/* ---------- DEMANDES D'ADHÉSION PUBLIQUES ---------- */

/**
 * Traite la soumission publique d'une demande d'adhésion (statut "en_attente").
 */
function soumettreDemandeAdhesion(e) {
    e.preventDefault();

    const nom = document.getElementById('demande-nom').value.trim();
    const prenom = document.getElementById('demande-prenom').value.trim();
    const sexe = document.getElementById('demande-sexe').value;
    const telephone = document.getElementById('demande-telephone').value.trim();
    const motDePasse = document.getElementById('demande-motdepasse').value;

    const membres = getData(CLES_STOCKAGE.MEMBRES) || [];

    const dejaExistant = membres.some(m => m.telephone === telephone && m.statut !== 'refuse');
    if (dejaExistant) {
        toast('Une demande ou un compte existe déjà avec ce numéro de téléphone.', 'erreur');
        return;
    }

    const nouvelleDemande = {
        id: prochainId(membres),
        matricule: null,
        nom, prenom, sexe, telephone,
        dateAdhesion: dateDuJourIso(),
        statut: 'en_attente',
        motDePasse,
        celebrationsSessions: []
    };

    membres.push(nouvelleDemande);
    saveData(CLES_STOCKAGE.MEMBRES, membres);

    document.getElementById('form-demande-adhesion').reset();
    document.getElementById('demande-adhesion-formulaire').classList.add('etat-cache');
    document.getElementById('demande-adhesion-confirmation').classList.remove('etat-cache');
}

function reouvrirFormulaireDemande() {
    document.getElementById('demande-adhesion-formulaire').classList.remove('etat-cache');
    document.getElementById('demande-adhesion-confirmation').classList.add('etat-cache');
}

/* ---------- MULTI-GESTIONNAIRES (COMPTES RESPONSABLES) ---------- */

function afficherResponsables() {
    const tbody = document.getElementById('liste-responsables-tbody');
    if (!tbody) return;
    const users = getData(CLES_STOCKAGE.USERS) || [];
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="etat-vide">Aucun responsable enregistré.</td></tr>`;
        return;
    }

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${echapperHtml(u.nomComplet)}</strong></td>
            <td>${echapperHtml(u.email)}</td>
            <td>${users.length > 1 ? `<button class="btn-icone btn-danger-ghost" onclick="supprimerResponsable(${u.id})" title="Retirer l'accès">✕</button>` : '<span class="texte-discret">Compte principal</span>'}</td>
        `;
        tbody.appendChild(tr);
    });
}

function ajouterResponsable(e) {
    e.preventDefault();

    const nomComplet = document.getElementById('responsable-nom').value.trim();
    const email = document.getElementById('responsable-email').value.trim();
    const password = document.getElementById('responsable-password').value;

    const users = getData(CLES_STOCKAGE.USERS) || [];
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        toast('Un responsable utilise déjà cette adresse email.', 'erreur');
        return;
    }

    users.push({ id: prochainId(users), role: 'RESPONSABLE', email, password, nomComplet });
    saveData(CLES_STOCKAGE.USERS, users);

    document.getElementById('form-ajouter-responsable').reset();
    afficherResponsables();
    toast(`${nomComplet} peut désormais se connecter en tant que responsable.`, 'succes');
}

async function supprimerResponsable(id) {
    const ok = await confirmerAction("Retirer l'accès de ce responsable ?", 'Retirer');
    if (!ok) return;
    let users = getData(CLES_STOCKAGE.USERS) || [];
    users = users.filter(u => u.id !== id);
    saveData(CLES_STOCKAGE.USERS, users);
    afficherResponsables();
    toast('Accès retiré.', 'succes');
}
