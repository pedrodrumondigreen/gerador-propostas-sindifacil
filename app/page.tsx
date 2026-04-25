import ProposalForm from "@/components/ProposalForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F4F6FA]">
      {/* Header */}
      <header className="bg-[#1C2D4E] text-white py-5 px-6 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <img
            src="/assets/logo2.png"
            alt="SindiFácil"
            className="h-14 w-14 object-contain"
          />
          <div className="border-l border-white/20 pl-4">
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
