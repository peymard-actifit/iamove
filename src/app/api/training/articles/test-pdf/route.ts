import { NextResponse } from "next/server";
import { articleToPdf } from "@/lib/url-to-pdf";

/**
 * GET - Test de génération PDF avec pdfkit.
 */
export async function GET() {
  try {
    console.log("[test-pdf] Début génération...");
    const pdfBuffer = await articleToPdf({
      title: "Test Article",
      description: "Ceci est un test de génération PDF.",
      content: "Le contenu de l'article de test. Lorem ipsum dolor sit amet.",
      url: "https://example.com",
      source: "Test",
      level: 1,
      duration: 5,
    });
    console.log(`[test-pdf] OK, ${pdfBuffer.length} octets`);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="test.pdf"',
      },
    });
  } catch (error) {
    console.error("[test-pdf] Erreur:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
