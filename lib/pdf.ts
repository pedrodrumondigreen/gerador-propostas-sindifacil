import { generateProposalHTML, ProposalData } from "./proposal-template";
import path from "path";
import fs from "fs";

function imageToBase64(filename: string): string {
  const filePath = path.join(process.cwd(), "public", "pages", filename);
  const buffer = fs.readFileSync(filePath);
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === "production";

  // Carrega cada página como base64 para garantir que o Puppeteer renderize corretamente
  const pages = {
    page1: imageToBase64("page1.png"),
    page2: imageToBase64("page2.png"),
    page3: imageToBase64("page3.png"),
    page4: imageToBase64("page4.png"),
    page5: imageToBase64("page5.png"),
    page6: imageToBase64("page6.png"),
  };

  const html = generateProposalHTML(data, pages);

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
    await page.setContent(html, { waitUntil: "domcontentloaded" });

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
