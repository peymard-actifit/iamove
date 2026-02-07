import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Obtenir un module spécifique
export async function GET(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;

    const module = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
      include: {
        method: {
          include: { translations: true },
        },
        level: true,
        translations: true,
      },
    });

    if (!module) {
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ module });
  } catch (error) {
    console.error("[training/modules/[id]] Erreur GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// PATCH - Modifier un module
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const { moduleId } = await params;
    const body = await request.json();
    const { title, description, content, duration, difficulty, practicalExercises, resources } = body;

    const module = await prisma.trainingModule.update({
      where: { id: moduleId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(content !== undefined && { content }),
        ...(duration && { duration }),
        ...(difficulty && { difficulty }),
        ...(practicalExercises !== undefined && { practicalExercises }),
        ...(resources !== undefined && { resources }),
      },
    });

    // Mettre à jour la traduction FR si le titre ou la description a changé
    if (title || description !== undefined) {
      await prisma.trainingModuleTranslation.upsert({
        where: {
          moduleId_language: {
            moduleId,
            language: "FR",
          },
        },
        update: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
        },
        create: {
          moduleId,
          language: "FR",
          title: title || module.title,
          description,
        },
      });
    }

    return NextResponse.json({ success: true, module });
  } catch (error) {
    console.error("[training/modules/[id]] Erreur PATCH:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE - Supprimer un module
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }

    const { moduleId } = await params;

    // Supprimer le module (les traductions et progress seront supprimés en cascade)
    await prisma.trainingModule.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[training/modules/[id]] Erreur DELETE:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
