// components/TempoConsultoriaCard.tsx
import React from 'react';
import StudentRow from './StudentRow';
import { AlunoConsultoria, StatusAluno } from '../types';
import { IconeRelogio } from './icons'; // Exemplo de uso de ícone
import { CORES_STATUS_ALUNO } from '../constants'; // Para as opções de status

interface TempoConsultoriaCardProps {
  alunos: AlunoConsultoria[];
  aoAdicionarAluno: () => void;
  aoAbrirDetalhesAluno: (aluno: AlunoConsultoria) => void;
  // v0.1.2 (Parte 2): Props para filtros
  filtroStatus: StatusAluno | '';
  onFiltroStatusChange: (status: StatusAluno | '') => void;
  filtroObjetivo: string;
  onFiltroObjetivoChange: (objetivo: string) => void;
}

const statusOptions: { value: StatusAluno | '', label: string }[] = [
    { value: '', label: 'Todos Status' },
    ...Object.keys(CORES_STATUS_ALUNO).map(statusKey => ({
        value: statusKey as StatusAluno,
        label: statusKey,
    }))
];


const TempoConsultoriaCard: React.FC<TempoConsultoriaCardProps> = ({ 
    alunos, 
    aoAdicionarAluno, 
    aoAbrirDetalhesAluno,
    filtroStatus,
    onFiltroStatusChange,
    filtroObjetivo,
    onFiltroObjetivoChange,
}) => {
  return (
    <div className="bg-slate-700 p-5 rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 md:gap-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Tempo de Consultoria
        </h3>
        {/* v0.1.2 (Parte 2): Controles de Filtro */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <select 
                value={filtroStatus}
                onChange={(e) => onFiltroStatusChange(e.target.value as StatusAluno | '')}
                className="input-base-sm py-1.5 flex-grow md:flex-grow-0 md:min-w-[150px]"
                aria-label="Filtrar alunos por status"
            >
                {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <input 
                type="text"
                placeholder="Filtrar por objetivo..."
                value={filtroObjetivo}
                onChange={(e) => onFiltroObjetivoChange(e.target.value)}
                className="input-base-sm py-1.5 flex-grow md:flex-grow-0 md:min-w-[180px]"
                aria-label="Filtrar alunos por objetivo principal"
            />
        </div>
        <button
          onClick={aoAdicionarAluno}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-1.5 px-4 rounded-md transition-colors w-full md:w-auto mt-2 md:mt-0"
        >
          Adicionar Aluno
        </button>
      </div>
      {alunos.length > 0 ? (
        <div className="space-y-2">
          {alunos.map((aluno) => (
            <StudentRow key={aluno.id} aluno={aluno} aoAbrirDetalhesAluno={aoAbrirDetalhesAluno} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
            <IconeRelogio className="w-12 h-12 mx-auto mb-3" />
            <p className="font-semibold">Nenhum aluno em consultoria.</p>
            <p className="text-xs mt-1">
                {filtroStatus || filtroObjetivo ? "Nenhum aluno corresponde aos filtros atuais." : "Clique em \"Adicionar Aluno\" para começar."}
            </p>
        </div>
      )}
       <style>{`
        .input-base-sm { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500; }
      `}</style>
    </div>
  );
};

export default TempoConsultoriaCard;