// components/MainContent.tsx
import React from 'react';
import AlunosCadastradosCard from './AlunosCadastradosCard';
import ObjetivosCard from './ObjetivosCard';
import TempoConsultoriaCard from './TempoConsultoriaCard';
import ProximosAgendamentosCard from './ProximosAgendamentosCard'; // v0.1.0
import PainelFinanceiroCard from './PainelFinanceiroCard'; // v0.1.2 (Parte 9)
import { AlunoConsultoria, DadosAlunosCadastrados, Objetivo, Agendamento, StatusAluno, PainelFinanceiroData, ToastType } from '../types';

interface MainContentProps {
  dadosAlunos: DadosAlunosCadastrados;
  objetivos: Objetivo[]; 
  onAbrirModalObjetivo: (objetivo?: Objetivo) => void;
  onRemoverObjetivo: (objetivoId: string) => void;
  // getProximoIdObjetivo: () => Promise<string>; // Removed as ID generation is handled in App.tsx
  alunosConsultoria: AlunoConsultoria[];
  aoAdicionarAluno: () => void;
  aoAbrirPerfilAluno: (aluno: AlunoConsultoria) => void;
  // v0.1.0: Props para ProximosAgendamentosCard
  agendamentos: Agendamento[];
  onAbrirAgenda: () => void;
  onAdicionarAgendamentoRapido: () => void; // v0.1.1
  // v0.1.2 (Parte 2): Novas props
  contagemAgendamentosHoje: number;
  contagemAgendamentosAmanha: number;
  filtroStatusAlunos: StatusAluno | '';
  onFiltroStatusAlunosChange: (status: StatusAluno | '') => void;
  filtroObjetivoAlunos: string;
  onFiltroObjetivoAlunosChange: (objetivo: string) => void;
  // v0.1.2 (Parte 9): Dados para Painel Financeiro
  painelFinanceiroData: PainelFinanceiroData | null;
  addToast: (message: string, type?: ToastType) => void; 
}

const MainContent: React.FC<MainContentProps> = ({
  dadosAlunos,
  objetivos,
  onAbrirModalObjetivo,
  onRemoverObjetivo,
  // getProximoIdObjetivo, // Removed
  alunosConsultoria,
  aoAdicionarAluno,
  aoAbrirPerfilAluno,
  agendamentos, 
  onAbrirAgenda, 
  onAdicionarAgendamentoRapido,
  contagemAgendamentosHoje,
  contagemAgendamentosAmanha,
  filtroStatusAlunos,
  onFiltroStatusAlunosChange,
  filtroObjetivoAlunos,
  onFiltroObjetivoAlunosChange,
  painelFinanceiroData,
  addToast, // addToast is still a prop of MainContent for other potential uses or direct children
}) => {
  return (
    <main className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Primeira Linha de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-full">
          <AlunosCadastradosCard dados={dadosAlunos} />
        </div>
        {painelFinanceiroData && (
          <div className="lg:col-span-2 h-full">
            <PainelFinanceiroCard data={painelFinanceiroData} />
          </div>
        )}
      </div>

      {/* Segunda Linha de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="h-full">
            <ObjetivosCard 
            objetivos={objetivos}
            onAdicionarObjetivo={() => onAbrirModalObjetivo()} 
            onEditarObjetivo={(obj) => onAbrirModalObjetivo(obj)}
            onRemoverObjetivo={onRemoverObjetivo}
            // addToast prop removed from ObjetivosCard as it no longer directly uses it
            />
        </div>
        <div className="h-full">
            <ProximosAgendamentosCard 
            agendamentos={agendamentos}
            onVerAgendaCompleta={onAbrirAgenda}
            onAdicionarAgendamentoRapido={onAdicionarAgendamentoRapido} 
            contagemAgendamentosHoje={contagemAgendamentosHoje} 
            contagemAgendamentosAmanha={contagemAgendamentosAmanha} 
            />
        </div>
      </div>
      
      {/* Terceira Linha - Card de Alunos (geralmente mais alto) */}
      <div>
        <TempoConsultoriaCard
            alunos={alunosConsultoria}
            aoAdicionarAluno={aoAdicionarAluno}
            aoAbrirDetalhesAluno={aoAbrirPerfilAluno}
            filtroStatus={filtroStatusAlunos} 
            onFiltroStatusChange={onFiltroStatusAlunosChange} 
            filtroObjetivo={filtroObjetivoAlunos} 
            onFiltroObjetivoChange={onFiltroObjetivoAlunosChange} 
        />
      </div>
    </main>
  );
};

export default MainContent;