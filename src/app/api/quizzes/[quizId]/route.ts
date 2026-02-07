import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Les 26 langues cibles (sans FR)
const TARGET_LANGUAGES = [
  "EN", "DE", "ES", "IT", "PT", "NL", "PL", "RU", "JA", "ZH",
  "KO", "AR", "TR", "SV", "DA", "FI", "NO", "CS", "EL", "HU",
  "RO", "SK", "UK", "BG", "HR"
];

// Fonction pour traduire via DeepL
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === "") return "";
  
  const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
  if (!DEEPL_API_KEY) return text;

  try {
    const response = await fetch("https://api.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        text,
        source_lang: "FR",
        target_lang: targetLang,
      }),
    });

    if (!response.ok) return text;
    const data = await response.json();
    return data.translations?.[0]?.text || text;
  } catch {
    return text;
  }
}

// Traduire les réponses
async function translateAnswers(answers: { text: string; isCorrect: boolean }[], targetLang: string) {
  const translated = await Promise.all(
    answers.map(async (a) => ({
      text: await translateText(a.text, targetLang),
      isCorrect: a.isCorrect,
    }))
  );
  return translated;
}

// PATCH - Modifier un quiz (+ retraduction automatique)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { quizId } = await params;
    const body = await request.json();
    const { question, levelId, answers, isActive } = body;

    // Récupérer l'ancien quiz pour comparer
    const oldQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { question: true, answers: true },
    });

    // Mettre à jour le quiz
    const quiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        question,
        levelId,
        answers,
        isActive,
      },
      include: {
        level: true,
      },
    });

    // Si la question ou les réponses ont changé, retraduire en arrière-plan
    const oldAnswersStr = JSON.stringify(oldQuiz?.answers);
    const newAnswersStr = JSON.stringify(answers);
    const contentChanged = oldQuiz?.question !== question || oldAnswersStr !== newAnswersStr;

    if (contentChanged && question && answers) {
      // Lancer la retraduction en arrière-plan (ne pas attendre)
      (async () => {
        try {
          for (const lang of TARGET_LANGUAGES) {
            const [translatedQuestion, translatedAnswers] = await Promise.all([
              translateText(question, lang),
              translateAnswers(answers, lang),
            ]);

            await prisma.quizTranslation.upsert({
              where: {
                quizId_language: { quizId, language: lang },
              },
              update: {
                question: translatedQuestion,
                answers: translatedAnswers,
              },
              create: {
                quizId,
                language: lang,
                question: translatedQuestion,
                answers: translatedAnswers,
              },
            });
          }
          console.log(`Quiz ${quizId} retranslated to all languages`);
        } catch (error) {
          console.error(`Error retranslating quiz ${quizId}:`, error);
        }
      })();
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un quiz
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.userType !== "STUDIO_USER" || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { quizId } = await params;

    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
