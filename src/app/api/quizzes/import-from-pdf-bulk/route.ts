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

// Interface pour une question de quizz avec niveau
interface QuizQuestionWithLevel {
  question: string;
  answers: { text: string; isCorrect: boolean }[];
  explanation?: string;
  detectedLevel?: number;
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

// Charger les descriptions des niveaux pour l'analyse IA
async function getLevelDescriptions(): Promise<Map<number, string>> {
  const levels = await prisma.level.findMany({
    where: { number: { gte: 1, lte: 20 } },
    orderBy: { number: "asc" },
  });
  
  const descriptions = new Map<number, string>();
  for (const level of levels) {
    descriptions.set(level.number, `${level.name}: ${level.seriousGaming || ""}`);
  }
  return descriptions;
}

// Déterminer le niveau d'une question via l'IA (OpenAI)
async function determineLevel(question: string, levelDescriptions: Map<number, string>): Promise<number> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    // Sans clé API, retourner niveau 1 par défaut
    return 1;
  }

  // Construire le contexte des niveaux
  const levelsContext = Array.from(levelDescriptions.entries())
    .map(([num, desc]) => `Niveau ${num}: ${desc}`)
    .join("\n");

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Tu es un expert en évaluation de compétences IA. Tu dois déterminer le niveau de difficulté d'une question de quiz sur l'IA.

Voici l'échelle des niveaux (1 = débutant, 20 = expert) :
${levelsContext}

