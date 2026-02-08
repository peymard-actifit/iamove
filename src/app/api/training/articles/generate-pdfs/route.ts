import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureTrainingArticlesSeeded, generateMissingArticlePdfs } from "@/lib/training-seed-articles";

/**
 * POST /api/training/articles/generate-pdfs
 * Génère les PDF manquants pour tous les articles IA.
 * Réservé aux admins. Peut prendre plusieurs minutes (1 PDF par article).
 */
export const maxDuration = 300; // 5 min max (Vercel Pro)

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    // S'assurer que les articles sont bien créés d'abord
    await ensureTrainingArticlesSeeded(prisma);

    // Générer les PDF manquants
    const result = await generateMissingArticlePdfs(prisma);

    return NextResponse.json({
      success: true,
      ...result,
      message: `${result.generated} PDF généré(s), ${result.errors} erreur(s).`,
    });
  } catch (e) {
    console.error("[training/articles/generate-pdfs] POST:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
