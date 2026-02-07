import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const counts = await prisma.quiz.groupBy({
      by: ["levelId"],
      _count: {
        id: true,
      },
    });

    const result: Record<string, number> = {};
    for (const count of counts) {
      result[count.levelId] = count._count.id;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json({}, { status: 500 });
  }
}
