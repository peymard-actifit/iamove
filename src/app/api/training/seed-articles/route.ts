import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ensureTrainingArticlesSeeded } from "@/lib/training-seed-articles";

/**
 * POST – Lance le seed des 20 articles IA (niveaux 1–20).
 * Réservé aux admins. En pratique les articles sont créés automatiquement
 * au premier accès à GET /api/training/articles ; cette route permet un re-seed manuel si besoin.
 */
export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const method = await prisma.trainingMethod.findFirst({
      where: { type: "ARTICLE", isActive: true },
    });
    if (!method) {
      return NextResponse.json(
        { error: "Méthode « Articles & Lectures » introuvable. Exécutez d’abord l’initialisation des méthodes de formation." },
        { status: 400 }
      );
    }

    await ensureTrainingArticlesSeeded(prisma);

    return NextResponse.json({ success: true, message: "Articles IA à jour (seed idempotent)." });
  } catch (e) {
    console.error("[training/seed-articles] Erreur:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
