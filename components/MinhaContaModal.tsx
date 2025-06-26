// components/MinhaContaModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PerfilProfessor, ToastType } from '../types';

interface MinhaContaModalProps {
  visivel: boolean;
  perfil: PerfilProfessor;
  aoFechar: () => void;
  aoSalvar: (perfilAtualizado: PerfilProfessor) => void;
  addToast: (message: string, type?: ToastType) => void;
}

const MinhaContaModal: React.FC<MinhaContaModalProps> = ({
  visivel,
  perfil,
  aoFechar,
  aoSalvar,
  addToast,
}) => {
  const [nome, setNome] = useState('');
  const [iniciais, setIniciais] = useState('');
  const [email, setEmail] = useState('');
  const [plano, setPlano] = useState('');
  const [iniciaisManualmenteEditadas, setIniciaisManualmenteEditadas] = useState(false);

  useEffect(() => {
    if (visivel && perfil) {
      setNome(perfil.nome);
      setIniciais(perfil.iniciais);
      setEmail(perfil.email || '');
      setPlano(perfil.plano);
      setIniciaisManualmenteEditadas(true); // Assume que iniciais carregadas são "manuais" para não auto-derivar
    }
  }, [visivel, perfil]);

  const derivarIniciais = (nomeCompleto: string): string => {
    if (!nomeCompleto.trim()) return '';
    const partes = nomeCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (partes.length === 0) return '';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + (partes[partes.length - 1][0] || '')).toUpperCase();
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoNome = e.target.value;
    setNome(novoNome);
    if (!iniciaisManualmenteEditadas) {
      setIniciais(derivarIniciais(novoNome));
    }
  };

  const handleIniciaisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIniciais(e.target.value.toUpperCase().substring(0, 2));
    setIniciaisManualmenteEditadas(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !iniciais.trim() || !plano.trim()) {
      addToast("Nome, Iniciais e Tipo de Plano são obrigatórios.", "error");
      return;
    }
    aoSalvar({
      ...perfil, // Mantém o ID original
      nome: nome.trim(),
      iniciais: iniciais.trim().toUpperCase(),
      email: email.trim() || undefined,
      plano: plano.trim(),
    });
  };

  const inputBaseClasses = "w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500";
  const btnPrimaryClasses = "px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors";
  const btnSecondaryClasses = "px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors";

  return (
    <Modal titulo="Minha Conta" visivel={visivel} aoFechar={aoFechar} largura="max-w-lg">
       <style>{`
        .input-base { @apply ${inputBaseClasses}; }
        .btn-primary { @apply ${btnPrimaryClasses}; }
        .btn-secondary { @apply ${btnSecondaryClasses}; }
      `}</style>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="profNome" className="block text-sm font-medium text-slate-300 mb-1">Nome Completo *</label>
          <input type="text" id="profNome" value={nome} onChange={handleNomeChange} className="input-base" required />
        </div>
        <div>
          <label htmlFor="profIniciais" className="block text-sm font-medium text-slate-300 mb-1">Iniciais (2 letras) *</label>
          <input type="text" id="profIniciais" value={iniciais} onChange={handleIniciaisChange} maxLength={2} className="input-base" required pattern="[A-Za-zÀ-ú]{1,2}" />
        </div>
        <div>
          <label htmlFor="profEmail" className="block text-sm font-medium text-slate-300 mb-1">Email de Contato</label>
          <input type="email" id="profEmail" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" />
        </div>
        <div>
          <label htmlFor="profPlano" className="block text-sm font-medium text-slate-300 mb-1">Tipo de Plano *</label>
          <input type="text" id="profPlano" value={plano} onChange={(e) => setPlano(e.target.value)} className="input-base" required placeholder="Ex: Plano PRO" />
        </div>
        <div className="flex justify-end space-x-3 pt-3">
          <button type="button" onClick={aoFechar} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Salvar Alterações</button>
        </div>
      </form>
    </Modal>
  );
};

export default MinhaContaModal;
