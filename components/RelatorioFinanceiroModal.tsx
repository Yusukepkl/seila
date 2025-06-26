// components/RelatorioFinanceiroModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { AlunoConsultoria, Pagamento, TipoPeriodoRelatorio, RelatorioFinanceiroFiltros, TransacaoRelatorio, DadosRelatorioFinanceiro, StatusPagamentoOpcoes } from '../types';
import { OPCOES_PERIODO_RELATORIO, CORES_STATUS_PAGAMENTO } from '../constants';
import { IconeDownload, IconeInfo, IconeGraficoLinha } from './icons'; // v0.1.2 (Parte 18): Add IconeGraficoLinha
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'; // v0.1.2 (Parte 18): Add chart components


interface RelatorioFinanceiroModalProps {
  visivel: boolean;
  aoFechar: () => void;
  alunos: AlunoConsultoria[]; // Para obter todos os pagamentos
}

const formatarData = (dataStr: string | undefined): string => {
  if (!dataStr) return 'N/A';
  // Assume que dataStr é YYYY-MM-DD
  const partes = dataStr.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataStr;
};

const formatarMoeda = (valor: number): string => {
  return `R$ ${valor.toFixed(2).replace('.', ',')}`;
};

const getIntervaloDeDatas = (periodo: TipoPeriodoRelatorio, inicioPersonalizado?: string, fimPersonalizado?: string): { dataInicio: Date, dataFim: Date } => {
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

const TOP_X_ALUNOS = 5; // v0.1.2 (Parte 18)

const RelatorioFinanceiroModal: React.FC<RelatorioFinanceiroModalProps> = ({
  visivel,
  aoFechar,
  alunos,
}) => {
  const hojeStr = new Date().toISOString().split('T')[0];
  const [filtros, setFiltros] = useState<RelatorioFinanceiroFiltros>({
    periodo: 'mesAtual',
    dataInicioPersonalizada: hojeStr,
    dataFimPersonalizada: hojeStr,
  });
  const [dadosRelatorio, setDadosRelatorio] = useState<DadosRelatorioFinanceiro | null>(null);
  const [ordenacao, setOrdenacao] = useState<{ coluna: keyof TransacaoRelatorio | null, direcao: 'asc' | 'desc' }>({ coluna: 'data', direcao: 'desc'});


  useEffect(() => {
    if (visivel && alunos.length > 0) {
      const { dataInicio, dataFim } = getIntervaloDeDatas(filtros.periodo, filtros.dataInicioPersonalizada, filtros.dataFimPersonalizada);
      
      let receitaRealizadaPeriodo = 0;
      let receitaPrevistaPeriodo = 0;
      let totalAtrasadoPeriodo = 0;
      const transacoesPeriodo: TransacaoRelatorio[] = [];
      const receitaPorAlunoMap = new Map<string, { nome: string, receita: number }>(); // v0.1.2 (Parte 18)

      alunos.forEach(aluno => {
        (aluno.historicoPagamentos || []).forEach(pg => {
          const dataPagamento = new Date(pg.data + 'T00:00:00Z'); 
          const dataVencimento = pg.dataVencimento ? new Date(pg.dataVencimento + 'T00:00:00Z') : dataPagamento;
          const dataRelevanteParaPeriodo = pg.status === 'Pago' ? dataPagamento : dataVencimento;

          if (dataRelevanteParaPeriodo >= dataInicio && dataRelevanteParaPeriodo <= dataFim) {
            transacoesPeriodo.push({ ...pg, alunoId: aluno.id, alunoNome: aluno.nome });

            if (pg.status === 'Pago') {
              receitaRealizadaPeriodo += pg.valor;
              // v0.1.2 (Parte 18): Contabilizar para ranking
              if (aluno.id && aluno.nome) {
                const atual = receitaPorAlunoMap.get(aluno.id) || { nome: aluno.nome, receita: 0 };
                atual.receita += pg.valor;
                receitaPorAlunoMap.set(aluno.id, atual);
              }
            }
            if (pg.status === 'Atrasado') {
              totalAtrasadoPeriodo += pg.valor;
            }
            receitaPrevistaPeriodo += pg.valor;
          }
        });
      });
      
      const taxaInadimplenciaPeriodo = receitaPrevistaPeriodo > 0 ? (totalAtrasadoPeriodo / receitaPrevistaPeriodo) * 100 : 0;

      // v0.1.2 (Parte 18): Processar dados para gráfico de evolução
      const evolucaoDataMap = new Map<string, { Realizada: number; Prevista: number }>();
      const diffTime = Math.abs(dataFim.getTime() - dataInicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) +1;
      const useMonthlyAggregation = diffDays > 90; // Agrega mensalmente para períodos maiores que ~3 meses

      for (let d = new Date(dataInicio); d <= dataFim; d.setDate(d.getDate() + (useMonthlyAggregation ? 0 : 1))) {
        const key = useMonthlyAggregation 
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
            : d.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!evolucaoDataMap.has(key)) {
            evolucaoDataMap.set(key, { Realizada: 0, Prevista: 0 });
        }
        if (useMonthlyAggregation) { // Avança para o próximo mês
            if (d.getMonth() === dataFim.getMonth() && d.getFullYear() === dataFim.getFullYear()) break; // Evita loop infinito se dataFim for o último dia do mês.
            d.setMonth(d.getMonth() + 1, 1); // Vai para o primeiro dia do próximo mês
             if (d > dataFim && !(d.getMonth() === dataFim.getMonth() && d.getFullYear() === dataFim.getFullYear()) ) break; // Garante que não ultrapasse o dataFim, a menos que seja o mesmo mês/ano
        }
      }
      
      transacoesPeriodo.forEach(pg => {
        const dataPagamento = new Date(pg.data + 'T00:00:00Z');
        const dataVencimento = pg.dataVencimento ? new Date(pg.dataVencimento + 'T00:00:00Z') : dataPagamento;
        
        const dataRealizadaKey = useMonthlyAggregation 
            ? `${dataPagamento.getFullYear()}-${String(dataPagamento.getMonth() + 1).padStart(2, '0')}`
            : dataPagamento.toISOString().split('T')[0];
        
        const dataPrevistaKey = useMonthlyAggregation
            ? `${dataVencimento.getFullYear()}-${String(dataVencimento.getMonth() + 1).padStart(2, '0')}`
            : dataVencimento.toISOString().split('T')[0];

        if (pg.status === 'Pago' && evolucaoDataMap.has(dataRealizadaKey)) {
          evolucaoDataMap.get(dataRealizadaKey)!.Realizada += pg.valor;
        }
        if (evolucaoDataMap.has(dataPrevistaKey)) {
            evolucaoDataMap.get(dataPrevistaKey)!.Prevista += pg.valor;
        }
      });

      const evolucaoReceitaData = Array.from(evolucaoDataMap.entries())
        .map(([key, values]) => ({
          dataLabel: useMonthlyAggregation 
            ? new Date(key + '-01T00:00:00Z').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }) 
            : new Date(key + 'T00:00:00Z').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }),
          ...values,
        }))
        .sort((a,b) => {
            const dateA = useMonthlyAggregation ? new Date(a.dataLabel.split('/').reverse().join('-') + '-01') : new Date(a.dataLabel.split('/').reverse().join('-'));
            const dateB = useMonthlyAggregation ? new Date(b.dataLabel.split('/').reverse().join('-') + '-01') : new Date(b.dataLabel.split('/').reverse().join('-'));
            // Para formatar datas de MMM/YY para YYYY-MM-DD antes de criar o objeto Date.
            // Ex: 'ago/24' -> '2024-08-01'
            const parseDateLabel = (label: string) => {
              if (useMonthlyAggregation) {
                  const [monthStr, yearStr] = label.split('/');
                  const monthMap: { [key: string]: string } = { jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06', jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12' };
                  return `20${yearStr}-${monthMap[monthStr.toLowerCase()]}-01`;
              } else { // DD/MM
                  const [day, month] = label.split('/');
                  // Assume ano corrente se não especificado, mas para comparação é melhor ter o ano.
                  // O ideal seria ter a data completa no 'dataLabel' se for para ordenar por ela.
                  // Como estamos usando a 'key' original para ordenar, está ok.
                  const fullYear = dataInicio.getFullYear(); // Usa o ano do início do período como referência
                  return `${fullYear}-${month}-${day}`;
              }
            };
            // A ordenação é feita pela key antes de formatar o dataLabel
             return new Date(parseDateLabel(a.dataLabel)).getTime() - new Date(parseDateLabel(b.dataLabel)).getTime();
        });
        if (useMonthlyAggregation) {
          evolucaoReceitaData.sort((a,b) => {
              const partsA = a.dataLabel.split('/'); // "ago/24"
              const partsB = b.dataLabel.split('/');
              const yearA = parseInt("20" + partsA[1], 10);
              const yearB = parseInt("20" + partsB[1], 10);
              const monthA = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].indexOf(partsA[0].toLowerCase());
              const monthB = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"].indexOf(partsB[0].toLowerCase());
              if (yearA !== yearB) return yearA - yearB;
              return monthA - monthB;
          });
        } else {
           evolucaoReceitaData.sort((a,b) => {
              const partsA = a.dataLabel.split('/'); // "DD/MM"
              const partsB = b.dataLabel.split('/');
              const dateA = new Date(`${dataInicio.getFullYear()}-${partsA[1]}-${partsA[0]}`); // Assume ano corrente do filtro
              const dateB = new Date(`${dataInicio.getFullYear()}-${partsB[1]}-${partsB[0]}`);
              return dateA.getTime() - dateB.getTime();
           });
        }


      // v0.1.2 (Parte 18): Ranking de alunos
      const rankingAlunosReceita = Array.from(receitaPorAlunoMap.entries())
        .map(([alunoId, data]) => ({ alunoId, alunoNome: data.nome, receitaTotal: data.receita }))
        .sort((a, b) => b.receitaTotal - a.receitaTotal)
        .slice(0, TOP_X_ALUNOS);

      setDadosRelatorio({
        filtros,
        kpis: { receitaRealizadaPeriodo, receitaPrevistaPeriodo, totalAtrasadoPeriodo, taxaInadimplenciaPeriodo },
        transacoes: transacoesPeriodo,
        evolucaoReceitaData, // v0.1.2 (Parte 18)
        rankingAlunosReceita, // v0.1.2 (Parte 18)
      });
    } else if (visivel) {
        setDadosRelatorio({
            filtros,
            kpis: { receitaRealizadaPeriodo: 0, receitaPrevistaPeriodo: 0, totalAtrasadoPeriodo: 0, taxaInadimplenciaPeriodo: 0 },
            transacoes: [],
            evolucaoReceitaData: [],
            rankingAlunosReceita: [],
        });
    }
  }, [visivel, alunos, filtros]);

  const handleFiltroChange = (campo: keyof RelatorioFinanceiroFiltros, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleExportarCSV = () => {
    if (!dadosRelatorio || dadosRelatorio.transacoes.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    const { dataInicio, dataFim } = getIntervaloDeDatas(filtros.periodo, filtros.dataInicioPersonalizada, filtros.dataFimPersonalizada);
    const nomeArquivo = `Relatorio_Financeiro_${formatarData(dataInicio.toISOString().split('T')[0])}_a_${formatarData(dataFim.toISOString().split('T')[0])}.csv`;

    const cabecalhos = ["Data", "Aluno", "Descrição", "Valor", "Status", "Data Vencimento"];
    const linhas = dadosRelatorio.transacoes.map(t => [
      formatarData(t.data),
      t.alunoNome || 'N/A',
      t.descricao || '',
      t.valor.toFixed(2).replace('.', ','),
      t.status,
      t.dataVencimento ? formatarData(t.dataVencimento) : '',
    ]);

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

  const transacoesOrdenadas = useMemo(() => {
    if (!dadosRelatorio) return [];
    const { coluna, direcao } = ordenacao;
    if (!coluna) return dadosRelatorio.transacoes;

    return [...dadosRelatorio.transacoes].sort((a, b) => {
        let valA = a[coluna];
        let valB = b[coluna];

        if (coluna === 'data' || coluna === 'dataVencimento') {
            valA = valA ? new Date(valA as string).getTime() : 0;
            valB = valB ? new Date(valB as string).getTime() : 0;
        } else if (coluna === 'valor') {
            valA = valA || 0;
            valB = valB || 0;
        } else { 
            valA = String(valA || '').toLowerCase();
            valB = String(valB || '').toLowerCase();
        }
        
        if (valA < valB) return direcao === 'asc' ? -1 : 1;
        if (valA > valB) return direcao === 'asc' ? 1 : -1;
        return 0;
    });
  }, [dadosRelatorio, ordenacao]);

  const handleOrdenar = (col: keyof TransacaoRelatorio) => {
    setOrdenacao(prev => ({
        coluna: col,
        direcao: prev.coluna === col && prev.direcao === 'desc' ? 'asc' : 'desc'
    }));
  };
  
  const renderSetaOrdenacao = (col: keyof TransacaoRelatorio) => {
    if (ordenacao.coluna !== col) return null;
    return ordenacao.direcao === 'asc' ? '▲' : '▼';
  };


  return (
    <Modal titulo="Relatório Financeiro Detalhado" visivel={visivel} aoFechar={aoFechar} largura="max-w-6xl">
      <div className="space-y-6">
        {/* Filtros */}
        <div className="p-4 bg-slate-700/50 rounded-lg">
          <h4 className="text-md font-semibold text-slate-200 mb-3">Filtros</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="filtroPeriodo" className="block text-xs font-medium text-slate-400 mb-1">Período</label>
              <select
                id="filtroPeriodo"
                value={filtros.periodo}
                onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                className="input-base-sm py-2"
              >
                {OPCOES_PERIODO_RELATORIO.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {filtros.periodo === 'personalizado' && (
              <>
                <div>
                  <label htmlFor="filtroDataInicio" className="block text-xs font-medium text-slate-400 mb-1">Data Início</label>
                  <input
                    type="date"
                    id="filtroDataInicio"
                    value={filtros.dataInicioPersonalizada}
                    onChange={(e) => handleFiltroChange('dataInicioPersonalizada', e.target.value)}
                    className="input-base-sm py-2"
                  />
                </div>
                <div>
                  <label htmlFor="filtroDataFim" className="block text-xs font-medium text-slate-400 mb-1">Data Fim</label>
                  <input
                    type="date"
                    id="filtroDataFim"
                    value={filtros.dataFimPersonalizada}
                    onChange={(e) => handleFiltroChange('dataFimPersonalizada', e.target.value)}
                    className="input-base-sm py-2"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* KPIs */}
        {dadosRelatorio && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-600/20 p-4 rounded-lg text-center">
              <p className="text-xs text-green-300 uppercase">Receita Realizada</p>
              <p className="text-2xl font-bold text-green-200">{formatarMoeda(dadosRelatorio.kpis.receitaRealizadaPeriodo)}</p>
            </div>
            <div className="bg-blue-600/20 p-4 rounded-lg text-center">
              <p className="text-xs text-blue-300 uppercase">Receita Prevista</p>
              <p className="text-2xl font-bold text-blue-200">{formatarMoeda(dadosRelatorio.kpis.receitaPrevistaPeriodo)}</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${dadosRelatorio.kpis.taxaInadimplenciaPeriodo > 10 ? 'bg-red-600/20' : 'bg-yellow-600/20'}`}>
              <p className={`text-xs uppercase ${dadosRelatorio.kpis.taxaInadimplenciaPeriodo > 10 ? 'text-red-300' : 'text-yellow-300'}`}>Inadimplência</p>
              <p className={`text-2xl font-bold ${dadosRelatorio.kpis.taxaInadimplenciaPeriodo > 10 ? 'text-red-200' : 'text-yellow-200'}`}>{dadosRelatorio.kpis.taxaInadimplenciaPeriodo.toFixed(1)}%</p>
               <p className="text-xs text-slate-400">(Atrasado: {formatarMoeda(dadosRelatorio.kpis.totalAtrasadoPeriodo)})</p>
            </div>
          </div>
        )}
        
        {/* v0.1.2 (Parte 18): Gráfico de Evolução e Ranking */}
        {dadosRelatorio && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-700/50 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-slate-200 mb-3 flex items-center">
                <IconeGraficoLinha className="w-5 h-5 mr-2 text-indigo-400" /> Evolução da Receita
              </h4>
              {dadosRelatorio.evolucaoReceitaData && dadosRelatorio.evolucaoReceitaData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={dadosRelatorio.evolucaoReceitaData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                    <XAxis dataKey="dataLabel" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={formatarMoeda} />
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.375rem' }} labelStyle={{ color: '#E2E8F0' }} itemStyle={{fontSize: '12px'}} />
                    <Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} />
                    <Bar dataKey="Prevista" name="Prevista" fill="#3B82F6" radius={[3, 3, 0, 0]} barSize={15} />
                    <Line type="monotone" dataKey="Realizada" name="Realizada" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-slate-500 min-h-[250px] flex flex-col justify-center items-center">
                  <IconeInfo className="w-10 h-10 mx-auto mb-2 opacity-60"/>
                  <p>Não há dados suficientes para exibir o gráfico de evolução.</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-1 bg-slate-700/50 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-slate-200 mb-3">Top {TOP_X_ALUNOS} Alunos por Receita (Pago)</h4>
              {dadosRelatorio.rankingAlunosReceita && dadosRelatorio.rankingAlunosReceita.length > 0 ? (
                <ul className="space-y-2 text-sm max-h-[250px] overflow-y-auto">
                  {dadosRelatorio.rankingAlunosReceita.map((aluno, index) => (
                    <li key={aluno.alunoId || index} className="flex justify-between items-center p-2 bg-slate-600/50 rounded-md">
                      <span className="text-slate-200 truncate">
                        <span className="font-semibold text-indigo-400 mr-2">{index + 1}.</span>
                        {aluno.alunoNome}
                      </span>
                      <span className="font-semibold text-green-400">{formatarMoeda(aluno.receitaTotal)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                 <div className="text-center py-8 text-slate-500 min-h-[250px] flex flex-col justify-center items-center">
                    <IconeInfo className="w-10 h-10 mx-auto mb-2 opacity-60"/>
                    <p>Nenhum aluno gerou receita no período.</p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* Tabela de Transações */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
           <div className="flex justify-between items-center mb-3">
             <h4 className="text-md font-semibold text-slate-200">Transações no Período</h4>
             <button onClick={handleExportarCSV} className="btn-secondary-xs flex items-center" disabled={!dadosRelatorio || dadosRelatorio.transacoes.length === 0}>
                <IconeDownload className="w-4 h-4 mr-1.5"/> Exportar CSV
             </button>
           </div>
          
          {dadosRelatorio && transacoesOrdenadas.length > 0 ? (
            <div className="overflow-x-auto max-h-[40vh] relative">
              <table className="min-w-full text-xs text-left">
                <thead className="sticky top-0 bg-slate-700 z-10">
                  <tr>
                    {([
                        { key: 'data', label: 'Data Pgto.' },
                        { key: 'alunoNome', label: 'Aluno' },
                        { key: 'descricao', label: 'Descrição' },
                        { key: 'valor', label: 'Valor' },
                        { key: 'status', label: 'Status' },
                        { key: 'dataVencimento', label: 'Data Venc.' },
                    ] as { key: keyof TransacaoRelatorio, label: string }[]).map(col => (
                         <th key={col.key} scope="col" className="px-3 py-2.5 font-medium text-slate-300 hover:text-indigo-300 cursor-pointer" onClick={() => handleOrdenar(col.key)}>
                            {col.label} {renderSetaOrdenacao(col.key)}
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                  {transacoesOrdenadas.map((t) => {
                    const statusCor = CORES_STATUS_PAGAMENTO[t.status];
                    return (
                        <tr key={t.id} className="hover:bg-slate-600/50">
                        <td className="px-3 py-2 whitespace-nowrap">{formatarData(t.data)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{t.alunoNome}</td>
                        <td className="px-3 py-2 truncate max-w-xs" title={t.descricao}>{t.descricao || '-'}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">{formatarMoeda(t.valor)}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${statusCor.bg} ${statusCor.text} border ${statusCor.border || 'border-transparent'}`}>
                            {t.status}
                            </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">{formatarData(t.dataVencimento)}</td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
                <IconeInfo className="w-12 h-12 mx-auto mb-3 opacity-60"/>
                <p>Nenhuma transação encontrada para o período selecionado.</p>
            </div>
          )}
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

export default RelatorioFinanceiroModal;