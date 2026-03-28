export interface ProposalData {
  numero: string;
  data: string; // DD/MM/YYYY
  nomeCondominio: string;
  endereco: string;
  bairro: string;
  cidade: string;
  responsavel: string;
  // Serviços contratados
  servicoA: boolean;
  valorA?: string;    // ex: "1.000,00"
  servicoB: boolean;
  valorB?: string;
  servicoC: boolean;
  valorC?: string;
  valorExtenso: string; // total por extenso (manual)
  horarioAtendimento: string;
  minimoVisitas: string;
  plantao: boolean;
  valorPlantao?: string; // somado ao total, não exibido separadamente
}

export interface PageImages {
  page1: string; // base64 data URI
  page2: string;
  page3: string;
  page4: string;
  page5: string;
  page6: string;
}

/**
 * Coordenadas extraídas da API do Canva (design 794×1123 px).
 * Campos variáveis: página 1 (data, número, cliente) e página 5 (valor, horário, visitas).
 */
function parseBRL(v: string): number {
  return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateProposalHTML(
  data: ProposalData,
  images: PageImages
): string {
  const {
    numero,
    data: dataProposta,
    nomeCondominio,
    endereco,
    bairro,
    cidade,
    responsavel,
    servicoA, valorA,
    servicoB, valorB,
    servicoC, valorC,
    valorExtenso,
    horarioAtendimento,
    minimoVisitas,
    plantao, valorPlantao,
  } = data;

  const totalValor = formatBRL(
    (servicoA && valorA ? parseBRL(valorA) : 0) +
    (servicoB && valorB ? parseBRL(valorB) : 0) +
    (servicoC && valorC ? parseBRL(valorC) : 0) +
    (plantao && valorPlantao ? parseBRL(valorPlantao) : 0)
  );

  // Cores amostradas pixel a pixel do PNG exportado pelo Canva
  const ORANGE_BG = "#DD9F6A";
  const NAVY_COVER = "#1E3757";

  function page(bgData: string, overlays = "") {
    return `<div style="
      width:794px; height:1123px;
      position:relative; overflow:hidden;
      page-break-after:always;
      background-image:url('${bgData}');
      background-size:794px 1123px;
      background-repeat:no-repeat;
      font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;
    ">${overlays}</div>`;
  }

  function box(
    top: number, left: number, width: number, height: number,
    bg: string, content: string
  ) {
    return `<div style="
      position:absolute;
      top:${top}px; left:${left}px;
      width:${width}px; height:${height}px;
      background:${bg}; overflow:hidden;
    ">${content}</div>`;
  }

  // ── PÁGINA 1 ──────────────────────────────────────────────────
  // Posições Canva: date top=482.57 left=93.56 w=280 h=39
  //                numero top=556.84 left=93.56 w=500 h=78
  //                cliente top=899.03 left=67 w=726 h=224 (inclui padding do fundo laranja)

  const p1 = page(images.page1,
    // Cobertura da data
    box(478, 90, 290, 46, NAVY_COVER,
      `<span style="color:#fff;font-size:17px;font-weight:400;line-height:46px;padding-left:3px;">${dataProposta}</span>`
    ) +
    // Cobertura do número
    box(553, 90, 500, 82, NAVY_COVER,
      `<div style="color:rgba(255,255,255,0.88);font-size:15.5px;line-height:1.55;padding:5px 0 0 3px;">
        Proposta comercial<br>Nº ${numero}
      </div>`
    ) +
    // Cobertura do bloco de cliente (fundo laranja completo)
    box(860, 0, 794, 263, ORANGE_BG,
      `<div style="padding:22px 24px 0 28px;">
        <div style="
          border-left:4px solid #1C2D4E;
          padding-left:12px;
        ">
          <div style="color:#1C2D4E;font-size:14.5px;font-weight:800;text-transform:uppercase;line-height:1.3;margin-bottom:5px;">${nomeCondominio}</div>
          <div style="color:#1C2D4E;font-size:13.5px;font-weight:600;line-height:1.6;">
            ${endereco} ${bairro},<br>
            ${cidade}<br>
            Aos cuidados de ${responsavel}
          </div>
        </div>
      </div>`
    )
  );

  // ── PÁGINAS 2, 3, 4 — FIXAS ───────────────────────────────────
  const p2 = page(images.page2);
  const p3 = page(images.page3);
  const p4 = page(images.page4);

  // ── PÁGINA 5 ──────────────────────────────────────────────────
  // Box laranja de condições: top=438.36 left=79.37 w=382.21 h=460.64

  const SERVICOS = [
    {
      ativo: servicoA,
      valor: valorA,
      opcao: "A",
      nome: "Síndico Profissional",
      desc: "Representação legal, gestão das áreas comuns, convocação de assembleias e prestação de contas.",
    },
    {
      ativo: servicoB,
      valor: valorB,
      opcao: "B",
      nome: "Administração financeira/contábil",
      desc: "Controle financeiro, emissão de boletos, pagamentos, conciliação e escrituração contábil.",
    },
    {
      ativo: servicoC,
      valor: valorC,
      opcao: "C",
      nome: "Apoio operacional ao síndico",
      desc: "Suporte operacional: orçamentos, secretaria em assembleias e gestão dos bastidores.",
    },
  ].filter((s) => s.ativo);

  const servicosHTML = SERVICOS.map((s) => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;">
        <div style="font-size:11px;font-weight:800;color:#1C2D4E;text-transform:uppercase;letter-spacing:0.3px;flex:1;padding-right:8px;">
          ${s.nome}
        </div>
        <div style="font-size:11px;font-weight:800;color:#1C2D4E;white-space:nowrap;">
          R$ ${s.valor}
        </div>
      </div>
    </div>
  `).join("");

  const p5 = page(images.page5,
    box(438, 79, 384, 461, ORANGE_BG,
      `<div style="padding:20px 20px 0 20px;">

        ${servicosHTML}

        <div style="border-top:1.5px solid rgba(28,45,78,0.35);margin:10px 0 10px;"></div>

        <div style="font-size:11px;font-weight:800;color:#1C2D4E;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
          VALOR MENSAL TOTAL:
        </div>
        <div style="font-size:26px;font-weight:900;color:#1C2D4E;line-height:1.1;">
          R$ ${totalValor}
        </div>
        <div style="font-size:12px;color:#1C2D4E;font-style:italic;margin:4px 0 14px;">
          (${valorExtenso})
        </div>

        <div style="font-size:11px;font-weight:800;color:#1C2D4E;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:12px;">
          CORREÇÃO ANUAL: IGPM ou INPC
        </div>

        <div style="font-size:11px;color:#1C2D4E;line-height:1.65;padding-left:14px;position:relative;margin-bottom:6px;">
          <span style="position:absolute;left:0;">•</span>
          ${horarioAtendimento};
        </div>

        <div style="font-size:11px;color:#1C2D4E;line-height:1.65;padding-left:14px;position:relative;">
          <span style="position:absolute;left:0;">•</span>
          Mínimo de ${minimoVisitas} visitas mensais.
        </div>

      </div>`
    )
  );

  // ── PÁGINA 6 — FIXA ──────────────────────────────────────────
  const p6 = page(images.page6);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <style>
    @page { margin: 0; size: 794px 1123px; }
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body { width:794px; background:#fff; }
  </style>
</head>
<body>
  ${p1}
  ${p2}
  ${p3}
  ${p4}
  ${p5}
  ${p6}
</body>
</html>`;
}
