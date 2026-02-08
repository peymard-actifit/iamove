import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { articleToPdf } from "@/lib/url-to-pdf";

export const maxDuration = 30;

/**
 * GET /api/training/articles/[moduleId] – Renvoie le PDF pour ce module.
 * Si le PDF n'existe pas encore, le génère à partir du contenu de l'article,
 * le stocke en base pour le cache, puis le renvoie.
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
      select: {
        pdfData: true,
        title: true,
        description: true,
        content: true,
        resources: true,
        duration: true,
        level: { select: { number: true } },
      },
    });

    if (!mod) {
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    let pdfData = mod.pdfData;

    // Si pas de PDF en cache, le générer à partir du contenu
    if (!pdfData) {
      const resources = mod.resources as Array<{ url?: string; title?: string }> | null;
      const url = resources?.[0]?.url || "";
      const source = resources?.[0]?.title || "";

      console.log(`[PDF on-demand] Génération pour "${mod.title}"`);
      try {
        const pdfBuffer = await articleToPdf({
          title: mod.title,
          description: mod.description,
          content: mod.content,
          url,
          source,
          level: mod.level?.number,
          duration: mod.duration,
        });

        // Stocker en cache dans la base
        await prisma.trainingModule.update({
          where: { id: moduleId },
          data: { pdfData: pdfBuffer },
        });
        pdfData = pdfBuffer;
        console.log(`[PDF on-demand] OK – ${mod.title} (${(pdfBuffer.length / 1024).toFixed(0)} Ko)`);
      } catch (genError) {
        console.error(`[PDF on-demand] Erreur pour "${mod.title}":`, genError);
        return NextResponse.json(
          { error: "Erreur lors de la génération du PDF." },
          { status: 503 }
        );
      }
    }

    const filename = `${mod.title.replace(/[^a-zA-Z0-9àâäéèêëïîôùûüÿçœæ ]/gi, "_").substring(0, 80)}.pdf`;

    return new NextResponse(new Uint8Array(pdfData), {
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
