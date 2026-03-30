import { generateProposalHTML, ProposalData, TemplateAssets } from "./proposal-template";
import path from "path";
import fs from "fs";
import zlib from "zlib";

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
 * Lê um PNG RGB (sem alpha), amostra o pixel (0,0) como fundo,
 * adiciona canal alpha e torna transparentes os pixels dentro da tolerância.
 * Usa apenas módulos nativos do Node.js (zlib) — sem dependências nativas.
 */
function removeBgPNG(filePath: string): string {
  const buf = fs.readFileSync(filePath);

  // ── 1. Valida assinatura PNG ─────────────────────────────────────────────
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!buf.slice(0, 8).equals(PNG_SIG)) throw new Error("Não é um PNG válido");

  // ── 2. Lê IHDR ───────────────────────────────────────────────────────────
  const width    = buf.readUInt32BE(16);
  const height   = buf.readUInt32BE(20);
  const bitDepth = buf[24];
  const colorType = buf[25]; // 2=RGB, 6=RGBA

  if (bitDepth !== 8) throw new Error(`Bit depth ${bitDepth} não suportado`);
  const srcChannels = colorType === 6 ? 4 : colorType === 2 ? 3 : (() => { throw new Error(`colorType ${colorType} não suportado`); })();

  // ── 3. Coleta chunks IDAT e concatena ────────────────────────────────────
  const idatChunks: Buffer[] = [];
  let offset = 8;
  while (offset < buf.length - 4) {
    const chunkLen  = buf.readUInt32BE(offset);
    const chunkType = buf.slice(offset + 4, offset + 8).toString("ascii");
    const chunkData = buf.slice(offset + 8, offset + 8 + chunkLen);
    if (chunkType === "IDAT") idatChunks.push(chunkData);
    offset += 12 + chunkLen;
  }
  const compressed  = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressed);

  // ── 4. Desfiltro PNG (reconstrução de scanlines) ─────────────────────────
  const stride = 1 + width * srcChannels; // 1 byte de filtro + pixels
  const raw = Buffer.alloc(width * height * srcChannels);

  function paeth(a: number, b: number, c: number): number {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  }

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * stride];
    const lineIn  = decompressed.slice(y * stride + 1, (y + 1) * stride);
    const lineOut  = raw.slice(y * width * srcChannels, (y + 1) * width * srcChannels);

    for (let x = 0; x < width * srcChannels; x++) {
      const a = x >= srcChannels ? lineOut[x - srcChannels] : 0;
      const b = y > 0 ? raw[(y - 1) * width * srcChannels + x] : 0;
      const c = y > 0 && x >= srcChannels ? raw[(y - 1) * width * srcChannels + x - srcChannels] : 0;
      const raw_ = lineIn[x];

      switch (filterType) {
        case 0: lineOut[x] = raw_; break;
        case 1: lineOut[x] = (raw_ + a) & 0xff; break;
        case 2: lineOut[x] = (raw_ + b) & 0xff; break;
        case 3: lineOut[x] = (raw_ + Math.floor((a + b) / 2)) & 0xff; break;
        case 4: lineOut[x] = (raw_ + paeth(a, b, c)) & 0xff; break;
        default: lineOut[x] = raw_;
      }
    }
  }

  // ── 5. Cor do fundo: pixel (0,0) ─────────────────────────────────────────
  const bgR = raw[0], bgG = raw[1], bgB = raw[2];
  const tolerance = 55;

  // ── 6. Constrói imagem RGBA com alpha calculado ──────────────────────────
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const si = i * srcChannels;
    const di = i * 4;
    const r = raw[si], g = raw[si + 1], b = raw[si + 2];
    const a = srcChannels === 4 ? raw[si + 3] : 255;
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    rgba[di]     = r;
    rgba[di + 1] = g;
    rgba[di + 2] = b;
    rgba[di + 3] = dist < tolerance ? Math.round((dist / tolerance) * 255) & a : a;
  }

  // ── 7. Monta PNG de saída (colorType=6, RGBA) ────────────────────────────
  function crc32(data: Buffer): number {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type: string, data: Buffer): Buffer {
    const typeB = Buffer.from(type, "ascii");
    const lenB  = Buffer.alloc(4); lenB.writeUInt32BE(data.length);
    const crcB  = Buffer.alloc(4); crcB.writeUInt32BE(crc32(Buffer.concat([typeB, data])));
    return Buffer.concat([lenB, typeB, data, crcB]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; // bit depth 8, RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Comprimir scanlines (filtro 0 = None)
  const rawLines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawLines[y * (1 + width * 4)] = 0; // filtro None
    rgba.copy(rawLines, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed2 = zlib.deflateSync(rawLines, { level: 6 });

  const pngOut = Buffer.concat([
    PNG_SIG,
    chunk("IHDR", ihdr),
    chunk("IDAT", compressed2),
    chunk("IEND", Buffer.alloc(0)),
  ]);

  return `data:image/png;base64,${pngOut.toString("base64")}`;
}

export async function generateProposalPDF(data: ProposalData): Promise<Buffer> {
  const isProduction = process.env.NODE_ENV === "production";

  // Resolve o caminho da logo e remove o fundo (pure Node.js, sem deps nativas)
  const logoFilePath =
    ["assets/logo2.png", "assets/logo.png"]
      .map((p) => path.join(process.cwd(), "public", p))
      .find((p) => fs.existsSync(p) && p.endsWith(".png")) ?? null;

  let logoImg: string | undefined;
  if (logoFilePath) {
    try {
      logoImg = removeBgPNG(logoFilePath);
    } catch {
      logoImg = imageToBase64(path.relative(path.join(process.cwd(), "public"), logoFilePath)) ?? undefined;
    }
  }

  const assets: TemplateAssets = {
    buildingBg: imageToBase64("assets/building.jpg") ?? "",
    logoImg,
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
