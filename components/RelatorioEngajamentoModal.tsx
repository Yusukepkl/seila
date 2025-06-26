// components/RelatorioEngajamentoModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { 
    AlunoConsultoria, 
    StatusAluno, 
    TipoPeriodoRelatorio, 
    RelatorioEngajamentoFiltros,
    DadosRelatorioEngajamento,
    AtividadeTreinoConcluido,
    AtividadeMedidaRegistrada,
    AtividadeDiarioRegistrada,
    Agendamento // v0.1.2 (Parte 21): Import Agendamento
} from '../types';
import { OPCOES_PERIODO_RELATORIO, CORES_STATUS_ALUNO } from '../constants';
import { IconeDownload, IconeInfo, IconeCalendario } from './icons';

interface RelatorioEngajamentoModalProps {
  visivel: boolean;
  aoFechar: () => void;
  alunos: AlunoConsultoria[];
  agendamentos: Agendamento[]; // v0.1.2 (Parte 21): Adicionar prop de agendamentos globais
}

// Helper para formatar data para exibição
const formatarDataRelatorio = (dataStr: string | undefined): string => {
  if (!dataStr) return 'N/A';
  const partes = dataStr.split('-'); // Assume YYYY-MM-DD
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};
// Helper para formatar data e hora
const formatarDataHoraRelatorio = (dataHoraISO?: string): string => {
    if (!dataHoraISO) return 'Data/Hora não informada';
    try {
        const data = new Date(dataHoraISO);
        if (isNaN(data.getTime())) return 'Data/Hora inválida';
        return data.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) { return dataHoraISO; }
};


// v0.1.2 (Parte 21): Helper para formatar duração em meses e dias
const formatarDuracao = (totalDias: number): string => {
    if (isNaN(totalDias) || totalDias < 0) return "N/A";
    if (totalDias === 0) return "0 dias";

    const diasPorMes = 30.4375; // Média de dias em um mês
    const meses = Math.floor(totalDias / diasPorMes);
    const diasRestantes = Math.round(totalDias % diasPorMes);

    let resultado = "";
    if (meses > 0) {
        resultado += `${meses} mes${meses > 1 ? "es" : ""}`;
    }
    if (diasRestantes > 0) {
        if (meses > 0) resultado += " e ";
        resultado += `${diasRestantes} dia${diasRestantes > 1 ? "s" : ""}`;
    }
    return resultado || "Menos de 1 dia";
};


