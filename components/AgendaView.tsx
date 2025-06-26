
// components/AgendaView.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Agendamento, AlunoParaAgendamento, StatusAgendamento, TipoModalOuView } from '../types';
import { IconeAdicionar, IconeEditar, IconeLixeira, IconeCalendario, IconeLista, IconeAgendaSemanal, IconeSetaEsquerda, IconeSetaDireita, IconeCheck, IconeFechar, IconeRefresh } from './icons';
import { CORES_EVENTO_AGENDA, STATUS_AGENDAMENTO_OPCOES, CORES_STATUS_AGENDAMENTO } from '../constants';

interface AgendaViewProps {
  agendamentos: Agendamento[];
  onAdicionarAgendamento: (dataSelecionada?: string) => void;
  onEditarAgendamento: (agendamento: Agendamento) => void;
  onReagendarAgendamento: (agendamentoOriginal: Agendamento) => void; // Nova prop
  onRemoverAgendamento: (agendamentoId: string) => void;
  onAtualizarStatusAgendamento: (agendamentoId: string, novoStatus: StatusAgendamento) => void; 
  alunos: AlunoParaAgendamento[];
  abrirModalConfirmacao: (tipo: TipoModalOuView, dadosConfirmacao: any) => void; 
}

type VisualizacaoAgenda = 'lista' | 'semana';
type FiltroPeriodoAgenda = 'todos' | 'hoje' | 'amanha' | 'estaSemana' | 'proximos7Dias' | 'esteMes';
type OrdemListaAgenda = 'dataRecente' | 'dataAntiga' | 'tituloAZ' | 'statusAZ';


