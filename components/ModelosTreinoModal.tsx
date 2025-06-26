// components/ModelosTreinoModal.tsx
import React, { useState } from 'react';
import Modal from './Modal';
import { ModeloDeTreino, DificuldadePlanoTreino, CategoriaModeloTreino, ExercicioModelo } from '../types';
import { IconeAdicionar, IconeEditar, IconeLixeira, IconeDuplicar, IconeTemplate } from './icons';
import { DIFICULDADES_PLANO_TREINO_OPCOES, CATEGORIAS_MODELO_TREINO_OPCOES } from '../constants';

interface ModelosTreinoModalProps {
  visivel: boolean;
  aoFechar: () => void;
  modelosDeTreino: ModeloDeTreino[];
  onRemoverModelo: (modeloId: string) => void;
  onDuplicarModelo: (modelo: ModeloDeTreino) => void; // A lógica de gerar ID e nome "Cópia de" é feita no App.tsx
  abrirFormModelo: (modelo?: ModeloDeTreino) => void;
}

const ModelosTreinoModal: React.FC<ModelosTreinoModalProps> = ({
  visivel,
  aoFechar,
  modelosDeTreino,
  onRemoverModelo,
  onDuplicarModelo,
  abrirFormModelo,
}) => {
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroDificuldade, setFiltroDificuldade] = useState<DificuldadePlanoTreino | ''>('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaModeloTreino | ''>('');

  const modelosFiltrados = modelosDeTreino.filter(modelo => {
    const nomeMatch = filtroNome === '' || modelo.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const dificuldadeMatch = filtroDificuldade === '' || modelo.dificuldade === filtroDificuldade;
    const categoriaMatch = filtroCategoria === '' || modelo.categoria === filtroCategoria;
    return nomeMatch && dificuldadeMatch && categoriaMatch;
  });

  const handleRemover = (modelo: ModeloDeTreino) => {
    if (window.confirm(`Tem certeza que deseja remover o modelo "${modelo.nome}"?`)) {
      onRemoverModelo(modelo.id);
    }
  };

  const handleDuplicar = (modelo: ModeloDeTreino) => {
     onDuplicarModelo(modelo); // O App.tsx lida com a criação do novo ID e nome
  };

  return (
    <Modal titulo="Gerenciar Modelos de Treino" visivel={visivel} aoFechar={aoFechar} largura="max-w-4xl">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="input-base-sm flex-grow sm:flex-grow-0"
            aria-label="Filtrar modelos por nome"
          />
          <select
            value={filtroDificuldade}
            onChange={(e) => setFiltroDificuldade(e.target.value as DificuldadePlanoTreino | '')}
            className="input-base-sm flex-grow sm:flex-grow-0"
            aria-label="Filtrar modelos por dificuldade"
          >
            <option value="">Todas Dificuldades</option>
            {DIFICULDADES_PLANO_TREINO_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value as CategoriaModeloTreino | '')}
            className="input-base-sm flex-grow sm:flex-grow-0"
            aria-label="Filtrar modelos por categoria"
          >
            <option value="">Todas Categorias</option>
            {CATEGORIAS_MODELO_TREINO_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <button
          onClick={() => abrirFormModelo()}
          className="btn-primary flex items-center w-full sm:w-auto mt-2 sm:mt-0"
          aria-label="Criar Novo Modelo de Treino"
        >
          <IconeAdicionar className="w-5 h-5 mr-2" /> Criar Novo Modelo
        </button>
      </div>

      {modelosFiltrados.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          <IconeTemplate className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="font-semibold text-lg">
            {modelosDeTreino.length === 0 ? "Nenhum modelo de treino cadastrado." : "Nenhum modelo corresponde aos filtros."}
          </p>
          <p className="text-sm mt-1">
            {modelosDeTreino.length === 0 ? "Crie seu primeiro modelo!" : "Ajuste os filtros ou crie um novo modelo."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {modelosFiltrados.map((modelo) => (
            <div key={modelo.id} className="bg-slate-700 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-indigo-400">{modelo.nome}</h4>
                  <div className="flex items-center space-x-2 mt-0.5 text-xs">
                    <span className="text-slate-300">Dificuldade: <span className="font-medium text-slate-200">{modelo.dificuldade}</span></span>
                    <span className="text-slate-300">Categoria: <span className="font-medium text-slate-200">{modelo.categoria}</span></span>
                  </div>
                   <p className="text-xs text-slate-400 mt-1">Exercícios: {modelo.exercicios.length}</p>
                </div>
                <div className="flex space-x-1.5 items-center">
                  <button onClick={() => handleDuplicar(modelo)} title="Duplicar Modelo" className="p-1.5 text-purple-400 hover:text-purple-300 transition-colors">
                    <IconeDuplicar className="w-5 h-5" />
                  </button>
                  <button onClick={() => abrirFormModelo(modelo)} title="Editar Modelo" className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                    <IconeEditar className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleRemover(modelo)} title="Remover Modelo" className="p-1.5 text-red-400 hover:text-red-300 transition-colors">
                    <IconeLixeira className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {modelo.notasModelo && (
                <div className="mt-2 pt-2 border-t border-slate-600">
                  <p className="text-xs text-slate-400 mb-0.5">Notas do Modelo:</p>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{modelo.notasModelo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default ModelosTreinoModal;
// Estilos que podem ser necessários se não forem globais:
// .input-base-sm { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500; }
// .btn-primary { @apply px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors; }
// .btn-secondary-xs { @apply px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-500 hover:bg-slate-400 rounded-md transition-colors; }
// .btn-icon-xs { @apply p-1.5 rounded-md transition-colors; } (Adapte para o tamanho desejado)
