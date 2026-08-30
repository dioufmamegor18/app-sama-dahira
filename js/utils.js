/**
 * ============================================================
 *  UTILS.JS — Fonctions transversales utilisées par tous les modules
 * ============================================================
 *  - Formatage (montants, dates)
 *  - Génération d'identifiants séquentiels sûrs
 *  - Notifications "toast" (remplacent les alert() bloquants)
 *  - Boîte de confirmation personnalisée
 *  - Ouverture / fermeture de fenêtres modales génériques
 *  - Échappement HTML (protection basique contre l'injection)
 */

/* ---------- FORMATAGE ---------- */

/**
 * Formate un nombre en montant FCFA lisible : 125000 -> "125 000 FCFA"
 */
function formaterMontant(nombre) {
    const valeur = Math.round(Number(nombre) || 0);
    return `${valeur.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Version courte pour les axes de graphiques : 1250000 -> "1,25M" / 125000 -> "125k"
 */
function formaterMontantCourt(nombre) {
    const valeur = Number(nombre) || 0;
    const abs = Math.abs(valeur);
    if (abs >= 1000000) return (valeur / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + 'M';
    if (abs >= 1000) return Math.round(valeur / 1000) + 'k';
    return String(Math.round(valeur));
}

/**
 * Convertit une date ISO (YYYY-MM-DD) en format français lisible (JJ/MM/AAAA).
 */
function formaterDateFr(dateIso) {
    if (!dateIso) return '—';
    const [annee, mois, jour] = dateIso.split('-');
    if (!annee || !mois || !jour) return dateIso;
    return `${jour}/${mois}/${annee}`;
}

/**
 * Retourne la date du jour au format ISO (YYYY-MM-DD), utilisée pour l'horodatage auto.
 */
function dateDuJourIso() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Retourne l'heure actuelle au format HH:MM.
 */
function heureActuelle() {
    return new Date().toTimeString().split(' ')[0].substring(0, 5);
}

/**
 * Nom du mois abrégé en français à partir d'une date ISO, pour les graphiques (ex: "janv. 2026").
 */
function moisAbregeFr(dateIso) {
    const d = new Date(dateIso + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
}

/* ---------- IDENTIFIANTS ---------- */

/**
 * Calcule le prochain identifiant numérique séquentiel disponible pour une liste donnée.
 * Beaucoup plus sûr qu'un identifiant basé sur Date.now() en cas de saisie en lot
 * (plusieurs enregistrements créés dans la même milliseconde).
 */
function prochainId(liste) {
    if (!liste || liste.length === 0) return 1;
    const max = liste.reduce((m, item) => Math.max(m, Number(item.id) || 0), 0);
    return max + 1;
}

/* ---------- SÉCURITÉ D'AFFICHAGE ---------- */

/**
 * Échappe les caractères HTML sensibles d'une chaîne avant injection dans innerHTML,
 * pour éviter qu'un nom, une description ou un lieu ne casse l'affichage (ou pire).
 */
function echapperHtml(valeur) {
    if (valeur === null || valeur === undefined) return '';
    return String(valeur)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/* ---------- NOTIFICATIONS "TOAST" ---------- */

/**
 * Affiche une notification temporaire non bloquante en bas à droite de l'écran.
 * @param {string} message
 * @param {'succes'|'erreur'|'info'} type
 */
function toast(message, type = 'succes') {
    let conteneur = document.getElementById('toast-conteneur');
    if (!conteneur) {
        conteneur = document.createElement('div');
        conteneur.id = 'toast-conteneur';
        conteneur.setAttribute('aria-live', 'polite');
        document.body.appendChild(conteneur);
    }

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icone">${type === 'succes' ? '✓' : type === 'erreur' ? '!' : 'i'}</span><span>${echapperHtml(message)}</span>`;
    conteneur.appendChild(el);

    requestAnimationFrame(() => el.classList.add('toast-visible'));

    setTimeout(() => {
        el.classList.remove('toast-visible');
        setTimeout(() => el.remove(), 300);
    }, 4000);
}

/* ---------- CONFIRMATION PERSONNALISÉE ---------- */

/**
 * Remplace confirm() par une modale cohérente avec le design.
 * Utilisation : const ok = await confirmerAction("Supprimer ce membre ?");
 * @returns {Promise<boolean>}
 */
function confirmerAction(message, libelleValider = 'Confirmer') {
    return new Promise((resoudre) => {
        const overlay = document.getElementById('confirm-overlay');
        const texte = document.getElementById('confirm-texte');
        const btnOui = document.getElementById('confirm-btn-oui');
        const btnNon = document.getElementById('confirm-btn-non');
        if (!overlay || !texte || !btnOui || !btnNon) {
            // Repli de sécurité si la modale n'est pas présente dans le DOM
            resoudre(window.confirm(message));
            return;
        }

        texte.textContent = message;
        btnOui.textContent = libelleValider;
        overlay.classList.add('modal-visible');

        const nettoyer = (reponse) => {
            overlay.classList.remove('modal-visible');
            btnOui.removeEventListener('click', surOui);
            btnNon.removeEventListener('click', surNon);
            resoudre(reponse);
        };
        const surOui = () => nettoyer(true);
        const surNon = () => nettoyer(false);

        btnOui.addEventListener('click', surOui);
        btnNon.addEventListener('click', surNon);
    });
}

/* ---------- MODALES GÉNÉRIQUES ---------- */

function ouvrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('modal-visible');
}

function fermerModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('modal-visible');
}

// Ferme toute modale ouverte au clic sur l'overlay ou sur un bouton [data-fermer-modal]
document.addEventListener('click', (e) => {
    if (e.target.classList && e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('modal-visible');
    }
    const btnFermeture = e.target.closest && e.target.closest('[data-fermer-modal]');
    if (btnFermeture) {
        const cible = btnFermeture.closest('.modal-overlay');
        if (cible) cible.classList.remove('modal-visible');
    }
});
