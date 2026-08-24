/**
 * Gestion des cotisations pour SAMA DAHIRA.
 */

document.addEventListener('DOMContentLoaded', () => {
	afficherCotisations();
});

/**
 * Ouvre le formulaire d'enregistrement et charge les listes déroulantes.
 */
function ouvrirModalCotisation() {
	const modal = document.getElementById('modal-cotisation');
	if (modal) modal.style.display = 'block';

	const selectMembre = document.getElementById('cotisation-membre');
	const membres = getData('membres') || [];
	selectMembre.innerHTML = '<option value="">-- Sélectionner un membre --</option>';
	membres.forEach(membre => {
		selectMembre.innerHTML += `<option value="${membre.matricule}">${membre.matricule} - ${membre.nom} ${membre.prenom}</option>`;
	});

	const selectCaisse = document.getElementById('cotisation-caisse');
	const caisses = getData('caisses') || [];
	selectCaisse.innerHTML = '<option value="">-- Sélectionner une caisse --</option>';
	caisses.forEach(caisse => {
		selectCaisse.innerHTML += `<option value="${caisse.nom}">${caisse.nom}</option>`;
	});
}

/**
 * Vérifie si une cotisation peut encore être modifiée (moins d'une heure).
 * @param {object} cotisation - L'objet cotisation
 * @returns {boolean} True si modifiable, false sinon
 */
function estCotisationModifiable(cotisation) {
	const heureCreation = cotisation.id;
	const maintenant = Date.now();
	const uneHeureEnMs = 60 * 60 * 1000;
	const difference = maintenant - heureCreation;

	return difference >= 0 && difference <= uneHeureEnMs;
}

/**
 * Modifie une cotisation existante si le délai d'une heure n'est pas dépassé.
 * @param {number} idCotisation - L'ID de la cotisation
 * @param {number} nouveauMontant - Le nouveau montant saisi
 */
function modifierCotisation(idCotisation, nouveauMontant) {
	let cotisations = getData('cotisations') || [];
	const index = cotisations.findIndex(cotisation => cotisation.id === idCotisation);

	if (index === -1) {
		alert('Cotisation introuvable.');
		return;
	}

	const cotisation = cotisations[index];

	if (!estCotisationModifiable(cotisation)) {
		alert("MODIFICATION VERROUILLÉE : Le délai d'une heure après l'enregistrement est dépassé.");
		return;
	}

	const currentUser = sessionStorage.getItem('currentUser')
		? JSON.parse(sessionStorage.getItem('currentUser'))
		: { nomComplet: 'Administrateur' };
	const now = new Date();

	if (!cotisation.historiqueModifications) {
		cotisation.historiqueModifications = [];
	}

	cotisation.historiqueModifications.push({
		ancienMontant: cotisation.montant,
		nouveauMontant: Number(nouveauMontant),
		modifiePar: currentUser.nomComplet,
		dateModification: now.toISOString().split('T')[0],
		heureModification: now.toTimeString().split(' ')[0].substring(0, 5)
	});

	cotisation.montant = Number(nouveauMontant);
	cotisations[index] = cotisation;
	saveData('cotisations', cotisations);

	afficherCotisations();
	alert('Cotisation modifiée avec succès. La modification a été tracée.');
}

/**
 * Initialise les listes déroulantes du module de saisie rapide.
 */
function initSaisieRapideSelects() {
	const selectMembre = document.getElementById('rapide-membre');
	const selectCaisse = document.getElementById('rapide-caisse');

	if (!selectMembre || !selectCaisse) return;

	const membres = getData('membres') || [];
	selectMembre.innerHTML = '<option value="">-- Choisir membre --</option>';
	membres.forEach(membre => {
		selectMembre.innerHTML += `<option value="${membre.matricule}">${membre.matricule} - ${membre.nom} ${membre.prenom}</option>`;
	});

	const caisses = getData('caisses') || [];
	selectCaisse.innerHTML = '<option value="">-- Choisir caisse --</option>';
	caisses.forEach(caisse => {
		selectCaisse.innerHTML += `<option value="${caisse.nom}">${caisse.nom}</option>`;
	});
}

/**
 * Enregistre une cotisation depuis le formulaire de saisie rapide.
 */
