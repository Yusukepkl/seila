// components/ProximosAgendamentosCard.tsx
import React from 'react';
import { Agendamento } from '../types';
import { IconeProximosEventos, IconeCalendario, IconeAdicionar } from './icons';
import { CORES_EVENTO_AGENDA } from '../constants';

interface ProximosAgendamentosCardProps {
  agendamentos: Agendamento[];
  onVerAgendaCompleta: () => void;
  onAdicionarAgendamentoRapido: () => void; 
  maxItens?: number;
  contagemAgendamentosHoje: number; // v0.1.2 (Parte 2)
  contagemAgendamentosAmanha: number; // v0.1.2 (Parte 2)
}

const ProximosAgendamentosCard: React.FC<ProximosAgendamentosCardProps> = ({ 
  agendamentos, 
  onVerAgendaCompleta,
  onAdicionarAgendamentoRapido, 
  maxItens = 3,
  contagemAgendamentosHoje, // v0.1.2 (Parte 2)
  contagemAgendamentosAmanha, // v0.1.2 (Parte 2)
}) => {
  const agora = new Date();

  const proximos = agendamentos
    .filter(ag => new Date(ag.data + 'T' + ag.horaFim) >= agora) 
    .sort((a, b) => new Date(a.data + 'T' + a.horaInicio).getTime() - new Date(b.data + 'T' + b.horaInicio).getTime()) 
    .slice(0, maxItens);

  const formatarDataHora = (data: string, hora: string) => {
    const dataObj = new Date(data + 'T' + hora);
    const diaSemana = dataObj.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
    const diaMes = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
    return `${diaSemana}, ${diaMes} às ${hora}`;
  };

  const getCorEvento = (tipo: string) => CORES_EVENTO_AGENDA[tipo] || CORES_EVENTO_AGENDA.padrao;


  return (
    <div className="bg-slate-700 p-5 rounded-lg shadow h-full flex flex-col">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center">
          <IconeCalendario className="w-5 h-5 mr-2 text-indigo-400" />
          Próximos Agendamentos
        </h3>
        <div className="flex items-center space-x-2">
            <button
                onClick={onAdicionarAgendamentoRapido}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors flex items-center p-1"
                aria-label="Adicionar agendamento rápido"
                title="Adicionar Agendamento Rápido"
            >
                <IconeAdicionar className="w-4 h-4 mr-0.5" /> Rápido
            </button>
            <button
                onClick={onVerAgendaCompleta}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                aria-label="Ver agenda completa"
            >
                Ver Todos
            </button>
        </div>
      </div>
      {/* v0.1.2 (Parte 2): Contadores Hoje/Amanhã */}
      <div className="flex space-x-3 mb-3 text-xs">
        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">Hoje: <strong>{contagemAgendamentosHoje}</strong></span>
        <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Amanhã: <strong>{contagemAgendamentosAmanha}</strong></span>
      </div>


      {proximos.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-4">
          <IconeProximosEventos className="w-12 h-12 mb-2 opacity-60" />
          <p className="text-sm">Nenhum agendamento futuro.</p>
          <p className="text-xs mt-1">Sua agenda está livre!</p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto pr-1 flex-grow max-h-[120px]"> {/* Altura máxima ajustada */}
          {proximos.map((ag) => (
            <div key={ag.id} className={`p-2.5 rounded-md border-l-4 ${ag.corEvento || getCorEvento(ag.tipo).replace('bg-', 'border-')}`}>
              <p className="text-xs font-medium text-slate-200 truncate" title={ag.titulo}>
                {ag.titulo}
              </p>
              <p className="text-xs text-slate-400">
                {formatarDataHora(ag.data, ag.horaInicio)}
              </p>
              {ag.alunoNome && (
                <p className="text-xs text-slate-400">Com: {ag.alunoNome}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProximosAgendamentosCard;