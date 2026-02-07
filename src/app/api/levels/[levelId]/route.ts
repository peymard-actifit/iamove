import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ levelId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès réservé aux administrateurs" },
        { status: 403 }
      );
    }

    const { levelId } = await params;
    const body = await request.json();
    const { name, category, seriousGaming, description } = body;

    const level = await prisma.level.update({
      where: { id: levelId },
      data: {
        ...(name && { name }),
        ...(category !== undefined && { category }),
        ...(seriousGaming !== undefined && { seriousGaming }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(level);
  } catch (error) {
    console.error("Error updating level:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
