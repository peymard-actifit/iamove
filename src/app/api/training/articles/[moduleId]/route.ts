import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { urlToPdf } from "@/lib/url-to-pdf";

export const maxDuration = 60; // Vercel timeout pour génération PDF on-demand

/**
 * GET /api/training/articles/[moduleId] – Renvoie le PDF stocké pour ce module.
 * Si le PDF n'existe pas encore, le génère à la volée depuis l'URL source,
 * le stocke en base, puis le renvoie.
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
      select: { pdfData: true, title: true, resources: true },
    });

    if (!mod) {
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    let pdfData = mod.pdfData;

    // Si pas de PDF, le générer à la volée depuis l'URL source
    if (!pdfData) {
      const resources = mod.resources as Array<{ url?: string }> | null;
      const url = resources?.[0]?.url;
      if (!url) {
        return NextResponse.json({ error: "Pas d'URL source pour générer le PDF" }, { status: 404 });
      }

      console.log(`[PDF on-demand] Génération pour "${mod.title}" depuis ${url}`);
      try {
        const pdfBuffer = await urlToPdf(url);
        // Stocker en base pour la prochaine fois
        await prisma.trainingModule.update({
          where: { id: moduleId },
          data: { pdfData: pdfBuffer },
        });
        pdfData = pdfBuffer;
        console.log(`[PDF on-demand] OK – ${mod.title} (${(pdfBuffer.length / 1024).toFixed(0)} Ko)`);
      } catch (genError) {
        console.error(`[PDF on-demand] Erreur génération pour "${mod.title}":`, genError);
        return NextResponse.json(
          { error: "Erreur lors de la génération du PDF. Réessayez plus tard." },
          { status: 503 }
        );
      }
    }

    const filename = `${mod.title.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçœæ ]/gi, "_").substring(0, 80)}.pdf`;

    return new NextResponse(Buffer.from(pdfData), {
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
