// components/ObjetivosCard.tsx
import React from 'react';
import { Objetivo } from '../types';
// Removed: import ObjetivoModal from './ObjetivoModal'; // No longer rendering local modal
// Removed: import { ToastType } from '../types'; // addToast prop removed
import { IconeAdicionar, IconeEditar, IconeLixeira, IconeAlvo } from './icons';

interface ObjetivosCardProps {
  objetivos: Objetivo[];
  onAdicionarObjetivo: () => void; // Prop to signal App.tsx to open modal for adding
  onEditarObjetivo: (objetivo: Objetivo) => void; // Prop to signal App.tsx to open modal for editing
  onRemoverObjetivo: (objetivoId: string) => void;
  // addToast prop removed
}

const ObjetivosCard: React.FC<ObjetivosCardProps> = ({
  objetivos,
  onAdicionarObjetivo,
  onEditarObjetivo,
  onRemoverObjetivo,
}) => {
  // Removed local state for modal:
  // const [modalAberto, setModalAberto] = useState(false);
  // const [objetivoParaEditar, setObjetivoParaEditar] = useState<Objetivo | null>(null);

  const handleAbrirModalParaAdicionar = () => {
    onAdicionarObjetivo(); // Signal App.tsx to open its modal
  };

  const handleAbrirModalParaEditar = (objetivo: Objetivo) => {
    onEditarObjetivo(objetivo); // Signal App.tsx to open its modal with data
  };

  // Removed local handleSalvarObjetivo as the card no longer saves directly

  const handleRemover = (id: string) => {
    if (window.confirm("Tem certeza que deseja remover este objetivo?")) {
      onRemoverObjetivo(id); // App.tsx will handle toast for removal
    }
  };
  
  const calcularPercentual = (atual: number, meta: number): number => {
    if (meta === 0) return atual > 0 ? 100 : 0;
    if (atual < 0) return 0; 
    return Math.min(Math.max(0, (atual / meta) * 100), 100);
  };

  return (
    <div className="bg-slate-700 p-5 rounded-lg shadow h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center">
          <IconeAlvo className="w-5 h-5 mr-2 text-indigo-400" />
          Meus Objetivos
        </h3>
        <button
          onClick={handleAbrirModalParaAdicionar}
          className="btn-primary-xs flex items-center"
          aria-label="Adicionar Novo Objetivo"
        >
          <IconeAdicionar className="w-4 h-4 mr-1" /> Novo
        </button>
      </div>

      {objetivos.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 p-4">
            <IconeAlvo className="w-12 h-12 mb-2"/>
            <p className="text-sm">Nenhum objetivo definido ainda.</p>
            <p className="text-xs mt-1">Clique em "Novo" para adicionar seu primeiro objetivo!</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto pr-1 flex-grow max-h-[160px]">
          {objetivos.map((obj) => {
            const percentual = calcularPercentual(obj.valorAtual, obj.valorMeta);
            return (
              <div key={obj.id} className="bg-slate-600/50 p-2.5 rounded-md">
                <div className="flex justify-between items-start text-xs mb-1">
                  <span className="font-medium text-slate-200 truncate pr-2" title={obj.nome}>{obj.nome}</span>
                  <div className="flex space-x-1.5 flex-shrink-0">
                    <button onClick={() => handleAbrirModalParaEditar(obj)} className="text-blue-400 hover:text-blue-300" title="Editar Objetivo">
                      <IconeEditar className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleRemover(obj.id)} className="text-red-400 hover:text-red-300" title="Remover Objetivo">
                      <IconeLixeira className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-slate-500 rounded-full h-2 mb-0.5">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentual}%` }}
                    role="progressbar"
                    aria-valuenow={percentual}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso do objetivo ${obj.nome}: ${percentual.toFixed(0)}%`}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 text-right">
                  {obj.valorAtual} / {obj.valorMeta} {obj.unidade || ''} ({percentual.toFixed(0)}%)
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Removed local ObjetivoModal instance */}
      {/* {modalAberto && (
        <ObjetivoModal
          visivel={modalAberto}
          aoFechar={() => setModalAberto(false)}
          aoSalvar={handleSalvarObjetivo}
          objetivoExistente={objetivoParaEditar}
          addToast={addToast}
        />
      )} */}
       <style>{`
        .btn-primary-xs { @apply px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors; }
      `}</style>
    </div>
  );
};

export default ObjetivosCard;