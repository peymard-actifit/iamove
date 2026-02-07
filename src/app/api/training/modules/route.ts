import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Créer un module de formation
export async function POST(request: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const body = await request.json();
    const { methodId, levelId, title, description, duration, difficulty } = body;

    if (!methodId || !levelId || !title) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    // Vérifier que la méthode existe
    const method = await prisma.trainingMethod.findUnique({
      where: { id: methodId },
    });
    if (!method) {
      return NextResponse.json({ error: "Méthode non trouvée" }, { status: 404 });
    }

    // Vérifier que le niveau existe
    const level = await prisma.level.findUnique({
      where: { id: levelId },
    });
    if (!level) {
      return NextResponse.json({ error: "Niveau non trouvé" }, { status: 404 });
    }

    // Obtenir l'ordre suivant
    const lastModule = await prisma.trainingModule.findFirst({
      where: { methodId },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastModule?.order || 0) + 1;

    // Créer le module
    const module = await prisma.trainingModule.create({
      data: {
        methodId,
        levelId,
        title,
        description: description || null,
        duration: duration || 15,
        difficulty: difficulty || 1,
        order: nextOrder,
        isActive: true,
      },
    });

    // Créer la traduction FR
    await prisma.trainingModuleTranslation.create({
      data: {
        moduleId: module.id,
        language: "FR",
        title,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, module });
  } catch (error) {
    console.error("[training/modules] Erreur POST:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// GET - Obtenir tous les modules
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const methodId = searchParams.get("methodId");
    const levelId = searchParams.get("levelId");

    const where: Record<string, unknown> = { isActive: true };
    if (methodId) where.methodId = methodId;
    if (levelId) where.levelId = levelId;

    const modules = await prisma.trainingModule.findMany({
      where,
      orderBy: [
        { level: { number: "asc" } },
        { order: "asc" },
      ],
      include: {
        method: true,
        level: true,
        translations: true,
      },
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error("[training/modules] Erreur GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
