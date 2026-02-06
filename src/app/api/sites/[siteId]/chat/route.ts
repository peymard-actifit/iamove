import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

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

    const systemPrompt = site.settings?.tab4SystemPrompt || 
      "Tu es un assistant spécialisé dans la formation aux compétences IA en entreprise. Tu aides les utilisateurs à comprendre et maîtriser les technologies d'intelligence artificielle.";

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

    // Appeler OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer une réponse.";

    // Sauvegarder les messages si personId fourni
    if (personId) {
      await prisma.chatMessage.createMany({
        data: [
          {
            personId,
            role: "USER",
            content: message,
            tokens: completion.usage?.prompt_tokens ?? null,
            model: "gpt-4-turbo-preview",
          },
          {
            personId,
            role: "ASSISTANT",
            content: response,
            tokens: completion.usage?.completion_tokens ?? null,
            model: "gpt-4-turbo-preview",
          },
        ],
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de la réponse" },
      { status: 500 }
    );
  }
}
