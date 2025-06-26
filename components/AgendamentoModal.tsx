// components/AgendamentoModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Agendamento, AlunoParaAgendamento, TipoAgendamento, StatusAgendamento, ToastType } from '../types'; // v0.1.2 (Parte 4): Add StatusAgendamento
import { CORES_EVENTO_AGENDA } from '../constants';

interface AgendamentoModalProps {
  visivel: boolean;
  aoFechar: () => void;
  aoSalvar: (agendamento: Agendamento | Omit<Agendamento, 'id'>) => void; // Updated type
  agendamentoExistente?: Agendamento | Partial<Agendamento> | null; 
  // getProximoIdAgendamento: () => Promise<string>; // Removed, App.tsx handles ID generation
  alunos: AlunoParaAgendamento[]; 
  dataSelecionada?: string; 
  addToast: (message: string, type?: ToastType) => void;
}

const tiposAgendamento: TipoAgendamento[] = ['Consulta', 'Treino', 'Avaliação', 'Pessoal', 'Outro'];

const AgendamentoModal: React.FC<AgendamentoModalProps> = ({
  visivel,
  aoFechar,
  aoSalvar,
  agendamentoExistente,
  // getProximoIdAgendamento, // Removed
  alunos,
  dataSelecionada,
  addToast,
}) => {
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoAgendamento>('Treino');
  const [observacoes, setObservacoes] = useState('');
  const [status, setStatus] = useState<StatusAgendamento>('Agendado');
  const [isEditMode, setIsEditMode] = useState(false);


  useEffect(() => {
    if (visivel) {
      const isEditing = !!(agendamentoExistente && 'id' in agendamentoExistente && agendamentoExistente.id);
      setIsEditMode(isEditing);

      if (isEditing) {
        const agExt = agendamentoExistente as Agendamento;
        setTitulo(agExt.titulo);
        setData(agExt.data);
        setHoraInicio(agExt.horaInicio);
        setHoraFim(agExt.horaFim);
        setAlunoId(agExt.alunoId || null);
        setTipo(agExt.tipo);
        setObservacoes(agExt.observacoes || '');
        setStatus(agExt.status || 'Agendado');
      } else { 
        setTitulo(agendamentoExistente?.titulo || '');
        setData(agendamentoExistente?.data || dataSelecionada || new Date().toISOString().split('T')[0]);
        setHoraInicio(agendamentoExistente?.horaInicio || '08:00');
        setHoraFim(agendamentoExistente?.horaFim || '09:00');
        setAlunoId(agendamentoExistente?.alunoId || null);
        setTipo(agendamentoExistente?.tipo || 'Treino');
        setObservacoes(agendamentoExistente?.observacoes || '');
        setStatus('Agendado'); 
      }
    }
  }, [visivel, agendamentoExistente, dataSelecionada]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !data || !horaInicio || !horaFim) {
      addToast('Título, Data, Hora de Início e Hora de Fim são obrigatórios.', 'error');
      return;
    }
    if (horaInicio >= horaFim) {
        addToast('A hora de início deve ser anterior à hora de fim.', 'error');
        return;
    }

    const alunoSelecionado = alunos.find(a => a.id === alunoId);
    
    const agendamentoDataPayload: Agendamento | Omit<Agendamento, 'id'> = {
        titulo: titulo.trim(),
        data,
        horaInicio,
        horaFim,
        alunoId: alunoId || undefined,
        alunoNome: alunoSelecionado?.nome || undefined,
        tipo,
        observacoes: observacoes.trim() || undefined,
        corEvento: CORES_EVENTO_AGENDA[tipo] || CORES_EVENTO_AGENDA.padrao,
        status: status,
    };

    if (isEditMode && agendamentoExistente && 'id' in agendamentoExistente && agendamentoExistente.id) {
        (agendamentoDataPayload as Agendamento).id = agendamentoExistente.id;
    }
    // If not isEditMode, or if it's a reagendamento (which is treated as new), 
    // App.tsx's handleSalvarAgendamento will generate the ID.

    aoSalvar(agendamentoDataPayload);
    aoFechar();
  };
  
  const inputBaseClasses = "w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500";
  const btnPrimaryClasses = "px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors";
  const btnSecondaryClasses = "px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors";


  return (
    <Modal
      titulo={isEditMode ? 'Editar Agendamento' : (agendamentoExistente?.titulo ? `Reagendar: ${agendamentoExistente.titulo}` : 'Novo Agendamento')}
      visivel={visivel}
      aoFechar={aoFechar}
      largura="max-w-lg"
    >
      <style>{`
        .input-base { @apply ${inputBaseClasses}; }
        .btn-primary { @apply ${btnPrimaryClasses}; }
        .btn-secondary { @apply ${btnSecondaryClasses}; }
      `}</style>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="agTitulo" className="block text-sm font-medium text-slate-300 mb-1">Título *</label>
          <input type="text" id="agTitulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="input-base" required />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label htmlFor="agData" className="block text-sm font-medium text-slate-300 mb-1">Data *</label>
                <input type="date" id="agData" value={data} onChange={(e) => setData(e.target.value)} className="input-base" required />
            </div>
            <div>
                <label htmlFor="agHoraInicio" className="block text-sm font-medium text-slate-300 mb-1">Início *</label>
                <input type="time" id="agHoraInicio" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="input-base" required />
            </div>
            <div>
                <label htmlFor="agHoraFim" className="block text-sm font-medium text-slate-300 mb-1">Fim *</label>
                <input type="time" id="agHoraFim" value={horaFim} onChange={(e) => setHoraFim(e.target.value)} className="input-base" required />
            </div>
        </div>

        <div>
          <label htmlFor="agAluno" className="block text-sm font-medium text-slate-300 mb-1">Associar Aluno (opcional)</label>
          <select id="agAluno" value={alunoId || ''} onChange={(e) => setAlunoId(e.target.value || null)} className="input-base">
            <option value="">Nenhum aluno</option>
            {alunos.map(al => (
              <option key={al.id} value={al.id}>{al.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="agTipo" className="block text-sm font-medium text-slate-300 mb-1">Tipo de Evento *</label>
          <select id="agTipo" value={tipo} onChange={(e) => setTipo(e.target.value as TipoAgendamento)} className="input-base" required>
            {tiposAgendamento.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {isEditMode && (
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                <p className={`input-base bg-slate-500/30 cursor-not-allowed`}>{status}</p>
             </div>
        )}

        <div>
          <label htmlFor="agObservacoes" className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
          <textarea id="agObservacoes" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} className="input-base" />
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <button type="button" onClick={aoFechar} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">
            {isEditMode ? 'Salvar Alterações' : (agendamentoExistente?.titulo ? 'Salvar Reagendamento' : 'Criar Agendamento')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AgendamentoModal;