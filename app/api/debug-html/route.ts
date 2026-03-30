import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { generateProposalHTML, ProposalData, TemplateAssets } from "@/lib/proposal-template";

function imageToBase64(relPath: string): string | null {
  const filePath = path.join(process.cwd(), "public", relPath);
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(relPath).slice(1).toLowerCase();
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

const DADOS: ProposalData = {
  numero: "DEBUG/2026",
  data: "30/03/2026",
  nomeCondominio: "Condomínio Debug",
  endereco: "Rua Teste, 123",
  bairro: "Centro",
  cidade: "Belo Horizonte/MG",
  responsavel: "Debug User",
  servicoA: true,
  valorA: "1.200,00",
  servicoB: true,
  valorB: "800,00",
  servicoC: false,
  valorExtenso: "dois mil reais",
  horarioAtendimento: "Atendimento nos dias úteis, de 9 às 12h e de 14 às 17h",
  minimoVisitas: "4 (quatro)",
  plantao: false,
};

export async function GET() {
  const cwd = process.cwd();
  const buildingBg = imageToBase64("assets/building.jpg");
  const logoImg = imageToBase64("assets/logo2.png");
  const cristianoImg = imageToBase64("assets/cristiano.jpeg");

  const assets: TemplateAssets = {
    buildingBg: buildingBg ?? "",
    logoImg: logoImg ?? undefined,
    cristianoImg: cristianoImg ?? undefined,
  };

  const html = generateProposalHTML(DADOS, assets);

  const info = `
<!-- DEBUG INFO:
  cwd: ${cwd}
  buildingBg: ${buildingBg ? "LOADED (" + Math.round((buildingBg.length / 1024)) + "KB)" : "NOT FOUND"}
  logoImg: ${logoImg ? "LOADED" : "NOT FOUND"}
  cristianoImg: ${cristianoImg ? "LOADED" : "NOT FOUND"}
  htmlLength: ${html.length} chars
  firstChars: ${html.slice(0, 100)}
-->`;

  return new NextResponse(html + info, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
