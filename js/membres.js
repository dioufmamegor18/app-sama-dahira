/**
 * Gestion des membres pour SAMA DAHIRA.
 */

// Charger la liste des membres au chargement de la section
document.addEventListener('DOMContentLoaded', () => {
    afficherMembres();
});

/**
 * Génère automatiquement le matricule (ex: DT00001)
 * @returns {string} Le matricule généré
 */
function genererMatricule() {
    const membres = getData('membres') || [];
    const nombreActuel = membres.length + 1;
    // Format : DT + 5 chiffres complétés par des zéros à gauche
    const numeroFormate = String(nombreActuel).padStart(5, '0');
    return `DT${numeroFormate}`;
}

/**
 * Récupère et affiche tous les membres dans le tableau HTML.
 */
function afficherMembres(membresAffiche = null) {
    const tbody = document.getElementById('liste-membres-tbody');
    if (!tbody) return;

    const membres = membresAffiche || getData('membres') || [];
    
    tbody.innerHTML = '';

    if (membres.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Aucun membre trouvé.</td></tr>`;
        return;
    }

    membres.forEach(membre => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${membre.matricule}</strong></td>
            <td>${membre.nom} ${membre.prenom}</td>
            <td>${membre.sexe}</td>
            <td>${membre.telephone}</td>
            <td>${membre.dateAdhesion}</td>
            <td><span class="badge ${membre.statut === 'actif' ? 'badge-success' : 'badge-warning'}">${membre.statut}</span></td>
            <td>
                <button class="btn-sm btn-info" onclick="voirFicheMembre(${membre.id})">Fiche</button>
                <button class="btn-sm btn-danger" onclick="supprimerMembre(${membre.id})">Supprimer</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Ajoute un nouveau membre directement par le responsable.
 * @param {object} nouveauMembreData - Données du formulaire d'ajout
 */
function ajouterMembreDirect(nom, prenom, sexe, telephone) {
    const membres = getData('membres') || [];
    
    const nouveauMembre = {
        id: Date.now(), // ID unique basé sur le timestamp
        matricule: genererMatricule(),
        nom: nom,
        prenom: prenom,
        sexe: sexe,
        telephone: telephone,
        dateAdhesion: new Date().toISOString().split('T')[0], // Date du jour YYYY-MM-DD
        statut: 'actif'
    };

    membres.push(nouveauMembre);
    saveData('membres', membres);
    afficherMembres();
    alert(`Membre ajouté avec succès ! Matricule généré : ${nouveauMembre.matricule}`);
}

/**
 * Filtre les membres selon la barre de recherche (nom, prénom ou matricule).
 */
function filtrerMembres() {
    const query = document.getElementById('search-membre').value.toLowerCase();
    const membres = getData('membres') || [];

    const resultats = membres.filter(membre => 
        membre.nom.toLowerCase().includes(query) ||
        membre.prenom.toLowerCase().includes(query) ||
        membre.matricule.toLowerCase().includes(query)
    );

    afficherMembres(resultats);
}

/**
 * Supprime un membre (pour la gestion).
 */
function supprimerMembre(id) {
    if (confirm("Voulez-vous vraiment supprimer ce membre ?")) {
        let membres = getData('membres') || [];
        membres = membres.filter(m => m.id !== id);
        saveData('membres', membres);
        afficherMembres();
    }
}