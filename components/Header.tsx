
// components/Header.tsx
import React from 'react';
import { IconeFechar } from './icons';

interface HeaderProps {
  versaoAtual: string;
  aoAbrirPatchNotes: () => void;
  aoFecharApp?: () => void; // Ação do X pode ser fechar modal ou app
}

const Header: React.FC<HeaderProps> = ({ versaoAtual, aoAbrirPatchNotes, aoFecharApp }) => {
  return (
    <header className="bg-slate-800 p-4 flex justify-between items-center shadow-md sticky top-0 z-40">
      <h1 className="text-2xl font-bold text-indigo-400">Gestor Trainer</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={aoAbrirPatchNotes}
          className="bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 px-3 py-1.5 rounded-md transition-colors"
        >
          Patch Notes ({versaoAtual})
        </button>
        {aoFecharApp && (
          <button 
            onClick={aoFecharApp} 
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <IconeFechar className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
