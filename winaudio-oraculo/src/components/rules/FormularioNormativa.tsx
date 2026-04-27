'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import type { NormativaSecoes } from '@/types';

interface FormularioNormativaProps {
  secoes: NormativaSecoes;
  onChange: (secoes: NormativaSecoes) => void;
  codigoWn: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  onVigenciaInicioChange: (v: string) => void;
  onVigenciaFimChange: (v: string) => void;
}

interface SecaoProps {
  numero: string;
  titulo: string;
  descricao: string;
  valor: string;
  onChange: (v: string) => void;
  obrigatoria?: boolean;
  placeholder: string;
  linhas?: number;
}

function Secao({ numero, titulo, descricao, valor, onChange, obrigatoria = true, placeholder, linhas = 4 }: SecaoProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            {numero}. {titulo}
            {obrigatoria && <span className="text-[var(--color-error)] ml-1">*</span>}
          </label>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{descricao}</p>
        </div>
        {!obrigatoria && (
          <span className="text-xs text-[var(--color-text-light)] bg-[var(--color-bg-muted)] px-2 py-0.5 rounded-full flex-shrink-0">
            Opcional
          </span>
        )}
      </div>
      <textarea
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        required={obrigatoria}
        rows={linhas}
        placeholder={placeholder}
        className="w-full border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] resize-y"
      />
    </div>
  );
}

export function montarHtmlNormativa(titulo: string, codigoWn: string, setor: string, vigenciaInicio: string, vigenciaFim: string, secoes: NormativaSecoes): string {
  const formatarData = (d: string) => d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';
  const vigencia = vigenciaFim
    ? `${formatarData(vigenciaInicio)} até ${formatarData(vigenciaFim)}`
    : `A partir de ${formatarData(vigenciaInicio)}`;

  const linhaParaHtml = (texto: string) =>
    texto.split('\n').filter(l => l.trim()).map(l => `<p>${l.trim()}</p>`).join('');

  return `
<p><strong>Código:</strong> ${codigoWn} &nbsp;|&nbsp; <strong>Setor:</strong> ${setor} &nbsp;|&nbsp; <strong>Vigência:</strong> ${vigencia}</p>
<hr/>
<h2>1. Objetivo</h2>
${linhaParaHtml(secoes.objetivo)}
<h2>2. Passo a Passo Obrigatório</h2>
${linhaParaHtml(secoes.passo_a_passo)}
<h2>3. Regras de Negócio e Restrições</h2>
${linhaParaHtml(secoes.regras_restricoes)}
${secoes.procedimento_tecnico.trim() ? `<h2>4. Procedimento Técnico</h2>${linhaParaHtml(secoes.procedimento_tecnico)}` : ''}
${secoes.checklist_finalizacao.trim() ? `<h2>5. Checklist de Finalização</h2>${linhaParaHtml(secoes.checklist_finalizacao)}` : ''}
<h2>6. Consequências do Descumprimento</h2>
${linhaParaHtml(secoes.consequencias)}
`.trim();
}

