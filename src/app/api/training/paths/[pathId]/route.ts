import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    const { pathId } = await params;
    const path = await prisma.trainingPath.findUnique({
      where: { id: pathId },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            module: {
              include: {
                level: { select: { number: true } },
                method: { select: { id: true, name: true, type: true } },
                translations: true,
              },
            },
          },
        },
      },
    });
    if (!path) return NextResponse.json({ error: "Parcours non trouvé" }, { status: 404 });
    return NextResponse.json({ path });
  } catch (e) {
    console.error("[training/paths/:id] GET:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
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
    const { name, description, itemIds } = body as {
      name?: string;
      description?: string;
      itemIds?: string[];
    };
    const data: { name?: string; description?: string | null } = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description?.trim() || null;
    if (Object.keys(data).length > 0) {
      await prisma.trainingPath.update({
        where: { id: pathId },
        data,
      });
    }
    if (Array.isArray(itemIds) && itemIds.length > 0) {
      await Promise.all(
        itemIds.map((id, index) =>
          prisma.trainingPathItem.updateMany({
            where: { id, pathId },
            data: { order: index },
          })
        )
      );
    }
    const path = await prisma.trainingPath.findUnique({
      where: { id: pathId },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            module: {
              include: {
                level: { select: { number: true } },
                method: { select: { id: true, name: true, type: true } },
                translations: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json({ path });
  } catch (e) {
    console.error("[training/paths/:id] PATCH:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ pathId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    const { pathId } = await params;
    await prisma.trainingPath.delete({ where: { id: pathId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[training/paths/:id] DELETE:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
