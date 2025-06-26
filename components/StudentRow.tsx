// components/StudentRow.tsx
import React from 'react';
import { AlunoConsultoria, StatusAluno, StatusPagamentoAluno } from '../types';
import { IconeInfo } from './icons';
import { CORES_STATUS_ALUNO, STATUS_PAGAMENTO_ALUNO_INFO } from '../constants'; // v0.1.2 (Parte 4)

interface StudentRowProps {
  aluno: AlunoConsultoria;
  aoAbrirDetalhesAluno: (aluno: AlunoConsultoria) => void; 
}

const StudentRow: React.FC<StudentRowProps> = ({ aluno, aoAbrirDetalhesAluno }) => {
  const statusClasses = CORES_STATUS_ALUNO[aluno.status] || CORES_STATUS_ALUNO.Ativo;
  
  // v0.1.2 (Parte 4): Indicador de Status de Pagamento
  const statusPagamentoInfo = aluno.statusPagamento ? STATUS_PAGAMENTO_ALUNO_INFO[aluno.statusPagamento] : null;
  const IconeStatusPagamento = statusPagamentoInfo?.icon;


  return (
    <div 
      className="flex items-center justify-between p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-md transition-colors cursor-pointer"
      onClick={() => aoAbrirDetalhesAluno(aluno)}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') aoAbrirDetalhesAluno(aluno);}}
      aria-label={`Ver detalhes de ${aluno.nome}`}
    >
      <div className="flex items-center space-x-3">
        {aluno.fotoPerfil ? (
          <img 
            src={aluno.fotoPerfil} 
            alt={`Foto de ${aluno.nome}`} 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className={`w-8 h-8 rounded-full ${aluno.corAvatar} flex items-center justify-center text-white text-sm font-semibold`}>
            {aluno.iniciais}
          </div>
        )}
        <span className="text-sm text-slate-200">{aluno.nome}</span>
        
        {aluno.status && ( 
          <span 
            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses.bg} ${statusClasses.text} border ${statusClasses.border || 'border-transparent'}`}
            title={`Status do aluno: ${aluno.status}`}
          >
            {aluno.status}
          </span>
        )}

        {/* v0.1.2 (Parte 4): Indicador de Status de Pagamento */}
        {IconeStatusPagamento && statusPagamentoInfo && (
          <span title={statusPagamentoInfo.title} className="flex items-center">
            <IconeStatusPagamento className={`w-4 h-4 ${statusPagamentoInfo.colorClasses}`} />
          </span>
        )}

      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-slate-400">{aluno.dataConsultoria}</span>
        <div className="w-24 h-2 bg-slate-600 rounded-full" title={`Progresso: ${aluno.progresso}%`}>
          <div
            className="h-full bg-yellow-400 rounded-full"
            style={{ width: `${aluno.progresso}%` }}
            aria-valuenow={aluno.progresso}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
            aria-label={`Progresso do aluno: ${aluno.progresso}%`}
          ></div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            aoAbrirDetalhesAluno(aluno);
          }}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-md transition-colors"
          aria-label={`Abrir perfil detalhado de ${aluno.nome}`}
        >
          Detalhes
        </button>
      </div>
    </div>
  );
};

export default StudentRow;