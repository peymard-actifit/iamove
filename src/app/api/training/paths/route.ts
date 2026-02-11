import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxLevel = searchParams.get("maxLevel"); // Niveau max de l'utilisateur (optionnel)
    
    // Accès public pour lire les parcours (utilisé par le site publié)
    const paths = await prisma.trainingPath.findMany({
      where: { isActive: true },
      orderBy: [
        { level: { number: "asc" } }, // Trier par niveau recommandé
        { order: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        level: { select: { number: true, name: true } }, // Inclure le niveau recommandé
        items: {
          orderBy: { order: "asc" },
          include: {
            module: {
              select: {
                id: true,
                title: true,
                duration: true,
                isActive: true,
                level: { select: { number: true } },
                method: { select: { id: true, name: true, type: true } },
              },
            },
          },
        },
      },
    });
    
    // Filtrer les items dont le module est actif
    let filteredPaths = paths.map((path) => ({
      ...path,
      items: path.items.filter((item) => item.module?.isActive !== false),
    }));
    
    // Si un niveau max est spécifié, filtrer les parcours accessibles
    if (maxLevel) {
      const maxLevelNum = parseInt(maxLevel, 10);
      if (!isNaN(maxLevelNum)) {
        filteredPaths = filteredPaths.filter(
          (path) => !path.level || path.level.number <= maxLevelNum
        );
      }
    }
    
    return NextResponse.json({ paths: filteredPaths });
  } catch (e) {
    console.error("[training/paths] GET:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    const body = await request.json();
    const { name, description } = body as { name: string; description?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nom requis" }, { status: 400 });
    }
    const path = await prisma.trainingPath.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        order: await prisma.trainingPath.count(),
      },
    });
    return NextResponse.json({ path });
  } catch (e) {
    console.error("[training/paths] POST:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
