import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * GET — Retourne les méthodes de formation avec leurs modules.
 * Utilisé par la page admin Training pour un chargement client-side
 * (évite les gros payloads RSC qui cassent le streaming).
 */
export async function GET() {
  try {
    const methods = await prisma.trainingMethod.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        translations: true,
        modules: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            description: true,
            duration: true,
            difficulty: true,
            order: true,
            methodId: true,
            level: { select: { id: true, number: true, name: true } },
            translations: {
              select: {
                id: true,
                language: true,
                title: true,
                description: true,
                content: true,
              },
              take: 5, // Limiter les traductions chargées
            },
          },
          orderBy: [
            { level: { number: "asc" } },
            { order: "asc" },
          ],
        },
        _count: {
          select: { modules: true },
        },
      },
    });

    const levels = await prisma.level.findMany({
      where: { number: { gte: 1, lte: 20 } },
      orderBy: { number: "asc" },
      select: { id: true, number: true, name: true },
    });

    return NextResponse.json({ methods, levels });
  } catch (error) {
    console.error("[training/methods] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
