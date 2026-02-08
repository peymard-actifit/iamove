import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ARTICLES_IA } from "@/lib/training-seed-articles";

/**
 * GET - Diagnostic complet des articles en base.
 * Détecte doublons, orphelins, et état PDF.
 */
export async function GET() {
  try {
    const method = await prisma.trainingMethod.findFirst({
      where: { type: "ARTICLE", isActive: true },
    });

    if (!method) {
      return NextResponse.json({ error: "Méthode ARTICLE introuvable" }, { status: 404 });
    }

    // Tous les modules ARTICLE en base
    const allModules = await prisma.trainingModule.findMany({
      where: { methodId: method.id },
      select: {
        id: true,
        title: true,
        isActive: true,
        order: true,
        resources: true,
        level: { select: { number: true } },
        pdfData: false,
      },
      orderBy: [{ level: { number: "asc" } }, { order: "asc" }],
    });

    // Vérifier quels modules ont un PDF (sans charger le blob)
    const allIds = allModules.map((m) => m.id);
    const withPdf = await prisma.trainingModule.findMany({
      where: { id: { in: allIds }, pdfData: { not: null } },
      select: { id: true },
    });
    const pdfSet = new Set(withPdf.map((m) => m.id));

    // Vérifier la taille des PDF pour les modules qui en ont
    const pdfSizes = await prisma.trainingModule.findMany({
      where: { id: { in: Array.from(pdfSet) } },
      select: { id: true, pdfData: true },
    });
    const pdfSizeMap = new Map<string, number>();
    for (const m of pdfSizes) {
      if (m.pdfData) {
        pdfSizeMap.set(m.id, m.pdfData.length);
      }
    }

    // Titres attendus du seed
    const expectedTitles = new Set(ARTICLES_IA.map((a) => a.title));

    // Détecter doublons (même titre)
    const titleCount = new Map<string, string[]>();
    for (const mod of allModules) {
      const ids = titleCount.get(mod.title) || [];
      ids.push(mod.id);
      titleCount.set(mod.title, ids);
    }
    const duplicates = Array.from(titleCount.entries())
      .filter(([, ids]) => ids.length > 1)
      .map(([title, ids]) => ({ title, count: ids.length, ids }));

    // Modules par niveau
    const byLevel = new Map<number, typeof allModules>();
    for (const mod of allModules) {
      const lvl = mod.level.number;
      const list = byLevel.get(lvl) || [];
      list.push(mod);
      byLevel.set(lvl, list);
    }

    const levelSummary = Array.from(byLevel.entries())
      .sort(([a], [b]) => a - b)
      .map(([level, mods]) => ({
        level,
        count: mods.length,
        withPdf: mods.filter((m) => pdfSet.has(m.id)).length,
        titles: mods.map((m) => ({
          id: m.id,
          title: m.title,
          isActive: m.isActive,
          hasPdf: pdfSet.has(m.id),
          pdfSizeKB: pdfSizeMap.has(m.id) ? Math.round(pdfSizeMap.get(m.id)! / 1024) : 0,
          inSeed: expectedTitles.has(m.title),
        })),
      }));

    // Modules en base qui ne sont pas dans le seed (orphelins)
    const orphans = allModules.filter((m) => !expectedTitles.has(m.title)).map((m) => ({
      id: m.id,
      title: m.title,
      level: m.level.number,
      isActive: m.isActive,
    }));

    return NextResponse.json({
      totalModules: allModules.length,
      expectedFromSeed: ARTICLES_IA.length,
      totalWithPdf: withPdf.length,
      duplicateGroups: duplicates.length,
      duplicates,
      orphanCount: orphans.length,
      orphans,
      levelSummary,
    });
  } catch (error) {
    console.error("[articles/debug] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
