import { generateProposalHTML, ProposalData, TemplateAssets } from "./proposal-template";
import path from "path";
import fs from "fs";

function imageToBase64(relPath: string): string | null {
  const filePath = path.join(process.cwd(), "public", relPath);
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(relPath).slice(1).toLowerCase();
  const mime =
    ext === "svg" ? "image/svg+xml" : ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

/**
 * Remove o fundo da logo usando o Canvas API do browser (via Puppeteer).
 * Amostra a cor do pixel (0,0) e torna transparentes todos os pixels
 * dentro de uma tolerância de cor Euclidiana.
 */
async function removeBgViaCanvas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  browser: any,
  logoDataUri: string
): Promise<string> {
  const page = await browser.newPage();
  try {
    const result = await page.evaluate((src: string) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject("no ctx"); return; }
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imageData.data;

          // Cor do fundo: pixel (0,0)
          const bgR = d[0], bgG = d[1], bgB = d[2];
          const tolerance = 45; // tolerância Euclidiana

          for (let i = 0; i < d.length; i += 4) {
            const dr = d[i] - bgR;
            const dg = d[i + 1] - bgG;
            const db = d[i + 2] - bgB;
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);
            if (dist < tolerance) {
              // Fade suave nas bordas para evitar serrilhado
              const alpha = Math.round((dist / tolerance) * 255);
              d[i + 3] = alpha;
            }
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject("load error");
        img.src = src;
      });
    }, logoDataUri);
    return result;
  } finally {
    await page.close();
  }
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === "production";

  let browser;

  if (isProduction) {
    const chromium = (await import("@sparticuz/chromium-min")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
      ),
      headless: true,
    });
  } else {
    const puppeteer = (await import("puppeteer")).default;
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  try {
    // Carrega assets
    const rawLogo =
      imageToBase64("assets/logo2.png") ??
      imageToBase64("assets/logo.png") ??
      imageToBase64("assets/logo.jpg") ??
      undefined;

    const assets: TemplateAssets = {
      buildingBg: imageToBase64("assets/building.jpg") ?? "",
      // Remove fundo da logo via canvas do browser
      logoImg: rawLogo ? await removeBgViaCanvas(browser, rawLogo) : undefined,
      cristianoImg:
        imageToBase64("assets/cristiano.jpeg") ??
        imageToBase64("assets/cristiano.jpg") ??
        imageToBase64("assets/cristiano.png") ??
        undefined,
    };

    const html = generateProposalHTML(data, assets);

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });
    // networkidle0 garante que o Google Fonts seja carregado antes de renderizar
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
