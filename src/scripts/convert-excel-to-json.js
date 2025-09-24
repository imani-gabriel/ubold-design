const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Chemin du fichier Excel et du fichier de sortie JSON
const excelFile = path.join(__dirname, 'store', 'docs', 'cholera-db.xlsx');
const outputFile = path.join(__dirname, 'store', 'docs', 'cholera-db.json');

// Lire le fichier Excel
const workbook = XLSX.readFile(excelFile);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convertir la feuille en JSON
const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

// Écrire le JSON dans un fichier
fs.writeFileSync(outputFile, JSON.stringify(jsonData, null, 2), 'utf8');

console.log(`Conversion terminée. Le fichier JSON a été créé à ${outputFile}`);
