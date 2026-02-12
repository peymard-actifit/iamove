import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/training/modules/[moduleId]/view
 * Renvoie une page HTML de visualisation élégante pour n'importe quel type de module.
 * Adapte le rendu selon le type : ARTICLE, VIDEO, TUTORIAL, EXERCISE, SERIOUS_GAME, INTERACTIVE
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
        id: true,
        title: true,
        description: true,
        content: true,
        duration: true,
        difficulty: true,
        resources: true,
        practicalExercises: true,
        level: { select: { number: true, name: true } },
        method: { select: { name: true, type: true } },
      },
    });

    if (!mod) {
      return NextResponse.json({ error: "Module non trouvé" }, { status: 404 });
    }

    const methodType = mod.method?.type || "ARTICLE";
    const resources = mod.resources as Array<{ url?: string; title?: string; type?: string }> | null;
    const exercises = mod.practicalExercises as Array<{ title?: string; description?: string; instructions?: string }> | null;

    // Convertir le contenu Markdown basique en HTML
    const contentHtml = convertMarkdownToHtml(mod.content || "");

    // Couleurs et icônes selon le type
    const typeStyles = getTypeStyles(methodType);

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
    }
    .header {
      background: ${typeStyles.gradient};
      color: white;
      padding: 2rem 2.5rem;
    }
    .header .type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255,255,255,0.2);
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
    }
    .header .type-badge svg {
      width: 16px;
      height: 16px;
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
      max-width: 900px;
    }
    .content p {
      margin-bottom: 1rem;
      font-size: 1rem;
      text-align: justify;
    }
    .content h2 {
      font-size: 1.3rem;
      color: ${typeStyles.color};
      margin: 1.5rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid ${typeStyles.color}20;
    }
    .content h3 {
      font-size: 1.1rem;
      color: #374151;
      margin: 1.25rem 0 0.75rem;
    }
    .content ul, .content ol {
      margin: 1rem 0 1rem 1.5rem;
    }
    .content li {
      margin-bottom: 0.5rem;
    }
    .content a {
      color: ${typeStyles.color};
      text-decoration: underline;
    }
    .content code {
      background: #f3f4f6;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    .content pre {
      background: #1f2937;
      color: #e5e7eb;
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1rem 0;
    }
    .content pre code {
      background: none;
      color: inherit;
    }
    .content blockquote {
      border-left: 4px solid ${typeStyles.color};
      padding-left: 1rem;
      margin: 1rem 0;
      color: #6b7280;
      font-style: italic;
    }
    .video-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      margin: 1.5rem 0;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
    }
    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .video-placeholder {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
    }
    .video-placeholder svg {
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      opacity: 0.8;
    }
    .exercise-card {
      background: ${typeStyles.color}10;
      border: 1px solid ${typeStyles.color}30;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1rem 0;
    }
    .exercise-card h4 {
      color: ${typeStyles.color};
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
    }
    .exercise-card .instructions {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1rem;
      border: 1px solid ${typeStyles.color}20;
    }
    .resource-box {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      margin: 0.5rem 0;
      border: 1px solid #e5e7eb;
    }
    .resource-box:hover {
      background: #f3f4f6;
    }
    .resource-box .icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: ${typeStyles.color}20;
      color: ${typeStyles.color};
      border-radius: 8px;
    }
    .resource-box .info {
      flex: 1;
    }
    .resource-box .info .title {
      font-weight: 600;
      color: #1f2937;
    }
    .resource-box .info .url {
      font-size: 0.8rem;
      color: #6b7280;
      word-break: break-all;
    }
    .interactive-frame {
      border: 2px solid ${typeStyles.color}30;
      border-radius: 12px;
      overflow: hidden;
      margin: 1.5rem 0;
    }
    .interactive-frame iframe {
      width: 100%;
      min-height: 500px;
      border: none;
    }
    .cta-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: ${typeStyles.gradient};
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      margin: 1rem 0;
      transition: opacity 0.2s;
    }
    .cta-button:hover {
      opacity: 0.9;
      color: white;
    }
    .footer {
      margin-top: 2.5rem;
      padding: 1rem 2.5rem;
      border-top: 1px solid #e5e7eb;
      color: #9ca3af;
      font-size: 0.75rem;
      text-align: center;
    }
    @media print {
      .header { padding: 1.5rem 2rem; }
      .content { padding: 1.5rem 2rem; }
      body { font-size: 11pt; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="type-badge">
      ${typeStyles.icon}
      ${mod.method?.name || "Formation"}
    </div>
    <div class="meta">
      Niveau ${mod.level?.number || "?"} ${mod.level?.name ? "– " + escapeHtml(mod.level.name) : ""}
      &nbsp;•&nbsp; ${mod.duration || 0} min
      &nbsp;•&nbsp; Difficulté ${mod.difficulty || 1}/5
    </div>
    <h1>${escapeHtml(mod.title)}</h1>
    ${mod.description ? `<div class="description">${escapeHtml(mod.description)}</div>` : ""}
  </div>
  <div class="content">
    ${renderContentByType(methodType, contentHtml, resources, exercises, mod, typeStyles)}
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
    console.error("[training/modules/[moduleId]/view] GET:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

function getTypeStyles(type: string) {
  const styles: Record<string, { gradient: string; color: string; icon: string }> = {
    ARTICLE: {
      gradient: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
      color: "#3b82f6",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`,
    },
    VIDEO: {
      gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
      color: "#ef4444",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`,
    },
    TUTORIAL: {
      gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      color: "#06b6d4",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    },
    EXERCISE: {
      gradient: "linear-gradient(135deg, #22c55e 0%, #10b981 100%)",
      color: "#22c55e",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
    },
    SERIOUS_GAME: {
      gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
      color: "#a855f7",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4"/><path d="M8 10v4"/><circle cx="17" cy="10" r="1"/><circle cx="15" cy="14" r="1"/></svg>`,
    },
    INTERACTIVE: {
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      color: "#6366f1",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>`,
    },
  };
  return styles[type] || styles.ARTICLE;
}

function renderContentByType(
  type: string,
  contentHtml: string,
  resources: Array<{ url?: string; title?: string; type?: string }> | null,
  exercises: Array<{ title?: string; description?: string; instructions?: string }> | null,
  mod: { title: string; duration: number | null },
  typeStyles: { gradient: string; color: string; icon: string }
): string {
  const hasContent = contentHtml && contentHtml.trim().length > 0;
  
  switch (type) {
    case "VIDEO":
      const videoUrl = resources?.find(r => r.type === "video" || r.url?.includes("youtube") || r.url?.includes("vimeo"))?.url;
      const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
      return `
        ${embedUrl ? `
          <div class="video-container">
            <iframe src="${escapeHtml(embedUrl)}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        ` : `
          <div class="video-container">
            <div class="video-placeholder">
              <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <p>Vidéo : ${escapeHtml(mod.title)}</p>
              <p style="font-size: 0.9rem; opacity: 0.7;">${mod.duration || 0} minutes</p>
            </div>
          </div>
        `}
        ${hasContent ? `<h2>À propos de cette vidéo</h2><p>${contentHtml}</p>` : ""}
        ${renderResources(resources, typeStyles)}
      `;

    case "TUTORIAL":
      return `
        ${hasContent ? `
          <h2>Guide pas à pas</h2>
          <p>${contentHtml}</p>
        ` : `
          <div class="exercise-card">
            <h4>📖 Tutoriel en cours de création</h4>
            <p>Ce tutoriel détaillé sera bientôt disponible. Il vous guidera étape par étape dans l'apprentissage de ce sujet.</p>
          </div>
        `}
        ${exercises && exercises.length > 0 ? `
          <h2>Étapes pratiques</h2>
          ${exercises.map((ex, i) => `
            <div class="exercise-card">
              <h4>Étape ${i + 1} : ${escapeHtml(ex.title || "")}</h4>
              <p>${escapeHtml(ex.description || "")}</p>
              ${ex.instructions ? `
                <div class="instructions">
                  <strong>Instructions :</strong><br>
                  ${escapeHtml(ex.instructions)}
                </div>
              ` : ""}
            </div>
          `).join("")}
        ` : ""}
        ${renderResources(resources, typeStyles)}
      `;

    case "EXERCISE":
      return `
        ${hasContent ? `
          <h2>Objectif de l'exercice</h2>
          <p>${contentHtml}</p>
        ` : ""}
        ${exercises && exercises.length > 0 ? `
          <h2>Exercices à réaliser</h2>
          ${exercises.map((ex, i) => `
            <div class="exercise-card">
              <h4>Exercice ${i + 1} : ${escapeHtml(ex.title || "")}</h4>
              <p>${escapeHtml(ex.description || "")}</p>
              ${ex.instructions ? `
                <div class="instructions">
                  <strong>Ce que vous devez faire :</strong><br>
                  ${escapeHtml(ex.instructions)}
                </div>
              ` : ""}
            </div>
          `).join("")}
        ` : `
          <div class="exercise-card">
            <h4>🎯 Exercice pratique</h4>
            <p>Cet exercice vous permettra de mettre en pratique vos connaissances. Le contenu détaillé sera bientôt disponible.</p>
          </div>
        `}
        ${renderResources(resources, typeStyles)}
      `;

    case "SERIOUS_GAME":
      const gameUrl = resources?.find(r => r.type === "game" || r.type === "interactive")?.url;
      return `
        ${gameUrl ? `
          <div class="interactive-frame">
            <iframe src="${escapeHtml(gameUrl)}" allowfullscreen></iframe>
          </div>
        ` : `
          <div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%); border-radius: 16px; margin: 1rem 0;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🎮</div>
            <h3 style="color: #a855f7; margin-bottom: 0.5rem;">Serious Game</h3>
            <p style="color: #6b7280;">${escapeHtml(mod.title)}</p>
            <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 0.5rem;">Durée estimée : ${mod.duration || 0} minutes</p>
          </div>
        `}
        ${hasContent ? `<h2>À propos de ce jeu</h2><p>${contentHtml}</p>` : ""}
        ${renderResources(resources, typeStyles)}
      `;

    case "INTERACTIVE":
      const interactiveUrl = resources?.find(r => r.type === "interactive" || r.type === "tool")?.url;
      return `
        ${interactiveUrl ? `
          <div class="interactive-frame">
            <iframe src="${escapeHtml(interactiveUrl)}" allowfullscreen></iframe>
          </div>
        ` : `
          <div style="text-align: center; padding: 3rem; background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%); border-radius: 16px; margin: 1rem 0;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🔬</div>
            <h3 style="color: #6366f1; margin-bottom: 0.5rem;">Module Interactif</h3>
            <p style="color: #6b7280;">${escapeHtml(mod.title)}</p>
            <p style="font-size: 0.9rem; color: #9ca3af; margin-top: 0.5rem;">Explorez et expérimentez pendant ${mod.duration || 0} minutes</p>
          </div>
        `}
        ${hasContent ? `<h2>Guide d'utilisation</h2><p>${contentHtml}</p>` : ""}
        ${renderResources(resources, typeStyles)}
      `;

    case "ARTICLE":
    default:
      const sourceUrl = resources?.[0]?.url || "";
      const sourceName = resources?.[0]?.title || "";
      return `
        ${hasContent ? `<p>${contentHtml}</p>` : `
          <div style="text-align: center; padding: 2rem; background: #f9fafb; border-radius: 12px;">
            <p style="color: #6b7280;">Le contenu de cet article est en cours de rédaction.</p>
          </div>
        `}
        ${sourceUrl ? `
          <div class="resource-box" style="margin-top: 2rem; border-left: 4px solid #3b82f6;">
            <div class="icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </div>
            <div class="info">
              <div class="title">Source originale</div>
              <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener" class="url">${escapeHtml(sourceUrl)}</a>
              ${sourceName ? `<div style="font-size: 0.8rem; color: #9ca3af; margin-top: 0.25rem;">— ${escapeHtml(sourceName)}</div>` : ""}
            </div>
          </div>
        ` : ""}
      `;
  }
}

function renderResources(
  resources: Array<{ url?: string; title?: string; type?: string }> | null,
  typeStyles: { gradient: string; color: string; icon: string }
): string {
  if (!resources || resources.length === 0) return "";
  
  const filteredResources = resources.filter(r => r.url && r.type !== "video" && r.type !== "game" && r.type !== "interactive");
  if (filteredResources.length === 0) return "";

  return `
    <h2>Ressources complémentaires</h2>
    ${filteredResources.map(r => `
      <a href="${escapeHtml(r.url || "")}" target="_blank" rel="noopener" class="resource-box" style="text-decoration: none;">
        <div class="icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </div>
        <div class="info">
          <div class="title">${escapeHtml(r.title || "Ressource")}</div>
          <div class="url">${escapeHtml(r.url || "")}</div>
        </div>
      </a>
    `).join("")}
  `;
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  
  return null;
}

function convertMarkdownToHtml(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gim, "</p><h3>$1</h3><p>")
    .replace(/^## (.*$)/gim, "</p><h2>$1</h2><p>")
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Blockquotes
    .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
    // Lists
    .replace(/^\* (.*$)/gim, "<li>$1</li>")
    .replace(/^- (.*$)/gim, "<li>$1</li>")
    .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
    // Paragraphs
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
