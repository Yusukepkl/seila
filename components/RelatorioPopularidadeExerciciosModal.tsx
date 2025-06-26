// components/RelatorioPopularidadeExerciciosModal.tsx
import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { AlunoConsultoria, ExercicioBiblioteca, GrupoMuscular } from '../types';
import { GRUPOS_MUSCULARES_OPCOES } from '../constants';
import { IconeDownload, IconeGraficoBarras, IconeInfo } from './icons';

interface RelatorioPopularidadeExerciciosModalProps {
  visivel: boolean;
  aoFechar: () => void;
  alunos: AlunoConsultoria[];
  exerciciosBiblioteca: ExercicioBiblioteca[];
}

interface ExercicioPopularidade extends ExercicioBiblioteca {
  contagem: number;
}

const RelatorioPopularidadeExerciciosModal: React.FC<RelatorioPopularidadeExerciciosModalProps> = ({
  visivel,
  aoFechar,
  alunos,
  exerciciosBiblioteca,
}) => {
  const [filtroGrupoMuscular, setFiltroGrupoMuscular] = useState<GrupoMuscular | ''>('');
  const [ordenacao, setOrdenacao] = useState<{ coluna: keyof ExercicioPopularidade | 'contagem', direcao: 'asc' | 'desc' }>({ coluna: 'contagem', direcao: 'desc'});

  const dadosPopularidade = useMemo(() => {
    if (!visivel) return [];

    const contagemMap = new Map<string, number>();

    alunos.forEach(aluno => {
      aluno.planosDeTreino.forEach(plano => {
        plano.exercicios.forEach(exPlano => {
          if (exPlano.exercicioBibliotecaId) {
            contagemMap.set(exPlano.exercicioBibliotecaId, (contagemMap.get(exPlano.exercicioBibliotecaId) || 0) + 1);
          }
        });
      });
    });

    let popularidade: ExercicioPopularidade[] = exerciciosBiblioteca.map(exBib => ({
      ...exBib,
      contagem: contagemMap.get(exBib.id) || 0,
    }));

    if (filtroGrupoMuscular) {
      popularidade = popularidade.filter(ex => ex.grupoMuscularPrincipal === filtroGrupoMuscular);
    }
    
    // Aplicar Ordenação
    const { coluna, direcao } = ordenacao;
    if (coluna) {
      popularidade.sort((a, b) => {
        let valA = a[coluna as keyof ExercicioPopularidade]; // Type assertion for contagem
        let valB = b[coluna as keyof ExercicioPopularidade];

        if (typeof valA === 'number' && typeof valB === 'number') {
            return direcao === 'asc' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
            return direcao === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return 0;
      });
    }


    return popularidade;
  }, [visivel, alunos, exerciciosBiblioteca, filtroGrupoMuscular, ordenacao]);

  const handleExportarCSV = () => {
    if (dadosPopularidade.length === 0) {
      alert("Não há dados para exportar.");
      return;
    }
    const nomeArquivo = `Relatorio_Popularidade_Exercicios_${new Date().toISOString().split('T')[0]}.csv`;

    const cabecalhos = ["Exercício", "Grupo Muscular Principal", "Contagem de Uso"];
    const linhas = dadosPopularidade.map(ex => [
      ex.nome,
      ex.grupoMuscularPrincipal,
      ex.contagem.toString(),
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM para Excel
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
  
  const handleOrdenar = (col: keyof ExercicioPopularidade | 'contagem') => {
    setOrdenacao(prev => ({
        coluna: col,
        direcao: prev.coluna === col && prev.direcao === 'desc' ? 'asc' : 'desc'
    }));
  };

  const renderSetaOrdenacao = (col: keyof ExercicioPopularidade | 'contagem') => {
    if (ordenacao.coluna !== col) return null;
    return ordenacao.direcao === 'asc' ? '▲' : '▼';
  };


  return (
    <Modal titulo="Relatório de Popularidade de Exercícios" visivel={visivel} aoFechar={aoFechar} largura="max-w-4xl">
      <div className="space-y-6">
        {/* Filtros */}
        <div className="p-4 bg-slate-700/50 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>
            <label htmlFor="filtroGrupoMuscular" className="block text-xs font-medium text-slate-400 mb-1">Filtrar por Grupo Muscular Principal</label>
            <select
              id="filtroGrupoMuscular"
              value={filtroGrupoMuscular}
              onChange={(e) => setFiltroGrupoMuscular(e.target.value as GrupoMuscular | '')}
              className="input-base-sm py-2 min-w-[200px]"
            >
              <option value="">Todos os Grupos</option>
              {GRUPOS_MUSCULARES_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
           <button onClick={handleExportarCSV} className="btn-secondary-xs flex items-center mt-2 sm:mt-0" disabled={dadosPopularidade.length === 0}>
              <IconeDownload className="w-4 h-4 mr-1.5"/> Exportar CSV
           </button>
        </div>

        {/* Tabela de Popularidade */}
        <div className="bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-md font-semibold text-slate-200 mb-3">Popularidade dos Exercícios</h4>
          {dadosPopularidade.length > 0 ? (
            <div className="overflow-x-auto max-h-[50vh] relative">
              <table className="min-w-full text-xs text-left">
                <thead className="sticky top-0 bg-slate-700 z-10">
                  <tr>
                    {([
                        { key: 'nome', label: 'Exercício' },
                        { key: 'grupoMuscularPrincipal', label: 'Grupo Muscular' },
                        { key: 'contagem', label: 'Contagem de Uso' },
                    ] as { key: keyof ExercicioPopularidade | 'contagem', label: string }[]).map(col => (
                         <th key={col.key} scope="col" className="px-3 py-2.5 font-medium text-slate-300 hover:text-indigo-300 cursor-pointer" onClick={() => handleOrdenar(col.key)}>
                            {col.label} {renderSetaOrdenacao(col.key)}
                        </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600">
                  {dadosPopularidade.map((ex) => (
                    <tr key={ex.id} className="hover:bg-slate-600/50">
                      <td className="px-3 py-2 whitespace-nowrap">{ex.nome}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{ex.grupoMuscularPrincipal}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-center">{ex.contagem}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
                <IconeInfo className="w-12 h-12 mx-auto mb-3 opacity-60"/>
                <p>Nenhum exercício encontrado com os filtros atuais ou a biblioteca está vazia.</p>
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

export default RelatorioPopularidadeExerciciosModal;