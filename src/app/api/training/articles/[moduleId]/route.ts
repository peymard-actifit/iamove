import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/training/articles/[moduleId]
 * Renvoie une page HTML de lecture élégante pour l'article,
 * optimisée pour l'impression / export PDF navigateur.
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
        title: true,
        description: true,
        content: true,
        duration: true,
        difficulty: true,
        resources: true,
        level: { select: { number: true, name: true } },
      },
    });

    if (!mod) {
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    const resources = mod.resources as Array<{ url?: string; title?: string }> | null;
    const sourceUrl = resources?.[0]?.url || "";
    const sourceName = resources?.[0]?.title || "";

    // Convertir le contenu Markdown basique en HTML
    const contentHtml = (mod.content || "")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(mod.title)} – iamove</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      color: #1f2937;
      background: #ffffff;
      line-height: 1.7;
      padding: 0;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      padding: 2rem 2.5rem;
    }
    .header .meta {
      font-size: 0.85rem;
      opacity: 0.85;
      margin-bottom: 0.5rem;
    }
    .header h1 {
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 0.5rem;
    }
    .header .description {
      font-size: 1rem;
      opacity: 0.9;
      font-style: italic;
    }
    .content {
      padding: 2rem 2.5rem;
      max-width: 800px;
    }
    .content p {
      margin-bottom: 1rem;
      font-size: 1rem;
      text-align: justify;
    }
    .content a {
      color: #2563eb;
      text-decoration: underline;
    }
    .source-box {
      margin-top: 2rem;
      padding: 1rem 1.5rem;
      background: #f3f4f6;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .source-box .label {
      font-size: 0.8rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }
    .source-box a {
      color: #2563eb;
      font-size: 0.9rem;
      word-break: break-all;
    }
    .source-box .name {
      color: #9ca3af;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }
    .footer {
      margin-top: 2.5rem;
      padding: 1rem 2.5rem;
      border-top: 1px solid #e5e7eb;
      color: #d1d5db;
      font-size: 0.75rem;
      text-align: center;
    }
    @media print {
      .header { padding: 1.5rem 2rem; }
      .content { padding: 1.5rem 2rem; }
      .source-box { break-inside: avoid; }
      body { font-size: 11pt; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="meta">
      Niveau ${mod.level?.number || "?"} ${mod.level?.name ? "– " + escapeHtml(mod.level.name) : ""}
      &nbsp;•&nbsp; ${mod.duration || 0} min de lecture
      &nbsp;•&nbsp; Difficulté ${mod.difficulty || 1}/5
    </div>
    <h1>${escapeHtml(mod.title)}</h1>
    ${mod.description ? `<div class="description">${escapeHtml(mod.description)}</div>` : ""}
  </div>
  <div class="content">
    <p>${contentHtml}</p>
    ${sourceUrl ? `
    <div class="source-box">
      <div class="label">Source originale</div>
      <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener">${escapeHtml(sourceUrl)}</a>
      ${sourceName ? `<div class="name">— ${escapeHtml(sourceName)}</div>` : ""}
    </div>` : ""}
  </div>
  <div class="footer">
    Généré par iamove • ${new Date().toLocaleDateString("fr-FR")}
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[training/articles/[moduleId]] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
