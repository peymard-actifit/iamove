/**
 * Utilitaire de parsing PDF avec fallback automatique entre plusieurs méthodes
 * Essaie différentes librairies jusqu'à ce qu'une fonctionne
 */

type ParseMethod = {
  name: string;
  parse: (buffer: Buffer) => Promise<string>;
};

// Méthode 1: pdf-parse (le plus fiable sur Vercel)
async function parsePdfParse(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text;
}

// Méthode 2: pdfjs-dist legacy
async function parsePdfJsLegacy(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");
  
  const uint8Array = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: unknown) => {
        const textItem = item as { str?: string };
        return textItem.str || "";
      })
      .join(" ");
    fullText += pageText + "\n";
  }
  
  return fullText;
}

// Méthode 3: Extraction basique via regex sur le contenu brut
async function parseBasicExtraction(buffer: Buffer): Promise<string> {
  const content = buffer.toString("latin1");
  
  // Extraire les streams de texte du PDF
  const textMatches: string[] = [];
  
  // Pattern pour les blocs de texte PDF
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let match;
  
  while ((match = streamRegex.exec(content)) !== null) {
    const streamContent = match[1];
    // Chercher les opérateurs de texte Tj et TJ
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    
    let textMatch;
    while ((textMatch = tjRegex.exec(streamContent)) !== null) {
      textMatches.push(textMatch[1]);
    }
    while ((textMatch = tjArrayRegex.exec(streamContent)) !== null) {
      // Extraire les chaînes entre parenthèses dans le tableau
      const arrayContent = textMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(arrayContent)) !== null) {
        textMatches.push(strMatch[1]);
      }
    }
  }
  
  if (textMatches.length === 0) {
    throw new Error("Aucun texte trouvé avec l'extraction basique");
  }
  
  // Décoder les caractères échappés PDF
  const decodedText = textMatches
    .map(text => {
      return text
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\\\/g, "\\")
        .replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
    })
    .join(" ");
  
  return decodedText;
}

// Méthode 4: Extraction de texte brut (dernier recours)
async function parseRawText(buffer: Buffer): Promise<string> {
  // Convertir en string et extraire tout ce qui ressemble à du texte lisible
  const content = buffer.toString("utf8", 0, buffer.length);
  
  // Trouver les séquences de texte lisible (lettres, chiffres, ponctuation)
  const textPattern = /[A-Za-zÀ-ÿ0-9\s,.;:!?'"()-]{10,}/g;
  const matches = content.match(textPattern) || [];
  
  if (matches.length === 0) {
    throw new Error("Aucun texte lisible trouvé");
  }
  
  return matches.join(" ");
}

// Liste des méthodes à essayer dans l'ordre
const parseMethods: ParseMethod[] = [
  { name: "pdf-parse", parse: parsePdfParse },
  { name: "pdfjs-dist-legacy", parse: parsePdfJsLegacy },
  { name: "basic-extraction", parse: parseBasicExtraction },
  { name: "raw-text", parse: parseRawText },
];

export interface ParseResult {
  success: boolean;
  text: string;
  method: string;
  errors: string[];
  bufferSize: number;
}

/**
 * Parse un PDF en essayant plusieurs méthodes jusqu'à ce qu'une fonctionne
 */
export async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  const errors: string[] = [];
  const bufferSize = buffer.length;
  
  console.log(`[PDF Parser] Début du parsing, taille du buffer: ${bufferSize} bytes`);
  
  if (bufferSize === 0) {
    return {
      success: false,
      text: "",
      method: "none",
      errors: ["Le fichier PDF est vide (0 bytes)"],
      bufferSize: 0,
    };
  }
  
  // Vérifier que c'est bien un PDF
  const header = buffer.toString("utf8", 0, Math.min(10, bufferSize));
  if (!header.startsWith("%PDF")) {
    return {
      success: false,
      text: "",
      method: "none",
      errors: [`Le fichier ne semble pas être un PDF valide (header: ${header.substring(0, 10)})`],
      bufferSize,
    };
  }
  
  for (const method of parseMethods) {
    try {
      console.log(`[PDF Parser] Essai de la méthode: ${method.name}`);
      const text = await method.parse(buffer);
      
      // Vérifier que le texte n'est pas vide
      if (text && text.trim().length > 0) {
        console.log(`[PDF Parser] Succès avec: ${method.name} (${text.length} caractères)`);
        return {
          success: true,
          text: text,
          method: method.name,
          errors: errors,
          bufferSize,
        };
      } else {
        const error = `${method.name}: texte vide retourné`;
        console.log(`[PDF Parser] ${error}`);
        errors.push(error);
      }
    } catch (error) {
      const errorMsg = `${method.name}: ${error instanceof Error ? error.message : String(error)}`;
      console.log(`[PDF Parser] Erreur: ${errorMsg}`);
      errors.push(errorMsg);
    }
  }
  
  // Toutes les méthodes ont échoué
  return {
    success: false,
    text: "",
    method: "none",
    errors: errors,
    bufferSize,
  };
}
