
// components/ExercicioBibliotecaFormModal.tsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { ExercicioBiblioteca, GrupoMuscular, ToastType } from '../types';
import { GRUPOS_MUSCULARES_OPCOES } from '../constants';
import { IconeSpinner } from './icons'; // Import IconeSpinner

interface ExercicioBibliotecaFormModalProps {
  visivel: boolean;
  aoFechar: () => void;
  aoSalvar: (exercicio: ExercicioBiblioteca | Omit<ExercicioBiblioteca, 'id'>) => void; // Updated type
  exercicioExistente?: ExercicioBiblioteca | null;
  // getProximoIdExercicioBiblioteca: () => string; // Removed
  addToast: (message: string, type?: ToastType) => void;
  onGerarDescricaoIA: (nomeExercicio: string) => Promise<string | null>;
  aiServiceInitialized: boolean;
}

const ExercicioBibliotecaFormModal: React.FC<ExercicioBibliotecaFormModalProps> = ({
  visivel,
  aoFechar,
  aoSalvar,
  exercicioExistente,
  // getProximoIdExercicioBiblioteca, // Removed
  addToast,
  onGerarDescricaoIA,
  aiServiceInitialized,
}) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grupoMuscularPrincipal, setGrupoMuscularPrincipal] = useState<GrupoMuscular>('Peito');
  const [gruposMuscularesSecundarios, setGruposMuscularesSecundarios] = useState<GrupoMuscular[]>([]);
  const [linkVideo, setLinkVideo] = useState('');
  const [linkImagem, setLinkImagem] = useState('');
  const [isSalvando, setIsSalvando] = useState(false);
  const [isGerandoDescricao, setIsGerandoDescricao] = useState(false);

  useEffect(() => {
    if (visivel) {
      if (exercicioExistente) {
        setNome(exercicioExistente.nome);
        setDescricao(exercicioExistente.descricao || '');
        setGrupoMuscularPrincipal(exercicioExistente.grupoMuscularPrincipal);
        setGruposMuscularesSecundarios(exercicioExistente.gruposMuscularesSecundarios || []);
        setLinkVideo(exercicioExistente.linkVideo || '');
        setLinkImagem(exercicioExistente.linkImagem || '');
      } else {
        setNome('');
        setDescricao('');
        setGrupoMuscularPrincipal(GRUPOS_MUSCULARES_OPCOES[0]?.value || 'Peito');
        setGruposMuscularesSecundarios([]);
        setLinkVideo('');
        setLinkImagem('');
      }
      setIsSalvando(false);
      setIsGerandoDescricao(false);
    }
  }, [visivel, exercicioExistente]);

  const handleGrupoSecundarioChange = (grupo: GrupoMuscular) => {
    setGruposMuscularesSecundarios(prev =>
      prev.includes(grupo) ? prev.filter(g => g !== grupo) : [...prev, grupo]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      addToast("O nome do exercício é obrigatório.", 'error');
      return;
    }
    setIsSalvando(true);
    try {
      const exercicioPayloadBase = {
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        grupoMuscularPrincipal,
        gruposMuscularesSecundarios: gruposMuscularesSecundarios.length > 0 ? gruposMuscularesSecundarios : undefined,
        linkVideo: linkVideo.trim() || undefined,
        linkImagem: linkImagem.trim() || undefined,
      };

      if (exercicioExistente?.id) {
        aoSalvar({
          ...exercicioPayloadBase,
          id: exercicioExistente.id,
        });
      } else {
        aoSalvar(exercicioPayloadBase as Omit<ExercicioBiblioteca, 'id'>);
      }
      // O aoFechar() já é chamado pelo App.tsx após o onSalvar ter sucesso e atualizado o estado.
    } catch (error) {
      addToast("Erro ao salvar exercício.", "error");
      // setIsSalvando(false); // Only set to false on error, as success closes modal.
    } 
    // Do not set setIsSalvando(false) here if aoSalvar leads to modal closure,
    // as it might cause a React state update on an unmounted component.
    // App.tsx's `handleSalvarExercicioBiblioteca` will set states and close modal.
  };

  const handleGerarDescricaoClick = async () => {
    if (!aiServiceInitialized) {
        addToast("Serviço de IA não disponível. Verifique a chave de API.", "warning");
        return;
    }
    if (!nome.trim()) {
      addToast("Preencha o nome do exercício para gerar uma descrição.", "warning");
      return;
    }
    setIsGerandoDescricao(true);
    const descricaoGerada = await onGerarDescricaoIA(nome.trim());
    if (descricaoGerada) {
      setDescricao(descricaoGerada);
      addToast("Descrição gerada com IA!", "success");
    }
    // Mensagens de erro são tratadas pela função onGerarDescricaoIA e exibidas via addToast.
    setIsGerandoDescricao(false);
  };

  return (
    <Modal
      titulo={exercicioExistente ? 'Editar Exercício da Biblioteca' : 'Adicionar Novo Exercício à Biblioteca'}
      visivel={visivel}
      aoFechar={aoFechar}
      largura="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="exBibNome" className="block text-sm font-medium text-slate-300 mb-1">Nome do Exercício *</label>
          <input type="text" id="exBibNome" value={nome} onChange={e => setNome(e.target.value)} required className="input-base" />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="exBibDescricao" className="block text-sm font-medium text-slate-300">Descrição (Opcional)</label>
            <button 
              type="button" 
              onClick={handleGerarDescricaoClick}
              disabled={isGerandoDescricao || !aiServiceInitialized}
              className="btn-secondary-xs flex items-center disabled:opacity-50"
              title={!aiServiceInitialized ? "Serviço de IA não configurado" : "Gerar descrição usando Inteligência Artificial"}
            >
              {isGerandoDescricao && <IconeSpinner className="w-3 h-3 mr-1.5" />}
              {isGerandoDescricao ? "Gerando..." : "Gerar Descrição com IA"}
            </button>
          </div>
          <textarea id="exBibDescricao" value={descricao} onChange={e => setDescricao(e.target.value)} rows={4} className="input-base" placeholder="Instruções de execução, dicas, etc." />
        </div>

        <div>
          <label htmlFor="exBibGrupoPrincipal" className="block text-sm font-medium text-slate-300 mb-1">Grupo Muscular Principal *</label>
          <select id="exBibGrupoPrincipal" value={grupoMuscularPrincipal} onChange={e => setGrupoMuscularPrincipal(e.target.value as GrupoMuscular)} required className="input-base">
            {GRUPOS_MUSCULARES_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Grupos Musculares Secundários (Opcional)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-slate-700/50 rounded-md max-h-32 overflow-y-auto">
            {GRUPOS_MUSCULARES_OPCOES.map(opt => (
              <label key={opt.value} className="flex items-center space-x-2 text-xs text-slate-200 cursor-pointer p-1 hover:bg-slate-600 rounded">
                <input
                  type="checkbox"
                  checked={gruposMuscularesSecundarios.includes(opt.value)}
                  onChange={() => handleGrupoSecundarioChange(opt.value)}
                  className="form-checkbox h-3.5 w-3.5 text-indigo-500 bg-slate-600 border-slate-500 focus:ring-indigo-400 rounded-sm"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="exBibLinkVideo" className="block text-sm font-medium text-slate-300 mb-1">Link do Vídeo (Opcional)</label>
          <input type="url" id="exBibLinkVideo" value={linkVideo} onChange={e => setLinkVideo(e.target.value)} className="input-base" placeholder="https://www.youtube.com/watch?v=..." />
        </div>
        <div>
          <label htmlFor="exBibLinkImagem" className="block text-sm font-medium text-slate-300 mb-1">Link da Imagem (Opcional)</label>
          <input type="url" id="exBibLinkImagem" value={linkImagem} onChange={e => setLinkImagem(e.target.value)} className="input-base" placeholder="https://example.com/imagem.jpg" />
        </div>

        <div className="flex justify-end space-x-3 pt-3">
          <button type="button" onClick={aoFechar} className="btn-secondary" disabled={isSalvando || isGerandoDescricao}>Cancelar</button>
          <button
            type="submit"
            className="btn-primary flex items-center justify-center"
            disabled={isSalvando || isGerandoDescricao}
          >
            {isSalvando ? (
                <>
                    <IconeSpinner className="w-4 h-4 mr-2" />
                    Salvando...
                </>
            ) : (
                exercicioExistente ? 'Salvar Alterações' : 'Adicionar Exercício'
            )}
          </button>
        </div>
      </form>
      <style>{`
        .input-base { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500; }
        .btn-primary { @apply px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-60; }
        .btn-secondary { @apply px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:opacity-60; }
        .btn-secondary-xs { @apply px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-500 hover:bg-slate-400 rounded-md transition-colors disabled:opacity-60; }
      `}</style>
    </Modal>
  );
};

export default ExercicioBibliotecaFormModal;
