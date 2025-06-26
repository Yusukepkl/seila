
// components/AdicionarAlunoModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { AlunoConsultoria, ToastType } from '../types'; 
import { IconeSpinner } from './icons';

interface AdicionarAlunoModalProps {
  visivel: boolean;
  aoFechar: () => void;
  aoSalvarAluno: (novoAlunoData: Pick<AlunoConsultoria, 'nome' | 'iniciais' | 'dataConsultoria' | 'contatoPrincipal' | 'objetivoPrincipal' | 'dataInicio'>) => void;
  addToast: (message: string, type?: ToastType) => void;
}

const AdicionarAlunoModal: React.FC<AdicionarAlunoModalProps> = ({ visivel, aoFechar, aoSalvarAluno, addToast }) => {
  const [nome, setNome] = useState('');
  const [iniciais, setIniciais] = useState('');
  const [dataConsultoria, setDataConsultoria] = useState(new Date().toISOString().split('T')[0]);
  const [iniciaisManualmenteEditadas, setIniciaisManualmenteEditadas] = useState(false);
  const [contatoPrincipal, setContatoPrincipal] = useState('');
  const [objetivoPrincipal, setObjetivoPrincipal] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (visivel) {
      setNome('');
      setIniciais('');
      setDataConsultoria(new Date().toISOString().split('T')[0]);
      setIniciaisManualmenteEditadas(false);
      setContatoPrincipal('');
      setObjetivoPrincipal('');
      setDataInicio(new Date().toISOString().split('T')[0]);
      setIsLoading(false);
    }
  }, [visivel]);

  const derivarIniciais = (nomeCompleto: string): string => {
    if (!nomeCompleto.trim()) return '';
    const partes = nomeCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (partes.length === 0) return '';
    if (partes.length === 1) {
      return partes[0].substring(0, 2).toUpperCase();
    }
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
    setIniciais(e.target.value.toUpperCase().substring(0,2));
    setIniciaisManualmenteEditadas(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim() && iniciais.trim() && dataConsultoria) {
      setIsLoading(true);
      const [year, month, day] = dataConsultoria.split('-');
      const dataFormatadaConsultoria = `${day}/${month}/${year}`;
      
      // const [yearInicio, monthInicio, dayInicio] = dataInicio.split('-');
      // const dataFormatadaInicio = `${dayInicio}/${monthInicio}/${yearInicio}`;


      aoSalvarAluno({ 
        nome: nome.trim(), 
        iniciais: iniciais.trim().toUpperCase(), 
        dataConsultoria: dataFormatadaConsultoria,
        contatoPrincipal: contatoPrincipal.trim() || undefined,
        objetivoPrincipal: objetivoPrincipal.trim() || undefined,
        dataInicio: dataInicio ? formatarDataParaInputDate(dataInicio) : undefined, 
      });
      // O App.tsx fechará o modal e mostrará o toast
      // setIsLoading(false); // O App.tsx cuida de fechar o modal, o que reseta o estado.
    } else {
        addToast("Nome, Iniciais e Data da Consultoria são obrigatórios.", "error");
    }
  };
  
    const formatarDataParaInputDate = (dataInput?: string): string => { 
    if (!dataInput) return '';
    const partesIso = dataInput.split('-');
    if (partesIso.length === 3 && partesIso[0].length === 4) {
        return dataInput;
    }
    const partes = dataInput.split('/');
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return ''; 
    };


  return (
    <Modal titulo="Adicionar Novo Aluno" visivel={visivel} aoFechar={aoFechar} largura="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label htmlFor="nomeAluno" className="block text-sm font-medium text-slate-300 mb-1">Nome Completo *</label>
            <input
                type="text" id="nomeAluno" value={nome} onChange={handleNomeChange}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                required aria-required="true" disabled={isLoading}
            />
            </div>
            <div>
            <label htmlFor="iniciaisAluno" className="block text-sm font-medium text-slate-300 mb-1">Iniciais (2 letras) *</label>
            <input
                type="text" id="iniciaisAluno" value={iniciais} onChange={handleIniciaisChange} maxLength={2}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                required aria-required="true" pattern="[A-Za-zÀ-ú]{1,2}" title="Insira 1 ou 2 letras para as iniciais." disabled={isLoading}
            />
            </div>
            <div>
            <label htmlFor="dataConsultoriaAluno" className="block text-sm font-medium text-slate-300 mb-1">Data da Consultoria *</label>
            <input
                type="date" id="dataConsultoriaAluno" value={dataConsultoria} onChange={(e) => setDataConsultoria(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                required aria-required="true" disabled={isLoading}
            />
            </div>
            <div>
                <label htmlFor="dataInicioAluno" className="block text-sm font-medium text-slate-300 mb-1">Data de Início (Aluno)</label>
                <input type="date" id="dataInicioAluno" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                    disabled={isLoading}
                />
            </div>
        </div>

        <div>
            <label htmlFor="contatoPrincipalAluno" className="block text-sm font-medium text-slate-300 mb-1">Contato Principal (Telefone/Email)</label>
            <input type="text" id="contatoPrincipalAluno" value={contatoPrincipal} onChange={(e) => setContatoPrincipal(e.target.value)}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: (XX) 99999-9999 ou email@example.com" disabled={isLoading}
            />
        </div>
        <div>
            <label htmlFor="objetivoPrincipalAluno" className="block text-sm font-medium text-slate-300 mb-1">Objetivo Principal do Aluno</label>
            <textarea id="objetivoPrincipalAluno" value={objetivoPrincipal} onChange={(e) => setObjetivoPrincipal(e.target.value)} rows={3}
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Descreva o principal objetivo do aluno (ex: Perda de peso, Hipertrofia, etc.)" disabled={isLoading}
            />
        </div>


        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={aoFechar}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center justify-center disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? <><IconeSpinner className="w-4 h-4 mr-2"/> Salvando...</> : "Salvar Aluno"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AdicionarAlunoModal;