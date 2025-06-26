// components/PainelFinanceiroCard.tsx
import React from 'react';
import { PainelFinanceiroData } from '../types';
import { IconeDinheiro, IconeGraficoBarras } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PainelFinanceiroCardProps {
  data: PainelFinanceiroData | null;
}

const PainelFinanceiroCard: React.FC<PainelFinanceiroCardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="bg-slate-700 p-5 rounded-lg shadow h-full flex flex-col items-center justify-center">
        <IconeDinheiro className="w-12 h-12 text-slate-500 mb-2" />
        <p className="text-slate-500">Dados financeiros indisponíveis.</p>
      </div>
    );
  }

  const { kpis, chartData } = data;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded border border-slate-600 shadow-lg text-xs">
          <p className="font-semibold text-slate-200 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  

  return (
    <div className="bg-slate-700 p-5 rounded-lg shadow h-full flex flex-col">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
        <IconeGraficoBarras className="w-5 h-5 mr-2 text-indigo-400" />
        Painel Financeiro
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 text-center">
        <div className={`p-2 rounded-md ${kpis.receitaRealizadaMes > 0 ? 'bg-green-500/20' : 'bg-slate-600/50'}`}>
          <p className="text-xs text-green-400 uppercase">Realizado Mês</p>
          <p className="text-lg font-bold text-green-300">{formatCurrency(kpis.receitaRealizadaMes)}</p>
        </div>
        <div className={`p-2 rounded-md ${kpis.pendenteMes > 0 ? 'bg-yellow-500/20' : 'bg-slate-600/50'}`}>
          <p className="text-xs text-yellow-400 uppercase">Pendente Mês</p>
          <p className="text-lg font-bold text-yellow-300">{formatCurrency(kpis.pendenteMes)}</p>
        </div>
        <div className={`p-2 rounded-md ${kpis.atrasadoGeral > 0 ? 'bg-red-500/20' : 'bg-slate-600/50'}`}>
          <p className="text-xs text-red-400 uppercase">Atrasado Geral</p>
          <p className="text-lg font-bold text-red-300">{formatCurrency(kpis.atrasadoGeral)}</p>
        </div>
        <div className={`p-2 rounded-md ${kpis.novosPagamentosHojeQtd > 0 ? 'bg-blue-500/20' : 'bg-slate-600/50'}`}>
          <p className="text-xs text-blue-400 uppercase">Pagos Hoje</p>
          <p className="text-lg font-bold text-blue-300">{formatCurrency(kpis.novosPagamentosHojeValor)} <span className="text-xs">({kpis.novosPagamentosHojeQtd})</span></p>
        </div>
      </div>
        
      <div className="flex-grow min-h-[150px]"> {/* Altura mínima para o gráfico */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} />
            <YAxis stroke="#94A3B8" fontSize={10} tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(71, 85, 105, 0.3)' }} />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
            <Bar dataKey="Realizada" fill="#10B981" name="Receita Realizada" radius={[4, 4, 0, 0]} barSize={25} />
            <Bar dataKey="Pendente" fill="#F59E0B" name="Pag. Pendentes" radius={[4, 4, 0, 0]} barSize={25} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PainelFinanceiroCard;
