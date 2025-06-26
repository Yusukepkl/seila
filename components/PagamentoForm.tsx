
// components/PagamentoForm.tsx
import React, { useState, useEffect } from 'react';
import { Pagamento, StatusPagamentoOpcoes, ToastType } from '../types';
import { STATUS_PAGAMENTO_OPCOES } from '../constants';

interface PagamentoFormProps {
  pagamentoInitial?: Pagamento | null;
  onSubmit: (pagamento: Pagamento) => void;
  onCancel: () => void;
  getProximoIdPagamento: () => Promise<string>;
  addToast: (message: string, type?: ToastType) => void;
}

const formatarDataParaInputDate = (dataISOouInput?: string): string => {
    if (!dataISOouInput) return new Date().toISOString().split('T')[0];
    try {
      const date = new Date(dataISOouInput);
      if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
      // Se já for YYYY-MM-DD
      if (dataISOouInput.length === 10 && dataISOouInput.indexOf('T') === -1 && dataISOouInput.indexOf('/') === -1) {
          const [year, month, day] = dataISOouInput.split('-').map(Number);
          return new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
      }
      // Se for DD/MM/YYYY
      if (dataISOouInput.includes('/')) {
          const parts = dataISOouInput.split('/');
          if (parts.length === 3) {
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) -1;
              const year = parseInt(parts[2], 10);
              if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                   return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
              }
          }
      }
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
};

const PagamentoForm: React.FC<PagamentoFormProps> = ({
  pagamentoInitial,
  onSubmit,
  onCancel,
  getProximoIdPagamento,
  addToast,
}) => {
  const [data, setData] = useState('');
  const [valor, setValor] = useState<number | ''>('');
  const [status, setStatus] = useState<StatusPagamentoOpcoes>('Pendente');
  const [descricao, setDescricao] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');

  useEffect(() => {
    if (pagamentoInitial) {
      setData(formatarDataParaInputDate(pagamentoInitial.data));
      setValor(pagamentoInitial.valor);
      setStatus(pagamentoInitial.status);
      setDescricao(pagamentoInitial.descricao || '');
      setDataVencimento(pagamentoInitial.dataVencimento ? formatarDataParaInputDate(pagamentoInitial.dataVencimento) : '');
    } else {
      setData(formatarDataParaInputDate());
      setValor('');
      setStatus('Pendente');
      setDescricao('');
      setDataVencimento('');
    }
  }, [pagamentoInitial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || valor === '' || Number(valor) <= 0) {
      addToast('Data e Valor (positivo) são obrigatórios para o pagamento.', 'error');
      return;
    }
    const finalId = pagamentoInitial?.id || await getProximoIdPagamento();
    onSubmit({
      id: finalId,
      data,
      valor: Number(valor),
      status,
      descricao: descricao.trim() || undefined,
      dataVencimento: dataVencimento || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-700 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-white">
        {pagamentoInitial ? 'Editar Pagamento' : 'Novo Pagamento'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pagamentoData" className="block text-sm font-medium text-slate-300 mb-1">Data do Pagamento *</label>
          <input
            type="date"
            id="pagamentoData"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="w-full input-base"
          />
        </div>
        <div>
          <label htmlFor="pagamentoValor" className="block text-sm font-medium text-slate-300 mb-1">Valor (R$) *</label>
          <input
            type="number"
            id="pagamentoValor"
            value={valor}
            onChange={(e) => setValor(e.target.value === '' ? '' : parseFloat(e.target.value))}
            min="0.01"
            step="0.01"
            required
            className="w-full input-base"
            placeholder="Ex: 150.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pagamentoStatus" className="block text-sm font-medium text-slate-300 mb-1">Status *</label>
          <select
            id="pagamentoStatus"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusPagamentoOpcoes)}
            required
            className="w-full input-base"
          >
            {STATUS_PAGAMENTO_OPCOES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="pagamentoDataVencimento" className="block text-sm font-medium text-slate-300 mb-1">Data de Vencimento (Opcional)</label>
          <input
            type="date"
            id="pagamentoDataVencimento"
            value={dataVencimento}
            onChange={(e) => setDataVencimento(e.target.value)}
            className="w-full input-base"
          />
        </div>
      </div>

      <div>
        <label htmlFor="pagamentoDescricao" className="block text-sm font-medium text-slate-300 mb-1">Descrição (Opcional)</label>
        <textarea
          id="pagamentoDescricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={3}
          className="w-full input-base"
          placeholder="Ex: Mensalidade Agosto, Avaliação Física"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary">Salvar Pagamento</button>
      </div>
    </form>
  );
};

export default PagamentoForm;
