import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    const { pathId } = await params;
    const body = await request.json();
    const { moduleId } = body as { moduleId: string };
    if (!moduleId) {
      return NextResponse.json({ error: "moduleId requis" }, { status: 400 });
    }
    const path = await prisma.trainingPath.findUnique({ where: { id: pathId } });
    if (!path) return NextResponse.json({ error: "Parcours non trouvé" }, { status: 404 });
    const maxOrder = await prisma.trainingPathItem
      .aggregate({
        where: { pathId },
        _max: { order: true },
      })
      .then((r) => r._max.order ?? -1);
    const item = await prisma.trainingPathItem.create({
      data: { pathId, moduleId, order: maxOrder + 1 },
      include: {
        module: {
          include: {
            level: { select: { number: true } },
            method: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });
    return NextResponse.json({ item });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return NextResponse.json({ error: "Ce module est déjà dans le parcours" }, { status: 400 });
    }
    console.error("[training/paths/:pathId/items] POST:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
