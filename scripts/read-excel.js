const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Chemin du fichier Excel
const filePath = process.argv[2] || 'C:\\Users\\patri\\ActifIT Dropbox\\Patrick Eymard\\Crypted\\Somone\\20260206 SOMONE ENGIE AINAC IASCALE.xlsx';

// Dossier de sortie pour les images
const outputDir = path.join(__dirname, '..', 'public', 'images', 'levels');

try {
  // Créer le dossier de sortie s'il n'existe pas
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log('Dossier créé:', outputDir);
  }

  // Lire le fichier Excel avec les images
  const workbook = XLSX.readFile(filePath, { cellStyles: true, bookImages: true });
  
  console.log('=== Fichier Excel ===');
  console.log('Feuilles:', workbook.SheetNames);
  
  // Vérifier s'il y a des images dans le workbook
  if (workbook.Sheets) {
    console.log('\n=== Recherche des images ===');
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      
      // Chercher les images dans la feuille
      if (sheet['!images']) {
        console.log(`Images trouvées dans ${sheetName}:`, sheet['!images'].length);
        sheet['!images'].forEach((img, idx) => {
          console.log(`  Image ${idx}:`, img);
        });
      }
      
      // Chercher les drawings
      if (sheet['!drawings']) {
        console.log(`Drawings trouvés dans ${sheetName}:`, sheet['!drawings']);
      }
    });
  }
  
  // Vérifier les médias dans le workbook
  if (workbook.Media) {
    console.log('\n=== Médias dans le workbook ===');
    console.log('Nombre de médias:', workbook.Media.length);
    workbook.Media.forEach((media, idx) => {
      console.log(`  Media ${idx}:`, {
        name: media.name,
        type: media.type,
        size: media.data ? media.data.length : 0
      });
    });
  }
  
  // Autre méthode : lire le fichier comme un zip et extraire les images
  console.log('\n=== Extraction directe des images ===');
  
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();
  
  let imageCount = 0;
  zipEntries.forEach(entry => {
    if (entry.entryName.startsWith('xl/media/')) {
      imageCount++;
      const imageName = path.basename(entry.entryName);
      const outputPath = path.join(outputDir, imageName);
      
      // Extraire l'image
      zip.extractEntryTo(entry, outputDir, false, true);
      console.log(`  Extrait: ${imageName}`);
    }
  });
  
  if (imageCount === 0) {
    console.log('  Aucune image trouvée dans xl/media/');
    
    // Lister toutes les entrées pour debug
    console.log('\n=== Contenu du fichier Excel (ZIP) ===');
    zipEntries.forEach(entry => {
      if (!entry.entryName.includes('xml')) {
        console.log(' ', entry.entryName);
      }
    });
  } else {
    console.log(`\n${imageCount} image(s) extraite(s) dans ${outputDir}`);
  }
  
  // Afficher aussi les données pour référence
  console.log('\n=== Données de la feuille IASCALE ===');
  const sheet = workbook.Sheets['IASCALE'];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  data.slice(0, 5).forEach((row, index) => {
    console.log(`Ligne ${index + 1}:`, JSON.stringify(row));
  });
  
} catch (error) {
  console.error('Erreur:', error.message);
  console.error(error.stack);
}
