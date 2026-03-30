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
  valorA?: string; // ex: "1.000,00"
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

export interface TemplateAssets {
  buildingBg: string;    // base64 data URI da foto de fundo
  logoImg?: string;      // base64 data URI da logo (opcional — fallback textual)
  cristianoImg?: string; // base64 data URI da foto do Cristiano (opcional — fallback monograma)
}

function parseBRL(v: string): number {
  return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Paleta de cores ───────────────────────────────────────────────────────────
const C = {
  navy:     "#1E3757",
  navyDark: "#162B45",
  orange:   "#D98C45",
  white:    "#FFFFFF",
  offwhite: "#F8F7F4",
  dark:     "#1A1A2E",
  grayText: "#6B7280",
  grayLine: "#E5E7EB",
};

// ── Utilitários de layout ──────────────────────────────────────────────────────

function page(content: string, bg = C.white): string {
  return `<div style="
    width:794px; height:1123px;
    position:relative; overflow:hidden;
    page-break-after:always;
    background:${bg};
    font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
    -webkit-print-color-adjust:exact;
    print-color-adjust:exact;
  ">${content}</div>`;
}

/** Logo: usa imagem fornecida (já com fundo transparente) ou fallback tipográfico. */
function logoBlock(assets: TemplateAssets, height = 44): string {
  if (assets.logoImg) {
    return `<img src="${assets.logoImg}" style="
      height:${height}px; width:${height}px;
      object-fit:contain; display:block;
    " />`;
  }
  return `<div style="
    font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
    font-size:${Math.round(height * 0.72)}px;
    font-weight:900;
    color:${C.white};
    letter-spacing:-1px;
    line-height:1;
  ">Sindi<span style="color:${C.orange};">Fácil</span></div>
  <div style="
    font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
    font-size:9px; font-weight:700; color:${C.white};
    opacity:0.55; letter-spacing:2.5px; text-transform:uppercase; margin-top:5px;
  ">Síndico Profissional &amp; Administração</div>`;
}

// ── PÁGINA 1 — Capa ───────────────────────────────────────────────────────────

function coverPage(data: ProposalData, assets: TemplateAssets): string {
  const hasBg = !!assets.buildingBg;

  const bgLayer = hasBg
    ? `<!-- Foto de fundo -->
       <img src="${assets.buildingBg}" style="
         position:absolute; top:0; left:0;
         width:794px; height:1123px;
         object-fit:cover; object-position:center;
       "/>
       <!-- Overlay gradiente navy -->
       <div style="
         position:absolute; top:0; left:0; width:794px; height:1123px;
         background:linear-gradient(160deg, rgba(22,43,69,0.93) 0%, rgba(30,55,87,0.88) 60%, rgba(22,43,69,0.96) 100%);
       "></div>`
    : "";

  const content = `
    ${bgLayer}

    <!-- Accent stripe esquerda -->
    <div style="position:absolute; top:0; left:0; width:4px; height:1123px; background:${C.orange};"></div>

    <!-- Logo -->
    <div style="position:absolute; top:52px; left:0; right:0; display:flex; justify-content:center;">
      ${logoBlock(assets, 160)}
    </div>

    <!-- Separador horizontal tênue -->
    <div style="
      position:absolute; top:232px; left:56px; right:56px;
      height:1px; background:rgba(255,255,255,0.15);
    "></div>

    <!-- Hero text -->
    <div style="position:absolute; top:256px; left:56px; right:72px;">
      <div style="
        font-size:12px; font-weight:700; color:${C.orange};
        letter-spacing:4.5px; text-transform:uppercase; margin-bottom:16px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Proposta Comercial</div>

      <div style="
        font-family:'Playfair Display',Georgia,'Times New Roman',serif;
        font-size:56px; font-weight:700; color:${C.white};
        line-height:1.05; letter-spacing:-1px; margin-bottom:10px;
      ">Prestação de<br>Serviços</div>

      <div style="
        font-size:16px; font-weight:300; color:rgba(255,255,255,0.55);
        line-height:1.6; margin-top:18px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Administração e gestão condominial profissional<br>em Belo Horizonte.</div>
    </div>

    <!-- Card do cliente -->
    <div style="
      position:absolute; top:550px; left:56px; right:56px;
      border-left:3px solid ${C.orange};
      background:rgba(255,255,255,0.07);
      padding:26px 28px 24px;
    ">
      <div style="
        font-size:11px; font-weight:700; color:${C.orange};
        letter-spacing:3.5px; text-transform:uppercase; margin-bottom:12px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Destinatário</div>
      <div style="
        font-family:'Playfair Display',Georgia,'Times New Roman',serif;
        font-size:22px; font-weight:700; color:${C.white};
        line-height:1.3; margin-bottom:12px; text-transform:uppercase;
      ">${data.nomeCondominio}</div>
      <div style="
        font-size:15px; font-weight:300; color:rgba(255,255,255,0.65);
        line-height:1.9;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">
        ${data.endereco}${data.bairro ? ` — ${data.bairro}` : ""}<br>
        ${data.cidade}<br>
        Aos cuidados de ${data.responsavel}
      </div>
    </div>

    <!-- Número + data -->
    <div style="
      position:absolute; top:810px; left:56px; right:56px;
      display:flex; justify-content:space-between; align-items:flex-end;
    ">
      <div>
        <div style="
          font-size:11px; font-weight:700; color:${C.orange};
          letter-spacing:3px; text-transform:uppercase; margin-bottom:6px;
          font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
        ">Número</div>
        <div style="
          font-family:'Playfair Display',Georgia,'Times New Roman',serif;
          font-size:30px; font-weight:700; color:${C.white};
        ">Nº ${data.numero}</div>
      </div>
      <div style="text-align:right;">
        <div style="
          font-size:11px; font-weight:700; color:${C.orange};
          letter-spacing:3px; text-transform:uppercase; margin-bottom:6px;
          font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
        ">Emissão</div>
        <div style="
          font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
          font-size:22px; font-weight:700; color:${C.white};
        ">${data.data}</div>
      </div>
    </div>

    <!-- Tagline rodapé -->
    <div style="
      position:absolute; bottom:36px; left:0; right:0; text-align:center;
      font-size:11px; font-weight:300; color:rgba(255,255,255,0.22);
      letter-spacing:2px; font-style:italic;
      font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
    ">Gestão eficiente e fácil.</div>
  `;

  return page(content, C.navyDark);
}

// ── PÁGINA 2 — Sobre a SindiFácil ─────────────────────────────────────────────

function aboutPage(assets: TemplateAssets): string {
  const content = `
    <!-- Barra laranja topo -->
    <div style="position:absolute; top:0; left:0; width:794px; height:4px; background:${C.orange};"></div>

    <!-- Accent stripe esquerda -->
    <div style="position:absolute; top:0; left:0; width:4px; height:1123px; background:${C.navy};"></div>

    <!-- Conteúdo -->
    <div style="position:absolute; top:60px; left:56px; right:56px; bottom:60px;">

      <!-- Eyebrow -->
      <div style="
        font-size:11px; font-weight:700; color:${C.orange};
        letter-spacing:4px; text-transform:uppercase; margin-bottom:10px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Sobre a</div>

      <!-- Título -->
      <div style="
        font-family:'Playfair Display',Georgia,'Times New Roman',serif;
        font-size:48px; font-weight:700; color:${C.navy};
        line-height:1.0; letter-spacing:-1.5px; margin-bottom:26px;
      ">SindiFácil</div>

      <!-- Corpo -->
      <div style="
        font-size:15px; font-weight:400; color:${C.dark};
        line-height:1.85; margin-bottom:16px; max-width:600px;
      ">
        A SindiFácil apresenta aos seus clientes uma administração inclusiva e participativa.
        Sem nenhuma vaidade e de forma simples, buscamos sempre o que for de melhor para o seu condomínio.
        Gestão eficiente e fácil — assim surgiu a SindiFácil.
      </div>
      <div style="
        font-size:15px; font-weight:400; color:${C.dark};
        line-height:1.85; margin-bottom:34px; max-width:600px;
      ">
        Nosso objetivo é proporcionar tranquilidade, segurança e valorização patrimonial
        aos condomínios que administramos, com equilíbrio entre redução de custos e
        manutenção da qualidade dos serviços.
      </div>

      <!-- Separador pontilhado laranja -->
      <div style="border-top:2px dashed rgba(217,140,69,0.4); margin-bottom:30px;"></div>

      <!-- Bloco do fundador -->
      <div style="display:flex; align-items:flex-start; gap:22px;">
        <!-- Foto / Monograma -->
        ${assets.cristianoImg
          ? `<img src="${assets.cristianoImg}" style="
              width:90px; height:90px; border-radius:50%; flex-shrink:0;
              object-fit:cover; object-position:center 30%;
              border:3px solid ${C.orange};
            "/>`
          : `<div style="
              width:90px; height:90px; border-radius:50%;
              background:${C.navy}; flex-shrink:0;
              display:flex; align-items:center; justify-content:center;
              border:3px solid ${C.orange};
            ">
              <div style="
                font-family:'Playfair Display',Georgia,serif;
                font-size:28px; font-weight:700; color:${C.white};
              ">CD</div>
            </div>`
        }

        <div>
          <div style="
            font-family:'Playfair Display',Georgia,'Times New Roman',serif;
            font-size:20px; font-weight:700; color:${C.navy}; margin-bottom:4px;
          ">Cristiano Drumond</div>
          <div style="
            font-size:11px; font-weight:700; color:${C.orange};
            text-transform:uppercase; letter-spacing:2px; margin-bottom:16px;
            font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
          ">Fundador &amp; Síndico Profissional</div>

          <div style="font-size:14px; font-weight:400; color:${C.dark}; line-height:2.1;">
            <div>• Graduado em Administração de Empresas</div>
            <div>• Pós-graduado em Previdência Complementar</div>
            <div>• Certificação em Gestão Condominial — ASCOB</div>
            <div>• Programa de Desenvolvimento de Dirigentes — Fundação Dom Cabral</div>
            <div>• 20 anos de experiência no mercado financeiro e imobiliário</div>
            <div>• Fundador da SindiFácil desde fevereiro de 2020</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Número da página -->
    <div style="
      position:absolute; bottom:26px; right:38px;
      font-size:10px; font-weight:700; color:${C.grayText}; letter-spacing:1.5px;
      font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
    ">02</div>
  `;
  return page(content, C.white);
}

// ── PÁGINAS DE SERVIÇO (condicionais) ─────────────────────────────────────────

function servicePage(
  pageNum: number,
  letra: string,
  nomeHTML: string,
  itens: string[]
): string {
  const itensHTML = itens.map((item) => `
    <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:13px;">
      <div style="
        width:6px; height:6px; border-radius:50%;
        background:${C.orange}; flex-shrink:0; margin-top:7px;
      "></div>
      <div style="font-size:15px; font-weight:400; color:${C.dark}; line-height:1.65;">${item}</div>
    </div>
  `).join("");

  const pgStr = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;

  const content = `
    <!-- Header navy -->
    <div style="
      position:absolute; top:0; left:0; width:794px; height:248px;
      background:${C.navy};
    ">
      <div style="position:absolute; top:0; left:0; width:4px; height:248px; background:${C.orange};"></div>
      <div style="position:absolute; top:58px; left:56px; right:56px;">
        <div style="
          font-size:11px; font-weight:700; color:${C.orange};
          letter-spacing:4px; text-transform:uppercase; margin-bottom:12px;
          font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
        ">Serviço ${letra}</div>
        <div style="
          font-family:'Playfair Display',Georgia,'Times New Roman',serif;
          font-size:38px; font-weight:700; color:${C.white};
          line-height:1.1; letter-spacing:-1px;
        ">${nomeHTML}</div>
      </div>
      <div style="
        position:absolute; bottom:16px; right:38px;
        font-size:10px; font-weight:700; color:rgba(255,255,255,0.2); letter-spacing:1.5px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">${pgStr}</div>
    </div>

    <!-- Linha laranja divisória -->
    <div style="position:absolute; top:248px; left:0; right:0; height:3px; background:${C.orange};"></div>

    <!-- Conteúdo -->
    <div style="position:absolute; top:278px; left:56px; right:56px; bottom:56px; overflow:hidden;">
      <div style="
        font-size:11px; font-weight:700; color:${C.navy};
        letter-spacing:3px; text-transform:uppercase;
        border-bottom:1px solid ${C.grayLine}; padding-bottom:10px; margin-bottom:20px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">O que está incluso</div>
      ${itensHTML}
    </div>
  `;
  return page(content, C.offwhite);
}

// ── PÁGINA DE VALORES ─────────────────────────────────────────────────────────

function valoresPage(data: ProposalData, pageNum: number): string {
  const {
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

  const activeServicos = [
    { ativo: servicoA, valor: valorA, nome: "Síndico Profissional" },
    { ativo: servicoB, valor: valorB, nome: "Administração Financeira/Contábil" },
    { ativo: servicoC, valor: valorC, nome: "Apoio Operacional ao Síndico" },
  ].filter((s) => s.ativo);

  const rowsHTML = activeServicos.map((s, i) => `
    <div style="
      display:flex; justify-content:space-between; align-items:center;
      padding:14px 0;
      ${i < activeServicos.length - 1 ? `border-bottom:1px solid ${C.grayLine};` : ""}
    ">
      <div style="font-size:15px; font-weight:400; color:${C.dark};">${s.nome}</div>
      <div style="
        font-size:15px; font-weight:700; color:${C.navy};
        white-space:nowrap; margin-left:16px;
      ">R$ ${s.valor}</div>
    </div>
  `).join("");

  const bullet = (text: string) => `
    <div style="display:flex; align-items:flex-start; gap:12px; margin-bottom:11px;">
      <div style="
        width:6px; height:6px; border-radius:50%;
        background:${C.orange}; flex-shrink:0; margin-top:7px;
      "></div>
      <div style="font-size:15px; font-weight:400; color:${C.dark}; line-height:1.6;">${text}</div>
    </div>
  `;

  const pgStr = pageNum < 10 ? `0${pageNum}` : `${pageNum}`;

  const content = `
    <!-- Barra laranja topo -->
    <div style="position:absolute; top:0; left:0; width:794px; height:4px; background:${C.orange};"></div>
    <!-- Accent stripe esquerda -->
    <div style="position:absolute; top:0; left:0; width:4px; height:1123px; background:${C.navy};"></div>

    <div style="position:absolute; top:60px; left:56px; right:56px; bottom:60px;">

      <!-- Eyebrow + título -->
      <div style="
        font-size:11px; font-weight:700; color:${C.orange};
        letter-spacing:4px; text-transform:uppercase; margin-bottom:10px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Valores e Condições</div>
      <div style="
        font-family:'Playfair Display',Georgia,'Times New Roman',serif;
        font-size:44px; font-weight:700; color:${C.navy};
        line-height:1; letter-spacing:-1.5px; margin-bottom:30px;
      ">Sua Proposta</div>

      <!-- Tabela de serviços -->
      <div style="border-top:2px solid ${C.navy}; margin-bottom:0;">
        ${rowsHTML}
      </div>

      <!-- Bloco do total -->
      <div style="
        display:flex; justify-content:space-between; align-items:center;
        padding:18px 22px; background:${C.navy}; margin-top:0; margin-bottom:8px;
      ">
        <div style="
          font-size:13px; font-weight:700; color:rgba(255,255,255,0.7);
          text-transform:uppercase; letter-spacing:2px;
          font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
        ">Total Mensal</div>
        <div style="
          font-family:'Playfair Display',Georgia,'Times New Roman',serif;
          font-size:32px; font-weight:700; color:${C.white}; letter-spacing:-0.5px;
        ">R$ ${totalValor}</div>
      </div>
      <div style="
        font-size:13px; color:${C.grayText}; font-style:italic;
        text-align:right; margin-bottom:32px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">(${valorExtenso})</div>

      <!-- Condições -->
      <div style="
        font-size:11px; font-weight:700; color:${C.navy};
        letter-spacing:3px; text-transform:uppercase;
        padding-bottom:10px; margin-bottom:18px;
        border-bottom:2px solid ${C.orange};
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Condições Comerciais</div>

      ${bullet("Correção anual pelo IGPM ou INPC;")}
      ${bullet(horarioAtendimento + ";")}
      ${bullet(`Mínimo de ${minimoVisitas} visitas mensais;`)}
      ${bullet("Proposta válida por 30 dias a partir da data de emissão;")}
      ${bullet("<strong>Primeiro mês GRÁTIS</strong> se o contrato for assinado nos primeiros 10 dias após a emissão.")}
    </div>

    <div style="
      position:absolute; bottom:26px; right:38px;
      font-size:10px; font-weight:700; color:${C.grayText}; letter-spacing:1.5px;
      font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
    ">${pgStr}</div>
  `;
  return page(content, C.white);
}

// ── PÁGINA FINAL — Encerramento ───────────────────────────────────────────────

function closingPage(assets: TemplateAssets): string {
  const hasBg = !!assets.buildingBg;

  const bgLayer = hasBg
    ? `<img src="${assets.buildingBg}" style="
         position:absolute; top:0; left:0;
         width:794px; height:1123px;
         object-fit:cover; object-position:center;
       "/>
       <div style="
         position:absolute; top:0; left:0; width:794px; height:1123px;
         background:linear-gradient(180deg, rgba(22,43,69,0.95) 0%, rgba(30,55,87,0.90) 50%, rgba(22,43,69,0.97) 100%);
       "></div>`
    : "";

  const content = `
    ${bgLayer}

    <!-- Accent stripe esquerda -->
    <div style="position:absolute; top:0; left:0; width:4px; height:1123px; background:${C.orange};"></div>

    <!-- Conteúdo centralizado -->
    <div style="
      position:absolute; top:0; left:0; width:794px; height:1123px;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      text-align:center; padding:60px 80px;
    ">
      <!-- Logo -->
      <div style="margin-bottom:40px;">
        ${logoBlock(assets, 190)}
      </div>

      <!-- Mensagem -->
      <div style="
        font-size:18px; font-weight:300; color:rgba(255,255,255,0.80);
        line-height:1.8; max-width:440px; margin-bottom:48px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Ficamos à disposição para quaisquer<br>esclarecimentos adicionais.</div>

      <!-- Linha laranja curta -->
      <div style="width:48px; height:3px; background:${C.orange}; margin-bottom:48px;"></div>

      <!-- Telefone -->
      <div style="
        font-family:'Playfair Display',Georgia,'Times New Roman',serif;
        font-size:32px; font-weight:700; color:${C.orange};
        margin-bottom:16px;
      ">(31) 9 9969-7470</div>

      <!-- Redes sociais -->
      <div style="
        font-size:16px; font-weight:700; color:rgba(255,255,255,0.65);
        letter-spacing:0.5px; margin-bottom:8px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">@sindifacilmg</div>
      <div style="
        font-size:15px; font-weight:300; color:rgba(255,255,255,0.4);
        margin-bottom:60px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">sindifacilmg.com</div>

      <!-- Tagline -->
      <div style="
        font-size:11px; font-weight:300; color:rgba(255,255,255,0.22);
        font-style:italic; letter-spacing:2px;
        font-family:'Lato','Helvetica Neue',Helvetica,Arial,sans-serif;
      ">Gestão eficiente e fácil.</div>
    </div>
  `;
  return page(content, C.navyDark);
}