export function htmlParaSecoes(html: string): NormativaSecoes {
  const extrair = (de: number, ate: number | null, texto: string): string => {
    const regex = ate
      ? new RegExp(`<h2>${de}\\.[^<]*<\\/h2>([\\s\\S]*?)<h2>${ate}\\.`, 'i')
      : new RegExp(`<h2>${de}\\.[^<]*<\\/h2>([\\s\\S]*)$`, 'i');
    const match = texto.match(regex);
    if (!match) return '';
    return match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return {
    objetivo: extrair(1, 2, html),
    passo_a_passo: extrair(2, 3, html),
    regras_restricoes: extrair(3, 4, html),
    procedimento_tecnico: extrair(4, 5, html),
    checklist_finalizacao: extrair(5, 6, html),
    consequencias: extrair(6, null, html),
  };
}

export function FormularioNormativa({
  secoes,
  onChange,
  codigoWn,
  vigenciaInicio,
  vigenciaFim,
  onVigenciaInicioChange,
  onVigenciaFimChange,
}: FormularioNormativaProps) {
  const set = (campo: keyof NormativaSecoes) => (valor: string) =>
    onChange({ ...secoes, [campo]: valor });

  return (
    <div className="space-y-6">
      {/* Cabeçalho da normativa */}
      <div className="bg-[var(--color-bg-muted)] rounded-xl px-4 py-3 flex items-center gap-3">
        <Info size={16} className="text-[var(--color-primary)] flex-shrink-0" />
        <div className="flex items-center gap-4 flex-wrap text-sm">
          <span>
            <span className="text-[var(--color-text-muted)]">Código: </span>
            <span className="font-bold text-[var(--color-primary)]">{codigoWn || 'Selecione o setor'}</span>
          </span>
          <span className="text-[var(--color-border)]">|</span>
          <span>
            <span className="text-[var(--color-text-muted)]">Gerado automaticamente após salvar</span>
          </span>
        </div>
      </div>

      {/* Vigência */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            Vigência — Início <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="date"
            required
            value={vigenciaInicio}
            onChange={(e) => onVigenciaInicioChange(e.target.value)}
            className="w-full border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-[var(--color-text-primary)]">
            Vigência — Fim
            <span className="text-xs font-normal text-[var(--color-text-light)] ml-2">(opcional — deixe vazio se indeterminado)</span>
          </label>
          <input
            type="date"
            value={vigenciaFim}
            min={vigenciaInicio}
            onChange={(e) => onVigenciaFimChange(e.target.value)}
            className="w-full border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] pt-6 space-y-6">
        <Secao
          numero="1" titulo="Objetivo" obrigatoria
          descricao="Breve resumo de uma frase sobre o que esta norma busca garantir."
          placeholder="Ex: Garantir que todas as vendas sejam realizadas somente após confirmação documental do cliente."
          valor={secoes.objetivo} onChange={set('objetivo')} linhas={2}
        />
        <Secao
          numero="2" titulo="Passo a Passo Obrigatório" obrigatoria
          descricao="Descreva as ações obrigatórias, prazos e formatos. Use uma linha por item."
          placeholder={"Ação Obrigatória: ...\nPrazo/Momento: ...\nFormato: ..."}
          valor={secoes.passo_a_passo} onChange={set('passo_a_passo')} linhas={5}
        />
        <Secao
          numero="3" titulo="Regras de Negócio e Restrições" obrigatoria
          descricao="Destaque o que NÃO pode acontecer e as infrações mais graves."
          placeholder={"ATENÇÃO: É expressamente proibido...\nInfração Gravíssima: ..."}
          valor={secoes.regras_restricoes} onChange={set('regras_restricoes')} linhas={4}
        />
        <Secao
          numero="4" titulo="Procedimento Técnico" obrigatoria={false}
          descricao="Para casos de suporte, migração ou sistemas. Checklist, execução e validação."
          placeholder={"1. Checklist de Início: ...\n2. Execução: ...\n3. Validação Final: ..."}
          valor={secoes.procedimento_tecnico} onChange={set('procedimento_tecnico')} linhas={4}
        />
        <Secao
          numero="5" titulo="Checklist de Finalização" obrigatoria={false}
          descricao="Lista de verificação a ser concluída ao fim do processo."
          placeholder={"[ ] Item 1\n[ ] Item 2"}
          valor={secoes.checklist_finalizacao} onChange={set('checklist_finalizacao')} linhas={3}
        />
        <Secao
          numero="6" titulo="Consequências do Descumprimento" obrigatoria
          descricao="Transparência sobre as medidas disciplinares aplicáveis."
          placeholder={"O não cumprimento pode resultar em advertências formais...\nA reincidência levará a ações corretivas mais rigorosas."}
          valor={secoes.consequencias} onChange={set('consequencias')} linhas={3}
        />
      </div>
    </div>
  );
}
