import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePDF } from "@/lib/pdf-parser";

// Les 26 langues supportées
const SUPPORTED_LANGUAGES = [
  "fr", "en", "de", "es", "it", "pt", "nl", "pl", "ru", "zh",
  "ja", "ko", "ar", "hi", "tr", "vi", "th", "id", "ms", "cs",
  "sk", "hu", "ro", "bg", "uk", "el"
];

// Interface pour une question de quizz
interface QuizQuestion {
  question: string;
  answers: { text: string; isCorrect: boolean }[];
  explanation?: string;
}

// Fonction pour traduire du texte via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) return text;

  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        auth_key: apiKey,
        text: text,
        source_lang: "FR",
        target_lang: targetLang.toUpperCase(),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.translations[0]?.text || text;
    }
  } catch {
    // En cas d'erreur, retourner le texte original
  }
  return text;
}

// Parser le contenu du PDF pour extraire les questions
// Supporte plusieurs formats: Q1/Q2, 1./2., Quiz 1, etc.
function parseQuizQuestions(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Nettoyer le texte
  let cleanText = text
    .replace(/\r\n/g, "\n")
    .replace(/-- \d+ of \d+ --/g, "") // Enlever les indicateurs de page
    .replace(/\n{3,}/g, "\n\n");
  
  // Symboles pour détecter les bonnes réponses (✓ peut apparaître comme caractères spéciaux)
  const correctMarkers = /[✓✔�]/;
  
  // Pattern pour format Q1, Q2, Quiz 1, etc.
  // Capture: Q + numéro, puis tout jusqu'à la prochaine question
  const questionBlocks = cleanText.split(/(?=\n(?:Q|Quiz\s*)\d+\b)/i);
  
  for (const block of questionBlocks) {
    // Vérifier si c'est un bloc de question
    const headerMatch = block.match(/^[\n\s]*(?:Q|Quiz\s*)(\d+)\b[^\n]*/i);
    if (!headerMatch) continue;
    
    const lines = block.split("\n").map(l => l.trim()).filter(l => l);
    if (lines.length < 2) continue;
    
    // La première ligne contient Q# ou Quiz #, la question peut être sur la même ligne ou la suivante
    let questionText = "";
    let answerStartIndex = 1;
    
    // Chercher le texte de la question
    const firstLine = lines[0];
    const questionInFirstLine = firstLine.replace(/^(?:Q|Quiz\s*)\d+\s*/i, "").trim();
    
    if (questionInFirstLine && !questionInFirstLine.match(/^[A-D]\./i)) {
      // La question est sur la première ligne (après Q#)
      questionText = questionInFirstLine.replace(/^:?\s*/, "").replace(/Question\s*:\s*/i, "").trim();
    } else {
      // La question est sur la ligne suivante
      if (lines.length > 1 && !lines[1].match(/^[A-D]\./i)) {
        questionText = lines[1].replace(/^Question\s*:\s*/i, "").trim();
        answerStartIndex = 2;
      }
    }
    
    // Si pas de question explicite, prendre la deuxième ligne
    if (!questionText && lines.length > 1) {
      questionText = lines[1].trim();
      answerStartIndex = 2;
    }
    
    if (!questionText) continue;
    
    // Extraire les réponses
    const answers: { text: string; isCorrect: boolean }[] = [];
    
    for (let i = answerStartIndex; i < lines.length; i++) {
      const line = lines[i];
      
      // Vérifier si c'est une ligne de réponse (A., B., C., D.)
      const answerMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);
      if (answerMatch) {
        const answerText = answerMatch[2].trim();
        // Détecter si c'est la bonne réponse (marqueur ✓ ou similaire)
        const isCorrect = correctMarkers.test(answerText) || correctMarkers.test(line);
        // Nettoyer le texte de la réponse
        const cleanAnswerText = answerText.replace(/[✓✔�\s]+$/g, "").trim();
        
        if (cleanAnswerText) {
          answers.push({ text: cleanAnswerText, isCorrect });
        }
      }
    }
    
    // S'il n'y a pas de réponses multiples mais une seule (ex: "A. Vrai"), 
    // créer des réponses Vrai/Faux
    if (answers.length === 1 && answers[0].text.toLowerCase() === "vrai") {
      answers.length = 0;
      answers.push({ text: "Vrai", isCorrect: true });
      answers.push({ text: "Faux", isCorrect: false });
    } else if (answers.length === 0) {
      // Pas de réponses trouvées, sauter cette question
      continue;
    }
    
    // S'assurer qu'au moins une réponse est marquée comme correcte
    if (!answers.some(a => a.isCorrect) && answers.length > 0) {
      answers[0].isCorrect = true;
    }
    
    questions.push({
      question: questionText,
      answers: answers,
    });
  }
  
  // Si aucune question trouvée avec le format Q#, essayer le format numérique classique
  if (questions.length === 0) {
    const numericPattern = /(\d{1,3})[.\)]\s*([^\n]+)/g;
    let match;
    
    while ((match = numericPattern.exec(cleanText)) !== null) {
      const questionText = match[2].trim();
      if (questionText.length > 10 && !questionText.match(/^[A-D]\./i)) {
        // Chercher les réponses qui suivent
        const afterQuestion = cleanText.substring(match.index + match[0].length, match.index + match[0].length + 500);
        const answerMatches = afterQuestion.match(/[A-D][\.\)]\s*[^\n]+/gi) || [];
        
        if (answerMatches.length >= 2) {
          const answers = answerMatches.slice(0, 4).map(ans => {
            const isCorrect = correctMarkers.test(ans);
            const text = ans.replace(/^[A-D][\.\)]\s*/i, "").replace(/[✓✔�\s]+$/g, "").trim();
            return { text, isCorrect };
          });
          
          if (!answers.some(a => a.isCorrect)) {
            answers[0].isCorrect = true;
          }
          
          questions.push({ question: questionText, answers });
        }
      }
    }
  }
  
  console.log(`[Parser] ${questions.length} questions extraites`);
  return questions;
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé - Administrateur requis" },
        { status: 401 }
      );
    }

    // Récupérer le formulaire
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const levelNumberStr = formData.get("levelNumber") as string | null;
    const replaceExistingStr = formData.get("replaceExisting") as string | null;
    const replaceExisting = replaceExistingStr === "true";

    if (!file) {
      return NextResponse.json(
        { error: "Fichier PDF requis" },
        { status: 400 }
      );
    }

    if (!levelNumberStr) {
      return NextResponse.json(
        { error: "Numéro de niveau requis" },
        { status: 400 }
      );
    }

    const levelNumber = parseInt(levelNumberStr, 10);
    if (isNaN(levelNumber) || levelNumber < 1 || levelNumber > 20) {
      return NextResponse.json(
        { error: "Numéro de niveau invalide (1-20)" },
        { status: 400 }
      );
    }

    // Trouver le niveau
    const level = await prisma.level.findFirst({
      where: { number: levelNumber },
    });

    if (!level) {
      return NextResponse.json(
        { error: `Niveau ${levelNumber} non trouvé` },
        { status: 404 }
      );
    }

    // Lire et parser le PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const parseResult = await parsePDF(buffer);
    
    if (!parseResult.success) {
      console.error("Erreur lecture PDF:", parseResult.errors);
      return NextResponse.json(
        { 
          error: `Impossible de lire le fichier PDF (${parseResult.bufferSize} bytes reçus)`,
          details: parseResult.errors,
          fileInfo: {
            name: file.name,
            type: file.type,
            size: file.size,
            bufferSize: parseResult.bufferSize,
          }
        },
        { status: 400 }
      );
    }
    
    const pdfText = parseResult.text;
    console.log(`PDF parsé avec succès via ${parseResult.method} (${pdfText.length} caractères)`);
    
    // Parser les questions du PDF
    const questions = parseQuizQuestions(pdfText);
    
    if (questions.length === 0) {
      return NextResponse.json(
        { 
          error: "Aucune question trouvée dans le PDF. Vérifiez le format du fichier.",
          pdfTextSample: pdfText.substring(0, 500) 
        },
        { status: 400 }
      );
    }

    // Supprimer les quizz existants seulement si l'option "remplacer" est activée
    if (replaceExisting) {
      await prisma.quizTranslation.deleteMany({
        where: {
          quiz: { levelId: level.id },
        },
      });
      await prisma.quiz.deleteMany({
        where: { levelId: level.id },
      });
    }

    // Importer les nouvelles questions
    let importedCount = 0;
    
    for (const q of questions) {
      // Créer le quiz en français
      const quiz = await prisma.quiz.create({
        data: {
          question: q.question,
          answers: q.answers,
          explanation: q.explanation || null,
          levelId: level.id,
          isActive: true,
          createdById: session.userId,
        },
      });

      // Créer les traductions
      for (const lang of SUPPORTED_LANGUAGES) {
        if (lang === "fr") {
          // Version française = version originale
          await prisma.quizTranslation.create({
            data: {
              quizId: quiz.id,
              language: "fr",
              question: q.question,
              answers: q.answers,
              explanation: q.explanation || null,
            },
          });
        } else {
          // Traduire via DeepL
          const translatedQuestion = await translateText(q.question, lang);
          const translatedAnswers = await Promise.all(
            q.answers.map(async (a) => ({
              text: await translateText(a.text, lang),
              isCorrect: a.isCorrect,
            }))
          );
          const translatedExplanation = q.explanation
            ? await translateText(q.explanation, lang)
            : null;

          await prisma.quizTranslation.create({
            data: {
              quizId: quiz.id,
              language: lang,
              question: translatedQuestion,
              answers: translatedAnswers,
              explanation: translatedExplanation,
            },
          });
        }
      }

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      level: levelNumber,
      fileName: file.name,
      mode: replaceExisting ? "replaced" : "added",
    });
  } catch (error) {
    console.error("Erreur import PDF:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'importation", details: String(error) },
      { status: 500 }
    );
  }
}

// GET pour vérifier que l'API est accessible
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "import-from-pdf",
    method: "POST required with FormData (file, levelNumber, replaceExisting)",
  });
}
