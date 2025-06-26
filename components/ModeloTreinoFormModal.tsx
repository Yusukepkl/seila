// components/ModeloTreinoFormModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ModeloDeTreino, ExercicioModelo, DificuldadePlanoTreino, CategoriaModeloTreino, ToastType } from '../types';
import { DIFICULDADES_PLANO_TREINO_OPCOES, CATEGORIAS_MODELO_TREINO_OPCOES } from '../constants';
import { IconeAdicionar, IconeEditar, IconeLixeira, IconeSpinner } from './icons'; // Added IconeSpinner

interface ExercicioModeloFormProps {
  exercicioInicial?: ExercicioModelo | null;
  onSubmitExercicio: (exercicio: ExercicioModelo) => void;
  onCancelExercicio: () => void;
  getProximoIdExercicioModelo: () => Promise<string>; 
  addToast: (message: string, type?: ToastType) => void;
}

const ExercicioModeloForm: React.FC<ExercicioModeloFormProps> = ({
  exercicioInicial,
  onSubmitExercicio,
  onCancelExercicio,
  getProximoIdExercicioModelo,
  addToast
}) => {
  const [nome, setNome] = useState(exercicioInicial?.nome || '');
  const [series, setSeries] = useState(exercicioInicial?.series || '');
  const [repeticoes, setRepeticoes] = useState(exercicioInicial?.repeticoes || '');
  const [tempoDescanso, setTempoDescanso] = useState(exercicioInicial?.tempoDescanso || '');
  const [observacoes, setObservacoes] = useState(exercicioInicial?.observacoes || '');
  const [isSalvandoExercicio, setIsSalvandoExercicio] = useState(false);

  useEffect(() => {
    setNome(exercicioInicial?.nome || '');
    setSeries(exercicioInicial?.series || '');
    setRepeticoes(exercicioInicial?.repeticoes || '');
    setTempoDescanso(exercicioInicial?.tempoDescanso || '');
    setObservacoes(exercicioInicial?.observacoes || '');
    setIsSalvandoExercicio(false);
  }, [exercicioInicial]);

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    if (!nome.trim() || !series.trim() || !repeticoes.trim()) {
      addToast("Nome, séries e repetições são obrigatórios para o exercício.", 'error');
      return;
    }
    setIsSalvandoExercicio(true);
    const finalId = exercicioInicial?.id || await getProximoIdExercicioModelo(); 
    onSubmitExercicio({
      id: finalId,
      nome: nome.trim(),
      series: series.trim(),
      repeticoes: repeticoes.trim(),
      tempoDescanso: tempoDescanso.trim() || undefined,
      observacoes: observacoes.trim() || undefined,
    });
    // setIsSalvandoExercicio(false); // Parent will close/reset
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 my-2 bg-slate-600/50 rounded-md border border-slate-500">
      <h4 className="text-sm font-semibold text-slate-100">{exercicioInicial ? 'Editar Exercício do Modelo' : 'Adicionar Novo Exercício ao Modelo'}</h4>
      <input type="text" placeholder="Nome do Exercício *" value={nome} onChange={e => setNome(e.target.value)} required className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
      <div className="grid grid-cols-3 gap-2">
        <input type="text" placeholder="Séries *" value={series} onChange={e => setSeries(e.target.value)} required className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
        <input type="text" placeholder="Repetições *" value={repeticoes} onChange={e => setRepeticoes(e.target.value)} required className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
        <input type="text" placeholder="Descanso" value={tempoDescanso} onChange={e => setTempoDescanso(e.target.value)} className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
      </div>
      <textarea placeholder="Observações (opcional)" value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
      <div className="flex justify-end space-x-2">
        <button type="button" onClick={onCancelExercicio} className="btn-secondary-xs" disabled={isSalvandoExercicio}>Cancelar</button>
        <button type="submit" className="btn-primary-xs flex items-center justify-center" disabled={isSalvandoExercicio}>
          {isSalvandoExercicio ? <><IconeSpinner className="w-3 h-3 mr-1.5" /> Salvando...</> : 'Salvar Exercício'}
        </button>
      </div>
    </form>
  );
};


