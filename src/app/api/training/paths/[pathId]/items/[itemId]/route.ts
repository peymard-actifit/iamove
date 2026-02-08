import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ pathId: string; itemId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès réservé aux administrateurs" }, { status: 403 });
    }
    const { pathId, itemId } = await params;
    await prisma.trainingPathItem.deleteMany({
      where: { id: itemId, pathId },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[training/paths/:pathId/items/:itemId] DELETE:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
