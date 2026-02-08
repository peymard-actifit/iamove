import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";

/**
 * Convertit une URL en PDF (Buffer).
 * Utilise puppeteer-core + @sparticuz/chromium (compatible Vercel serverless).
 * Timeout de 30 secondes par page.
 */
export async function urlToPdf(url: string): Promise<Buffer> {
  const isLocal = process.env.NODE_ENV === "development";

  const browser = await puppeteerCore.launch({
    args: isLocal ? [] : chromium.args,
    defaultViewport: { width: 1280, height: 900 },
    executablePath: isLocal
      ? // En local : utiliser Chrome/Chromium installé sur le système
        process.platform === "win32"
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : process.platform === "darwin"
        ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
        : "/usr/bin/chromium-browser"
      : await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Attendre un peu pour le rendu complet
    await new Promise((r) => setTimeout(r, 2000));

    const pdfUint8 = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
    });

    return Buffer.from(pdfUint8);
  } finally {
    await browser.close();
  }
}
