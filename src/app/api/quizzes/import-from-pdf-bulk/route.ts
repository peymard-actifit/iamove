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
function parseQuizQuestionsWithLevel(text: string): QuizQuestionWithLevel[] {
  const questions: QuizQuestionWithLevel[] = [];
  
  // Normaliser le texte
  const normalizedText = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  
  // Pattern pour détecter le niveau dans le texte
  // Ex: "Niveau 1", "Niv. 3", "N1", "Level 5", etc.
  const levelPattern = /(?:niveau|niv\.?|n|level)\s*(\d{1,2})/i;
  
  // Chercher un niveau global au début du document
  let globalLevel: number | undefined;
  const globalLevelMatch = normalizedText.substring(0, 500).match(levelPattern);
  if (globalLevelMatch) {
    const lvl = parseInt(globalLevelMatch[1], 10);
    if (lvl >= 1 && lvl <= 20) {
      globalLevel = lvl;
    }
  }
  
  // Pattern pour trouver les questions
  const questionPattern = /(\d{1,3})[.\)]\s*([^\n]+(?:\n(?![A-D][\)\.])[^\n]*)*)\s*\n\s*A[\)\.]?\s*([^\n]+)\s*\n\s*B[\)\.]?\s*([^\n]+)\s*\n\s*C[\)\.]?\s*([^\n]+)\s*\n\s*D[\)\.]?\s*([^\n]+)/gi;
  
  let match;
  while ((match = questionPattern.exec(normalizedText)) !== null) {
    const fullMatch = match[0];
    const questionText = match[2].trim().replace(/\n/g, " ");
    const answerA = match[3].trim();
    const answerB = match[4].trim();
    const answerC = match[5].trim();
    const answerD = match[6].trim();
    
    // Chercher le niveau dans le contexte de la question
    let detectedLevel = globalLevel;
    const localLevelMatch = fullMatch.match(levelPattern);
    if (localLevelMatch) {
      const lvl = parseInt(localLevelMatch[1], 10);
      if (lvl >= 1 && lvl <= 20) {
        detectedLevel = lvl;
      }
    }
    
    // Détecter la bonne réponse
    const answers = [
      { text: answerA.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerA) },
      { text: answerB.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerB) },
      { text: answerC.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerC) },
      { text: answerD.replace(/^\*|\*$|✓|✔|\(correct\)/gi, "").trim(), isCorrect: /^\*|\*$|✓|✔|\(correct\)/i.test(answerD) },
    ];
    
    // Chercher "Réponse: X" après les réponses si aucune n'est marquée
    if (!answers.some(a => a.isCorrect)) {
      const afterMatch = normalizedText.substring(match.index + match[0].length, match.index + match[0].length + 100);
      const correctPattern = /(?:réponse|bonne réponse|correct)\s*:?\s*([A-D])/i;
      const correctMatch = afterMatch.match(correctPattern);
      if (correctMatch) {
        const idx = "ABCD".indexOf(correctMatch[1].toUpperCase());
        if (idx >= 0) {
          answers[idx].isCorrect = true;
        }
      }
    }
    
    // Par défaut, marquer la première comme correcte
    if (!answers.some(a => a.isCorrect)) {
      answers[0].isCorrect = true;
    }
    
    questions.push({
      question: questionText,
      answers: answers,
      detectedLevel: detectedLevel,
    });
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

    if (!file) {
      return NextResponse.json(
        { error: "Fichier PDF requis" },
        { status: 400 }
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
      { error: "Erreur serveur lors de l'importation" },
      { status: 500 }
    );
  }
}
