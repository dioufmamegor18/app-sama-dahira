/**
 * ============================================================
 *  CHARTS.JS — Graphiques dynamiques dessinés en Canvas natif
 * ============================================================
 *  Aucune bibliothèque externe : conforme au socle technique du
 *  cahier des charges (HTML5 / CSS3 / JavaScript / LocalStorage
 *  uniquement) et garantit un fonctionnement 100% hors-ligne.
 */

const PALETTE_GRAPHIQUES = ['#1b4d3e', '#d4af37', '#3f7d63', '#8c6a2f', '#5b7a8c', '#a3382b', '#7a8471', '#b8934a'];

function arrondirRectangle(ctx, x, y, largeur, hauteur, rayon) {
    if (hauteur <= 0 || largeur <= 0) return;
    const r = Math.min(rayon, largeur / 2, hauteur);
    ctx.beginPath();
    ctx.moveTo(x, y + hauteur);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.lineTo(x + largeur - r, y);
    ctx.arcTo(x + largeur, y, x + largeur, y + r, r);
    ctx.lineTo(x + largeur, y + hauteur);
    ctx.closePath();
    ctx.fill();
}

/**
 * Graphique en barres groupées : évolution mensuelle recettes vs dépenses.
 */
function dessinerGraphiqueBarresGroupees(canvasId, labels, serieRecettes, serieDepenses) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const largeur = canvas.clientWidth || 600;
    const hauteur = canvas.clientHeight || 260;
    canvas.width = largeur * ratio;
    canvas.height = hauteur * ratio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, largeur, hauteur);

    const marge = { haut: 16, droite: 12, bas: 30, gauche: 54 };
    const largeurZone = largeur - marge.gauche - marge.droite;
    const hauteurZone = hauteur - marge.haut - marge.bas;

    const maxValeur = Math.max(1, ...serieRecettes, ...serieDepenses);
    const nbLignes = 4;
    const echelleMax = Math.ceil((maxValeur * 1.1) / nbLignes) * nbLignes || nbLignes;

    ctx.strokeStyle = 'rgba(27, 77, 62, 0.12)';
    ctx.fillStyle = '#6b7269';
    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.lineWidth = 1;
    for (let i = 0; i <= nbLignes; i++) {
        const y = marge.haut + hauteurZone - (hauteurZone / nbLignes) * i;
        ctx.beginPath();
        ctx.moveTo(marge.gauche, y);
        ctx.lineTo(largeur - marge.droite, y);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(formaterMontantCourt((echelleMax / nbLignes) * i), marge.gauche - 8, y + 3);
    }

    if (!labels.length) { ctx.textAlign = 'left'; return; }

    const largeurGroupe = largeurZone / labels.length;
    const largeurBarre = Math.min(18, largeurGroupe / 3.6);

    labels.forEach((label, i) => {
        const xGroupe = marge.gauche + i * largeurGroupe;
        const hRecette = (serieRecettes[i] / echelleMax) * hauteurZone;
        const hDepense = (serieDepenses[i] / echelleMax) * hauteurZone;
        const yBase = marge.haut + hauteurZone;

        ctx.fillStyle = '#1b4d3e';
        arrondirRectangle(ctx, xGroupe + largeurGroupe / 2 - largeurBarre - 2, yBase - hRecette, largeurBarre, hRecette, 3);
        ctx.fillStyle = '#a3382b';
        arrondirRectangle(ctx, xGroupe + largeurGroupe / 2 + 2, yBase - hDepense, largeurBarre, hDepense, 3);

        ctx.fillStyle = '#4b5248';
        ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, xGroupe + largeurGroupe / 2, hauteur - 10);
    });
    ctx.textAlign = 'left';
}

/**
 * Graphique en anneau (donut) : répartition du solde global par caisse.
 * Dessine aussi une légende HTML accessible (couleur + libellé + montant exact).
 */
function dessinerGraphiqueDonut(canvasId, legendeId, items) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const ratio = window.devicePixelRatio || 1;
    const taille = Math.min(canvas.clientWidth || 200, canvas.clientHeight || 200) || 200;
    canvas.width = taille * ratio;
    canvas.height = taille * ratio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.clearRect(0, 0, taille, taille);

    const total = items.reduce((s, it) => s + Math.max(0, it.valeur), 0);
    const totalReel = items.reduce((s, it) => s + it.valeur, 0);
    const centre = taille / 2;
    const rayonExt = centre - 4;
    const rayonInt = rayonExt * 0.6;

    if (total <= 0) {
        ctx.strokeStyle = '#e3e0d6';
        ctx.lineWidth = rayonExt - rayonInt;
        ctx.beginPath();
        ctx.arc(centre, centre, (rayonExt + rayonInt) / 2, 0, Math.PI * 2);
        ctx.stroke();
    } else {
        let angle = -Math.PI / 2;
        items.forEach((item, i) => {
            const part = Math.max(0, item.valeur) / total;
            const angleFin = angle + part * Math.PI * 2;
            ctx.fillStyle = item.couleur || PALETTE_GRAPHIQUES[i % PALETTE_GRAPHIQUES.length];
            ctx.beginPath();
            ctx.moveTo(centre, centre);
            ctx.arc(centre, centre, rayonExt, angle, angleFin);
            ctx.closePath();
            ctx.fill();
            angle = angleFin;
        });
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(centre, centre, rayonInt, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }

    ctx.fillStyle = '#20261f';
    ctx.textAlign = 'center';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('Solde global', centre, centre - 3);
    ctx.font = '700 14px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = totalReel < 0 ? '#a3382b' : '#20261f';
    ctx.fillText(formaterMontantCourt(totalReel) + ' F', centre, centre + 15);
    ctx.textAlign = 'left';

    const legende = document.getElementById(legendeId);
    if (legende) {
        legende.innerHTML = items.map((item, i) => `
            <div class="legende-item">
                <span class="legende-puce" style="background:${item.couleur || PALETTE_GRAPHIQUES[i % PALETTE_GRAPHIQUES.length]}"></span>
                <span class="legende-label">${echapperHtml(item.label)}</span>
                <span class="legende-valeur${item.valeur < 0 ? ' texte-alerte' : ''}">${formaterMontant(item.valeur)}</span>
            </div>
        `).join('');
    }
}
