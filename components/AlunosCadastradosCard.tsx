// components/AlunosCadastradosCard.tsx
import React from 'react';
import DonutChart from './DonutChart';
import { ItemGraficoPizza, DadosAlunosCadastrados, StatusAluno } from '../types';
import { CORES_GRAFICO_ALUNOS } from '../constants';

interface AlunosCadastradosCardProps {
  dados: DadosAlunosCadastrados;
}

const AlunosCadastradosCard: React.FC<AlunosCadastradosCardProps> = ({ dados }) => {
  const totalAlunos = dados.ativos + dados.expirados + dados.bloqueados + (dados.inativos || 0) + (dados.pausados || 0);

  const dadosGrafico: ItemGraficoPizza[] = [
    { nome: 'Ativos', valor: dados.ativos, cor: CORES_GRAFICO_ALUNOS.Ativo, percentual: totalAlunos > 0 ? `${Math.round((dados.ativos / totalAlunos) * 100)}%` : '0%' },
    { nome: 'Expirados', valor: dados.expirados, cor: CORES_GRAFICO_ALUNOS.Expirado, percentual: totalAlunos > 0 ? `${Math.round((dados.expirados / totalAlunos) * 100)}%` : '0%' },
    { nome: 'Bloqueados', valor: dados.bloqueados, cor: CORES_GRAFICO_ALUNOS.Bloqueado, percentual: totalAlunos > 0 ? `${Math.round((dados.bloqueados / totalAlunos) * 100)}%` : '0%' },
    // v0.1.2: Adicionar novos status ao gráfico se existirem
    ...(dados.inativos > 0 ? [{ nome: 'Inativos', valor: dados.inativos, cor: CORES_GRAFICO_ALUNOS.Inativo, percentual: totalAlunos > 0 ? `${Math.round((dados.inativos / totalAlunos) * 100)}%` : '0%' }] : []),
    ...(dados.pausados > 0 ? [{ nome: 'Pausados', valor: dados.pausados, cor: CORES_GRAFICO_ALUNOS.Pausado, percentual: totalAlunos > 0 ? `${Math.round((dados.pausados / totalAlunos) * 100)}%` : '0%' }] : []),
  ].filter(item => item.valor > 0 || totalAlunos === 0); 

   const dadosGraficoFinal = dadosGrafico.length > 0 ? dadosGrafico : [{ nome: 'Nenhum aluno', valor: 1, cor: '#4A5568', percentual: '100%'}];


  return (
    <div className="bg-slate-700 p-5 rounded-lg shadow h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">
        Alunos Cadastrados - {dados.ativos}/{dados.totalCapacidade}
      </h3>
      <div className="flex flex-col md:flex-row md:items-center flex-grow">
        <div className="w-full md:w-1/2 h-40 md:h-auto">
           <DonutChart dados={dadosGraficoFinal} innerRadius="65%" outerRadius="90%" exibirLegenda={true} />
        </div>
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-4 text-xs text-slate-400">
           {/* Espaço para futuras informações, como contagem detalhada por status aqui se a legenda não for suficiente */}
        </div>
      </div>
    </div>
  );
};

export default AlunosCadastradosCard;