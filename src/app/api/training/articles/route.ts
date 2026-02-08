import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureTrainingArticlesSeeded } from "@/lib/training-seed-articles";

/**
 * GET - Liste des articles (modules type ARTICLE) pour un niveau.
 * Public. Seed automatique des 20 articles au premier accès si besoin.
 * Query: levelId OU levelNumber (1-20)
 */
export async function GET(request: Request) {
  try {
    await ensureTrainingArticlesSeeded(prisma);

    const { searchParams } = new URL(request.url);
    const levelId = searchParams.get("levelId");
    const levelNumberParam = searchParams.get("levelNumber");
    const levelNumber = levelNumberParam ? parseInt(levelNumberParam, 10) : NaN;

    let targetLevelId: string | null = levelId || null;
    if (!targetLevelId && Number.isFinite(levelNumber) && levelNumber >= 1 && levelNumber <= 20) {
      const level = await prisma.level.findFirst({
        where: { number: levelNumber },
        select: { id: true },
      });
      targetLevelId = level?.id ?? null;
    }
    if (!targetLevelId) {
      return NextResponse.json({ error: "levelId ou levelNumber (1-20) requis" }, { status: 400 });
    }

    const method = await prisma.trainingMethod.findFirst({
      where: { type: "ARTICLE", isActive: true },
    });
    if (!method) {
      return NextResponse.json({ articles: [] });
    }

    const modules = await prisma.trainingModule.findMany({
      where: {
        methodId: method.id,
        levelId: targetLevelId,
        isActive: true,
      },
      orderBy: { order: "asc" },
      include: {
        level: true,
        translations: true,
      },
    });

    return NextResponse.json({ articles: modules });
  } catch (error) {
    console.error("[training/articles] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
