import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtenir les statistiques par niveau (authentification par session)
export async function GET() {
  try {
    // Vérifier la session admin
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    // Récupérer tous les niveaux avec leur nombre de questions
    const levels = await prisma.level.findMany({
      where: { number: { gte: 1, lte: 20 } },
      orderBy: { number: "asc" },
      include: {
        _count: {
          select: { quizzes: true }
        }
      }
    });

    const stats = levels.map(level => ({
      number: level.number,
      name: level.name,
      currentCount: level._count.quizzes,
      target: 120,
      missing: Math.max(0, 120 - level._count.quizzes),
    }));

    const totalCurrent = stats.reduce((sum, s) => sum + s.currentCount, 0);
    const totalMissing = stats.reduce((sum, s) => sum + s.missing, 0);

    return NextResponse.json({
      stats,
      summary: {
        totalCurrent,
        totalTarget: 2400,
        totalMissing,
        percentComplete: Math.round((totalCurrent / 2400) * 100),
      }
    });
  } catch (error) {
    console.error("[bulk-stats] Erreur:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
