/**
 * ============================================================
 *  STORAGE.JS — Couche d'accès aux données (simulation LocalStorage)
 * ============================================================
 *  Conformément au cahier des charges (section 7), 8 collections
 *  sont simulées sous LocalStorage :
 *    members[] | sessions[] | caisses[] | cotisations[] | depenses[]
 *    ziaras[]  | evenements[] | users[]
 *
 *  Les "demandes d'adhésion" ne forment pas une 9e collection :
 *  elles vivent dans members[] via le champ statut ('en_attente' /
 *  'actif' / 'refuse' / 'inactif'), exactement comme le cahier des
 *  charges le suggère ("Inscription publique... ou ajout direct par
 *  le responsable" dans le même paragraphe que l'attribut Statut).
 */

const CLES_STOCKAGE = {
    MEMBRES: 'membres',
    SESSIONS: 'sessions',
    CAISSES: 'caisses',
    COTISATIONS: 'cotisations',
    DEPENSES: 'depenses',
    ZIARAS: 'ziaras',
    EVENEMENTS: 'evenements',
    USERS: 'users'
};

/* ---------- ACCÈS BAS NIVEAU ---------- */

function getData(cle) {
    const data = localStorage.getItem(cle);
    return data ? JSON.parse(data) : null;
}

function saveData(cle, valeur) {
    localStorage.setItem(cle, JSON.stringify(valeur));
}

/* ---------- INITIALISATION & DONNÉES DE DÉMONSTRATION ---------- */

/**
 * Initialise l'ensemble des collections si elles n'existent pas encore.
 * Idempotent : n'écrase jamais des données déjà présentes.
 */
