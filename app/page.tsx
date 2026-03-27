import ProposalForm from "@/components/ProposalForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <header className="bg-[#1C2D4E] text-white py-5 px-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="14" width="28" height="24" stroke="#D98C45" strokeWidth="2"/>
            <rect x="13" y="19" width="5" height="5" fill="#D98C45" opacity="0.8"/>
            <rect x="26" y="19" width="5" height="5" fill="#D98C45" opacity="0.8"/>
            <rect x="13" y="27" width="5" height="5" fill="#D98C45" opacity="0.5"/>
            <rect x="26" y="27" width="5" height="5" fill="#D98C45" opacity="0.5"/>
            <rect x="19" y="28" width="6" height="10" fill="#D98C45"/>
            <polygon points="22,4 5,14 39,14" stroke="#D98C45" strokeWidth="2"/>
          </svg>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold text-[#D98C45]">Sindi</span>
              <span className="text-xl font-bold text-white">Fácil</span>
            </div>
            <p className="text-xs text-white/50 uppercase tracking-widest">Gerador de Propostas</p>
          </div>
        </div>
      </header>

      {/* Card do formulário */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1C2D4E]">Nova Proposta Comercial</h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados abaixo para gerar o PDF da proposta automaticamente.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <ProposalForm />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SindiFácil — Gestão eficiente e fácil
        </p>
      </div>
    </main>
  );
}
