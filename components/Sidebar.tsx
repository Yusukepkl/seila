// components/Sidebar.tsx
import React from 'react';
import ProfileCard from './ProfileCard';
import NavButton from './NavButton';
import { PerfilProfessor } from '../types'; // Import PerfilProfessor
import { IconeInfo, IconeTemplate, IconeDocumentoTexto, IconeBiblioteca, IconeGraficoBarras } from './icons'; // v0.1.2 (Parte 11): Add IconeBiblioteca, v0.1.2 (Parte 15) Add IconeGraficoBarras

interface SidebarProps {
  perfilProfessor: PerfilProfessor; 
  aoAbrirMinhaContaModal: () => void; 
  aoAbrirListaEspera: () => void;
  aoAbrirViewAgenda: () => void; 
  aoAbrirGerenciarModelosTreino: () => void; 
  aoAbrirRelatorioFinanceiro: () => void; 
  aoAbrirBibliotecaExercicios: () => void; 
  aoAbrirRelatorioPopularidadeExercicios: () => void; // v0.1.2 (Parte 15)
  contagemListaEspera: number; 
}

const Sidebar: React.FC<SidebarProps> = ({ 
  perfilProfessor, 
  aoAbrirMinhaContaModal, 
  aoAbrirListaEspera, 
  aoAbrirViewAgenda,
  aoAbrirGerenciarModelosTreino, 
  aoAbrirRelatorioFinanceiro, 
  aoAbrirBibliotecaExercicios, 
  aoAbrirRelatorioPopularidadeExercicios, // v0.1.2 (Parte 15)
  contagemListaEspera, 
}) => {
  return (
    <aside className="w-72 bg-slate-800 p-4 space-y-6 flex-shrink-0">
      <ProfileCard
        perfil={perfilProfessor} 
        aoClicarMinhaConta={aoAbrirMinhaContaModal}
      />
      <div className="space-y-4">
        <div>
          <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Lista de Espera</h4>
          <NavButton label="Ver Lista" aoClicar={aoAbrirListaEspera} />
          {contagemListaEspera > 0 && (
            <p className="text-xs text-indigo-400 mt-1.5 text-center flex items-center justify-center">
              <IconeInfo className="w-3.5 h-3.5 mr-1 opacity-75" />
              {contagemListaEspera} pessoa{contagemListaEspera > 1 ? 's' : ''} aguardando.
            </p>
          )}
        </div>
        <div>
          <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Treinos Marcados</h4>
          <NavButton label="Ver Agenda" aoClicar={aoAbrirViewAgenda} />
        </div>
        
        <div>
          <h4 className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Ferramentas</h4>
          <div className="space-y-2">
            <button
              onClick={aoAbrirGerenciarModelosTreino}
              className="w-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium py-2.5 px-4 rounded-md transition-colors text-sm flex items-center justify-center"
            >
              <IconeTemplate className="w-4 h-4 mr-2" /> Modelos de Treino
            </button>
            <button
              onClick={aoAbrirBibliotecaExercicios}
              className="w-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium py-2.5 px-4 rounded-md transition-colors text-sm flex items-center justify-center"
            >
              <IconeBiblioteca className="w-4 h-4 mr-2" /> Biblioteca de Exercícios
            </button>
             <button
              onClick={aoAbrirRelatorioFinanceiro}
              className="w-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium py-2.5 px-4 rounded-md transition-colors text-sm flex items-center justify-center"
            >
              <IconeDocumentoTexto className="w-4 h-4 mr-2" /> Relatório Financeiro
            </button>
            {/* v0.1.2 (Parte 15): Botão Relatório de Popularidade de Exercícios */}
            <button
              onClick={aoAbrirRelatorioPopularidadeExercicios}
              className="w-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium py-2.5 px-4 rounded-md transition-colors text-sm flex items-center justify-center"
            >
              <IconeGraficoBarras className="w-4 h-4 mr-2" /> Pop. de Exercícios
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;