function enregistrerSaisieRapide(e) {
	e.preventDefault();

	const matriculeMembre = document.getElementById('rapide-membre').value;
	const nomCaisse = document.getElementById('rapide-caisse').value;
	const montant = Number(document.getElementById('rapide-montant').value);
	const sessionActive = typeof getActiveSession === 'function' ? getActiveSession() : null;

	if (!sessionActive) {
		alert('Erreur : Aucune session active trouvée.');
		return;
	}

	const currentUser = sessionStorage.getItem('currentUser')
		? JSON.parse(sessionStorage.getItem('currentUser'))
		: { nomComplet: 'Administrateur' };
	const now = new Date();
	const nouvelleCotisation = {
		id: Date.now(),
		matriculeMembre,
		caisse: nomCaisse,
		montant,
		date: now.toISOString().split('T')[0],
		heure: now.toTimeString().split(' ')[0].substring(0, 5),
		session: sessionActive.nom,
		responsable: currentUser.nomComplet
	};

	const cotisations = getData('cotisations') || [];
	cotisations.push(nouvelleCotisation);
	saveData('cotisations', cotisations);

	document.getElementById('rapide-montant').value = '';
	afficherCotisations();
	console.log(`Saisie rapide réussie pour ${matriculeMembre}`);
}

document.addEventListener('DOMContentLoaded', () => {
	initSaisieRapideSelects();
});

function fermerModalCotisation() {
	const modal = document.getElementById('modal-cotisation');
	if (modal) modal.style.display = 'none';
}

/**
 * Enregistre une cotisation avec sa session et son responsable.
 */
function enregistrerCotisation(e) {
	e.preventDefault();

	const matriculeMembre = document.getElementById('cotisation-membre').value;
	const nomCaisse = document.getElementById('cotisation-caisse').value;
	const montant = Number(document.getElementById('cotisation-montant').value);
	const sessionActive = typeof getActiveSession === 'function' ? getActiveSession() : null;

	if (!sessionActive) {
		alert("Erreur : Aucune session active trouvée. Veuillez activer une session d'abord.");
		return;
	}

	const currentUser = sessionStorage.getItem('currentUser')
		? JSON.parse(sessionStorage.getItem('currentUser'))
		: { nomComplet: 'Administrateur' };
	const now = new Date();
	const nouvelleCotisation = {
		id: Date.now(),
		matriculeMembre,
		caisse: nomCaisse,
		montant,
		date: now.toISOString().split('T')[0],
		heure: now.toTimeString().split(' ')[0].substring(0, 5),
		session: sessionActive.nom,
		responsable: currentUser.nomComplet
	};

	const cotisations = getData('cotisations') || [];
	cotisations.push(nouvelleCotisation);
	saveData('cotisations', cotisations);

	document.getElementById('form-cotisation').reset();
	fermerModalCotisation();
	afficherCotisations();

	alert(`Cotisation de ${montant.toLocaleString()} FCFA enregistrée avec succès pour ${matriculeMembre} !`);
}

/**
 * Affiche l'historique des cotisations dans le tableau.
 */
function afficherCotisations() {
	const tbody = document.getElementById('liste-cotisations-tbody');
	if (!tbody) return;

	const cotisations = getData('cotisations') || [];
	const membres = getData('membres') || [];
	tbody.innerHTML = '';

	if (cotisations.length === 0) {
		tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Aucune cotisation enregistrée pour le moment.</td></tr>`;
		return;
	}

	[...cotisations].reverse().forEach(cotisation => {
		const membre = membres.find(item => item.matricule === cotisation.matriculeMembre);
		const nomMembreComplet = membre ? `${membre.nom} ${membre.prenom}` : 'Membre inconnu';
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${cotisation.date} à ${cotisation.heure}</td>
			<td><strong>${cotisation.matriculeMembre}</strong> - ${nomMembreComplet}</td>
			<td>${cotisation.caisse}</td>
			<td><strong style="color: #1b4d3e;">${Number(cotisation.montant).toLocaleString()} FCFA</strong></td>
			<td>${cotisation.session}</td>
			<td><small>${cotisation.responsable}</small></td>
		`;
		tbody.appendChild(tr);
	});
}
