import PDFDocument from "pdfkit";

interface ArticleContent {
  title: string;
  description?: string | null;
  content?: string | null;
  url: string;
  source?: string;
  level?: number;
  duration?: number;
}

/**
 * Génère un PDF à partir du contenu d'un article (sans navigateur headless).
 * Utilise pdfkit (pur Node.js, compatible Vercel serverless).
 */
export function articleToPdf(article: ArticleContent): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 60, bottom: 60, left: 50, right: 50 },
        info: {
          Title: article.title,
          Author: article.source || "iamove",
          Subject: article.description || "",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // ── En-tête avec ligne colorée ──
      doc
        .rect(doc.page.margins.left, 40, pageWidth, 3)
        .fill("#3B82F6");

      doc.moveDown(0.5);

      // ── Métadonnées ──
      if (article.level || article.duration) {
        const meta: string[] = [];
        if (article.level) meta.push(`Niveau ${article.level}`);
        if (article.duration) meta.push(`${article.duration} min de lecture`);

        doc
          .fontSize(9)
          .fillColor("#6B7280")
          .text(meta.join("  •  "), { align: "left" });
        doc.moveDown(0.3);
      }

      // ── Titre ──
      doc
        .fontSize(22)
        .fillColor("#111827")
        .text(article.title, { align: "left" });

      doc.moveDown(0.5);

      // ── Description ──
      if (article.description) {
        doc
          .fontSize(12)
          .fillColor("#4B5563")
          .text(article.description, { align: "left" });
        doc.moveDown(0.5);
      }

      // ── Ligne séparatrice ──
      const y = doc.y;
      doc
        .moveTo(doc.page.margins.left, y)
        .lineTo(doc.page.margins.left + pageWidth, y)
        .strokeColor("#E5E7EB")
        .lineWidth(1)
        .stroke();
      doc.moveDown(1);

      // ── Contenu ──
      if (article.content) {
        // Nettoyer le contenu Markdown basique
        const cleanContent = article.content
          .replace(/\*\*Source :\*\*.*$/m, "") // Retirer la ligne source déjà ajoutée
          .replace(/\*\*(.*?)\*\*/g, "$1") // Bold → texte simple (pdfkit ne supporte pas le Markdown inline)
          .replace(/\*(.*?)\*/g, "$1") // Italic → texte simple
          .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Liens → texte du lien
          .trim();

        doc
          .fontSize(11)
          .fillColor("#1F2937")
          .text(cleanContent, {
            align: "justify",
            lineGap: 4,
          });
      }

      doc.moveDown(2);

      // ── Source ──
      const sourceY = doc.y;
      doc
        .rect(doc.page.margins.left, sourceY, pageWidth, 40)
        .fill("#F3F4F6");

      doc
        .fontSize(9)
        .fillColor("#6B7280")
        .text("Source originale :", doc.page.margins.left + 10, sourceY + 8);

      doc
        .fontSize(9)
        .fillColor("#2563EB")
        .text(article.url, doc.page.margins.left + 10, sourceY + 22, {
          link: article.url,
          underline: true,
          width: pageWidth - 20,
        });

      if (article.source) {
        doc
          .fontSize(9)
          .fillColor("#9CA3AF")
          .text(`— ${article.source}`, { continued: false });
      }

      // ── Pied de page ──
      doc.moveDown(2);
      doc
        .fontSize(8)
        .fillColor("#D1D5DB")
        .text(`Généré par iamove • ${new Date().toLocaleDateString("fr-FR")}`, {
          align: "center",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

// Rétrocompatibilité (ancien nom)
export async function urlToPdf(url: string): Promise<Buffer> {
  return articleToPdf({ title: "Article", url, content: url });
}