function initialiserApplication() {
    if (!getData(CLES_STOCKAGE.SESSIONS)) {
        saveData(CLES_STOCKAGE.SESSIONS, [
            { id: 1, nom: 'Session 2026', dateOuverture: '2026-01-01', dateFermeture: '2026-12-31', active: true, objectifHomme: 120000, objectifFemme: 60000 }
        ]);
    }

    if (!getData(CLES_STOCKAGE.CAISSES)) {
        saveData(CLES_STOCKAGE.CAISSES, [
            { id: 1, nom: 'Caisse Principale', description: 'Caisse centrale du Dahira', statut: 'active', compteDansObjectif: true },
            { id: 2, nom: 'Caisse Sociale', description: 'Solidarité et aide aux membres — cotisations libres, sans objectif', statut: 'active', compteDansObjectif: false },
            { id: 3, nom: 'Caisse Thiantes', description: 'Organisation des séances de Thiantes', statut: 'active', compteDansObjectif: true },
            { id: 4, nom: 'Caisse 18 Safar', description: 'Préparation du Magal et des grands événements', statut: 'active', compteDansObjectif: true }
        ]);
    }

    if (!getData(CLES_STOCKAGE.MEMBRES)) {
        saveData(CLES_STOCKAGE.MEMBRES, [
            { id: 1, matricule: 'DT00001', nom: 'Diop', prenom: 'Awa', sexe: 'F', telephone: '771234567', dateAdhesion: '2026-01-10', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 2, matricule: 'DT00002', nom: 'Sow', prenom: 'Fatou', sexe: 'F', telephone: '772345678', dateAdhesion: '2026-01-12', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 3, matricule: 'DT00003', nom: 'Ndiaye', prenom: 'Moustapha', sexe: 'M', telephone: '773456789', dateAdhesion: '2026-01-15', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 4, matricule: 'DT00004', nom: 'Ba', prenom: 'Ousmane', sexe: 'M', telephone: '774567890', dateAdhesion: '2026-01-20', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 5, matricule: 'DT00005', nom: 'Ndoye', prenom: 'Mame Diarra', sexe: 'F', telephone: '775678901', dateAdhesion: '2026-02-02', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 6, matricule: 'DT00006', nom: 'Fall', prenom: 'Ibrahima', sexe: 'M', telephone: '776789012', dateAdhesion: '2026-02-05', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 7, matricule: 'DT00007', nom: 'Diallo', prenom: 'Mouhamadou', sexe: 'M', telephone: '777890123', dateAdhesion: '2026-02-20', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 8, matricule: 'DT00008', nom: 'Gueye', prenom: 'Ndeye', sexe: 'F', telephone: '778901234', dateAdhesion: '2026-03-04', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 9, matricule: 'DT00009', nom: 'Sarr', prenom: 'Abdoulaye', sexe: 'M', telephone: '779012345', dateAdhesion: '2026-03-11', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 10, matricule: 'DT00010', nom: 'Ndao', prenom: 'Aissatou', sexe: 'F', telephone: '770123456', dateAdhesion: '2026-03-17', statut: 'actif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 11, matricule: null, nom: 'Mbaye', prenom: 'Pape', sexe: 'M', telephone: '771111222', dateAdhesion: dateDuJourIso(), statut: 'en_attente', motDePasse: 'demo1234', celebrationsSessions: [] },
            { id: 12, matricule: null, nom: 'Cisse', prenom: 'Mariama', sexe: 'F', telephone: '772222333', dateAdhesion: '2026-02-28', statut: 'en_attente', motDePasse: 'demo5678', celebrationsSessions: [] },
            { id: 13, matricule: 'DT00013', nom: 'Thiam', prenom: 'Yacine', sexe: 'M', telephone: '773333444', dateAdhesion: '2026-01-02', statut: 'inactif', motDePasse: '123456', celebrationsSessions: [] },
            { id: 14, matricule: 'DT00014', nom: 'Faye', prenom: 'Khady', sexe: 'F', telephone: '774444555', dateAdhesion: '2026-02-10', statut: 'refuse', motDePasse: '123456', celebrationsSessions: [] }
        ]);
    }

    if (!getData(CLES_STOCKAGE.COTISATIONS)) {
        const h = (date) => new Date(date + 'T09:00:00').getTime();
        saveData(CLES_STOCKAGE.COTISATIONS, [
            { id: 1, matriculeMembre: 'DT00001', caisseId: 1, montant: 15000, sessionId: 1, date: '2026-01-10', heure: '09:00', creeLe: h('2026-01-10'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 2, matriculeMembre: 'DT00001', caisseId: 1, montant: 15000, sessionId: 1, date: '2026-03-05', heure: '09:00', creeLe: h('2026-03-05'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 3, matriculeMembre: 'DT00001', caisseId: 1, montant: 15000, sessionId: 1, date: '2026-05-12', heure: '09:00', creeLe: h('2026-05-12'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 4, matriculeMembre: 'DT00001', caisseId: 1, montant: 20000, sessionId: 1, date: '2026-07-20', heure: '09:00', creeLe: h('2026-07-20'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 5, matriculeMembre: 'DT00002', caisseId: 1, montant: 10000, sessionId: 1, date: '2026-02-14', heure: '10:00', creeLe: h('2026-02-14'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 6, matriculeMembre: 'DT00002', caisseId: 1, montant: 15000, sessionId: 1, date: '2026-04-18', heure: '10:00', creeLe: h('2026-04-18'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 7, matriculeMembre: 'DT00002', caisseId: 2, montant: 5000, sessionId: 1, date: '2026-05-22', heure: '10:00', creeLe: h('2026-05-22'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 8, matriculeMembre: 'DT00002', caisseId: 1, montant: 10000, sessionId: 1, date: '2026-06-30', heure: '10:00', creeLe: h('2026-06-30'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 9, matriculeMembre: 'DT00003', caisseId: 1, montant: 30000, sessionId: 1, date: '2026-01-25', heure: '11:00', creeLe: h('2026-01-25'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 10, matriculeMembre: 'DT00003', caisseId: 1, montant: 30000, sessionId: 1, date: '2026-03-25', heure: '11:00', creeLe: h('2026-03-25'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 11, matriculeMembre: 'DT00003', caisseId: 3, montant: 30000, sessionId: 1, date: '2026-05-25', heure: '11:00', creeLe: h('2026-05-25'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 12, matriculeMembre: 'DT00004', caisseId: 1, montant: 40000, sessionId: 1, date: '2026-02-10', heure: '12:00', creeLe: h('2026-02-10'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 13, matriculeMembre: 'DT00004', caisseId: 1, montant: 40000, sessionId: 1, date: '2026-06-14', heure: '12:00', creeLe: h('2026-06-14'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 14, matriculeMembre: 'DT00005', caisseId: 1, montant: 20000, sessionId: 1, date: '2026-03-08', heure: '14:00', creeLe: h('2026-03-08'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 15, matriculeMembre: 'DT00006', caisseId: 4, montant: 50000, sessionId: 1, date: '2026-08-15', heure: '09:00', creeLe: h('2026-08-15'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 16, matriculeMembre: 'DT00007', caisseId: 1, montant: 25000, sessionId: 1, date: '2026-08-18', heure: '09:00', creeLe: h('2026-08-18'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 17, matriculeMembre: 'DT00008', caisseId: 3, montant: 18000, sessionId: 1, date: '2026-08-19', heure: '08:30', creeLe: h('2026-08-19'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 18, matriculeMembre: 'DT00009', caisseId: 1, montant: 22000, sessionId: 1, date: '2026-08-22', heure: '11:15', creeLe: h('2026-08-22'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 19, matriculeMembre: 'DT00010', caisseId: 2, montant: 15000, sessionId: 1, date: '2026-08-24', heure: '10:45', creeLe: h('2026-08-24'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 20, matriculeMembre: 'DT00003', caisseId: 4, montant: 50000, sessionId: 1, date: '2026-08-05', heure: '09:00', creeLe: h('2026-08-05'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 21, matriculeMembre: 'DT00004', caisseId: 4, montant: 50000, sessionId: 1, date: '2026-08-10', heure: '09:00', creeLe: h('2026-08-10'), responsable: 'Responsable Principal', historiqueModifications: [] },
            { id: 22, matriculeMembre: 'DT00005', caisseId: 4, montant: 20000, sessionId: 1, date: '2026-08-12', heure: '09:00', creeLe: h('2026-08-12'), responsable: 'Responsable Principal', historiqueModifications: [] }
        ]);
    }

    if (!getData(CLES_STOCKAGE.DEPENSES)) {
        saveData(CLES_STOCKAGE.DEPENSES, [
            { id: 1, caisseId: 1, categorie: 'transport', montant: 15000, description: "Location d'un véhicule pour une sortie du bureau", evenementId: null, date: '2026-02-20', heure: '09:30', responsable: 'Responsable Principal' },
            { id: 2, caisseId: 1, categorie: 'restauration', montant: 25000, description: 'Collation lors de la réunion mensuelle', evenementId: null, date: '2026-04-15', heure: '13:00', responsable: 'Responsable Principal' },
            { id: 3, caisseId: 3, categorie: 'materiel', montant: 12000, description: 'Achat de nattes et haut-parleurs pour les Thiantes', evenementId: null, date: '2026-05-30', heure: '16:00', responsable: 'Responsable Principal' },
            { id: 4, caisseId: 2, categorie: 'don', montant: 10000, description: "Aide ponctuelle à un membre en difficulté", evenementId: null, date: '2026-06-05', heure: '10:00', responsable: 'Responsable Principal' },
            { id: 5, caisseId: 1, categorie: 'evenement', montant: 60000, description: 'Sonorisation et location de chaises', evenementId: 2, date: '2026-03-10', heure: '08:00', responsable: 'Responsable Principal' },
            { id: 6, caisseId: 1, categorie: 'restauration', montant: 55000, description: 'Repas offert aux invités de la conférence', evenementId: 2, date: '2026-03-11', heure: '18:00', responsable: 'Responsable Principal' },
            { id: 7, caisseId: 4, categorie: 'transport', montant: 80000, description: 'Bus affrétés pour les membres en route vers Touba', evenementId: 1, date: '2026-08-20', heure: '07:00', responsable: 'Responsable Principal' },
            { id: 8, caisseId: 4, categorie: 'restauration', montant: 50000, description: 'Vivres et repas pour le séjour du Magal', evenementId: 1, date: '2026-08-22', heure: '09:00', responsable: 'Responsable Principal' },
            { id: 9, caisseId: 4, categorie: 'ziara', montant: 130000, description: "Ziara à Touba auprès de Serigne Mbaye Diagne — déplacement 30 000 FCFA, hadiya 100 000 FCFA", evenementId: null, date: '2026-06-18', heure: '10:00', responsable: 'Responsable Principal' }
        ]);
    }

    if (!getData(CLES_STOCKAGE.ZIARAS)) {
        saveData(CLES_STOCKAGE.ZIARAS, [
            { id: 1, date: '2026-06-18', lieu: 'Touba', personne: 'Serigne Mbaye Diagne', fraisDeplacement: 30000, montantHadiya: 100000, totalSortie: 130000, caisseId: 4, responsable: 'Responsable Principal' }
        ]);
    }

    if (!getData(CLES_STOCKAGE.EVENEMENTS)) {
        saveData(CLES_STOCKAGE.EVENEMENTS, [
            { id: 1, titre: 'Magal de Touba 2026', type: 'Magal', date: '2026-08-30', lieu: 'Touba', description: 'Organisation du transport et du séjour des membres pour le Grand Magal.', budgetPrevu: 200000, statut: 'Planifié', responsable: 'Responsable Principal' },
            { id: 2, titre: 'Conférence annuelle du Dahira', type: 'Conférence', date: '2026-03-12', lieu: 'Siège du Dahira', description: "Conférence religieuse ouverte aux membres et invités du quartier.", budgetPrevu: 100000, statut: 'Terminé', responsable: 'Responsable Principal' },
            { id: 3, titre: 'Journée de Thiantes', type: 'Thiantes', date: '2026-09-12', lieu: 'Darou Salam', description: 'Cérémonie de prières et de partage avec les familles du Dahira.', budgetPrevu: 80000, statut: 'Planifié', responsable: 'Responsable Principal' },
            { id: 4, titre: 'Rassemblement de solidarité', type: 'Rencontre', date: '2026-10-04', lieu: 'Siège du Dahira', description: 'Accueil des nouveaux adhérents et recueil des besoins prioritaires.', budgetPrevu: 60000, statut: 'Planifié', responsable: 'Responsable Principal' }
        ]);
    }

    if (!getData(CLES_STOCKAGE.USERS)) {
        saveData(CLES_STOCKAGE.USERS, [
            { id: 1, role: 'RESPONSABLE', email: 'admin@samadahira.com', password: 'admin123', nomComplet: 'Responsable Principal' }
        ]);
    }
}

/**
 * Réinitialise complètement l'application aux données de démonstration.
 */
async function resetLocalStorage() {
    const ok = await confirmerAction(
        "Cette action efface toutes les données actuelles et restaure le jeu de démonstration. Voulez-vous continuer ?",
        'Réinitialiser'
    );
    if (!ok) return;
    localStorage.clear();
    sessionStorage.clear();
    initialiserApplication();
    toast('Application réinitialisée avec les données de démonstration.', 'succes');
    setTimeout(() => window.location.reload(), 900);
}
