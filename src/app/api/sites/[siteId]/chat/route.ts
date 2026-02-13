import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OpenAI from "openai";
import { OPENAI_CONFIG } from "@/lib/api-config";
import { checkAndAwardBadges } from "@/lib/badges";
import levelsData from "@/data/levels.json";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await request.json();
    const { message, personId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message requis" }, { status: 400 });
    }

    // Récupérer les paramètres du site
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      include: { settings: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site non trouvé" }, { status: 404 });
    }

    // Charger l'ensemble des questions du programme (quiz) pour les mettre à disposition de l'IA
    const allQuizzes = await prisma.quiz.findMany({
      where: { isActive: true },
      include: {
        level: { select: { number: true } },
        translations: { where: { language: "FR" }, take: 1 },
      },
      orderBy: [{ level: { number: "asc" } }, { createdAt: "asc" }],
    });
    const questionsContext = allQuizzes.length > 0
      ? "\n\n--- Questions du programme (quiz par niveau) ---\n" +
        allQuizzes.map((q) => {
          const t = q.translations[0];
          const questionText = t?.question ?? q.question;
          const answers = (t?.answers ?? q.answers) as { text: string; isCorrect: boolean }[] | null;
          const answersStr = Array.isArray(answers)
            ? answers.map((a) => a.text).join(" | ")
            : "";
          return `[Niveau ${q.level.number}] Q: ${questionText}${answersStr ? ` Réponses: ${answersStr}` : ""}`;
        }).join("\n")
      : "";

    // Échelle des niveaux du programme (classement compétence IA des personnes)
    const levels = (levelsData as { levels: { number: number; name: string; category: string; description: string }[] }).levels;
    const levelsScaleContext =
      "\n\n--- Échelle des niveaux du programme (1 à 20) pour classer la compétence IA ---\n" +
      levels
        .filter((l) => l.number >= 1 && l.number <= 20)
        .map(
          (l) =>
            `Niveau ${l.number}: ${l.name} (${l.category}). ${l.description}`
        )
        .join("\n");

    const systemPrompt = (site.settings?.tab4SystemPrompt ||
      "Tu es un assistant spécialisé dans la formation aux compétences IA en entreprise. Tu aides les utilisateurs à comprendre et maîtriser les technologies d'intelligence artificielle.") +
      levelsScaleContext +
      questionsContext;

    // Récupérer l'historique des messages (10 derniers)
    const history = personId ? await prisma.chatMessage.findMany({
      where: { personId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }) : [];

    // Construire les messages pour OpenAI
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.reverse().map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Appeler OpenAI - gpt-4o-mini est le modèle actuel recommandé
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: OPENAI_CONFIG.maxTokens.default,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    // Sauvegarder les messages si personId fourni + 5 PP par prompt (formation)
    if (personId) {
      await prisma.chatMessage.createMany({
        data: [
          {
            personId,
            role: "USER",
            content: message,
            tokens: completion.usage?.prompt_tokens ?? null,
            model: "gpt-4o-mini",
          },
          {
            personId,
            role: "ASSISTANT",
            content: response,
            tokens: completion.usage?.completion_tokens ?? null,
            model: "gpt-4o-mini",
          },
        ],
      });
      await prisma.person.update({
        where: { id: personId },
        data: { participationPoints: { increment: 5 }, lastSeenAt: new Date() },
      });
      checkAndAwardBadges(personId, siteId).catch(() => {});
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Erreur lors de la génération de la réponse: ${errorMessage}` },
      { status: 500 }
    );
  }
}
