/**
 * ============================================================
 *  CONFETTI.JS — Animation festive "100% de l'objectif atteint"
 * ============================================================
 *  Déclenchée une seule fois par membre et par session, dans son
 *  espace personnel (cf. membre-espace.js), en écho au chapelet
 *  de progression : grains d'or, vert et blanc, et une lueur douce.
 */

function lancerConfetti(conteneurId) {
    const conteneur = document.getElementById(conteneurId);
    if (!conteneur) return;

    const reduireMouvement = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduireMouvement) return;

    const couleurs = ['#d4af37', '#1b4d3e', '#ffffff', '#3f7d63', '#b8934a'];
    const nombreParticules = 60;

    const lueur = document.createElement('div');
    lueur.className = 'confetti-lueur';
    conteneur.appendChild(lueur);

    for (let i = 0; i < nombreParticules; i++) {
        const particule = document.createElement('span');
        particule.className = 'confetti-particule';
        particule.style.left = Math.random() * 100 + '%';
        particule.style.backgroundColor = couleurs[Math.floor(Math.random() * couleurs.length)];
        particule.style.animationDelay = (Math.random() * 0.4) + 's';
        particule.style.animationDuration = (2.2 + Math.random() * 1.2) + 's';
        particule.style.setProperty('--rotation-fin', (Math.random() * 720 - 360) + 'deg');
        particule.style.setProperty('--derive', (Math.random() * 160 - 80) + 'px');
        conteneur.appendChild(particule);
    }

    setTimeout(() => {
        conteneur.querySelectorAll('.confetti-particule, .confetti-lueur').forEach(el => el.remove());
    }, 4200);
}
