const XLSX = require('xlsx');
const path = require('path');

// Chemin du fichier Excel
const filePath = process.argv[2] || 'C:\\Users\\patri\\ActifIT Dropbox\\Patrick Eymard\\Crypted\\Somone\\20260206 SOMONE ENGIE AINAC IASCALE.xlsx';

try {
  // Lire le fichier Excel
  const workbook = XLSX.readFile(filePath);
  
  console.log('=== Fichier Excel ===');
  console.log('Feuilles:', workbook.SheetNames);
  console.log('');
  
  // Parcourir chaque feuille
  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n=== Feuille: ${sheetName} ===\n`);
    
    const sheet = workbook.Sheets[sheetName];
    
    // Convertir en JSON
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Afficher les données
    data.forEach((row, index) => {
      if (row.length > 0) {
        console.log(`Ligne ${index + 1}:`, JSON.stringify(row));
      }
    });
  });
  
} catch (error) {
  console.error('Erreur:', error.message);
}
