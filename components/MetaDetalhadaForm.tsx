
// components/MetaDetalhadaForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MetaDetalhada, TipoMetricaMeta, StatusMeta, DetalheMetricaMedidaCorporal, ToastType, AddToastFunction } from '../types';
import { TIPOS_METRICA_META_OPCOES, STATUS_META_OPCOES, DETALHE_METRICA_MEDIDA_CORPORAL_OPCOES } from '../constants';

interface MetaDetalhadaFormProps {
  metaInitial?: MetaDetalhada | null;
  onSubmit: (meta: MetaDetalhada) => void;
  onCancel: () => void;
  getProximoIdMetaDetalhada: () => Promise<string>;
  addToast: AddToastFunction;
}

const MetaDetalhadaForm: React.FC<MetaDetalhadaFormProps> = ({
  metaInitial,
  onSubmit,
  onCancel,
  getProximoIdMetaDetalhada,
  addToast,
}) => {
  const [descricao, setDescricao] = useState('');
  const [tipoMetrica, setTipoMetrica] = useState<TipoMetricaMeta>('Peso');
  const [detalheMetrica, setDetalheMetrica] = useState<string | DetalheMetricaMedidaCorporal>('');
  const [valorInicial, setValorInicial] = useState<number | ''>('');
  const [valorAtual, setValorAtual] = useState<number | ''>('');
  const [valorAlvo, setValorAlvo] = useState<number | ''>('');
  const [unidade, setUnidade] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataAlvo, setDataAlvo] = useState('');
  const [status, setStatus] = useState<StatusMeta>('Ativa');

  const valorAtualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (metaInitial) {
      setDescricao(metaInitial.descricao);
      setTipoMetrica(metaInitial.tipoMetrica);
      setDetalheMetrica(metaInitial.detalheMetrica || '');
      setValorInicial(metaInitial.valorInicial);
      setValorAtual(metaInitial.valorAtual); 
      setValorAlvo(metaInitial.valorAlvo);
      setUnidade(metaInitial.unidade || '');
      setDataInicio(metaInitial.dataInicio); 
      setDataAlvo(metaInitial.dataAlvo || ''); 
      setStatus(metaInitial.status);

      // Focus the 'valorAtual' input field when editing, especially if coming from a toast suggestion.
      if (valorAtualInputRef.current) {
          setTimeout(() => valorAtualInputRef.current?.focus(), 0); 
      }

    } else {
      // Valores padrão para nova meta
      const hoje = new Date().toISOString().split('T')[0];
      setDescricao('');
      setTipoMetrica('Peso');
      setDetalheMetrica('');
      setValorInicial('');
      setValorAtual('');
      setValorAlvo('');
      setUnidade('kg'); // Sugestão inicial
      setDataInicio(hoje);
      setDataAlvo('');
      setStatus('Ativa');
    }
  }, [metaInitial]);

  useEffect(() => {
    // Ajusta unidade sugerida e limpa detalhe da métrica ao mudar o tipo
    if (tipoMetrica === 'Peso') {
      setUnidade('kg');
      setDetalheMetrica('');
    } else if (tipoMetrica === '%Gordura') {
      setUnidade('%');
      setDetalheMetrica('');
    } else if (tipoMetrica === 'MedidaCorporal') {
      setUnidade('cm');
      // Não limpa detalheMetrica aqui para permitir seleção
    } else if (tipoMetrica === 'TempoDistancia') {
      setUnidade(''); // Deixa em branco para o usuário definir (min, km, m)
      setDetalheMetrica('');
    } else if (tipoMetrica === 'Performance') {
        setUnidade('kg'); // Default para carga, pode ser 'reps', 's', etc.
        // DetalheMetrica será o nome do exercício
    } else { // Outro
      setUnidade('');
      setDetalheMetrica('');
    }
  }, [tipoMetrica]);

  const handleTipoMetricaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const novoTipo = e.target.value as TipoMetricaMeta;
    setTipoMetrica(novoTipo);
    if (novoTipo !== 'MedidaCorporal' && novoTipo !== 'Performance') {
        setDetalheMetrica('');
    } else if (novoTipo === 'MedidaCorporal') {
        setDetalheMetrica(DETALHE_METRICA_MEDIDA_CORPORAL_OPCOES[0]?.value || ''); 
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim() || valorInicial === '' || valorAlvo === '' || !dataInicio) {
      addToast('Descrição, Valores (Inicial, Alvo) e Data de Início são obrigatórios.', 'error');
      return;
    }
    if (valorAtual === '') {
        addToast('O Valor Atual é obrigatório. Se for o início da meta, pode ser igual ao Valor Inicial.', 'error');
        return;
    }
    if (tipoMetrica === 'MedidaCorporal' && !detalheMetrica) {
        addToast('Para "Medida Corporal", o Detalhe da Métrica é obrigatório.', 'error');
        return;
    }
     if (tipoMetrica === 'Performance' && !detalheMetrica.trim()) {
        addToast('Para "Performance", o Detalhe da Métrica (nome do exercício/movimento) é obrigatório.', 'error');
        return;
    }

    const finalId = metaInitial?.id || await getProximoIdMetaDetalhada();
    onSubmit({
      id: finalId,
      descricao: descricao.trim(),
      tipoMetrica,
      detalheMetrica: detalheMetrica || undefined,
      valorInicial: Number(valorInicial),
      valorAtual: Number(valorAtual),
      valorAlvo: Number(valorAlvo),
      unidade: unidade.trim() || undefined,
      dataInicio, 
      dataAlvo: dataAlvo || undefined, 
      status,
      historicoAtualizacoes: metaInitial?.historicoAtualizacoes || [], 
    });
  };

  const inputNumberProps = { type: "number", step: "any", className: "w-full input-base" };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-700 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-white">
        {metaInitial ? 'Editar Meta Detalhada' : 'Nova Meta Detalhada'}
      </h3>
      <div>
        <label htmlFor="metaDescricao" className="block text-sm font-medium text-slate-300 mb-1">Descrição da Meta *</label>
        <input type="text" id="metaDescricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="w-full input-base" placeholder="Ex: Reduzir circunferência abdominal" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="metaTipoMetrica" className="block text-sm font-medium text-slate-300 mb-1">Tipo de Métrica *</label>
          <select id="metaTipoMetrica" value={tipoMetrica} onChange={handleTipoMetricaChange} required className="w-full input-base">
            {TIPOS_METRICA_META_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        {tipoMetrica === 'MedidaCorporal' && (
          <div>
            <label htmlFor="metaDetalheMedida" className="block text-sm font-medium text-slate-300 mb-1">Detalhe da Medida Corporal *</label>
            <select id="metaDetalheMedida" value={detalheMetrica} onChange={(e) => setDetalheMetrica(e.target.value as DetalheMetricaMedidaCorporal)} required className="w-full input-base">
              <option value="">Selecione...</option>
              {DETALHE_METRICA_MEDIDA_CORPORAL_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        )}
        {tipoMetrica === 'Performance' && (
             <div>
                <label htmlFor="metaDetalhePerformance" className="block text-sm font-medium text-slate-300 mb-1">Detalhe da Performance (Exercício) *</label>
                <input type="text" id="metaDetalhePerformance" value={detalheMetrica} onChange={(e) => setDetalheMetrica(e.target.value)} required className="w-full input-base" placeholder="Ex: Supino Reto, Corrida 5km"/>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="metaValorInicial" className="block text-sm font-medium text-slate-300 mb-1">Valor Inicial *</label>
          <input id="metaValorInicial" value={valorInicial} onChange={(e) => setValorInicial(e.target.value === '' ? '' : Number(e.target.value))} required {...inputNumberProps} />
        </div>
        <div>
          <label htmlFor="metaValorAtual" className="block text-sm font-medium text-slate-300 mb-1">Valor Atual *</label>
          <input 
            id="metaValorAtual" 
            value={valorAtual} 
            onChange={(e) => setValorAtual(e.target.value === '' ? '' : Number(e.target.value))} 
            required 
            {...inputNumberProps}
            ref={valorAtualInputRef}
          />
        </div>
        <div>
          <label htmlFor="metaValorAlvo" className="block text-sm font-medium text-slate-300 mb-1">Valor Alvo *</label>
          <input id="metaValorAlvo" value={valorAlvo} onChange={(e) => setValorAlvo(e.target.value === '' ? '' : Number(e.target.value))} required {...inputNumberProps} />
        </div>
      </div>

      <div>
        <label htmlFor="metaUnidade" className="block text-sm font-medium text-slate-300 mb-1">Unidade (Ex: kg, cm, min, reps)</label>
        <input type="text" id="metaUnidade" value={unidade} onChange={(e) => setUnidade(e.target.value)} className="w-full input-base" placeholder="kg, cm, min, reps, etc."/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="metaDataInicio" className="block text-sm font-medium text-slate-300 mb-1">Data de Início *</label>
          <input type="date" id="metaDataInicio" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required className="w-full input-base" />
        </div>
        <div>
          <label htmlFor="metaDataAlvo" className="block text-sm font-medium text-slate-300 mb-1">Data Alvo (Opcional)</label>
          <input type="date" id="metaDataAlvo" value={dataAlvo} onChange={(e) => setDataAlvo(e.target.value)} className="w-full input-base" />
        </div>
      </div>

      <div>
        <label htmlFor="metaStatus" className="block text-sm font-medium text-slate-300 mb-1">Status da Meta *</label>
        <select id="metaStatus" value={status} onChange={(e) => setStatus(e.target.value as StatusMeta)} required className="w-full input-base">
          {STATUS_META_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      <div className="flex justify-end space-x-2 pt-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary">Salvar Meta</button>
      </div>
    </form>
  );
};

export default MetaDetalhadaForm;
