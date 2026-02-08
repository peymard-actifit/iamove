import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/training/articles/[moduleId] – Renvoie le PDF stocké pour ce module.
 * Content-Type: application/pdf
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;

    const mod = await prisma.trainingModule.findUnique({
      where: { id: moduleId },
      select: { pdfData: true, title: true },
    });

    if (!mod || !mod.pdfData) {
      return NextResponse.json({ error: "PDF non disponible" }, { status: 404 });
    }

    const filename = `${mod.title.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçœæ ]/gi, "_").substring(0, 80)}.pdf`;

    return new NextResponse(mod.pdfData, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[training/articles/[moduleId]] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
