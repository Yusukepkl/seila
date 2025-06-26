// components/ObjetivoModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Objetivo, ToastType } from '../types';

interface ObjetivoModalProps {
  visivel: boolean;
  aoFechar: () => void;
  aoSalvar: (objetivo: Objetivo | Omit<Objetivo, 'id'>) => void; // Can be partial for new items
  objetivoExistente?: Objetivo | null;
  addToast: (message: string, type?: ToastType) => void;
}

const ObjetivoModal: React.FC<ObjetivoModalProps> = ({
  visivel,
  aoFechar,
  aoSalvar,
  objetivoExistente,
  addToast,
}) => {
  const [nome, setNome] = useState('');
  const [valorAtual, setValorAtual] = useState<number | ''>('');
  const [valorMeta, setValorMeta] = useState<number | ''>('');
  const [unidade, setUnidade] = useState('');

  useEffect(() => {
    if (visivel) {
      if (objetivoExistente) {
        setNome(objetivoExistente.nome);
        setValorAtual(objetivoExistente.valorAtual);
        setValorMeta(objetivoExistente.valorMeta);
        setUnidade(objetivoExistente.unidade || '');
      } else {
        setNome('');
        setValorAtual(0);
        setValorMeta(10); // Default
        setUnidade('');
      }
    }
  }, [visivel, objetivoExistente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim() === '' || valorAtual === '' || valorMeta === '') {
      addToast('Nome, valor atual e valor meta são obrigatórios.', 'error');
      return;
    }
    if (Number(valorAtual) > Number(valorMeta)) {
      addToast('O valor atual não pode ser maior que o valor meta.', 'error');
      return;
    }
    
    const dadosObjetivo = {
        nome: nome.trim(),
        valorAtual: Number(valorAtual),
        valorMeta: Number(valorMeta),
        unidade: unidade.trim() || undefined,
    };

    if (objetivoExistente) {
        aoSalvar({ ...dadosObjetivo, id: objetivoExistente.id });
    } else {
        aoSalvar(dadosObjetivo);
    }
    aoFechar(); 
  };

  const handleValorChange = (setter: React.Dispatch<React.SetStateAction<number | ''>>, value: string) => {
    if (value === '') {
      setter('');
    } else {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 0) {
        setter(num);
      }
    }
  };

  return (
    <Modal
      titulo={objetivoExistente ? 'Editar Objetivo' : 'Adicionar Novo Objetivo'}
      visivel={visivel}
      aoFechar={aoFechar}
      largura="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="objetivoNome" className="block text-sm font-medium text-slate-300 mb-1">
            Nome do Objetivo *
          </label>
          <input
            type="text"
            id="objetivoNome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full input-base"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="objetivoValorAtual" className="block text-sm font-medium text-slate-300 mb-1">
              Valor Atual *
            </label>
            <input
              type="number"
              id="objetivoValorAtual"
              value={valorAtual}
              onChange={(e) => handleValorChange(setValorAtual, e.target.value)}
              min="0"
              className="w-full input-base"
              required
            />
          </div>
          <div>
            <label htmlFor="objetivoValorMeta" className="block text-sm font-medium text-slate-300 mb-1">
              Valor Meta *
            </label>
            <input
              type="number"
              id="objetivoValorMeta"
              value={valorMeta}
              onChange={(e) => handleValorChange(setValorMeta, e.target.value)}
              min="0"
              className="w-full input-base"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="objetivoUnidade" className="block text-sm font-medium text-slate-300 mb-1">
            Unidade (opcional, ex: kg, clientes, %)
          </label>
          <input
            type="text"
            id="objetivoUnidade"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
            className="w-full input-base"
            placeholder="Ex: clientes"
          />
        </div>
        <div className="flex justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={aoFechar}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            {objetivoExistente ? 'Salvar Alterações' : 'Adicionar Objetivo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ObjetivoModal;
// Adicionar estilos globais se não existirem em StudentDetailView ou App.tsx
// Se não, os estilos para input-base, btn-primary, btn-secondary podem ser copiados para cá.
// Idealmente, esses estilos seriam globais.
// <style>{`
//   .input-base { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500; }
//   .btn-primary { @apply px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors; }
//   .btn-secondary { @apply px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors; }
// `}</style>