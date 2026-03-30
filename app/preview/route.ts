import { NextResponse } from "next/server";
import { generateProposalPDF } from "@/lib/pdf";
import { ProposalData } from "@/lib/proposal-template";

// Dados de teste fixos — edite à vontade para testar cenários diferentes
const DADOS_TESTE: ProposalData = {
  numero: "027/2026",
  data: "28/03/2026",
  nomeCondominio: "Condomínio Ed. Turquesa",
  endereco: "Rua das Flores, 150",
  bairro: "Bairro São Lucas",
  cidade: "Belo Horizonte/MG",
  responsavel: "Sr. João Silva",
  servicoA: true,
  valorA: "1.200,00",
  servicoB: true,
  valorB: "800,00",
  servicoC: false,
  valorExtenso: "dois mil, cento e cinquenta reais",
  horarioAtendimento: "Atendimento nos dias úteis, de 9 às 12h e de 14 às 17h",
  minimoVisitas: "4 (quatro)",
  plantao: true,
  valorPlantao: "150,00",
};

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const pdfBuffer = await generateProposalPDF(DADOS_TESTE);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        // inline = abre no browser em vez de baixar
        "Content-Disposition": 'inline; filename="preview.pdf"',
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("Erro no preview:", error);
    return new NextResponse(
      `Erro ao gerar preview: ${error instanceof Error ? error.message : String(error)}`,
      { status: 500, headers: { "Content-Type": "text/plain" } }
    );
  }
}
