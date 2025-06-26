
// components/PatchNotesModal.tsx
import React, { useState } from 'react';
import Modal from './Modal';
import { NotaAtualizacao } from '../types';

interface PatchNotesModalProps {
  visivel: boolean;
  aoFechar: () => void;
  notas: NotaAtualizacao[];
  aoAdicionarNota: (novaNota: Omit<NotaAtualizacao, 'data'>) => void;
}

const PatchNotesModal: React.FC<PatchNotesModalProps> = ({ visivel, aoFechar, notas, aoAdicionarNota }) => {
  const [novaVersao, setNovaVersao] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleSubmitNovaNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (novaVersao.trim() && novaDescricao.trim()) {
      aoAdicionarNota({ versao: novaVersao.trim(), descricao: novaDescricao.trim() });
      setNovaVersao('');
      setNovaDescricao('');
      setMostrarFormulario(false); // Esconde o formulário após adicionar
    }
  };
  
  // Ordena as notas da mais recente para a mais antiga pela versão (assumindo formato vX.Y.Z)
  const notasOrdenadas = [...notas].sort((a, b) => {
    const versaoA = a.versao.substring(1).split('.').map(Number);
    const versaoB = b.versao.substring(1).split('.').map(Number);
    for (let i = 0; i < Math.max(versaoA.length, versaoB.length); i++) {
        const numA = versaoA[i] || 0;
        const numB = versaoB[i] || 0;
        if (numA !== numB) return numB - numA; // Descendente
    }
    return 0;
  });


  return (
    <Modal titulo="Notas de Atualização" visivel={visivel} aoFechar={aoFechar} largura="max-w-2xl">
      <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2">
        {notasOrdenadas.length > 0 ? (
          notasOrdenadas.map((nota, index) => (
            <div key={index} className="pb-3 border-b border-slate-700 last:border-b-0">
              <div className="flex justify-between items-baseline">
                <h4 className="text-md font-semibold text-indigo-400">{nota.versao}</h4>
                <span className="text-xs text-slate-500">{new Date(nota.data).toLocaleDateString('pt-BR')}</span>
              </div>
              <p className="text-sm text-slate-300 mt-1">{nota.descricao}</p>
            </div>
          ))
        ) : (
          <p className="text-slate-400">Nenhuma nota de atualização disponível.</p>
        )}
      </div>

      {!mostrarFormulario && (
         <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
        >
          Adicionar Nova Nota (Simulação)
        </button>
      )}
     
      {mostrarFormulario && (
        <form onSubmit={handleSubmitNovaNota} className="mt-4 space-y-3 p-3 bg-slate-700 rounded-md">
           <h4 className="text-md font-semibold text-slate-200 mb-2">Adicionar Nova Nota</h4>
          <div>
            <label htmlFor="versaoNota" className="block text-xs font-medium text-slate-400 mb-1">Versão (ex: v0.7.0)</label>
            <input
              type="text"
              id="versaoNota"
              value={novaVersao}
              onChange={(e) => setNovaVersao(e.target.value)}
              placeholder="vX.Y.Z"
              className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="descricaoNota" className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
            <textarea
              id="descricaoNota"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              rows={3}
              placeholder="Descreva as mudanças..."
              className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              Salvar Nota
            </button>
            <button
              type="button"
              onClick={() => {
                setMostrarFormulario(false);
                setNovaDescricao('');
                setNovaVersao('');
              }}
              className="flex-1 bg-slate-500 hover:bg-slate-400 text-slate-800 font-medium py-2 px-4 rounded-md transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PatchNotesModal;