const AgendaView: React.FC<AgendaViewProps> = ({
  agendamentos,
  onAdicionarAgendamento,
  onEditarAgendamento,
  onReagendarAgendamento, // Nova prop
  onRemoverAgendamento,
  onAtualizarStatusAgendamento,
  alunos,
  abrirModalConfirmacao,
}) => {
  const [visualizacao, setVisualizacao] = useState<VisualizacaoAgenda>('semana');
  const [dataReferenciaSemana, setDataReferenciaSemana] = useState(new Date());
  
  const [filtroStatus, setFiltroStatus] = useState<StatusAgendamento | ''>('');
  const [filtroPeriodo, setFiltroPeriodo] = useState<FiltroPeriodoAgenda>('todos');
  const [ordemLista, setOrdemLista] = useState<OrdemListaAgenda>('dataRecente');


  const getCorEvento = (tipo: string) => CORES_EVENTO_AGENDA[tipo] || CORES_EVENTO_AGENDA.padrao;

  const handleConcluirAgendamento = (ag: Agendamento) => {
    onAtualizarStatusAgendamento(ag.id, 'Concluído');
  };

  const handleCancelarAgendamento = (ag: Agendamento) => {
    abrirModalConfirmacao('confirmarAcaoAgenda', {
      titulo: "Cancelar Agendamento",
      mensagem: `Tem certeza que deseja cancelar o agendamento "${ag.titulo}"?`,
      onConfirmar: () => onAtualizarStatusAgendamento(ag.id, 'Cancelado'),
      textoBotaoConfirmar: "Sim, Cancelar",
      corBotaoConfirmar: "bg-orange-600 hover:bg-orange-700",
    });
  };

  const handleRemover = (ag: Agendamento) => {
     abrirModalConfirmacao('confirmarAcaoAgenda', {
      titulo: "Remover Agendamento",
      mensagem: `Tem certeza que deseja remover permanentemente o agendamento "${ag.titulo}"? Esta ação não pode ser desfeita.`,
      onConfirmar: () => onRemoverAgendamento(ag.id),
      textoBotaoConfirmar: "Sim, Remover",
      corBotaoConfirmar: "bg-red-600 hover:bg-red-700",
    });
  };
  
  const mudarSemana = (offset: number) => {
    setDataReferenciaSemana(prevData => {
      const novaData = new Date(prevData);
      novaData.setDate(novaData.getDate() + offset * 7);
      return novaData;
    });
  };

  const getInicioDaSemana = (data: Date): Date => {
    const d = new Date(data);
    const diaDaSemana = d.getDay(); 
    const diff = d.getDate() - diaDaSemana + (diaDaSemana === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
  };

  const semanaAtual = useMemo(() => {
    const inicio = getInicioDaSemana(dataReferenciaSemana);
    const dias: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicio);
      dia.setDate(inicio.getDate() + i);
      dias.push(dia);
    }
    return dias;
  }, [dataReferenciaSemana]);

  const agendamentosFiltradosEOrdenados = useMemo(() => {
    let processados = [...agendamentos];

    if (filtroStatus) {
      processados = processados.filter(ag => ag.status === filtroStatus);
    }

    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);
    
    switch (filtroPeriodo) {
      case 'hoje':
        processados = processados.filter(ag => new Date(ag.data + 'T00:00:00Z').toDateString() === hoje.toDateString());
        break;
      case 'amanha':
        processados = processados.filter(ag => new Date(ag.data + 'T00:00:00Z').toDateString() === amanha.toDateString());
        break;
      case 'estaSemana':
        const inicioSemana = getInicioDaSemana(hoje);
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23,59,59,999);
        processados = processados.filter(ag => {
          const dataAg = new Date(ag.data + 'T00:00:00Z');
          return dataAg >= inicioSemana && dataAg <= fimSemana;
        });
        break;
      case 'proximos7Dias':
        const seteDiasFrente = new Date(hoje);
        seteDiasFrente.setDate(hoje.getDate() + 7);
        seteDiasFrente.setHours(23,59,59,999);
        processados = processados.filter(ag => {
          const dataAg = new Date(ag.data + 'T00:00:00Z');
          return dataAg >= hoje && dataAg <= seteDiasFrente;
        });
        break;
      case 'esteMes':
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        fimMes.setHours(23,59,59,999);
         processados = processados.filter(ag => {
          const dataAg = new Date(ag.data + 'T00:00:00Z');
          return dataAg >= inicioMes && dataAg <= fimMes;
        });
        break;
      case 'todos':
      default:
        break;
    }

    if (visualizacao === 'lista') {
      switch (ordemLista) {
        case 'dataRecente': processados.sort((a,b) => new Date(b.data + 'T' + b.horaInicio).getTime() - new Date(a.data + 'T' + a.horaInicio).getTime()); break;
        case 'dataAntiga': processados.sort((a,b) => new Date(a.data + 'T' + a.horaInicio).getTime() - new Date(b.data + 'T' + b.horaInicio).getTime()); break;
        case 'tituloAZ': processados.sort((a,b) => a.titulo.localeCompare(b.titulo)); break;
        case 'statusAZ': processados.sort((a,b) => (a.status || '').localeCompare(b.status || '')); break;
        default: break;
      }
    }
    return processados;
  }, [agendamentos, filtroStatus, filtroPeriodo, visualizacao, ordemLista, semanaAtual]);


  const renderListaAgendamentos = () => {
    const agora = new Date().getTime();
    const listaParaRenderizar = agendamentosFiltradosEOrdenados;
    
    if (listaParaRenderizar.length === 0) {
      return (
        <div className="text-center py-10 text-slate-500">
          <IconeCalendario className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-semibold text-lg">
            {agendamentos.length === 0 ? "Nenhum agendamento encontrado." : "Nenhum agendamento corresponde aos filtros."}
          </p>
          <p className="text-sm mt-1">
            {agendamentos.length === 0 ? "Clique em \"Novo Agendamento\" para começar." : "Ajuste os filtros ou adicione novos agendamentos."}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {listaParaRenderizar.map(ag => {
          const eventoPassado = new Date(ag.data + 'T' + ag.horaFim).getTime() < agora && ag.status !== 'Concluído' && ag.status !== 'Cancelado';
          const corBase = ag.corEvento || getCorEvento(ag.tipo);
          const corBorda = corBase.replace('bg-', 'border-');
          const statusInfo = CORES_STATUS_AGENDAMENTO[ag.status];

          return (
            <div key={ag.id} className={`p-4 rounded-lg shadow ${eventoPassado && ag.status === 'Agendado' ? 'bg-slate-700/70 opacity-80' : 'bg-slate-700'} border-l-4 ${statusInfo ? statusInfo.border : corBorda}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    <h3 className={`text-lg font-semibold ${eventoPassado && ag.status === 'Agendado' ? 'text-slate-400' : 'text-white'}`}>{ag.titulo}</h3>
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                        {ag.status}
                    </span>
                  </div>
                  <p className={`text-sm ${eventoPassado && ag.status === 'Agendado' ? 'text-slate-500' : 'text-slate-300'}`}>
                    {new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'UTC' })}
                  </p>
                  <p className={`text-sm ${eventoPassado && ag.status === 'Agendado' ? 'text-slate-500' : 'text-slate-300'}`}>{ag.horaInicio} - {ag.horaFim}</p>
                  {ag.alunoNome && <p className={`text-xs ${eventoPassado && ag.status === 'Agendado' ? 'text-slate-500' : 'text-slate-400'}`}>Aluno: {ag.alunoNome}</p>}
                  <p className={`text-xs ${eventoPassado && ag.status === 'Agendado' ? 'text-slate-500' : 'text-slate-400'}`}>Tipo: {ag.tipo}</p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1">
                    {ag.status === 'Agendado' && (
                        <>
                        <button onClick={() => handleConcluirAgendamento(ag)} className="btn-icon-xs bg-green-500/80 hover:bg-green-500 text-white" title="Marcar como Concluído"><IconeCheck className="w-4 h-4"/></button>
                        <button onClick={() => handleCancelarAgendamento(ag)} className="btn-icon-xs bg-orange-500/80 hover:bg-orange-500 text-white" title="Cancelar Agendamento"><IconeFechar className="w-4 h-4"/></button>
                        <button onClick={() => onReagendarAgendamento(ag)} className="btn-icon-xs bg-purple-500/80 hover:bg-purple-500 text-white" title="Reagendar Agendamento"><IconeRefresh className="w-4 h-4"/></button>
                        </>
                    )}
                     {ag.status === 'Cancelado' && (
                         <button onClick={() => onReagendarAgendamento(ag)} className="btn-icon-xs bg-purple-500/80 hover:bg-purple-500 text-white" title="Reagendar Agendamento"><IconeRefresh className="w-4 h-4"/></button>
                     )}
                    <button onClick={() => onEditarAgendamento(ag)} className="btn-icon-xs bg-blue-500/80 hover:bg-blue-500 text-white" title="Editar Agendamento"><IconeEditar className="w-4 h-4"/></button>
                    <button onClick={() => handleRemover(ag)} className="btn-icon-xs bg-red-500/80 hover:bg-red-500 text-white" title="Remover Agendamento"><IconeLixeira className="w-4 h-4"/></button>
                </div>
              </div>
              {ag.observacoes && <p className={`text-xs mt-2 pt-2 border-t ${eventoPassado && ag.status === 'Agendado' ? 'border-slate-600/70 text-slate-500' : 'border-slate-600 text-slate-400'}`}>Obs: {ag.observacoes}</p>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderVisualizacaoSemanal = () => {
    const hojeString = new Date().toDateString(); 
    const agendamentosParaSemana = agendamentosFiltradosEOrdenados;


    return (
      <div className="bg-slate-700 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => mudarSemana(-1)} className="btn-secondary-sm p-2" title="Semana Anterior"><IconeSetaEsquerda className="w-5 h-5" /></button>
          <h3 className="text-lg font-semibold text-white">
            {semanaAtual[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })} - {semanaAtual[6].toLocaleDateString('pt-BR', {  day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
          </h3>
          <button onClick={() => mudarSemana(1)} className="btn-secondary-sm p-2" title="Próxima Semana"><IconeSetaDireita className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {semanaAtual.map(dia => {
            const isToday = dia.toDateString() === hojeString;
            const agsDoDia = agendamentosParaSemana
              .filter(ag => new Date(ag.data + 'T00:00:00Z').toDateString() === dia.toDateString())
              .sort((a,b) => a.horaInicio.localeCompare(b.horaInicio));
            
            return (
                <div 
                    key={dia.toISOString()} 
                    className={`bg-slate-600 p-2 rounded min-h-[120px] flex flex-col relative
                                ${isToday ? 'border-2 border-indigo-500 bg-slate-600/80' : ''}`}
                >
                {isToday && <span className="absolute top-1 right-1 text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-semibold">Hoje</span>}
                <p className={`text-xs font-medium text-center mb-1 ${isToday ? 'text-indigo-300 font-bold' : 'text-slate-300'}`}>
                    {dia.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).slice(0,3)} <span className="block">{dia.getDate()}</span>
                </p>
                <div className="space-y-1 flex-grow overflow-y-auto max-h-[200px] pr-0.5">
                    {agsDoDia.map(ag => {
                       const statusInfo = CORES_STATUS_AGENDAMENTO[ag.status];
                       let bgColor = ag.corEvento || getCorEvento(ag.tipo);
                       if (ag.status === 'Cancelado') bgColor = statusInfo.iconColor?.replace('text-', 'bg-') || bgColor;
                       if (ag.status === 'Concluído') bgColor = statusInfo.iconColor?.replace('text-', 'bg-') || bgColor;


                        return (
                            <div 
                            key={ag.id} 
                            className={`p-1.5 rounded text-xs text-white ${bgColor} ${ag.status !== 'Agendado' ? 'opacity-70' : ''} cursor-pointer hover:opacity-80 shadow relative group`}
                            onClick={() => onEditarAgendamento(ag)}
                            title={`${ag.titulo}\n${ag.horaInicio}-${ag.horaFim}\nStatus: ${ag.status}\n${ag.alunoNome || ag.tipo}`}
                            >
                                <p className="font-semibold truncate">{ag.titulo}</p>
                                <p className="opacity-80 text-[10px]">{ag.horaInicio}</p>
                                {ag.status !== 'Agendado' && <span className="absolute top-0.5 right-0.5 text-[8px] bg-black/30 px-1 rounded-sm">{ag.status}</span>}
                                
                                <div className="absolute bottom-0 right-0 mb-0.5 mr-0.5 hidden group-hover:flex space-x-0.5 z-10">
                                {ag.status === 'Agendado' && (
                                    <>
                                    <button onClick={(e) => { e.stopPropagation(); handleConcluirAgendamento(ag); }} className="btn-icon-xxs bg-green-500 hover:bg-green-400 text-white" title="Concluir"><IconeCheck className="w-3 h-3"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleCancelarAgendamento(ag); }} className="btn-icon-xxs bg-orange-500 hover:bg-orange-400 text-white" title="Cancelar"><IconeFechar className="w-3 h-3"/></button>
                                    <button onClick={(e) => { e.stopPropagation(); onReagendarAgendamento(ag); }} className="btn-icon-xxs bg-purple-500 hover:bg-purple-400 text-white" title="Reagendar"><IconeRefresh className="w-3 h-3"/></button>
                                    </>
                                )}
                                 {ag.status === 'Cancelado' && (
                                     <button onClick={(e) => { e.stopPropagation(); onReagendarAgendamento(ag); }} className="btn-icon-xxs bg-purple-500 hover:bg-purple-400 text-white" title="Reagendar"><IconeRefresh className="w-3 h-3"/></button>
                                 )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button 
                    onClick={() => onAdicionarAgendamento(dia.toISOString().split('T')[0])} 
                    className="mt-1 text-indigo-400 hover:text-indigo-300 text-xs w-full text-center py-0.5 hover:bg-indigo-500/10 rounded"
                    title="Adicionar agendamento neste dia"
                >
                    + Add
                </button>
                </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const inputBaseSmClasses = "w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500";
  const btnPrimaryClasses = "px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors";
  const btnSecondarySmClasses = "px-3 py-1.5 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors";
  const btnIconXsClasses = "p-1.5 rounded-md transition-colors";
  const btnIconXXsClasses = "p-1 rounded-sm transition-colors";


  return (
    <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-850">
      <style>{`
        .input-base-sm { @apply ${inputBaseSmClasses}; }
        .btn-primary { @apply ${btnPrimaryClasses}; }
        .btn-secondary-sm { @apply ${btnSecondarySmClasses}; }
        .btn-icon-xs { @apply ${btnIconXsClasses}; }
        .btn-icon-xxs { @apply ${btnIconXXsClasses}; }
      `}</style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center">
          <IconeCalendario className="w-7 h-7 mr-3 text-indigo-400" /> Minha Agenda
        </h1>
        <div className="flex flex-wrap items-center gap-2">
            <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as StatusAgendamento | '')} className="input-base-sm py-2 min-w-[120px]" aria-label="Filtrar por status do agendamento">
                <option value="">Status: Todos</option>
                {STATUS_AGENDAMENTO_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value as FiltroPeriodoAgenda)} className="input-base-sm py-2 min-w-[130px]" aria-label="Filtrar por período">
                <option value="todos">Período: Todos</option>
                <option value="hoje">Hoje</option>
                <option value="amanha">Amanhã</option>
                <option value="estaSemana">Esta Semana</option>
                <option value="proximos7Dias">Próximos 7 Dias</option>
                <option value="esteMes">Este Mês</option>
            </select>
            {visualizacao === 'lista' && (
                <select value={ordemLista} onChange={e => setOrdemLista(e.target.value as OrdemListaAgenda)} className="input-base-sm py-2 min-w-[150px]" aria-label="Ordenar lista de agendamentos">
                    <option value="dataRecente">Ordenar: Mais Recentes</option>
                    <option value="dataAntiga">Ordenar: Mais Antigos</option>
                    <option value="tituloAZ">Ordenar: Título (A-Z)</option>
                    <option value="statusAZ">Ordenar: Status (A-Z)</option>
                </select>
            )}

            <button 
                onClick={() => setVisualizacao('lista')}
                className={`p-2 rounded-md transition-colors ${visualizacao === 'lista' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                title="Visualização em Lista"
            > <IconeLista className="w-5 h-5"/> </button>
            <button 
                onClick={() => setVisualizacao('semana')}
                className={`p-2 rounded-md transition-colors ${visualizacao === 'semana' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                title="Visualização Semanal"
            > <IconeAgendaSemanal className="w-5 h-5"/> </button>
            <button onClick={() => onAdicionarAgendamento()} className="btn-primary flex items-center">
                <IconeAdicionar className="w-5 h-5 mr-2" /> Novo
            </button>
        </div>
      </div>

      {visualizacao === 'lista' ? renderListaAgendamentos() : renderVisualizacaoSemanal()}
    </main>
  );
};

export default AgendaView;
