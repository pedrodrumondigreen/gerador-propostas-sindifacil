"use client";

import { useState } from "react";
import { useForm, useWatch, Controller, UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z
  .object({
    numero: z.string().min(1, "Número da proposta é obrigatório"),
    data: z.string().min(1, "Data é obrigatória"),
    nomeCondominio: z.string().min(1, "Nome do condomínio é obrigatório"),
    endereco: z.string().min(1, "Endereço é obrigatório"),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    responsavel: z.string().min(1, "Responsável é obrigatório"),
    servicoA: z.boolean(),
    valorA: z.string().optional(),
    servicoB: z.boolean(),
    valorB: z.string().optional(),
    servicoC: z.boolean(),
    valorC: z.string().optional(),
    valorExtenso: z.string().min(1, "Valor por extenso é obrigatório"),
    correcaoAnual: z.string().min(1, "Correção anual é obrigatória"),
    horarioAtendimento: z.string().min(1, "Horário de atendimento é obrigatório"),
    minimoVisitas: z.string().min(1, "Mínimo de visitas é obrigatório"),
    plantao: z.boolean(),
    valorPlantao: z.string().optional(),
    cortesias: z.string().optional(),
  })
  .refine((d) => d.servicoA || d.servicoB || d.servicoC, {
    message: "Selecione pelo menos um serviço",
    path: ["servicoA"],
  })
  .refine((d) => !d.servicoA || !!d.valorA, {
    message: "Informe o valor do Síndico Profissional",
    path: ["valorA"],
  })
  .refine((d) => !d.servicoB || !!d.valorB, {
    message: "Informe o valor da Administração financeira/contábil",
    path: ["valorB"],
  })
  .refine((d) => !d.servicoC || !!d.valorC, {
    message: "Informe o valor do Apoio operacional",
    path: ["valorC"],
  })
  .refine((d) => !d.plantao || !!d.valorPlantao, {
    message: "Informe o valor por acionamento do plantão",
    path: ["valorPlantao"],
  });

type FormData = z.infer<typeof schema>;

function todayFormatted(): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, "0");
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const y = now.getFullYear();
  return `${d}/${m}/${y}`;
}

function parseBRL(v: string): number {
  return parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0;
}

