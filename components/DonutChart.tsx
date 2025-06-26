
// components/DonutChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ItemGraficoPizza } from '../types';

interface DonutChartProps {
  dados: ItemGraficoPizza[];
  innerRadius?: number | string;
  outerRadius?: number | string;
  exibirLegenda?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ dados, innerRadius = "70%", outerRadius = "100%", exibirLegenda = true }) => {
  const totalValor = dados.reduce((soma, item) => soma + item.valor, 0);

  // Calcula o percentual para cada item, se não fornecido
  const dadosComPercentual = dados.map(item => ({
    ...item,
    percentual: item.percentual || (totalValor > 0 ? ((item.valor / totalValor) * 100).toFixed(0) + '%' : '0%')
  }));
  
  // Custom Tooltip
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-700 p-2 rounded border border-slate-600 text-sm">
          <p className="text-white">{`${data.nome}: ${data.valor} (${data.percentual})`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom Legend
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col space-y-1 mt-2">
        {payload.map((entry: any, index: number) => {
          const itemOriginal = dadosComPercentual.find(d => d.nome === entry.payload.nome);
          return (
            <li key={`item-${index}`} className="flex items-center text-xs text-slate-300">
              <span style={{ backgroundColor: entry.color, width: '10px', height: '10px', marginRight: '8px', display: 'inline-block', borderRadius: '2px' }}></span>
              {entry.value}: {itemOriginal?.valor} ({itemOriginal?.percentual})
            </li>
          );
        })}
      </ul>
    );
  };


  return (
    <ResponsiveContainer width="100%" height={exibirLegenda ? 200 : 150}>
      <PieChart>
        <Pie
          data={dadosComPercentual}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          fill="#8884d8"
          paddingAngle={dados.length > 1 ? 5 : 0}
          dataKey="valor"
          stroke="none"
        >
          {dadosComPercentual.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.cor} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        {exibirLegenda && <Legend content={renderLegend} verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ fontSize: '12px', color: '#cbd5e1' }}/>}
        {!exibirLegenda && dadosComPercentual.length === 1 && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={dadosComPercentual[0].cor} fontSize="14px" fontWeight="bold">
                {dadosComPercentual[0].valor} ({dadosComPercentual[0].percentual})
            </text>
        )}
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
