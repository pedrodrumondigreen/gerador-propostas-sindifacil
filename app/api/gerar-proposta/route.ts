import { NextRequest, NextResponse } from "next/server";
import { generateProposalPDF } from "@/lib/pdf";
import { ProposalData } from "@/lib/proposal-template";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const data: ProposalData = {
      numero: body.numero,
      data: body.data,
      nomeCondominio: body.nomeCondominio,
      endereco: body.endereco,
      bairro: body.bairro,
      cidade: body.cidade || "Belo Horizonte/MG",
      responsavel: body.responsavel,
      servicoA: !!body.servicoA,
      valorA: body.valorA || undefined,
      servicoB: !!body.servicoB,
      valorB: body.valorB || undefined,
      servicoC: !!body.servicoC,
      valorC: body.valorC || undefined,
      valorExtenso: body.valorExtenso,
      horarioAtendimento: body.horarioAtendimento,
      minimoVisitas: body.minimoVisitas,
      observacaoPlantao: body.observacaoPlantao || undefined,
    };

    const pdfBuffer = await generateProposalPDF(data);

    const nomeArquivo = `Proposta-${data.numero.replace("/", "-")}-${data.nomeCondominio.replace(/\s+/g, "_")}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
        "Content-Length": String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error("Erro ao gerar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao gerar o PDF da proposta." },
      { status: 500 }
    );
  }
}
