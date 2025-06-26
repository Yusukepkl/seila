
// components/Modal.tsx
import React from 'react';
import { IconeFechar } from './icons';

interface ModalProps {
  titulo: string;
  visivel: boolean;
  aoFechar: () => void;
  children: React.ReactNode;
  largura?: string; // e.g. 'max-w-md', 'max-w-lg', 'max-w-2xl'
}

const Modal: React.FC<ModalProps> = ({ titulo, visivel, aoFechar, children, largura = 'max-w-lg' }) => {
  if (!visivel) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-slate-800 rounded-lg shadow-xl w-full ${largura} p-6 transform transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">{titulo}</h2>
          <button
            onClick={aoFechar}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <IconeFechar className="w-6 h-6" />
          </button>
        </div>
        <div className="text-slate-300 max-h-[70vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
