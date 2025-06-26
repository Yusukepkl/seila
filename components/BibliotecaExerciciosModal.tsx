// components/BibliotecaExerciciosModal.tsx
import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { ExercicioBiblioteca, GrupoMuscular } from '../types';
import { IconeAdicionar, IconeEditar, IconeLixeira, IconeBiblioteca } from './icons';
import { GRUPOS_MUSCULARES_OPCOES } from '../constants';

interface BibliotecaExerciciosModalProps {
  visivel: boolean;
  aoFechar: () => void;
  exerciciosBiblioteca: ExercicioBiblioteca[];
  onRemoverExercicio: (exercicioId: string) => void;
  abrirFormExercicio: (exercicio?: ExercicioBiblioteca) => void; // Para abrir o ExercicioBibliotecaFormModal
}

const BibliotecaExerciciosModal: React.FC<BibliotecaExerciciosModalProps> = ({
  visivel,
  aoFechar,
  exerciciosBiblioteca,
  onRemoverExercicio,
  abrirFormExercicio,
}) => {
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroGrupoMuscular, setFiltroGrupoMuscular] = useState<GrupoMuscular | ''>('');

  const exerciciosFiltrados = useMemo(() => {
    return exerciciosBiblioteca.filter(ex => {
      const nomeMatch = filtroNome === '' || ex.nome.toLowerCase().includes(filtroNome.toLowerCase());
      const grupoMatch = filtroGrupoMuscular === '' || ex.grupoMuscularPrincipal === filtroGrupoMuscular;
      return nomeMatch && grupoMatch;
    }).sort((a,b) => a.nome.localeCompare(b.nome));
  }, [exerciciosBiblioteca, filtroNome, filtroGrupoMuscular]);

  const handleRemover = (exercicio: ExercicioBiblioteca) => {
    if (window.confirm(`Tem certeza que deseja remover o exercício "${exercicio.nome}" da biblioteca? Esta ação não pode ser desfeita.`)) {
      onRemoverExercicio(exercicio.id);
    }
  };

  return (
    <Modal titulo="Biblioteca de Exercícios" visivel={visivel} aoFechar={aoFechar} largura="max-w-4xl">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="input-base-sm flex-grow sm:flex-grow-0"
            aria-label="Filtrar exercícios por nome"
          />
          <select
            value={filtroGrupoMuscular}
            onChange={(e) => setFiltroGrupoMuscular(e.target.value as GrupoMuscular | '')}
            className="input-base-sm flex-grow sm:flex-grow-0"
            aria-label="Filtrar exercícios por grupo muscular principal"
          >
            <option value="">Todos Grupos Musculares</option>
            {GRUPOS_MUSCULARES_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <button
          onClick={() => abrirFormExercicio()}
          className="btn-primary flex items-center w-full sm:w-auto mt-2 sm:mt-0"
          aria-label="Adicionar Novo Exercício à Biblioteca"
        >
          <IconeAdicionar className="w-5 h-5 mr-2" /> Novo Exercício
        </button>
      </div>

      {exerciciosFiltrados.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <IconeBiblioteca className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-semibold text-lg">
            {exerciciosBiblioteca.length === 0 ? "Sua biblioteca de exercícios está vazia." : "Nenhum exercício corresponde aos filtros."}
          </p>
          <p className="text-sm mt-1">
            {exerciciosBiblioteca.length === 0 ? "Adicione seu primeiro exercício!" : "Ajuste os filtros ou adicione um novo exercício."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {exerciciosFiltrados.map((exercicio) => (
            <div key={exercicio.id} className="bg-slate-700 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-indigo-400">{exercicio.nome}</h4>
                  <p className="text-xs text-slate-300">
                    Grupo Principal: <span className="font-medium text-slate-200">{exercicio.grupoMuscularPrincipal}</span>
                  </p>
                  {exercicio.gruposMuscularesSecundarios && exercicio.gruposMuscularesSecundarios.length > 0 && (
                     <p className="text-xs text-slate-400">
                        Secundários: {exercicio.gruposMuscularesSecundarios.join(', ')}
                     </p>
                  )}
                </div>
                <div className="flex space-x-1.5 items-center">
                  <button onClick={() => abrirFormExercicio(exercicio)} title="Editar Exercício" className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                    <IconeEditar className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleRemover(exercicio)} title="Remover Exercício" className="p-1.5 text-red-400 hover:text-red-300 transition-colors">
                    <IconeLixeira className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {exercicio.descricao && (
                <p className="text-sm text-slate-300 mt-2 whitespace-pre-wrap">{exercicio.descricao}</p>
              )}
              <div className="mt-2 flex space-x-4 text-xs">
                {exercicio.linkVideo && (
                  <a href={exercicio.linkVideo} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                    Ver Vídeo
                  </a>
                )}
                {exercicio.linkImagem && (
                  <a href={exercicio.linkImagem} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 hover:underline">
                    Ver Imagem
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
       <style>{`
        .input-base-sm { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500; }
        .btn-primary { @apply px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors; }
      `}</style>
    </Modal>
  );
};

export default BibliotecaExerciciosModal;