function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ProposalForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      data: todayFormatted(),
      cidade: "Belo Horizonte/MG",
      correcaoAnual: "IGPM ou INPC",
      horarioAtendimento: "Atendimento nos dias úteis, de 9 às 12h e de 13 às 17h",
      minimoVisitas: "4 (quatro)",
      servicoA: false,
      servicoB: false,
      servicoC: false,
      plantao: false,
    },
  });

  const [servicoA, servicoB, servicoC, valorA, valorB, valorC, plantao, valorPlantao] = useWatch({
    control,
    name: ["servicoA", "servicoB", "servicoC", "valorA", "valorB", "valorC", "plantao", "valorPlantao"],
  });

  const total = formatBRL(
    (servicoA && valorA ? parseBRL(valorA) : 0) +
    (servicoB && valorB ? parseBRL(valorB) : 0) +
    (servicoC && valorC ? parseBRL(valorC) : 0) +
    (plantao && valorPlantao ? parseBRL(valorPlantao) : 0)
  );

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/gerar-proposta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao gerar proposta");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposta-${data.numero.replace("/", "-")}-${data.nomeCondominio.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── IDENTIFICAÇÃO DA PROPOSTA ── */}
      <section>
        <h2 className="text-sm font-bold text-[#1C2D4E] uppercase tracking-widest mb-4 pb-2 border-b border-[#1C2D4E]/10">
          Identificação da Proposta
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Número da Proposta" error={errors.numero?.message}>
            <input
              {...register("numero")}
              placeholder="ex: 027/2026"
              className={inputClass(!!errors.numero)}
            />
          </Field>
          <Field label="Data da Proposta" error={errors.data?.message}>
            <input
              {...register("data")}
              placeholder="DD/MM/AAAA"
              className={inputClass(!!errors.data)}
            />
          </Field>
        </div>
      </section>

      {/* ── DADOS DO CONDOMÍNIO ── */}
      <section>
        <h2 className="text-sm font-bold text-[#1C2D4E] uppercase tracking-widest mb-4 pb-2 border-b border-[#1C2D4E]/10">
          Dados do Condomínio
        </h2>
        <div className="space-y-4">
          <Field label="Nome do Condomínio" error={errors.nomeCondominio?.message}>
            <input
              {...register("nomeCondominio")}
              placeholder="ex: Condomínio Ed. Turquesa"
              className={inputClass(!!errors.nomeCondominio)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Endereço (Rua e número)" error={errors.endereco?.message}>
              <input
                {...register("endereco")}
                placeholder="ex: Rua das Flores, 150"
                className={inputClass(!!errors.endereco)}
              />
            </Field>
            <Field label="Bairro" error={errors.bairro?.message}>
              <input
                {...register("bairro")}
                placeholder="ex: Bairro São Lucas"
                className={inputClass(!!errors.bairro)}
              />
            </Field>
          </div>
          <Field label="Cidade/Estado" error={errors.cidade?.message}>
            <input
              {...register("cidade")}
              className={inputClass(!!errors.cidade)}
            />
          </Field>
          <Field label="Responsável (Aos cuidados de)" error={errors.responsavel?.message}>
            <input
              {...register("responsavel")}
              placeholder="ex: Sr. João Silva"
              className={inputClass(!!errors.responsavel)}
            />
          </Field>
        </div>
      </section>

      {/* ── SERVIÇOS CONTRATADOS ── */}
      <section>
        <h2 className="text-sm font-bold text-[#1C2D4E] uppercase tracking-widest mb-4 pb-2 border-b border-[#1C2D4E]/10">
          Serviços Contratados
        </h2>
        {errors.servicoA?.message && (
          <p className="mb-3 text-xs text-red-600">{errors.servicoA.message}</p>
        )}
        <div className="space-y-3">
          <ServicoCard
            letra="A"
            nome="Síndico Profissional"
            descricao="Representação legal, convocação de assembleias, gestão das áreas comuns e prestação de contas aos condôminos."
            checked={!!servicoA}
            checkboxProps={register("servicoA")}
            valorProps={register("valorA")}
            valorError={errors.valorA?.message}
            mostrarValor={!!servicoA}
          />
          <ServicoCard
            letra="B"
            nome="Administração financeira/contábil"
            descricao="Controle financeiro, emissão de boletos, pagamentos, conciliação bancária e escrituração contábil."
            checked={!!servicoB}
            checkboxProps={register("servicoB")}
            valorProps={register("valorB")}
            valorError={errors.valorB?.message}
            mostrarValor={!!servicoB}
          />
          <ServicoCard
            letra="C"
            nome="Apoio operacional ao síndico"
            descricao="Suporte operacional ao síndico: orçamentos, secretaria em assembleias virtuais e gestão dos bastidores."
            checked={!!servicoC}
            checkboxProps={register("servicoC")}
            valorProps={register("valorC")}
            valorError={errors.valorC?.message}
            mostrarValor={!!servicoC}
          />
        </div>

        {/* Total */}
        {(servicoA || servicoB || servicoC) && (
          <div className="mt-4 flex items-center justify-between bg-[#1C2D4E] rounded-lg px-5 py-3">
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
              Valor Total Mensal
            </span>
            <span className="text-lg font-bold text-white">
              R$ {total}
            </span>
          </div>
        )}
      </section>

      {/* ── CONDIÇÕES COMERCIAIS ── */}
      <section>
        <h2 className="text-sm font-bold text-[#1C2D4E] uppercase tracking-widest mb-4 pb-2 border-b border-[#1C2D4E]/10">
          Condições Comerciais
        </h2>
        <div className="space-y-4">
          <Field label="Valor Total por Extenso" error={errors.valorExtenso?.message}>
            <input
              {...register("valorExtenso")}
              placeholder="ex: um mil e trezentos reais"
              className={inputClass(!!errors.valorExtenso)}
            />
          </Field>
          <Field label="Correção Anual" error={errors.correcaoAnual?.message}>
            <input
              {...register("correcaoAnual")}
              placeholder="ex: IGPM ou INPC"
              className={inputClass(!!errors.correcaoAnual)}
            />
          </Field>
          <Field label="Horário de Atendimento" error={errors.horarioAtendimento?.message}>
            <input
              {...register("horarioAtendimento")}
              className={inputClass(!!errors.horarioAtendimento)}
            />
          </Field>
          <Field label="Mínimo de Visitas Mensais" error={errors.minimoVisitas?.message}>
            <input
              {...register("minimoVisitas")}
              className={inputClass(!!errors.minimoVisitas)}
            />
          </Field>
        </div>
      </section>

      {/* ── PLANTÃO ── */}
      <section>
        <h2 className="text-sm font-bold text-[#1C2D4E] uppercase tracking-widest mb-4 pb-2 border-b border-[#1C2D4E]/10">
          Plantão
        </h2>
        <div className="space-y-4">
          <Controller
            name="plantao"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold text-[#1C2D4E]">Inclui plantão?</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={field.value === true}
                    onChange={() => field.onChange(true)}
                    className="h-4 w-4 accent-[#D98C45]"
                  />
                  <span className="text-sm text-gray-700">Sim</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={field.value === false}
                    onChange={() => field.onChange(false)}
                    className="h-4 w-4 accent-[#D98C45]"
                  />
                  <span className="text-sm text-gray-700">Não</span>
                </label>
              </div>
            )}
          />
          {plantao && (
            <Field label="Valor por acionamento (R$)" error={errors.valorPlantao?.message}>
              <input
                {...register("valorPlantao")}
                placeholder="ex: 100,00"
                className={inputClass(!!errors.valorPlantao)}
              />
            </Field>
          )}
        </div>
      </section>

      {/* ── CORTESIAS ── */}
      <section>
        <h2 className="text-sm font-bold text-[#1C2D4E] uppercase tracking-widest mb-4 pb-2 border-b border-[#1C2D4E]/10">
          Cortesias
        </h2>
        <Field label="Cortesias oferecidas (opcional — uma por linha)">
          <textarea
            {...register("cortesias")}
            rows={4}
            placeholder={"ex: Primeiro mês de assessoria jurídica gratuita\nReunião de apresentação presencial sem custo"}
            className={`${inputClass(false)} resize-none leading-relaxed`}
          />
        </Field>
      </section>

      {/* ── FEEDBACK ── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          Proposta gerada com sucesso! O download iniciou automaticamente.
        </div>
      )}

      {/* ── SUBMIT ── */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#D98C45] hover:bg-[#c27b38] disabled:bg-[#D98C45]/50 text-white font-bold text-base uppercase tracking-widest py-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Gerando PDF...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Gerar Proposta PDF
          </>
        )}
      </button>
    </form>
  );
}

