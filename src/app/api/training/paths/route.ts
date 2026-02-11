import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Accès public pour lire les parcours (utilisé par le site publié)
    // Les utilisateurs connectés (admin ou site publié) peuvent voir les parcours
    const paths = await prisma.trainingPath.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
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
    const filteredPaths = paths.map((path) => ({
      ...path,
      items: path.items.filter((item) => item.module?.isActive !== false),
    }));
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
