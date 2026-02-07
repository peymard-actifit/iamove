import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

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
    const response = await fetch("https://api-free.deepl.com/v2/translate", {
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
function parseQuizQuestions(text: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  
  // Normaliser le texte (enlever les sauts de ligne multiples, etc.)
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  
  // Pattern pour trouver les questions
  // Format attendu: numéro. Question? (ou Question :)
  // Suivi de A) réponse, B) réponse, C) réponse, D) réponse
  // La bonne réponse est marquée avec * ou (correct) ou en gras
  
  // Essayer différents patterns
  
  // Pattern 1: Questions numérotées avec réponses A), B), C), D)
  const questionPattern = /(\d{1,3})[.\)]\s*([^\n]+(?:\n(?![A-D][\)\.])[^\n]*)*)\s*\n\s*A[\)\.]?\s*([^\n]+)\s*\n\s*B[\)\.]?\s*([^\n]+)\s*\n\s*C[\)\.]?\s*([^\n]+)\s*\n\s*D[\)\.]?\s*([^\n]+)/gi;
  
  let match;
  while ((match = questionPattern.exec(normalizedText)) !== null) {
    const questionText = match[2].trim().replace(/\n/g, " ");
    const answerA = match[3].trim();
    const answerB = match[4].trim();
    const answerC = match[5].trim();
    const answerD = match[6].trim();
    
    // Détecter la bonne réponse (marquée avec *, ✓, (correct), ou en MAJUSCULES dans certains formats)
    const answers = [
      { text: answerA.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerA) },
      { text: answerB.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerB) },
      { text: answerC.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerC) },
      { text: answerD.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerD) },
    ];
    
    // Si aucune réponse n'est marquée comme correcte, chercher après le bloc de réponses
    if (!answers.some(a => a.isCorrect)) {
      // Chercher "Réponse: X" ou "Bonne réponse: X" après les réponses
      const afterMatch = normalizedText.substring(match.index + match[0].length, match.index + match[0].length + 100);
      const correctPattern = /(?:réponse|bonne réponse|correct)\s*:?\s*([A-D])/i;
      const correctMatch = afterMatch.match(correctPattern);
      if (correctMatch) {
        const correctLetter = correctMatch[1].toUpperCase();
        const idx = "ABCD".indexOf(correctLetter);
        if (idx >= 0) {
          answers[idx].isCorrect = true;
        }
      }
    }
    
    // Si toujours aucune réponse correcte, marquer la première comme correcte par défaut
    if (!answers.some(a => a.isCorrect)) {
      answers[0].isCorrect = true;
    }
    
    questions.push({
      question: questionText,
      answers: answers,
    });
  }
  
  // Si le pattern 1 n'a pas trouvé de questions, essayer un pattern alternatif
  if (questions.length === 0) {
    // Pattern 2: Questions séparées par des lignes vides
    const blocks = normalizedText.split(/\n\n+/);
    let currentQuestion: QuizQuestion | null = null;
    
    for (const block of blocks) {
      const lines = block.trim().split("\n").map(l => l.trim()).filter(l => l);
      
      if (lines.length === 0) continue;
      
      // Si la première ligne ressemble à une question (termine par ? ou contient un numéro)
      if (lines[0].match(/^\d+[.\)]/)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        
        currentQuestion = {
          question: lines[0].replace(/^\d+[.\)]\s*/, "").trim(),
          answers: [],
        };
        
        // Chercher les réponses dans les lignes suivantes
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.match(/^[A-D][\)\.:]/i)) {
            const isCorrect = line.includes("*") || line.includes("✓") || line.includes("✔");
            const text = line.replace(/^[A-D][\)\.:]\s*/i, "").replace(/^\*|\*$|✓|✔/g, "").trim();
            currentQuestion.answers.push({ text, isCorrect });
          }
        }
      }
    }
    
    if (currentQuestion && currentQuestion.answers.length > 0) {
      questions.push(currentQuestion);
    }
  }
  
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
    
    let pdfData;
    try {
      pdfData = await pdfParse(buffer);
    } catch {
      return NextResponse.json(
        { error: "Impossible de lire le fichier PDF" },
        { status: 400 }
      );
    }

    const pdfText = pdfData.text;
    
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

    // Supprimer les quizz existants pour ce niveau
    await prisma.quizTranslation.deleteMany({
      where: {
        quiz: { levelId: level.id },
      },
    });
    await prisma.quiz.deleteMany({
      where: { levelId: level.id },
    });

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
    });
  } catch (error) {
    console.error("Erreur import PDF:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'importation" },
      { status: 500 }
    );
  }
}