function ServicoCard({
  letra,
  nome,
  descricao,
  checked,
  checkboxProps,
  valorProps,
  valorError,
  mostrarValor,
}: {
  letra: string;
  nome: string;
  descricao: string;
  checked: boolean;
  checkboxProps: UseFormRegisterReturn;
  valorProps: UseFormRegisterReturn;
  valorError?: string;
  mostrarValor: boolean;
}) {
  return (
    <div className={`rounded-lg border transition-colors duration-150 ${checked ? "border-[#D98C45] bg-[#FDF6EE]" : "border-gray-200 bg-white"}`}>
      <label className="flex items-start gap-3 p-4 cursor-pointer">
        <input
          type="checkbox"
          {...checkboxProps}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#D98C45] focus:ring-[#D98C45]/30 cursor-pointer"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1C2D4E] text-white text-xs font-bold">
              {letra}
            </span>
            <span className="text-sm font-semibold text-[#1C2D4E]">{nome}</span>
          </div>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">{descricao}</p>
        </div>
      </label>
      {mostrarValor && (
        <div className="px-4 pb-4 pt-0">
          <Field label={`Valor mensal — Opção ${letra} (R$)`} error={valorError}>
            <input
              {...valorProps}
              placeholder="ex: 1.000,00"
              className={inputClass(!!valorError)}
            />
          </Field>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#1C2D4E] mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full px-4 py-2.5 rounded-lg border text-sm text-gray-800 bg-white",
    "focus:outline-none focus:ring-2 transition-colors",
    hasError
      ? "border-red-300 focus:ring-red-200"
      : "border-gray-200 focus:border-[#D98C45] focus:ring-[#D98C45]/20",
  ].join(" ");
}
