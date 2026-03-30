import { generateProposalHTML, ProposalData, TemplateAssets } from "./proposal-template";
import path from "path";
import fs from "fs";
import sharp from "sharp";

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
 * Remove o fundo de uma imagem usando sharp (Node.js, sem browser).
 * Converte para RGBA, amostra o pixel (0,0) como cor de fundo,
 * e torna transparentes os pixels dentro de uma tolerância euclidiana.
 */
async function removeBg(filePath: string): Promise<string> {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info; // channels === 4 (RGBA)
  const buf = Buffer.from(data);

  // Cor do fundo: pixel (0,0)
  const bgR = buf[0], bgG = buf[1], bgB = buf[2];
  const tolerance = 50;

  for (let i = 0; i < width * height * channels; i += channels) {
    const dr = buf[i]     - bgR;
    const dg = buf[i + 1] - bgG;
    const db = buf[i + 2] - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < tolerance) {
      // Fade suave nas bordas para evitar serrilhado
      buf[i + 3] = Math.round((dist / tolerance) * 255);
    }
  }

  const pngBuffer = await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === "production";

  // Resolve o caminho da logo e remove o fundo em Node.js (sem Puppeteer)
  const logoFilePath =
    ["assets/logo2.png", "assets/logo.png", "assets/logo.jpg"]
      .map((p) => path.join(process.cwd(), "public", p))
      .find((p) => fs.existsSync(p)) ?? null;

  const assets: TemplateAssets = {
    buildingBg: imageToBase64("assets/building.jpg") ?? "",
    logoImg: logoFilePath ? await removeBg(logoFilePath) : undefined,
    cristianoImg:
      imageToBase64("assets/cristiano.jpeg") ??
      imageToBase64("assets/cristiano.jpg") ??
      imageToBase64("assets/cristiano.png") ??
      undefined,
  };

  const html = generateProposalHTML(data, assets);

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
    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });
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