const getIntervaloDeDatasRelatorio = (periodo: TipoPeriodoRelatorio, inicioPersonalizado?: string, fimPersonalizado?: string): { dataInicio: Date, dataFim: Date } => {
  const agora = new Date();
  let dataInicio = new Date(agora);
  let dataFim = new Date(agora);

  dataInicio.setHours(0, 0, 0, 0);
  dataFim.setHours(23, 59, 59, 999);

  switch (periodo) {
    case 'mesAtual':
      dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
      dataFim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'trimestreAtual':
      const trimestre = Math.floor(agora.getMonth() / 3);
      dataInicio = new Date(agora.getFullYear(), trimestre * 3, 1);
      dataFim = new Date(agora.getFullYear(), trimestre * 3 + 3, 0, 23, 59, 59, 999);
      break;
    case 'anoAtual':
      dataInicio = new Date(agora.getFullYear(), 0, 1);
      dataFim = new Date(agora.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'ultimos30dias':
      dataInicio.setDate(agora.getDate() - 29);
      break;
    case 'ultimos90dias':
      dataInicio.setDate(agora.getDate() - 89);
      break;
    case 'personalizado':
      if (inicioPersonalizado) dataInicio = new Date(inicioPersonalizado + 'T00:00:00Z');
      if (fimPersonalizado) dataFim = new Date(fimPersonalizado + 'T23:59:59Z');
      break;
  }
  return { dataInicio, dataFim };
};

const RelatorioEngajamentoModal: React.FC<RelatorioEngajamentoModalProps> = ({
  visivel,
  aoFechar,
  alunos,
  agendamentos, // v0.1.2 (Parte 21): Utilizar prop de agendamentos globais
}) => {
  const hojeStr = new Date().toISOString().split('T')[0];
  const [filtros, setFiltros] = useState<RelatorioEngajamentoFiltros>({
    periodo: 'mesAtual',
    dataInicioPersonalizada: hojeStr,
    dataFimPersonalizada: hojeStr,
    statusAluno: 'Ativo', // Default to 'Ativo' for engagement, but can be changed
  });
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorioEngajamento | null>(null);
  
  const statusAlunoOptions: { value: StatusAluno | '', label: string }[] = [
    { value: '', label: 'Todos Status' },
    ...Object.keys(CORES_STATUS_ALUNO).map(statusKey => ({
        value: statusKey as StatusAluno,
        label: statusKey,
    }))
  ];


  useEffect(() => {
    if (visivel && alunos) {
      const { dataInicio, dataFim } = getIntervaloDeDatasRelatorio(filtros.periodo, filtros.dataInicioPersonalizada, filtros.dataFimPersonalizada);
      
      let totalTreinosConcluidos = 0;
      let totalAtualizacoesProgresso = 0; // Medidas + Diário
      let totalAlunosConsiderados = 0; // Para as médias, baseado no filtro de status E atividade no período
      
      const treinosConcluidosLista: AtividadeTreinoConcluido[] = [];
      const medidasRegistradasLista: AtividadeMedidaRegistrada[] = [];
      const diarioRegistradosLista: AtividadeDiarioRegistrada[] = [];

      const alunosFiltradosPorStatus = filtros.statusAluno 
        ? alunos.filter(al => al.status === filtros.statusAluno) 
        : alunos;

      alunosFiltradosPorStatus.forEach(aluno => {
        let alunoTeveAtividadeNoPeriodo = false;

        // 1. Treinos Concluídos
        const treinosAluno = (agendamentos || []).filter(ag => 
            ag.alunoId === aluno.id && 
            ag.status === 'Concluído' &&
            ag.tipo === 'Treino' // Considerar apenas agendamentos do tipo 'Treino' como treinos
        );
        treinosAluno.forEach(treino => {
          const dataTreino = new Date(treino.data + 'T00:00:00Z');
          if (dataTreino >= dataInicio && dataTreino <= dataFim) {
            totalTreinosConcluidos++;
            alunoTeveAtividadeNoPeriodo = true;
            treinosConcluidosLista.push({
                id: treino.id,
                data: treino.data,
                alunoNome: aluno.nome,
                alunoId: aluno.id,
                tituloTreino: treino.titulo
            });
          }
        });

        // 2. Medidas Corporais Registradas
        (aluno.historicoMedidas || []).forEach(medida => {
          const dataMedida = new Date(medida.data + 'T00:00:00Z');
          if (dataMedida >= dataInicio && dataMedida <= dataFim) {
            totalAtualizacoesProgresso++;
            alunoTeveAtividadeNoPeriodo = true;
            let resumo = Object.entries(medida)
                .filter(([key, value]) => key !== 'id' && key !== 'data' && key !== 'observacoesAdicionais' && value !== undefined && value !== null && value !== '')
                .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                .slice(0, 3).join(', '); // Pega os 3 primeiros para resumo
            if (Object.keys(medida).length > 5) resumo += '...'; // Se houver mais de 3 medidas além de id/data/obs

            medidasRegistradasLista.push({
                id: medida.id,
                data: medida.data,
                alunoNome: aluno.nome,
                alunoId: aluno.id,
                resumoMedida: resumo || "Medida registrada"
            });
          }
        });

        // 3. Entradas no Diário
        (aluno.diario || []).forEach(entry => {
          const dataEntry = new Date(entry.data); // Presume que entry.data pode ter hora
          if (dataEntry >= dataInicio && dataEntry <= dataFim) {
            totalAtualizacoesProgresso++;
            alunoTeveAtividadeNoPeriodo = true;
            diarioRegistradosLista.push({
                id: entry.id,
                data: entry.data,
                alunoNome: aluno.nome,
                alunoId: aluno.id,
                tipoDiario: entry.tipo,
                tituloDiario: entry.titulo,
                conteudo: entry.conteudo, // Adicionado para popular a propriedade
            });
          }
        });
        
        if (alunoTeveAtividadeNoPeriodo) {
            totalAlunosConsiderados++;
        }
      });

      const mediaTreinosConcluidosPorAluno = totalAlunosConsiderados > 0 ? totalTreinosConcluidos / totalAlunosConsiderados : 0;
      const mediaAtualizacoesProgressoPorAluno = totalAlunosConsiderados > 0 ? totalAtualizacoesProgresso / totalAlunosConsiderados : 0;

      // v0.1.2 (Parte 21): Calcular Tempo Médio de Permanência
      let totalDiasPermanencia = 0;
      let countAlunosParaPermanencia = 0;
      let tempoMedioPermanenciaStr = "N/A";

      alunos.filter(al => al.status === 'Inativo' || al.status === 'Expirado').forEach(aluno => {
        if (!aluno.dataInicio) return;

        const dataInicioAluno = new Date(aluno.dataInicio + 'T00:00:00Z');
        let datasFimPotenciais: Date[] = [];

        (aluno.historicoPagamentos || []).forEach(pg => {
            datasFimPotenciais.push(new Date(pg.data + 'T00:00:00Z'));
        });

        (agendamentos || []).filter(ag => ag.alunoId === aluno.id && ag.status === 'Concluído').forEach(ag => {
            datasFimPotenciais.push(new Date(ag.data + 'T00:00:00Z'));
        });
        
        if (datasFimPotenciais.length > 0) {
            const dataFimProxy = new Date(Math.max(...datasFimPotenciais.map(d => d.getTime())));
            if (dataFimProxy >= dataInicioAluno) {
                const permanenciaMs = dataFimProxy.getTime() - dataInicioAluno.getTime();
                totalDiasPermanencia += permanenciaMs / (1000 * 60 * 60 * 24);
                countAlunosParaPermanencia++;
            }
        }
      });

      if (countAlunosParaPermanencia > 0) {
          const mediaDias = totalDiasPermanencia / countAlunosParaPermanencia;
          tempoMedioPermanenciaStr = formatarDuracao(mediaDias);
      }


      setDadosRelatorio({
        filtros,
        kpis: { 
            mediaTreinosConcluidosPorAluno, 
            mediaAtualizacoesProgressoPorAluno, 
            totalAlunosAtivosConsiderados: totalAlunosConsiderados,
            tempoMedioPermanencia: tempoMedioPermanenciaStr // v0.1.2 (Parte 21)
        },
        treinosConcluidos: treinosConcluidosLista.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
        medidasRegistradas: medidasRegistradasLista.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
        diarioRegistrados: diarioRegistradosLista.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
      });

    } else if (visivel) { // Caso alunos seja vazio mas modal esteja visível
        setDadosRelatorio({
            filtros,
            kpis: { mediaTreinosConcluidosPorAluno: 0, mediaAtualizacoesProgressoPorAluno: 0, totalAlunosAtivosConsiderados: 0, tempoMedioPermanencia: "N/A" },
            treinosConcluidos: [],
            medidasRegistradas: [],
            diarioRegistrados: [],
        });
    }
  }, [visivel, alunos, agendamentos, filtros]);

  const handleFiltroChange = (campo: keyof RelatorioEngajamentoFiltros, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleExportarCSV = () => {
    if (!dadosRelatorio || 
        (dadosRelatorio.treinosConcluidos.length === 0 && 
         dadosRelatorio.medidasRegistradas.length === 0 && 
         dadosRelatorio.diarioRegistrados.length === 0)) {
      alert("Não há dados de atividades para exportar.");
      return;
    }
    const { dataInicio, dataFim } = getIntervaloDeDatasRelatorio(filtros.periodo, filtros.dataInicioPersonalizada, filtros.dataFimPersonalizada);
    const nomeArquivo = `Relatorio_Engajamento_${dataInicio.toISOString().split('T')[0]}_a_${dataFim.toISOString().split('T')[0]}.csv`;

    const cabecalhos = ["Data", "Tipo Atividade", "Aluno", "Detalhe"];
    const linhas: (string[])[] = [];

    dadosRelatorio.treinosConcluidos.forEach(t => linhas.push([
      formatarDataRelatorio(t.data), "Treino Concluído", t.alunoNome, t.tituloTreino
    ]));
    dadosRelatorio.medidasRegistradas.forEach(m => linhas.push([
      formatarDataRelatorio(m.data), "Medida Registrada", m.alunoNome, m.resumoMedida
    ]));
    dadosRelatorio.diarioRegistrados.forEach(d => linhas.push([
      formatarDataHoraRelatorio(d.data), "Entrada no Diário", d.alunoNome, `${d.tipoDiario}${d.tituloDiario ? ': ' + d.tituloDiario : ''} - Conteúdo: ${d.conteudo.substring(0,50)}...`
    ]));
    
    // Ordenar todas as atividades por data (mais recente primeiro)
    linhas.sort((a,b) => {
        // Assumindo que o primeiro elemento é sempre uma data formatada (DD/MM/YYYY ou DD/MM/YYYY HH:MM)
        const parseDate = (dateStr: string) => {
            const parts = dateStr.split(' ');
            const dateParts = parts[0].split('/');
            if (parts.length > 1) { // Data e Hora
                const timeParts = parts[1].split(':');
                return new Date(Number(dateParts[2]), Number(dateParts[1])-1, Number(dateParts[0]), Number(timeParts[0]), Number(timeParts[1])).getTime();
            } else { // Só Data
                return new Date(Number(dateParts[2]), Number(dateParts[1])-1, Number(dateParts[0])).getTime();
            }
        };
        return parseDate(b[0]) - parseDate(a[0]);
    });


    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; 
    csvContent += cabecalhos.join(";") + "\r\n";
    linhas.forEach(linhaArray => {
      csvContent += linhaArray.map(item => `"${String(item).replace(/"/g, '""')}"`).join(";") + "\r\n";
    });
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAtividades = () => {
    if (!dadosRelatorio) return null;
    const todasAtividades = [
        ...dadosRelatorio.treinosConcluidos.map(t => ({ ...t, tipoDisplay: 'Treino Concluído', detalheDisplay: t.tituloTreino, dataOriginal: t.data })),
        ...dadosRelatorio.medidasRegistradas.map(m => ({ ...m, tipoDisplay: 'Medida Registrada', detalheDisplay: m.resumoMedida, dataOriginal: m.data })),
        ...dadosRelatorio.diarioRegistrados.map(d => ({ ...d, tipoDisplay: `Diário: ${d.tipoDiario}`, detalheDisplay: d.tituloDiario || d.conteudo.substring(0, 50) + (d.conteudo.length > 50 ? '...' : ''), dataOriginal: d.data }))
    ].sort((a,b) => new Date(b.dataOriginal).getTime() - new Date(a.dataOriginal).getTime());

    if (todasAtividades.length === 0) {
        return (
            <div className="text-center py-8 text-slate-500">
                <IconeInfo className="w-12 h-12 mx-auto mb-3 opacity-60"/>
                <p>Nenhuma atividade encontrada para os filtros selecionados.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto max-h-[35vh] relative">
            <table className="min-w-full text-xs text-left">
                <thead className="sticky top-0 bg-slate-700 z-10">
                    <tr>
                        <th className="px-3 py-2.5 font-medium text-slate-300">Data</th>
                        <th className="px-3 py-2.5 font-medium text-slate-300">Aluno</th>
                        <th className="px-3 py-2.5 font-medium text-slate-300">Tipo Atividade</th>
                        <th className="px-3 py-2.5 font-medium text-slate-300">Detalhe</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                    {todasAtividades.map((item, index) => (
                        <tr key={`${item.id}-${index}`} className="hover:bg-slate-600/50">
                            <td className="px-3 py-2 whitespace-nowrap">{item.tipoDisplay.startsWith('Diário') ? formatarDataHoraRelatorio(item.dataOriginal) : formatarDataRelatorio(item.dataOriginal)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{item.alunoNome}</td>
                            <td className="px-3 py-2 whitespace-nowrap">{item.tipoDisplay}</td>
                            <td className="px-3 py-2 truncate max-w-sm" title={item.detalheDisplay}>{item.detalheDisplay}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
  };

  return (
    <Modal titulo="Relatório de Engajamento e Atividade" visivel={visivel} aoFechar={aoFechar} largura="max-w-5xl">
      <div className="space-y-6">
        {/* Filtros */}
        <div className="p-4 bg-slate-700/50 rounded-lg">
          <h4 className="text-md font-semibold text-slate-200 mb-3">Filtros do Relatório</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label htmlFor="filtroEngPeriodo" className="block text-xs font-medium text-slate-400 mb-1">Período</label>
              <select id="filtroEngPeriodo" value={filtros.periodo} onChange={(e) => handleFiltroChange('periodo', e.target.value)} className="input-base-sm py-2">
                {OPCOES_PERIODO_RELATORIO.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {filtros.periodo === 'personalizado' && (
              <>
                <div>
                  <label htmlFor="filtroEngDataInicio" className="block text-xs font-medium text-slate-400 mb-1">Data Início</label>
                  <input type="date" id="filtroEngDataInicio" value={filtros.dataInicioPersonalizada} onChange={(e) => handleFiltroChange('dataInicioPersonalizada', e.target.value)} className="input-base-sm py-2"/>
                </div>
                <div>
                  <label htmlFor="filtroEngDataFim" className="block text-xs font-medium text-slate-400 mb-1">Data Fim</label>
                  <input type="date" id="filtroEngDataFim" value={filtros.dataFimPersonalizada} onChange={(e) => handleFiltroChange('dataFimPersonalizada', e.target.value)} className="input-base-sm py-2"/>
                </div>
              </>
            )}
            <div>
                <label htmlFor="filtroEngStatusAluno" className="block text-xs font-medium text-slate-400 mb-1">Status do Aluno</label>
                <select id="filtroEngStatusAluno" value={filtros.statusAluno} onChange={(e) => handleFiltroChange('statusAluno', e.target.value)} className="input-base-sm py-2">
                     {statusAlunoOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
          </div>
        </div>

        {/* KPIs de Engajamento */}
        {dadosRelatorio && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-sky-600/20 p-3 rounded-lg text-center">
              <p className="text-xs text-sky-300 uppercase">Média Treinos Concluídos</p>
              <p className="text-xl font-bold text-sky-200">{dadosRelatorio.kpis.mediaTreinosConcluidosPorAluno.toFixed(1)}</p>
              <p className="text-xs text-slate-400">por aluno no período</p>
            </div>
            <div className="bg-purple-600/20 p-3 rounded-lg text-center">
              <p className="text-xs text-purple-300 uppercase">Média Atualizações Progresso</p>
              <p className="text-xl font-bold text-purple-200">{dadosRelatorio.kpis.mediaAtualizacoesProgressoPorAluno.toFixed(1)}</p>
              <p className="text-xs text-slate-400">(medidas, diário) por aluno</p>
            </div>
            <div className="bg-teal-600/20 p-3 rounded-lg text-center">
              <p className="text-xs text-teal-300 uppercase">Alunos Considerados</p>
              <p className="text-xl font-bold text-teal-200">{dadosRelatorio.kpis.totalAlunosAtivosConsiderados}</p>
              <p className="text-xs text-slate-400">({filtros.statusAluno || 'Todos'}) com atividade</p>
            </div>
            {/* v0.1.2 (Parte 21): KPI de Tempo Médio de Permanência */}
            <div className="bg-amber-600/20 p-3 rounded-lg text-center">
              <p className="text-xs text-amber-300 uppercase">Permanência Média</p>
              <p className="text-xl font-bold text-amber-200">{dadosRelatorio.kpis.tempoMedioPermanencia || "N/A"}</p>
              <p className="text-xs text-slate-400">(Ex-Alunos Inativos/Expirados)</p>
            </div>
          </div>
        )}
        
        {/* Lista de Atividades */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
           <div className="flex justify-between items-center mb-3">
             <h4 className="text-md font-semibold text-slate-200">Detalhe das Atividades no Período</h4>
             <button 
                onClick={handleExportarCSV} 
                className="btn-secondary-xs flex items-center" 
                disabled={!dadosRelatorio || (dadosRelatorio.treinosConcluidos.length === 0 && dadosRelatorio.medidasRegistradas.length === 0 && dadosRelatorio.diarioRegistrados.length === 0)}
            >
                <IconeDownload className="w-4 h-4 mr-1.5"/> Exportar CSV
             </button>
           </div>
          {renderAtividades()}
        </div>
        
        <div className="flex justify-end pt-4">
            <button onClick={aoFechar} className="btn-secondary">Fechar Relatório</button>
        </div>
      </div>
       <style>{`
        .input-base-sm { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500; }
        .btn-secondary { @apply px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors; }
        .btn-secondary-xs { @apply px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-500 hover:bg-slate-400 rounded-md transition-colors; }
      `}</style>
    </Modal>
  );
};

export default RelatorioEngajamentoModal;
// Nota: Este modal 'RelatorioEngajamentoModal' precisa ser renderizado condicionalmente em App.tsx,
// assim como os outros modais (ex: 'patchNotes', 'adicionarAluno', etc.), e receber as props 'alunos' e 'agendamentos'.
// Atualmente, o case 'relatorioEngajamento' não está implementado em App.tsx -> renderModalOuViewAtiva.
// A funcionalidade de abrir este modal precisará ser adicionada em algum lugar na UI (ex: Sidebar).