// ── MONTAGEM FINAL ────────────────────────────────────────────────────────────

export function generateProposalHTML(data: ProposalData, assets: TemplateAssets): string {
  const itensA = [
    "Convocar e presidir as Assembleias ordinárias e extraordinárias;",
    "Representar o condomínio ativa e passivamente, judicial e extrajudicialmente;",
    "Cumprir e fazer cumprir a Convenção, o Regimento Interno e as deliberações das assembleias;",
    "Diligenciar a conservação e guarda das partes comuns e zelar pela prestação dos serviços;",
    "Prestar contas à assembleia anualmente e quando exigido;",
    "Realizar mínimo de 4 (quatro) visitas mensais ao condomínio;",
    "Efetuar a leitura de gás e água, quando individualizados;",
    "Admitir, demitir e gerir funcionários próprios ou devolvê-los ao posto, quando terceirizados;",
    "Zelar pela qualidade da limpeza e conservação das áreas comuns;",
    "Realizar orçamentos, contratar e acompanhar os serviços de empresas prestadoras;",
    "Atendimento em dias úteis dentro do horário comercial;",
    "Plantão aos sábados, domingos e feriados para urgências e emergências;",
    "Gerenciar a cobrança de inadimplência (administrativa, extrajudicial e judicial);",
    "Manter o condomínio segurado.",
  ];

  const itensB = [
    "Controle financeiro mensal do condomínio;",
    "Emissão de boletos de cobrança das taxas condominiais;",
    "Pagamento de fornecedores e prestadores de serviço;",
    "Conciliação bancária mensal;",
    "Escrituração contábil;",
    "Elaboração de balancetes e relatórios financeiros;",
    "Prestação de contas mensal à administração.",
  ];

  const itensC = [
    "Levantamento e análise comparativa de orçamentos;",
    "Secretaria em assembleias presenciais e virtuais;",
    "Gestão operacional de demandas e solicitações dos condôminos;",
    "Suporte administrativo ao síndico;",
    "Acompanhamento de serviços e obras contratadas;",
    "Comunicação e intermediação com fornecedores.",
  ];

  let pgNum = 2;
  const pages: string[] = [];

  pages.push(coverPage(data, assets));  // pg 1
  pages.push(aboutPage(assets));        // pg 2

  if (data.servicoA) {
    pgNum++;
    pages.push(servicePage(pgNum, "A", "Síndico<br>Profissional", itensA));
  }
  if (data.servicoB) {
    pgNum++;
    pages.push(servicePage(pgNum, "B", "Administração<br>Financeira/Contábil", itensB));
  }
  if (data.servicoC) {
    pgNum++;
    pages.push(servicePage(pgNum, "C", "Apoio Operacional<br>ao Síndico", itensC));
  }

  pgNum++;
  pages.push(valoresPage(data, pgNum));

  pages.push(closingPage(assets));

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="generator" content="sindifacil-v3"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=Lato:wght@300;400;700;900&display=swap');
    @page { margin: 0; size: 794px 1123px; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 794px; background: #fff; }
  </style>
</head>
<body>
  ${pages.join("\n")}
</body>
</html>`;
}