Réponds UNIQUEMENT avec un nombre entre 1 et 20, sans aucune explication.`
          },
          {
            role: "user",
            content: `Quel est le niveau de cette question ? "${question}"`
          }
        ],
        max_tokens: 10,
        temperature: 0.3,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim();
      const level = parseInt(content, 10);
      if (!isNaN(level) && level >= 1 && level <= 20) {
        return level;
      }
    }
  } catch (error) {
    console.error("Erreur OpenAI:", error);
  }

  // Par défaut, retourner niveau 1
  return 1;
}

// Parser le contenu du PDF pour extraire les questions avec détection de niveau
// Supporte plusieurs formats: Q1/Q2, 1./2., Quiz 1, etc.
function parseQuizQuestionsWithLevel(text: string): QuizQuestionWithLevel[] {
  const questions: QuizQuestionWithLevel[] = [];
  
  // Nettoyer le texte
  let cleanText = text
    .replace(/\r\n/g, "\n")
    .replace(/-- \d+ of \d+ --/g, "") // Enlever les indicateurs de page
    .replace(/\n{3,}/g, "\n\n");
  
  // Pattern pour détecter le niveau dans le texte
  const levelPattern = /(?:niveau|niv\.?|level)\s*(\d{1,2})/i;
  
  // Chercher un niveau global au début du document
  let globalLevel: number | undefined;
  const globalLevelMatch = cleanText.substring(0, 500).match(levelPattern);
  if (globalLevelMatch) {
    const lvl = parseInt(globalLevelMatch[1], 10);
    if (lvl >= 1 && lvl <= 20) {
      globalLevel = lvl;
    }
  }
  
  // Symboles pour détecter les bonnes réponses
  const correctMarkers = /[✓✔�]/;
  
  // Pattern pour format Q1, Q2, Quiz 1, etc.
  const questionBlocks = cleanText.split(/(?=\n(?:Q|Quiz\s*)\d+\b)/i);
  
  for (const block of questionBlocks) {
    const headerMatch = block.match(/^[\n\s]*(?:Q|Quiz\s*)(\d+)\b[^\n]*/i);
    if (!headerMatch) continue;
    
    const lines = block.split("\n").map(l => l.trim()).filter(l => l);
    if (lines.length < 2) continue;
    
    // Extraire le texte de la question
    let questionText = "";
    let answerStartIndex = 1;
    
    const firstLine = lines[0];
    const questionInFirstLine = firstLine.replace(/^(?:Q|Quiz\s*)\d+\s*/i, "").trim();
    
    if (questionInFirstLine && !questionInFirstLine.match(/^[A-D]\./i)) {
      questionText = questionInFirstLine.replace(/^:?\s*/, "").replace(/Question\s*:\s*/i, "").trim();
    } else {
      if (lines.length > 1 && !lines[1].match(/^[A-D]\./i)) {
        questionText = lines[1].replace(/^Question\s*:\s*/i, "").trim();
        answerStartIndex = 2;
      }
    }
    
    if (!questionText && lines.length > 1) {
      questionText = lines[1].trim();
      answerStartIndex = 2;
    }
    
    if (!questionText) continue;
    
    // Détecter le niveau local
    let detectedLevel = globalLevel;
    const localLevelMatch = block.match(levelPattern);
    if (localLevelMatch) {
      const lvl = parseInt(localLevelMatch[1], 10);
      if (lvl >= 1 && lvl <= 20) {
        detectedLevel = lvl;
      }
    }
    
    // Extraire les réponses
    const answers: { text: string; isCorrect: boolean }[] = [];
    
    for (let i = answerStartIndex; i < lines.length; i++) {
      const line = lines[i];
      const answerMatch = line.match(/^([A-D])[\.\)]\s*(.+)/i);
      if (answerMatch) {
        const answerText = answerMatch[2].trim();
        const isCorrect = correctMarkers.test(answerText) || correctMarkers.test(line);
        const cleanAnswerText = answerText.replace(/[✓✔�\s]+$/g, "").trim();
        
        if (cleanAnswerText) {
          answers.push({ text: cleanAnswerText, isCorrect });
        }
      }
    }
    
    // Gérer les questions Vrai/Faux
    if (answers.length === 1 && answers[0].text.toLowerCase() === "vrai") {
      answers.length = 0;
      answers.push({ text: "Vrai", isCorrect: true });
      answers.push({ text: "Faux", isCorrect: false });
    } else if (answers.length === 0) {
      continue;
    }
    
    if (!answers.some(a => a.isCorrect) && answers.length > 0) {
      answers[0].isCorrect = true;
    }
    
    questions.push({
      question: questionText,
      answers: answers,
      detectedLevel: detectedLevel,
    });
  }
  
  console.log(`[Parser Bulk] ${questions.length} questions extraites`);
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

    if (!file) {
      return NextResponse.json(
        { error: "Fichier PDF requis" },
        { status: 400 }
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
          error: "Impossible de lire le fichier PDF",
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }
    
    const pdfText = parseResult.text;
    console.log(`PDF parsé avec succès via ${parseResult.method} (${pdfText.length} caractères)`);
    
    // Parser les questions
    const questions = parseQuizQuestionsWithLevel(pdfText);
    
    if (questions.length === 0) {
      return NextResponse.json(
        { 
          error: "Aucune question trouvée dans le PDF. Vérifiez le format du fichier.",
          pdfTextSample: pdfText.substring(0, 500) 
        },
        { status: 400 }
      );
    }

    // Charger les descriptions des niveaux pour l'IA
    const levelDescriptions = await getLevelDescriptions();
    
    // Récupérer tous les niveaux de la base
    const allLevels = await prisma.level.findMany({
      where: { number: { gte: 1, lte: 20 } },
    });
    const levelMap = new Map(allLevels.map(l => [l.number, l.id]));

    // Importer les questions
    let importedCount = 0;
    const byLevel: Record<number, number> = {};
    
    for (const q of questions) {
      // Déterminer le niveau
      let levelNumber = q.detectedLevel;
      
      // Si pas de niveau détecté, utiliser l'IA
      if (!levelNumber) {
        levelNumber = await determineLevel(q.question, levelDescriptions);
      }
      
      // Trouver l'ID du niveau
      const levelId = levelMap.get(levelNumber);
      if (!levelId) {
        console.warn(`Niveau ${levelNumber} non trouvé, utilisation du niveau 1`);
        levelNumber = 1;
      }
      
      const finalLevelId = levelMap.get(levelNumber)!;
      
      // Créer le quiz
      const quiz = await prisma.quiz.create({
        data: {
          question: q.question,
          answers: q.answers,
          explanation: q.explanation || null,
          levelId: finalLevelId,
          isActive: true,
          createdById: session.userId,
        },
      });

      // Créer les traductions
      for (const lang of SUPPORTED_LANGUAGES) {
        if (lang === "fr") {
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
          const translatedQuestion = await translateText(q.question, lang);
          const translatedAnswers = await Promise.all(
            q.answers.map(async (a) => ({
              text: await translateText(a.text, lang),
              isCorrect: a.isCorrect,
            }))
          );

          await prisma.quizTranslation.create({
            data: {
              quizId: quiz.id,
              language: lang,
              question: translatedQuestion,
              answers: translatedAnswers,
              explanation: null,
            },
          });
        }
      }

      importedCount++;
      byLevel[levelNumber] = (byLevel[levelNumber] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      imported: importedCount,
      byLevel: byLevel,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Erreur import PDF vrac:", error);
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
    endpoint: "import-from-pdf-bulk",
    method: "POST required with FormData (file)",
  });
}
