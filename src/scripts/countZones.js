const fs = require('fs');

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync('./src/public/docs/cholera.json', 'utf8'));

// Vérifier si les données sont un tableau
if (!Array.isArray(data)) {
    console.error('Le fichier ne contient pas un tableau de données');
    process.exit(1);
}

// Extraire toutes les zones de santé uniques
const zonesDeSante = new Set();

// Parcourir chaque enregistrement
for (const record of data) {
    if (record.ZoneDeSante) {
        zonesDeSante.add(record.ZoneDeSante.trim());
    }
}

// Afficher le résultat
console.log(`Nombre total de zones de santé uniques: ${zonesDeSante.size}`);

// Afficher la liste complète des zones de santé
console.log('\nListe des zones de santé:');
console.log(Array.from(zonesDeSante).sort().join('\n'));