interface ModeloTreinoFormModalProps {
  visivel: boolean;
  aoFechar: () => void;
  aoSalvar: (modelo: ModeloDeTreino | Omit<ModeloDeTreino, 'id'>) => void; 
  modeloExistente?: ModeloDeTreino | null;
  getProximoIdExercicioModelo: () => Promise<string>; 
  addToast: (message: string, type?: ToastType) => void;
}

const ModeloTreinoFormModal: React.FC<ModeloTreinoFormModalProps> = ({
  visivel,
  aoFechar,
  aoSalvar,
  modeloExistente,
  getProximoIdExercicioModelo,
  addToast,
}) => {
  const [nome, setNome] = useState('');
  const [dificuldade, setDificuldade] = useState<DificuldadePlanoTreino>('Iniciante');
  const [categoria, setCategoria] = useState<CategoriaModeloTreino>('Outro');
  const [exercicios, setExercicios] = useState<ExercicioModelo[]>([]);
  const [notasModelo, setNotasModelo] = useState('');
  const [isSalvandoModelo, setIsSalvandoModelo] = useState(false);

  const [editandoExercicio, setEditandoExercicio] = useState<ExercicioModelo | null>(null);
  const [idxEditandoExercicio, setIdxEditandoExercicio] = useState<number | null>(null);
  const [mostrarFormExercicio, setMostrarFormExercicio] = useState(false);

  useEffect(() => {
    if (visivel) {
      if (modeloExistente) {
        setNome(modeloExistente.nome);
        setDificuldade(modeloExistente.dificuldade);
        setCategoria(modeloExistente.categoria);
        setExercicios(modeloExistente.exercicios || []);
        setNotasModelo(modeloExistente.notasModelo || '');
      } else {
        setNome('');
        setDificuldade('Iniciante');
        setCategoria('Outro');
        setExercicios([]);
        setNotasModelo('');
      }
      setMostrarFormExercicio(false);
      setEditandoExercicio(null);
      setIdxEditandoExercicio(null);
      setIsSalvandoModelo(false);
    }
  }, [visivel, modeloExistente]);

  const handleSalvarExercicio = (exercicio: ExercicioModelo) => {
    if (idxEditandoExercicio !== null) {
      setExercicios(prev => prev.map((ex, idx) => idx === idxEditandoExercicio ? exercicio : ex));
      addToast(`Exercício "${exercicio.nome}" atualizado no modelo.`, 'success');
    } else {
      setExercicios(prev => [...prev, exercicio]);
      addToast(`Exercício "${exercicio.nome}" adicionado ao modelo.`, 'success');
    }
    setMostrarFormExercicio(false);
    setEditandoExercicio(null);
    setIdxEditandoExercicio(null);
  };

  const handleEditarExercicio = (exercicio: ExercicioModelo, index: number) => {
    setEditandoExercicio(exercicio);
    setIdxEditandoExercicio(index);
    setMostrarFormExercicio(true);
  };

  const handleRemoverExercicio = (idExercicio: string) => {
    const exercicioRemovido = exercicios.find(ex => ex.id === idExercicio);
    if (window.confirm(`Tem certeza que deseja remover o exercício "${exercicioRemovido?.nome}" deste modelo?`)) {
      setExercicios(prev => prev.filter(ex => ex.id !== idExercicio));
      if (exercicioRemovido) addToast(`Exercício "${exercicioRemovido.nome}" removido do modelo.`, 'warning');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    if (!nome.trim()) {
      addToast("O nome do modelo é obrigatório.", 'error');
      return;
    }
    setIsSalvandoModelo(true);
    
    const modeloDataPayload: ModeloDeTreino | Omit<ModeloDeTreino, 'id'> = {
      nome: nome.trim(),
      dificuldade,
      categoria,
      exercicios: exercicios || [], 
      notasModelo: notasModelo.trim() || undefined,
    };

    if (modeloExistente?.id) {
        (modeloDataPayload as ModeloDeTreino).id = modeloExistente.id;
    }
        
    aoSalvar(modeloDataPayload);
  };

  return (
    <Modal
      titulo={modeloExistente ? 'Editar Modelo de Treino' : 'Criar Novo Modelo de Treino'}
      visivel={visivel}
      aoFechar={aoFechar}
      largura="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="modeloNome" className="block text-sm font-medium text-slate-300 mb-1">Nome do Modelo *</label>
          <input type="text" id="modeloNome" value={nome} onChange={e => setNome(e.target.value)} required className="w-full input-base" disabled={isSalvandoModelo}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="modeloDificuldade" className="block text-sm font-medium text-slate-300 mb-1">Dificuldade *</label>
            <select id="modeloDificuldade" value={dificuldade} onChange={e => setDificuldade(e.target.value as DificuldadePlanoTreino)} required className="w-full input-base" disabled={isSalvandoModelo}>
              {DIFICULDADES_PLANO_TREINO_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="modeloCategoria" className="block text-sm font-medium text-slate-300 mb-1">Categoria *</label>
            <select id="modeloCategoria" value={categoria} onChange={e => setCategoria(e.target.value as CategoriaModeloTreino)} required className="w-full input-base" disabled={isSalvandoModelo}>
              {CATEGORIAS_MODELO_TREINO_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="modeloNotas" className="block text-sm font-medium text-slate-300 mb-1">Notas do Modelo (Opcional)</label>
          <textarea id="modeloNotas" value={notasModelo} onChange={e => setNotasModelo(e.target.value)} rows={3} className="w-full input-base" placeholder="Instruções gerais, foco do modelo, etc." disabled={isSalvandoModelo}/>
        </div>

        <div className="pt-3 border-t border-slate-600">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold text-slate-200">Exercícios do Modelo ({exercicios.length})</h4>
            {!mostrarFormExercicio && (
              <button type="button" onClick={() => { setEditandoExercicio(null); setIdxEditandoExercicio(null); setMostrarFormExercicio(true); }} className="btn-secondary-sm flex items-center" disabled={isSalvandoModelo}>
                <IconeAdicionar className="w-4 h-4 mr-1" /> Adicionar Exercício
              </button>
            )}
          </div>

          {mostrarFormExercicio && (
            <ExercicioModeloForm
              exercicioInicial={editandoExercicio}
              onSubmitExercicio={handleSalvarExercicio}
              onCancelExercicio={() => { setMostrarFormExercicio(false); setEditandoExercicio(null); setIdxEditandoExercicio(null); }}
              getProximoIdExercicioModelo={getProximoIdExercicioModelo} 
              addToast={addToast}
            />
          )}

          {exercicios.length > 0 && !mostrarFormExercicio && (
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
              {exercicios.map((ex, idx) => (
                <div key={ex.id} className="p-2 bg-slate-600 rounded flex justify-between items-start">
                  <div>
                    <p className="font-medium text-slate-100">{idx + 1}. {ex.nome}</p>
                    <p className="text-xs text-slate-300">
                      {ex.series} séries / {ex.repeticoes} reps / Desc: {ex.tempoDescanso || 'N/A'}
                    </p>
                    {ex.observacoes && <p className="text-xs text-slate-400 mt-0.5">Obs: {ex.observacoes}</p>}
                  </div>
                  <div className="flex space-x-1 flex-shrink-0">
                    <button type="button" onClick={() => handleEditarExercicio(ex, idx)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Exercício" disabled={isSalvandoModelo}><IconeEditar className="w-4 h-4" /></button>
                    <button type="button" onClick={() => handleRemoverExercicio(ex.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Exercício" disabled={isSalvandoModelo}><IconeLixeira className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {exercicios.length === 0 && !mostrarFormExercicio && (
            <div className="text-center py-6 text-slate-500">
              <p className="text-sm">Nenhum exercício neste modelo ainda.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <button type="button" onClick={aoFechar} className="btn-secondary" disabled={isSalvandoModelo}>Cancelar</button>
          <button type="submit" className="btn-primary flex items-center justify-center" disabled={isSalvandoModelo}>
            {isSalvandoModelo ? <><IconeSpinner className="w-4 h-4 mr-2" /> Salvando...</> : (modeloExistente ? 'Salvar Alterações' : 'Criar Modelo')}
          </button>
        </div>
      </form>
       <style>{`
        .input-base { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500; }
        .input-base-sm { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500; }
        .btn-primary { @apply px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-70; }
        .btn-primary-xs { @apply px-2 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-70; }
        .btn-secondary { @apply px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:opacity-70; }
        .btn-secondary-sm { @apply px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:opacity-70; }
        .btn-secondary-xs { @apply px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-500 hover:bg-slate-400 rounded-md transition-colors disabled:opacity-70; }
      `}</style>
    </Modal>
  );
};

export default ModeloTreinoFormModal;
