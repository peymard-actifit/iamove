const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2] || 'c:\\Users\\patri\\ActifIT Dropbox\\Patrick Eymard\\Crypted\\Somone\\20260207 SOMONE ENGIE AINAC IASCALE.xlsx';

console.log('Lecture du fichier:', filePath);

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Extraire les en-têtes
const headers = data[0];
console.log('En-têtes:', headers);

// Trouver les indices des colonnes
const colIndices = {
  niveau: headers.indexOf('Niveau'),
  categorie: headers.indexOf('Catégorie'),
  nom: headers.indexOf('Nom'),
  seriousGaming: headers.indexOf('Serious Gaming'),
  description: headers.indexOf('Explication'),
  usage: headers.indexOf('Usage'),
  automatisation: headers.indexOf('Automatisation'),
  programmation: headers.indexOf('Programmation'),
  conception: headers.indexOf('Conception'),
  recherche: headers.indexOf('Recherche'),
};

console.log('Indices des colonnes:', colIndices);

// Extraire les niveaux
const levels = [];
for (let i = 1; i < data.length; i++) {
  const row = data[i];
  if (row[colIndices.niveau] !== undefined && row[colIndices.niveau] !== null) {
    levels.push({
      number: row[colIndices.niveau],
      category: row[colIndices.categorie] || '',
      name: row[colIndices.nom] || '',
      seriousGaming: row[colIndices.seriousGaming] || '',
      description: row[colIndices.description] || '',
      skills: {
        usage: row[colIndices.usage] || 0,
        automatisation: row[colIndices.automatisation] || 0,
        programmation: row[colIndices.programmation] || 0,
        conception: row[colIndices.conception] || 0,
        recherche: row[colIndices.recherche] || 0,
      }
    });
  }
}

console.log(`\n${levels.length} niveaux extraits:\n`);
levels.forEach(l => {
  console.log(`Niveau ${l.number} [${l.category}]: ${l.name} - ${l.seriousGaming}`);
  console.log(`  Description: ${l.description.substring(0, 80)}...`);
});

// Sauvegarder dans le fichier JSON
const outputPath = path.join(__dirname, '..', 'src', 'data', 'levels.json');
fs.writeFileSync(outputPath, JSON.stringify({ levels }, null, 2), 'utf8');
console.log(`\nDonnées sauvegardées dans: ${outputPath}`);
