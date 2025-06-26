// components/StudentDetailView.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlunoConsultoria, PlanoDeTreino, TreinoExercicio, MedidaCorporalEntry, NotaSessao, ToastType, DiarioEntry, MetaDetalhada, DificuldadePlanoTreino, ModeloDeTreino, StatusMeta, Pagamento, StatusPagamentoOpcoes, SubEntidadeIdTipo, ExercicioBiblioteca, TipoModalOuView, DetalheMetricaMedidaCorporal, TipoMetricaMeta, AddToastFunction, DobraCutaneaEntry } from '../types'; // v0.1.2 (Parte 12): Add ExercicioBiblioteca, TipoModalOuView. v0.1.2 (Parte 16): Add DetalheMetricaMedidaCorporal, TipoMetricaMeta. v0.1.2 (Parte 22): Add DobraCutaneaEntry
import { IconeSetaEsquerda, IconeEditar, IconeLixeira, IconePlanoTreino, IconeMedidas, IconeNotas, IconeAdicionar, IconeCheck, IconeGraficoLinha, IconeAlvo, IconeTemplate, IconeFinanceiro, IconeBiblioteca, IconeInfo, IconeSpinner, IconeDownload } from './icons'; // v0.1.2 (Parte 12): Add IconeBiblioteca, IconeInfo. Added IconeSpinner. v0.1.2 (Parte 17) Add IconeDownload
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DIFICULDADES_PLANO_TREINO_OPCOES, TIPOS_DIARIO_ENTRY_OPCOES, CORES_STATUS_META, STATUS_META_OPCOES, TIPOS_METRICA_META_OPCOES, CORES_STATUS_PAGAMENTO, GRUPOS_MUSCULARES_OPCOES, DETALHE_METRICA_MEDIDA_CORPORAL_OPCOES } from '../constants';
import DiarioEntryForm from './DiarioEntryForm';
import MetaDetalhadaForm from './MetaDetalhadaForm';
import PagamentoForm from './PagamentoForm';
import Modal from './Modal'; // v0.1.2 (Parte 12): Para visualização de detalhes
import jsPDF from 'jspdf'; // v0.1.2 (Parte 17)
import 'jspdf-autotable'; // v0.1.2 (Parte 17) - Extende o protótipo do jsPDF

interface StudentDetailViewProps {
  aluno: AlunoConsultoria;
  onUpdateAluno: (alunoAtualizado: AlunoConsultoria) => void;
  onDeleteAluno: (alunoId: string) => void;
  onGoBack: () => void;
  onOpenBasicProfileModal: () => void;
  getProximoId: (tipo: SubEntidadeIdTipo) => Promise<string>;
  addToast: AddToastFunction;
  modelosDeTreino: ModeloDeTreino[];
  exerciciosBiblioteca: ExercicioBiblioteca[];
  abrirModalVisualizarExercicioBiblioteca: (exercicio: ExercicioBiblioteca) => void;
}

type AbaAtiva = 'planos' | 'medidas' | 'diario' | 'metas' | 'financeiro' | 'dobrasCutaneas' | 'notas'; // v0.1.2 (Parte 22)

const formatarDataParaInputDate = (dataISOouInput?: string): string => {
  if (!dataISOouInput) return new Date().toISOString().split('T')[0];
  try {
    const date = new Date(dataISOouInput);
    if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];

    if (dataISOouInput.length === 10 && dataISOouInput.indexOf('T') === -1 && dataISOouInput.indexOf('/') === -1) {
        const [year, month, day] = dataISOouInput.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];
    }
    if (dataISOouInput.includes('/')) {
        const parts = dataISOouInput.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) -1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                 return new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
            }
        }
    }
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

const formatarDataParaExibicao = (dataInput?: string): string => {
  if (!dataInput) return 'N/A';
  const partes = dataInput.split('-'); // Assume YYYY-MM-DD
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`; // Converte para DD/MM/YYYY
  }
  return dataInput; // Retorna como está se não for o formato esperado
};

const formatarDataHoraParaExibicao = (dataHoraISO?: string): string => {
    if (!dataHoraISO) return 'Data/Hora não informada';
    try {
        const data = new Date(dataHoraISO);
        if (isNaN(data.getTime())) return 'Data/Hora inválida';
        return data.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch (e) {
        return dataHoraISO;
    }
};

// v0.1.2 (Parte 17): Função para sanitizar nome de arquivo
const sanitizarNomeArquivo = (nome: string): string => {
  return nome.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
};


interface PlanoTreinoFormProps {
  planoInicial?: PlanoDeTreino | null;
  onSubmit: (plano: PlanoDeTreino) => void;
  onCancel: () => void;
  getProximoIdPlano: () => Promise<string>;
  getProximoIdExercicio: () => Promise<string>;
  addToast: AddToastFunction;
  modelosDeTreino: ModeloDeTreino[];
  exerciciosBiblioteca: ExercicioBiblioteca[];
}

const PlanoTreinoForm: React.FC<PlanoTreinoFormProps> = ({ planoInicial, onSubmit, onCancel, getProximoIdPlano, getProximoIdExercicio, addToast, modelosDeTreino, exerciciosBiblioteca }) => {
  const [nome, setNome] = useState(planoInicial?.nome || '');
  const [descricao, setDescricao] = useState(planoInicial?.descricao || '');
  const [ativo, setAtivo] = useState(planoInicial?.ativo || false);
  const [exercicios, setExercicios] = useState<TreinoExercicio[]>(planoInicial?.exercicios || []);
  const [dificuldade, setDificuldade] = useState<DificuldadePlanoTreino>(planoInicial?.dificuldade || 'Iniciante');
  const [notasAdicionais, setNotasAdicionais] = useState(planoInicial?.notasAdicionais || '');
  const [isSalvandoPlano, setIsSalvandoPlano] = useState(false);
  const [editandoExercicio, setEditandoExercicio] = useState<TreinoExercicio | null>(null);
  const [idxEditandoExercicio, setIdxEditandoExercicio] = useState<number | null>(null);
  const [mostrarFormExercicio, setMostrarFormExercicio] = useState(false);
  const [modeloSelecionadoId, setModeloSelecionadoId] = useState<string>('');

  useEffect(() => {
    setNome(planoInicial?.nome || '');
    setDescricao(planoInicial?.descricao || '');
    setAtivo(planoInicial?.ativo || false);
    setExercicios(planoInicial?.exercicios || []);
    setDificuldade(planoInicial?.dificuldade || 'Iniciante');
    setNotasAdicionais(planoInicial?.notasAdicionais || '');
    setModeloSelecionadoId('');
    setMostrarFormExercicio(false);
    setEditandoExercicio(null);
    setIdxEditandoExercicio(null);
    setIsSalvandoPlano(false);
  }, [planoInicial]);


  const handleSalvarExercicio = (exercicio: TreinoExercicio) => {
    if (idxEditandoExercicio !== null) {
      setExercicios(prev => prev.map((ex, idx) => idx === idxEditandoExercicio ? exercicio : ex));
      addToast(`Exercício "${exercicio.nome}" atualizado.`, 'success');
    } else {
      // O ID já foi gerado e awaited dentro do ExercicioForm
      setExercicios(prev => [...prev, exercicio]);
      addToast(`Exercício "${exercicio.nome}" adicionado ao plano.`, 'success');
    }
    setMostrarFormExercicio(false);
    setEditandoExercicio(null);
    setIdxEditandoExercicio(null);
  };

  const handleEditarExercicio = (exercicio: TreinoExercicio, index: number) => {
    setEditandoExercicio(exercicio);
    setIdxEditandoExercicio(index);
    setMostrarFormExercicio(true);
  };

  const handleRemoverExercicio = (idExercicio: string) => {
    const exercicioRemovido = exercicios.find(ex => ex.id === idExercicio);
    if (window.confirm("Tem certeza que deseja remover este exercício do plano?")) {
        setExercicios(prev => prev.filter(ex => ex.id !== idExercicio));
        if (exercicioRemovido) addToast(`Exercício "${exercicioRemovido.nome}" removido do plano.`, 'warning');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      addToast("O nome do plano é obrigatório.", 'error');
      return;
    }
    setIsSalvandoPlano(true);
    const finalId = planoInicial?.id || await getProximoIdPlano();
    onSubmit({
      id: finalId,
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      ativo,
      exercicios: Array.isArray(exercicios) ? exercicios : [],
      dificuldade: dificuldade,
      notasAdicionais: notasAdicionais.trim() || undefined,
    });
    // setIsSalvandoPlano(false); // O onSubmit deve fechar o form e resetar o estado.
  };

  const handleCarregarModelo = async () => {
    if (!modeloSelecionadoId) {
        addToast("Selecione um modelo para carregar.", "info");
        return;
    }
    const modelo = modelosDeTreino.find(m => m.id === modeloSelecionadoId);
    if (modelo) {
        setNome(planoInicial?.nome || modelo.nome);
        setDificuldade(modelo.dificuldade);
        setNotasAdicionais(modelo.notasModelo || '');
        setDescricao('');

        const exerciciosDoModelo = await Promise.all(
          (Array.isArray(modelo.exercicios) ? modelo.exercicios : []).map(async exMod => ({
            ...exMod,
            id: await getProximoIdExercicio(),
            exercicioBibliotecaId: undefined,
          }))
        );
        setExercicios(exerciciosDoModelo);
        addToast(`Plano preenchido com o modelo "${modelo.nome}". Novos IDs gerados para os exercícios.`, "success");
        setModeloSelecionadoId('');
    } else {
        addToast("Modelo não encontrado.", "error");
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-700 rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{planoInicial ? 'Editar Plano de Treino' : 'Novo Plano de Treino'}</h3>
        {modelosDeTreino.length > 0 && (
             <div className="flex items-center space-x-2">
                <IconeTemplate className="w-5 h-5 text-indigo-400" />
                <select
                    value={modeloSelecionadoId}
                    onChange={e => setModeloSelecionadoId(e.target.value)}
                    className="input-base-sm py-1 max-w-[180px]"
                    aria-label="Selecionar modelo de treino para carregar"
                >
                    <option value="">Carregar de Modelo...</option>
                    {modelosDeTreino.map(mod => (
                        <option key={mod.id} value={mod.id}>{mod.nome} ({mod.categoria})</option>
                    ))}
                </select>
                <button type="button" onClick={handleCarregarModelo} className="btn-secondary-xs" disabled={!modeloSelecionadoId || isSalvandoPlano}>Carregar</button>
            </div>
        )}
      </div>

      <div>
        <label htmlFor="planoNome" className="block text-sm font-medium text-slate-300 mb-1">Nome do Plano *</label>
        <input type="text" id="planoNome" value={nome} onChange={e => setNome(e.target.value)} required className="w-full input-base" disabled={isSalvandoPlano} />
      </div>
      <div>
        <label htmlFor="planoDescricao" className="block text-sm font-medium text-slate-300 mb-1">Descrição (Opcional)</label>
        <textarea id="planoDescricao" value={descricao} onChange={e => setDescricao(e.target.value)} rows={2} className="w-full input-base" placeholder="Breve descrição do foco ou objetivo deste plano para o aluno." disabled={isSalvandoPlano} />
      </div>
      <div>
        <label htmlFor="planoDificuldade" className="block text-sm font-medium text-slate-300 mb-1">Dificuldade</label>
        <select
            id="planoDificuldade"
            value={dificuldade}
            onChange={e => setDificuldade(e.target.value as DificuldadePlanoTreino)}
            className="w-full input-base"
            disabled={isSalvandoPlano}
        >
            {DIFICULDADES_PLANO_TREINO_OPCOES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
      </div>
       <div>
        <label htmlFor="planoNotasAdicionais" className="block text-sm font-medium text-slate-300 mb-1">Notas Adicionais do Plano (para o aluno)</label>
        <textarea id="planoNotasAdicionais" value={notasAdicionais} onChange={e => setNotasAdicionais(e.target.value)} rows={3} className="w-full input-base" placeholder="Instruções gerais, foco do plano, dicas para o aluno, etc." disabled={isSalvandoPlano}/>
      </div>

      <div className="flex items-center">
        <input type="checkbox" id="planoAtivo" checked={ativo} onChange={e => setAtivo(e.target.checked)} className="h-4 w-4 text-indigo-600 border-slate-500 rounded focus:ring-indigo-500" disabled={isSalvandoPlano} />
        <label htmlFor="planoAtivo" className="ml-2 block text-sm text-slate-300">Marcar como plano ativo</label>
      </div>

      <div className="pt-3 border-t border-slate-600">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold text-slate-200">Exercícios ({Array.isArray(exercicios) ? exercicios.length : 0})</h4>
            {!mostrarFormExercicio && (
                 <button type="button" onClick={() => { setEditandoExercicio(null); setIdxEditandoExercicio(null); setMostrarFormExercicio(true);}} className="btn-secondary-sm flex items-center" disabled={isSalvandoPlano}>
                    <IconeAdicionar className="w-4 h-4 mr-1" /> Adicionar Exercício
                </button>
            )}
          </div>

          {mostrarFormExercicio && (
            <ExercicioForm
                exercicioInicial={editandoExercicio}
                onSubmitExercicio={handleSalvarExercicio}
                onCancelExercicio={() => { setMostrarFormExercicio(false); setEditandoExercicio(null); setIdxEditandoExercicio(null); }}
                getProximoIdExercicio={getProximoIdExercicio}
                addToast={addToast}
                exerciciosBiblioteca={exerciciosBiblioteca}
            />
          )}

          {Array.isArray(exercicios) && exercicios.length > 0 && !mostrarFormExercicio && (
            <div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-1">
                {exercicios.map((ex, idx) => (
                    ex && ex.id && ex.nome ? (
                        <div key={ex.id} className="p-2 bg-slate-600 rounded flex justify-between items-start">
                            <div>
                                <p className="font-medium text-slate-100">{idx + 1}. {ex.nome}</p>
                                <p className="text-xs text-slate-300">
                                    {ex.series} séries / {ex.repeticoes} reps / Desc: {ex.tempoDescanso || 'N/A'}
                                </p>
                                {ex.observacoes && <p className="text-xs text-slate-400 mt-0.5">Obs: {ex.observacoes}</p>}
                            </div>
                            <div className="flex space-x-1 flex-shrink-0">
                                <button type="button" onClick={() => handleEditarExercicio(ex, idx)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Exercício" disabled={isSalvandoPlano}><IconeEditar className="w-4 h-4"/></button>
                                <button type="button" onClick={() => handleRemoverExercicio(ex.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Exercício" disabled={isSalvandoPlano}><IconeLixeira className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ) : null
                ))}
            </div>
          )}
           {(!Array.isArray(exercicios) || exercicios.length === 0) && !mostrarFormExercicio && (
                <div className="text-center py-6 text-slate-500">
                    <IconePlanoTreino className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum exercício neste plano.</p>
                    <p className="text-xs">Adicione exercícios ou carregue de um modelo.</p>
                </div>
            )}
      </div>

      <div className="flex justify-end space-x-2 pt-3">
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSalvandoPlano}>Cancelar</button>
        <button type="submit" className="btn-primary flex items-center justify-center" disabled={isSalvandoPlano}>
            {isSalvandoPlano ? <><IconeSpinner className="w-4 h-4 mr-2"/> Salvando...</> : 'Salvar Plano'}
        </button>
      </div>
    </form>
  );
};

interface ExercicioFormProps {
    exercicioInicial?: TreinoExercicio | null;
    onSubmitExercicio: (exercicio: TreinoExercicio) => void;
    onCancelExercicio: () => void;
    getProximoIdExercicio: () => Promise<string>;
    addToast: AddToastFunction;
    exerciciosBiblioteca: ExercicioBiblioteca[];
}
const ExercicioForm: React.FC<ExercicioFormProps> = ({ exercicioInicial, onSubmitExercicio, onCancelExercicio, getProximoIdExercicio, addToast, exerciciosBiblioteca }) => {
    const [nome, setNome] = useState(exercicioInicial?.nome || '');
    const [series, setSeries] = useState(exercicioInicial?.series || '');
    const [repeticoes, setRepeticoes] = useState(exercicioInicial?.repeticoes || '');
    const [tempoDescanso, setTempoDescanso] = useState(exercicioInicial?.tempoDescanso || '');
    const [observacoes, setObservacoes] = useState(exercicioInicial?.observacoes || '');
    const [selectedBibliotecaId, setSelectedBibliotecaId] = useState(exercicioInicial?.exercicioBibliotecaId || '');
    const [isSalvandoExercicio, setIsSalvandoExercicio] = useState(false);

    useEffect(() => {
        setNome(exercicioInicial?.nome || '');
        setSeries(exercicioInicial?.series || '');
        setRepeticoes(exercicioInicial?.repeticoes || '');
        setTempoDescanso(exercicioInicial?.tempoDescanso || '');
        setObservacoes(exercicioInicial?.observacoes || '');
        setSelectedBibliotecaId(exercicioInicial?.exercicioBibliotecaId || '');
        setIsSalvandoExercicio(false);
    }, [exercicioInicial]);

    const handleBibliotecaSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const idSelecionado = e.target.value;
        setSelectedBibliotecaId(idSelecionado);
        const exercicioBib = exerciciosBiblioteca.find(ex => ex.id === idSelecionado);
        if (exercicioBib) {
            setNome(exercicioBib.nome);
            setObservacoes(exercicioBib.descricao || '');
        } else {
            if (!idSelecionado) setNome('');
        }
    };

    const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNome(e.target.value);
        const matchingLibEx = exerciciosBiblioteca.find(ex => ex.nome.toLowerCase() === e.target.value.toLowerCase());
        if (matchingLibEx) {
            if(selectedBibliotecaId !== matchingLibEx.id) {
                 setSelectedBibliotecaId(matchingLibEx.id);
                 if(!observacoes && matchingLibEx.descricao) setObservacoes(matchingLibEx.descricao);
            }
        } else {
            setSelectedBibliotecaId('');
        }
    };

    const handleSalvarClick = async () => {
        if(!nome.trim() || !series.trim() || !repeticoes.trim()) {
            addToast("Nome, séries e repetições são obrigatórios para o exercício.", 'error');
            return;
        }
        setIsSalvandoExercicio(true);
        const finalExercicioId = exercicioInicial?.id || await getProximoIdExercicio();
        onSubmitExercicio({
            id: finalExercicioId,
            nome: nome.trim(),
            series: series.trim(),
            repeticoes: repeticoes.trim(),
            tempoDescanso: tempoDescanso.trim() || undefined,
            observacoes: observacoes.trim() || undefined,
            exercicioBibliotecaId: selectedBibliotecaId || undefined,
        });
        // setIsSalvandoExercicio(false); // A submissão deve fechar o form.
    };

    return (
        <div className="space-y-3 p-3 my-2 bg-slate-600/50 rounded-md border border-slate-500">
             <h4 className="text-sm font-semibold text-slate-100">{exercicioInicial ? 'Editar Exercício' : 'Adicionar Novo Exercício'}</h4>

            <div>
                <label htmlFor="exercicioBibliotecaSelect" className="block text-xs font-medium text-slate-400 mb-0.5">Buscar na Biblioteca (Opcional)</label>
                <select
                    id="exercicioBibliotecaSelect"
                    value={selectedBibliotecaId}
                    onChange={handleBibliotecaSelectChange}
                    className="w-full input-base-sm mb-1"
                    disabled={isSalvandoExercicio}
                >
                    <option value="">-- Digitar nome ou selecionar --</option>
                    {exerciciosBiblioteca.map(ex => (
                        <option key={ex.id} value={ex.id}>{ex.nome} ({ex.grupoMuscularPrincipal})</option>
                    ))}
                </select>
            </div>

            <input type="text" placeholder="Nome do Exercício *" value={nome} onChange={handleNomeChange} required className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
            <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="Séries *" value={series} onChange={e => setSeries(e.target.value)} required className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
                <input type="text" placeholder="Repetições *" value={repeticoes} onChange={e => setRepeticoes(e.target.value)} required className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
                <input type="text" placeholder="Descanso" value={tempoDescanso} onChange={e => setTempoDescanso(e.target.value)} className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
            </div>
            <textarea placeholder="Observações (ex: cadência, técnica)" value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={2} className="w-full input-base-sm" disabled={isSalvandoExercicio}/>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onCancelExercicio} className="btn-secondary-xs" disabled={isSalvandoExercicio}>Cancelar</button>
                <button type="button" onClick={handleSalvarClick} className="btn-primary-xs flex items-center justify-center" disabled={isSalvandoExercicio}>
                    {isSalvandoExercicio ? <><IconeSpinner className="w-3 h-3 mr-1.5"/> Salvando...</> : 'Salvar Exercício'}
                </button>
            </div>
        </div>
    );
};

interface MedidaCorporalFormProps {
    medidaInicial?: MedidaCorporalEntry | null;
    onSubmit: (medida: MedidaCorporalEntry) => void;
    onCancel: () => void;
    getProximoIdMedida: () => Promise<string>;
    addToast: AddToastFunction;
}
const MedidaCorporalForm: React.FC<MedidaCorporalFormProps> = ({ medidaInicial, onSubmit, onCancel, getProximoIdMedida, addToast }) => {
    const [data, setData] = useState(formatarDataParaInputDate(medidaInicial?.data));
    const [peso, setPeso] = useState(medidaInicial?.peso?.toString() || '');
    const [percentualGordura, setPercentualGordura] = useState(medidaInicial?.percentualGordura?.toString() || '');
    const [peito, setPeito] = useState(medidaInicial?.peito?.toString() || '');
    const [cintura, setCintura] = useState(medidaInicial?.cintura?.toString() || '');
    const [quadril, setQuadril] = useState(medidaInicial?.quadril?.toString() || '');
    const [bracoE, setBracoE] = useState(medidaInicial?.bracoE?.toString() || '');
    const [bracoD, setBracoD] = useState(medidaInicial?.bracoD?.toString() || '');
    const [coxaE, setCoxaE] = useState(medidaInicial?.coxaE?.toString() || '');
    const [coxaD, setCoxaD] = useState(medidaInicial?.coxaD?.toString() || '');
    const [antebracoE, setAntebracoE] = useState(medidaInicial?.antebracoE?.toString() || '');
    const [antebracoD, setAntebracoD] = useState(medidaInicial?.antebracoD?.toString() || '');
    const [costas, setCostas] = useState(medidaInicial?.costas?.toString() || '');
    const [abdomen, setAbdomen] = useState(medidaInicial?.abdomen?.toString() || '');
    const [panturrilhaE, setPanturrilhaE] = useState(medidaInicial?.panturrilhaE?.toString() || '');
    const [panturrilhaD, setPanturrilhaD] = useState(medidaInicial?.panturrilhaD?.toString() || '');
    const [observacoesAdicionais, setObservacoesAdicionais] = useState(medidaInicial?.observacoesAdicionais || '');
    const [isSalvandoMedida, setIsSalvandoMedida] = useState(false);

    useEffect(() => {
        setData(formatarDataParaInputDate(medidaInicial?.data));
        setPeso(medidaInicial?.peso?.toString() || '');
        setPercentualGordura(medidaInicial?.percentualGordura?.toString() || '');
        setPeito(medidaInicial?.peito?.toString() || '');
        setCintura(medidaInicial?.cintura?.toString() || '');
        setQuadril(medidaInicial?.quadril?.toString() || '');
        setBracoE(medidaInicial?.bracoE?.toString() || '');
        setBracoD(medidaInicial?.bracoD?.toString() || '');
        setCoxaE(medidaInicial?.coxaE?.toString() || '');
        setCoxaD(medidaInicial?.coxaD?.toString() || '');
        setAntebracoE(medidaInicial?.antebracoE?.toString() || '');
        setAntebracoD(medidaInicial?.antebracoD?.toString() || '');
        setCostas(medidaInicial?.costas?.toString() || '');
        setAbdomen(medidaInicial?.abdomen?.toString() || '');
        setPanturrilhaE(medidaInicial?.panturrilhaE?.toString() || '');
        setPanturrilhaD(medidaInicial?.panturrilhaD?.toString() || '');
        setObservacoesAdicionais(medidaInicial?.observacoesAdicionais || '');
        setIsSalvandoMedida(false);
    }, [medidaInicial]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data) {
            addToast("A data é obrigatória para a medição.", 'error');
            return;
        }
        setIsSalvandoMedida(true);
        const finalId = medidaInicial?.id || await getProximoIdMedida();
        onSubmit({
            id: finalId,
            data: data,
            peso: peso ? parseFloat(peso) : undefined,
            percentualGordura: percentualGordura ? parseFloat(percentualGordura) : undefined,
            peito: peito ? parseFloat(peito) : undefined,
            cintura: cintura ? parseFloat(cintura) : undefined,
            quadril: quadril ? parseFloat(quadril) : undefined,
            bracoE: bracoE ? parseFloat(bracoE) : undefined,
            bracoD: bracoD ? parseFloat(bracoD) : undefined,
            coxaE: coxaE ? parseFloat(coxaE) : undefined,
            coxaD: coxaD ? parseFloat(coxaD) : undefined,
            antebracoE: antebracoE ? parseFloat(antebracoE) : undefined,
            antebracoD: antebracoD ? parseFloat(antebracoD) : undefined,
            costas: costas ? parseFloat(costas) : undefined,
            abdomen: abdomen ? parseFloat(abdomen) : undefined,
            panturrilhaE: panturrilhaE ? parseFloat(panturrilhaE) : undefined,
            panturrilhaD: panturrilhaD ? parseFloat(panturrilhaD) : undefined,
            observacoesAdicionais: observacoesAdicionais.trim() || undefined,
        });
    };

    const inputNumberProps = { type: "number", step: "0.1", className:"w-full input-base", disabled: isSalvandoMedida };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white">{medidaInicial ? 'Editar Medição' : 'Nova Medição Corporal'}</h3>
            <div>
                <label htmlFor="medidaData" className="block text-sm font-medium text-slate-300 mb-1">Data da Medição *</label>
                <input type="date" id="medidaData" value={data} onChange={e => setData(e.target.value)} required className="w-full input-base" disabled={isSalvandoMedida} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="medidaPeso" className="block text-sm font-medium text-slate-300 mb-1">Peso (kg)</label>
                    <input id="medidaPeso" value={peso} onChange={e => setPeso(e.target.value)} {...inputNumberProps} />
                </div>
                <div>
                    <label htmlFor="medidaGordura" className="block text-sm font-medium text-slate-300 mb-1">% Gordura</label>
                    <input id="medidaGordura" value={percentualGordura} onChange={e => setPercentualGordura(e.target.value)} {...inputNumberProps} />
                </div>
                 <div>
                    <label htmlFor="medidaPeito" className="block text-sm font-medium text-slate-300 mb-1">Peito (cm)</label>
                    <input id="medidaPeito" value={peito} onChange={e => setPeito(e.target.value)} {...inputNumberProps} />
                </div>
                <div>
                    <label htmlFor="medidaCintura" className="block text-sm font-medium text-slate-300 mb-1">Cintura (cm)</label>
                    <input id="medidaCintura" value={cintura} onChange={e => setCintura(e.target.value)} {...inputNumberProps} />
                </div>
                <div>
                    <label htmlFor="medidaAbdomen" className="block text-sm font-medium text-slate-300 mb-1">Abdômen (cm)</label>
                    <input id="medidaAbdomen" value={abdomen} onChange={e => setAbdomen(e.target.value)} {...inputNumberProps} />
                </div>
                 <div>
                    <label htmlFor="medidaQuadril" className="block text-sm font-medium text-slate-300 mb-1">Quadril (cm)</label>
                    <input id="medidaQuadril" value={quadril} onChange={e => setQuadril(e.target.value)} {...inputNumberProps} />
                </div>

                <div>
                    <label htmlFor="medidaBracoD" className="block text-sm font-medium text-slate-300 mb-1">Braço D (cm)</label>
                    <input id="medidaBracoD" value={bracoD} onChange={e => setBracoD(e.target.value)} {...inputNumberProps} />
                </div>
                <div>
                    <label htmlFor="medidaBracoE" className="block text-sm font-medium text-slate-300 mb-1">Braço E (cm)</label>
                    <input id="medidaBracoE" value={bracoE} onChange={e => setBracoE(e.target.value)} {...inputNumberProps} />
                </div>
                <div>
                    <label htmlFor="medidaAntebracoD" className="block text-sm font-medium text-slate-300 mb-1">Antebraço D (cm)</label>
                    <input id="medidaAntebracoD" value={antebracoD} onChange={e => setAntebracoD(e.target.value)} {...inputNumberProps} />
                </div>
                 <div>
                    <label htmlFor="medidaAntebracoE" className="block text-sm font-medium text-slate-300 mb-1">Antebraço E (cm)</label>
                    <input id="medidaAntebracoE" value={antebracoE} onChange={e => setAntebracoE(e.target.value)} {...inputNumberProps} />
                </div>
                <div>
                    <label htmlFor="medidaCostas" className="block text-sm font-medium text-slate-300 mb-1">Costas (cm)</label>
                    <input id="medidaCostas" value={costas} onChange={e => setCostas(e.target.value)} {...inputNumberProps} placeholder="Ex: Largura dorsal" />
                </div>

                <div>
                    <label htmlFor="medidaCoxaD" className="block text-sm font-medium text-slate-300 mb-1">Coxa D (cm)</label>
                    <input id="medidaCoxaD" value={coxaD} onChange={e => setCoxaD(e.target.value)} {...inputNumberProps} />
                </div>
                 <div>
                    <label htmlFor="medidaCoxaE" className="block text-sm font-medium text-slate-300 mb-1">Coxa E (cm)</label>
                    <input id="medidaCoxaE" value={coxaE} onChange={e => setCoxaE(e.target.value)} {...inputNumberProps} />
                </div>
                 <div>
                    <label htmlFor="medidaPanturrilhaD" className="block text-sm font-medium text-slate-300 mb-1">Panturrilha D (cm)</label>
                    <input id="medidaPanturrilhaD" value={panturrilhaD} onChange={e => setPanturrilhaD(e.target.value)} {...inputNumberProps} />
                </div>
                <div>
                    <label htmlFor="medidaPanturrilhaE" className="block text-sm font-medium text-slate-300 mb-1">Panturrilha E (cm)</label>
                    <input id="medidaPanturrilhaE" value={panturrilhaE} onChange={e => setPanturrilhaE(e.target.value)} {...inputNumberProps} />
                </div>
            </div>
            <div>
                <label htmlFor="medidaObs" className="block text-sm font-medium text-slate-300 mb-1">Observações Adicionais</label>
                <textarea id="medidaObs" value={observacoesAdicionais} onChange={e => setObservacoesAdicionais(e.target.value)} rows={3} className="w-full input-base" disabled={isSalvandoMedida}/>
            </div>
            <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSalvandoMedida}>Cancelar</button>
                <button type="submit" className="btn-primary flex items-center justify-center" disabled={isSalvandoMedida}>
                    {isSalvandoMedida ? <><IconeSpinner className="w-4 h-4 mr-2"/> Salvando...</> : 'Salvar Medição'}
                </button>
            </div>
        </form>
    );
};

interface NotaSessaoFormProps {
    notaInicial?: NotaSessao | null;
    onSubmit: (nota: NotaSessao) => void;
    onCancel: () => void;
    getProximoIdNota: () => Promise<string>;
    addToast: AddToastFunction;
}
const NotaSessaoForm: React.FC<NotaSessaoFormProps> = ({ notaInicial, onSubmit, onCancel, getProximoIdNota, addToast }) => {
    const [data, setData] = useState(formatarDataParaInputDate(notaInicial?.data));
    const [conteudo, setConteudo] = useState(notaInicial?.conteudo || '');
    const [isSalvandoNota, setIsSalvandoNota] = useState(false);

    useEffect(() => {
        setData(formatarDataParaInputDate(notaInicial?.data));
        setConteudo(notaInicial?.conteudo || '');
        setIsSalvandoNota(false);
    }, [notaInicial]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data || !conteudo.trim()) {
            addToast("Data e conteúdo da nota são obrigatórios.", 'error');
            return;
        }
        setIsSalvandoNota(true);
        const finalId = notaInicial?.id || await getProximoIdNota();
        onSubmit({
            id: finalId,
            data: data,
            conteudo: conteudo.trim(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white">{notaInicial ? 'Editar Nota da Sessão' : 'Nova Nota da Sessão'}</h3>
            <div>
                <label htmlFor="notaData" className="block text-sm font-medium text-slate-300 mb-1">Data da Nota *</label>
                <input type="date" id="notaData" value={data} onChange={e => setData(e.target.value)} required className="w-full input-base" disabled={isSalvandoNota} />
            </div>
            <div>
                <label htmlFor="notaConteudo" className="block text-sm font-medium text-slate-300 mb-1">Conteúdo da Nota *</label>
                <textarea id="notaConteudo" value={conteudo} onChange={e => setConteudo(e.target.value)} rows={4} required className="w-full input-base" disabled={isSalvandoNota} />
            </div>
            <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSalvandoNota}>Cancelar</button>
                <button type="submit" className="btn-primary flex items-center justify-center" disabled={isSalvandoNota}>
                     {isSalvandoNota ? <><IconeSpinner className="w-4 h-4 mr-2"/> Salvando...</> : 'Salvar Nota'}
                </button>
            </div>
        </form>
    );
};

// v0.1.2 (Parte 22): Componente para formulário de Dobras Cutâneas
interface DobraCutaneaFormProps {
  dobraInicial?: DobraCutaneaEntry | null;
  onSubmit: (dobra: DobraCutaneaEntry) => void;
  onCancel: () => void;
  getProximoIdDobra: () => Promise<string>;
  addToast: AddToastFunction;
}
const DobraCutaneaForm: React.FC<DobraCutaneaFormProps> = ({ dobraInicial, onSubmit, onCancel, getProximoIdDobra, addToast }) => {
    const [formData, setFormData] = useState<Partial<DobraCutaneaEntry>>({
        data: formatarDataParaInputDate(dobraInicial?.data),
        peitoral: dobraInicial?.peitoral,
        abdominal: dobraInicial?.abdominal,
        coxa: dobraInicial?.coxa,
        tricipital: dobraInicial?.tricipital,
        subescapular: dobraInicial?.subescapular,
        suprailiaca: dobraInicial?.suprailiaca,
        axilarMedia: dobraInicial?.axilarMedia,
        bicipital: dobraInicial?.bicipital,
        panturrilhaMedial: dobraInicial?.panturrilhaMedial,
        pescoco: dobraInicial?.pescoco,
        supraespinhal: dobraInicial?.supraespinhal,
        observacoes: dobraInicial?.observacoes || '',
    });
    const [isSalvandoDobra, setIsSalvandoDobra] = useState(false);

    useEffect(() => {
        setFormData({
            data: formatarDataParaInputDate(dobraInicial?.data),
            peitoral: dobraInicial?.peitoral,
            abdominal: dobraInicial?.abdominal,
            coxa: dobraInicial?.coxa,
            tricipital: dobraInicial?.tricipital,
            subescapular: dobraInicial?.subescapular,
            suprailiaca: dobraInicial?.suprailiaca,
            axilarMedia: dobraInicial?.axilarMedia,
            bicipital: dobraInicial?.bicipital,
            panturrilhaMedial: dobraInicial?.panturrilhaMedial,
            pescoco: dobraInicial?.pescoco,
            supraespinhal: dobraInicial?.supraespinhal,
            observacoes: dobraInicial?.observacoes || '',
        });
        setIsSalvandoDobra(false);
    }, [dobraInicial]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : (e.target.type === 'number' ? parseFloat(value) : value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.data) {
            addToast("A data é obrigatória para o registro de dobras.", 'error');
            return;
        }
        // Verifica se pelo menos uma dobra foi preenchida
        const temAlgumaDobra = Object.keys(formData).some(key => key !== 'data' && key !== 'id' && key !== 'observacoes' && formData[key as keyof DobraCutaneaEntry] !== undefined);
        if (!temAlgumaDobra) {
            addToast("Pelo menos uma medida de dobra cutânea deve ser preenchida.", 'error');
            return;
        }

        setIsSalvandoDobra(true);
        const finalId = dobraInicial?.id || await getProximoIdDobra();
        const dobraParaSalvar: DobraCutaneaEntry = {
            id: finalId,
            data: formData.data!, // Sabemos que está definido pela validação acima
            peitoral: formData.peitoral,
            abdominal: formData.abdominal,
            coxa: formData.coxa,
            tricipital: formData.tricipital,
            subescapular: formData.subescapular,
            suprailiaca: formData.suprailiaca,
            axilarMedia: formData.axilarMedia,
            bicipital: formData.bicipital,
            panturrilhaMedial: formData.panturrilhaMedial,
            pescoco: formData.pescoco,
            supraespinhal: formData.supraespinhal,
            observacoes: formData.observacoes?.trim() || undefined,
        };
        onSubmit(dobraParaSalvar);
    };

    const dobraFields: { key: keyof DobraCutaneaEntry; label: string; group: string }[] = [
        { key: 'peitoral', label: 'Peitoral (Tórax)', group: 'Tronco' },
        { key: 'subescapular', label: 'Subescapular', group: 'Tronco' },
        { key: 'axilarMedia', label: 'Axilar Média', group: 'Tronco' },
        { key: 'suprailiaca', label: 'Suprailíaca', group: 'Tronco' },
        { key: 'abdominal', label: 'Abdominal', group: 'Tronco' },
        { key: 'tricipital', label: 'Tricipital', group: 'Membros Superiores' },
        { key: 'bicipital', label: 'Bicipital', group: 'Membros Superiores' },
        { key: 'supraespinhal', label: 'Supraespinhal (Ombro)', group: 'Membros Superiores' },
        { key: 'pescoco', label: 'Pescoço', group: 'Membros Superiores' },
        { key: 'coxa', label: 'Coxa (Medial/Anterior)', group: 'Membros Inferiores' },
        { key: 'panturrilhaMedial', label: 'Panturrilha Medial', group: 'Membros Inferiores' },
    ];

    const groupedFields = dobraFields.reduce((acc, field) => {
        if (!acc[field.group]) acc[field.group] = [];
        acc[field.group].push(field);
        return acc;
    }, {} as Record<string, typeof dobraFields>);


    const inputDobraProps = { type: "number", step: "0.1", min:"0", className: "w-full input-base", onChange: handleChange, disabled: isSalvandoDobra };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-white">{dobraInicial ? 'Editar Registro de Dobras Cutâneas' : 'Novo Registro de Dobras Cutâneas'}</h3>
            <div>
                <label htmlFor="dobraData" className="block text-sm font-medium text-slate-300 mb-1">Data do Registro *</label>
                <input type="date" id="dobraData" name="data" value={formData.data} onChange={handleChange} required className="w-full input-base" disabled={isSalvandoDobra} />
            </div>

            {Object.entries(groupedFields).map(([groupName, fields]) => (
                <div key={groupName} className="pt-3 border-t border-slate-600/50">
                    <h4 className="text-md font-semibold text-indigo-300 mb-2">{groupName} (mm)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3">
                        {fields.map(field => (
                            <div key={field.key}>
                                <label htmlFor={`dobra-${field.key}`} className="block text-xs font-medium text-slate-400 mb-0.5">{field.label}</label>
                                <input id={`dobra-${field.key}`} name={field.key as string} value={formData[field.key] || ''} {...inputDobraProps} />
              </div>
            ))}


            <div>
                <label htmlFor="dobraObservacoes" className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
                <textarea id="dobraObservacoes" name="observacoes" value={formData.observacoes} onChange={handleChange} rows={3} className="w-full input-base" disabled={isSalvandoDobra}/>
            </div>
            <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={onCancel} className="btn-secondary" disabled={isSalvandoDobra}>Cancelar</button>
                <button type="submit" className="btn-primary flex items-center justify-center" disabled={isSalvandoDobra}>
                    {isSalvandoDobra ? <><IconeSpinner className="w-4 h-4 mr-2"/> Salvando...</> : 'Salvar Dobras'}
                </button>
            </div>
        </form>
    );
};



const StudentDetailView: React.FC<StudentDetailViewProps> = ({
    aluno,
    onUpdateAluno,
    onDeleteAluno,
    onGoBack,
    onOpenBasicProfileModal,
    getProximoId,
    addToast,
    modelosDeTreino,
    exerciciosBiblioteca,
    abrirModalVisualizarExercicioBiblioteca
}) => {
  const [alunoLocal, setAlunoLocal] = useState<AlunoConsultoria>(aluno);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('planos');

  const [mostrarFormPlano, setMostrarFormPlano] = useState(false);
  const [editandoPlano, setEditandoPlano] = useState<PlanoDeTreino | null>(null);

  const [mostrarFormMedida, setMostrarFormMedida] = useState(false);
  const [editandoMedida, setEditandoMedida] = useState<MedidaCorporalEntry | null>(null);

  const [mostrarFormNota, setMostrarFormNota] = useState(false);
  const [editandoNota, setEditandoNota] = useState<NotaSessao | null>(null);

  const [mostrarFormDiario, setMostrarFormDiario] = useState(false);
  const [editandoDiarioEntry, setEditandoDiarioEntry] = useState<DiarioEntry | null>(null);

  const [mostrarFormMeta, setMostrarFormMeta] = useState(false);
  const [editandoMeta, setEditandoMeta] = useState<MetaDetalhada | null>(null);

  const [mostrarFormPagamento, setMostrarFormPagamento] = useState(false);
  const [editandoPagamento, setEditandoPagamento] = useState<Pagamento | null>(null);

  const [mostrarFormDobraCutanea, setMostrarFormDobraCutanea] = useState(false); // v0.1.2 (Parte 22)
  const [editandoDobraCutanea, setEditandoDobraCutanea] = useState<DobraCutaneaEntry | null>(null); // v0.1.2 (Parte 22)


  type TipoMedidaGrafico = keyof Omit<MedidaCorporalEntry, 'id' | 'data' | 'observacoesAdicionais'>;
  const [medidaParaGrafico, setMedidaParaGrafico] = useState<TipoMedidaGrafico>('peso');


  useEffect(() => {
    setAlunoLocal(aluno);
    setMostrarFormPlano(false); setEditandoPlano(null);
    setMostrarFormMedida(false); setEditandoMedida(null);
    setMostrarFormNota(false); setEditandoNota(null);
    setMostrarFormDiario(false); setEditandoDiarioEntry(null);
    setMostrarFormMeta(false); setEditandoMeta(null);
    setMostrarFormPagamento(false); setEditandoPagamento(null);
    setMostrarFormDobraCutanea(false); setEditandoDobraCutanea(null); // v0.1.2 (Parte 22)
  }, [aluno]);

  const persistChanges = (updatedAluno: AlunoConsultoria) => {
    onUpdateAluno(updatedAluno);
  };

  const handleSalvarPlano = (plano: PlanoDeTreino) => {
    let planosAtualizados: PlanoDeTreino[];

    const exerciciosValidadosCorrigidos = (Array.isArray(plano.exercicios) ? plano.exercicios : []).map(ex => {
        const exId = (typeof ex.id === 'string' && ex.id) ? ex.id : `temp-id-${Math.random()}`; // Fallback, should have ID from form
        const exNome = (typeof ex.nome === 'string' && ex.nome.trim()) ? ex.nome.trim() : 'Exercício Sem Nome';
        const exSeries = (typeof ex.series === 'string' && ex.series.trim()) ? ex.series.trim() : (typeof ex.series === 'number' ? String(ex.series) : '3');
        const exRepeticoes = (typeof ex.repeticoes === 'string' && ex.repeticoes.trim()) ? ex.repeticoes.trim() : (typeof ex.repeticoes === 'number' ? String(ex.repeticoes) : '10');

        return {
            id: exId,
            nome: exNome,
            series: exSeries,
            repeticoes: exRepeticoes,
            tempoDescanso: (typeof ex.tempoDescanso === 'string' && ex.tempoDescanso.trim()) ? ex.tempoDescanso.trim() : undefined,
            observacoes: (typeof ex.observacoes === 'string' && ex.observacoes.trim()) ? ex.observacoes.trim() : undefined,
            exercicioBibliotecaId: (typeof ex.exercicioBibliotecaId === 'string' && ex.exercicioBibliotecaId.trim()) ? ex.exercicioBibliotecaId.trim() : undefined,
        };
    });

    const planoComExerciciosValidados = {
        ...plano,
        exercicios: exerciciosValidadosCorrigidos
    };

    if (planoComExerciciosValidados.ativo) {
        planosAtualizados = (alunoLocal.planosDeTreino || []).map(p => ({...p, ativo: false}));
    } else {
        planosAtualizados = [...(alunoLocal.planosDeTreino || [])];
    }

    const indexExistente = planosAtualizados.findIndex(p => p.id === planoComExerciciosValidados.id);
    if (indexExistente > -1) {
      planosAtualizados[indexExistente] = planoComExerciciosValidados;
      addToast(`Plano de treino "${planoComExerciciosValidados.nome}" atualizado!`, 'success');
    } else {
      planosAtualizados.push(planoComExerciciosValidados);
      addToast(`Plano de treino "${planoComExerciciosValidados.nome}" criado!`, 'success');
    }

    let planoAtivoEncontrado = false;
    planosAtualizados = planosAtualizados.map(p => {
        if (p.id === planoComExerciciosValidados.id && planoComExerciciosValidados.ativo) {
            planoAtivoEncontrado = true;
            return { ...p, ativo: true };
        }
        return { ...p, ativo: false };
    });

    if (planoComExerciciosValidados.ativo && !planoAtivoEncontrado && planosAtualizados.length > 0) {
        const algumOutroAtivo = planosAtualizados.some(p => p.ativo && p.id !== planoComExerciciosValidados.id);
        if(!algumOutroAtivo) {
            const idx = planosAtualizados.findIndex(p => p.id === planoComExerciciosValidados.id);
            if(idx > -1) planosAtualizados[idx].ativo = true;
        }
    }

    const novoAlunoLocal = { ...alunoLocal, planosDeTreino: planosAtualizados };
    setAlunoLocal(novoAlunoLocal);
    persistChanges(novoAlunoLocal);
    setMostrarFormPlano(false);
    setEditandoPlano(null);
  };

  const handleEditarPlano = (plano: PlanoDeTreino) => {
    setEditandoPlano(plano);
    setMostrarFormPlano(true);
  };

  const handleRemoverPlano = (planoId: string) => {
    const planoRemovido = alunoLocal.planosDeTreino.find(p => p.id === planoId);
    if (window.confirm("Tem certeza que deseja excluir este plano de treino?")) {
      const planosFiltrados = (alunoLocal.planosDeTreino || []).filter(p => p.id !== planoId);
      const novoAlunoLocal = { ...alunoLocal, planosDeTreino: planosFiltrados };
      setAlunoLocal(novoAlunoLocal);
      persistChanges(novoAlunoLocal);
      if (planoRemovido) addToast(`Plano "${planoRemovido.nome}" removido.`, 'success');
    }
  };

  const medidaToGoalMapping: Record<keyof Omit<MedidaCorporalEntry, 'id' | 'data' | 'observacoesAdicionais'>, { tipo: TipoMetricaMeta, detalhe?: DetalheMetricaMedidaCorporal, nomeMedida: string }> = {
    peso: { tipo: 'Peso', nomeMedida: 'Peso Corporal' },
    percentualGordura: { tipo: '%Gordura', nomeMedida: '% de Gordura' },
    peito: { tipo: 'MedidaCorporal', detalhe: 'Peito', nomeMedida: 'Peito' },
    cintura: { tipo: 'MedidaCorporal', detalhe: 'Cintura', nomeMedida: 'Cintura' },
    quadril: { tipo: 'MedidaCorporal', detalhe: 'Quadril', nomeMedida: 'Quadril' },
    bracoE: { tipo: 'MedidaCorporal', detalhe: 'BracoE', nomeMedida: 'Braço Esquerdo' },
    bracoD: { tipo: 'MedidaCorporal', detalhe: 'BracoD', nomeMedida: 'Braço Direito' },
    coxaE: { tipo: 'MedidaCorporal', detalhe: 'CoxaE', nomeMedida: 'Coxa Esquerda' },
    coxaD: { tipo: 'MedidaCorporal', detalhe: 'CoxaD', nomeMedida: 'Coxa Direita' },
    antebracoE: { tipo: 'MedidaCorporal', detalhe: 'AntebracoE', nomeMedida: 'Antebraço Esquerdo' },
    antebracoD: { tipo: 'MedidaCorporal', detalhe: 'AntebracoD', nomeMedida: 'Antebraço Direito' },
    costas: { tipo: 'MedidaCorporal', detalhe: 'Costas', nomeMedida: 'Costas' },
    abdomen: { tipo: 'MedidaCorporal', detalhe: 'Abdomen', nomeMedida: 'Abdômen' },
    panturrilhaE: { tipo: 'MedidaCorporal', detalhe: 'PanturrilhaE', nomeMedida: 'Panturrilha Esquerda' },
    panturrilhaD: { tipo: 'MedidaCorporal', detalhe: 'PanturrilhaD', nomeMedida: 'Panturrilha Direita' },
  };

  const handleSalvarMedida = (medida: MedidaCorporalEntry) => {
    const medicoesAtualizadas = [...alunoLocal.historicoMedidas];
    const indexExistente = medicoesAtualizadas.findIndex(m => m.id === medida.id);
    const dataFormatadaUser = formatarDataParaExibicao(medida.data);

    if (indexExistente > -1) {
        medicoesAtualizadas[indexExistente] = medida;
        addToast(`Medição de ${dataFormatadaUser} atualizada.`, 'success');
    } else {
        medicoesAtualizadas.push(medida);
        addToast(`Medição de ${dataFormatadaUser} adicionada.`, 'success');
    }
    medicoesAtualizadas.sort((a,b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    const novoAlunoLocalState = { ...alunoLocal, historicoMedidas: medicoesAtualizadas };
    setAlunoLocal(novoAlunoLocalState);
    persistChanges(novoAlunoLocalState);
    setMostrarFormMedida(false);
    setEditandoMedida(null);

    // Lógica de sugestão de atualização de metas
    Object.keys(medida).forEach(key => {
        const medidaKey = key as keyof Omit<MedidaCorporalEntry, 'id' | 'data' | 'observacoesAdicionais'>;
        if (!medidaToGoalMapping[medidaKey]) return;

        const valorMedido = medida[medidaKey];

        if (valorMedido !== undefined && valorMedido !== null && medidaToGoalMapping[medidaKey]) {
            const mapping = medidaToGoalMapping[medidaKey];
            const metaCorrespondente = (novoAlunoLocalState.metasDetalhadas || []).find(
                m => m.status === 'Ativa' &&
                     m.tipoMetrica === mapping.tipo &&
                     (m.detalheMetrica === mapping.detalhe || (!mapping.detalhe && !m.detalheMetrica && mapping.tipo !== 'MedidaCorporal'))
            );

            if (metaCorrespondente) {
                const handleUpdateGoalClick = () => {
                    setAbaAtiva('metas');
                    const metaParaEdicaoSugerida: MetaDetalhada = {
                        ...metaCorrespondente,
                        valorAtual: Number(valorMedido)
                    };
                    setEditandoMeta(metaParaEdicaoSugerida);
                    setMostrarFormMeta(true);
                };

                addToast(
                    `Registrou ${mapping.nomeMedida}: ${valorMedido}. Atualizar meta "${metaCorrespondente.descricao}"?`,
                    'info',
                    handleUpdateGoalClick,
                    'Atualizar Meta'
                );
            }
        }
    });
  };

  const handleEditarMedida = (medida: MedidaCorporalEntry) => {
    setEditandoMedida(medida);
    setMostrarFormMedida(true);
  };

  const handleRemoverMedida = (medidaId: string) => {
    const medidaRemovida = alunoLocal.historicoMedidas.find(m => m.id === medidaId);
    if (window.confirm("Tem certeza que deseja excluir esta medição?")) {
      const medicoesFiltradas = alunoLocal.historicoMedidas.filter(m => m.id !== medidaId);
      const novoAlunoLocal = { ...alunoLocal, historicoMedidas: medicoesFiltradas };
      setAlunoLocal(novoAlunoLocal);
      persistChanges(novoAlunoLocal);
      if (medidaRemovida) addToast(`Medição de ${formatarDataParaExibicao(medidaRemovida.data)} removida.`, 'success');
    }
  };

  const handleSalvarNota = (nota: NotaSessao) => {
    const notasAtualizadas = [...alunoLocal.notasSessao];
    const indexExistente = notasAtualizadas.findIndex(n => n.id === nota.id);
    const dataFormatadaUser = formatarDataParaExibicao(nota.data);

    if (indexExistente > -1) {
        notasAtualizadas[indexExistente] = nota;
        addToast(`Nota de ${dataFormatadaUser} atualizada.`, 'success');
    } else {
        notasAtualizadas.push(nota);
        addToast(`Nota de ${dataFormatadaUser} adicionada.`, 'success');
    }
    notasAtualizadas.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const novoAlunoLocal = { ...alunoLocal, notasSessao: notasAtualizadas };
    setAlunoLocal(novoAlunoLocal);
    persistChanges(novoAlunoLocal);
    setMostrarFormNota(false);
    setEditandoNota(null);
  };

  const handleEditarNota = (nota: NotaSessao) => {
    setEditandoNota(nota);
    setMostrarFormNota(true);
  };

  const handleRemoverNota = (notaId: string) => {
    const notaRemovida = alunoLocal.notasSessao.find(n => n.id === notaId);
     if (window.confirm("Tem certeza que deseja excluir esta nota de sessão?")) {
        const notasFiltradas = alunoLocal.notasSessao.filter(n => n.id !== notaId);
        const novoAlunoLocal = { ...alunoLocal, notasSessao: notasFiltradas };
        setAlunoLocal(novoAlunoLocal);
        persistChanges(novoAlunoLocal);
        if (notaRemovida) addToast(`Nota de ${formatarDataParaExibicao(notaRemovida.data)} removida.`, 'success');
    }
  };

  const handleSalvarDiarioEntry = (entry: DiarioEntry) => {
    const diarioAtualizado = [...alunoLocal.diario];
    const indexExistente = diarioAtualizado.findIndex(e => e.id === entry.id);
    const dataHoraFormatadaUser = formatarDataHoraParaExibicao(entry.data);

    if (indexExistente > -1) {
      diarioAtualizado[indexExistente] = entry;
      addToast(`Entrada do diário de ${dataHoraFormatadaUser} atualizada.`, 'success');
    } else {
      diarioAtualizado.push(entry);
      addToast(`Entrada do diário de ${dataHoraFormatadaUser} adicionada.`, 'success');
    }
    diarioAtualizado.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const novoAlunoLocal = { ...alunoLocal, diario: diarioAtualizado };
    setAlunoLocal(novoAlunoLocal);
    persistChanges(novoAlunoLocal);
    setMostrarFormDiario(false);
    setEditandoDiarioEntry(null);
  };

  const handleEditarDiarioEntry = (entry: DiarioEntry) => {
    setEditandoDiarioEntry(entry);
    setMostrarFormDiario(true);
  };

  const handleRemoverDiarioEntry = (entryId: string) => {
    const entryRemovida = alunoLocal.diario.find(e => e.id === entryId);
    if (window.confirm(`Tem certeza que deseja excluir esta entrada do diário de ${entryRemovida ? formatarDataHoraParaExibicao(entryRemovida.data) : 'data desconhecida'}?`)) {
      const diarioFiltrado = alunoLocal.diario.filter(e => e.id !== entryId);
      const novoAlunoLocal = { ...alunoLocal, diario: diarioFiltrado };
      setAlunoLocal(novoAlunoLocal);
      persistChanges(novoAlunoLocal);
      if (entryRemovida) addToast(`Entrada do diário de ${formatarDataHoraParaExibicao(entryRemovida.data)} removida.`, 'success');
    }
  };

  const handleSalvarMetaDetalhada = (meta: MetaDetalhada) => {
    const metasAtualizadas = [...alunoLocal.metasDetalhadas];
    const indexExistente = metasAtualizadas.findIndex(m => m.id === meta.id);

    if (indexExistente > -1) {
      metasAtualizadas[indexExistente] = meta;
      addToast(`Meta "${meta.descricao}" atualizada.`, 'success');
    } else {
      metasAtualizadas.push(meta);
      addToast(`Meta "${meta.descricao}" adicionada.`, 'success');
    }
    metasAtualizadas.sort((a,b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime());

    const novoAlunoLocal = { ...alunoLocal, metasDetalhadas: metasAtualizadas };
    setAlunoLocal(novoAlunoLocal);
    persistChanges(novoAlunoLocal);
    setMostrarFormMeta(false);
    setEditandoMeta(null);
  };

  const handleEditarMetaDetalhada = (meta: MetaDetalhada) => {
    setEditandoMeta(meta);
    setMostrarFormMeta(true);
  };

  const handleRemoverMetaDetalhada = (metaId: string) => {
    const metaRemovida = alunoLocal.metasDetalhadas.find(m => m.id === metaId);
    if (window.confirm(`Tem certeza que deseja excluir a meta "${metaRemovida?.descricao}"?`)) {
      const metasFiltradas = alunoLocal.metasDetalhadas.filter(m => m.id !== metaId);
      const novoAlunoLocal = { ...alunoLocal, metasDetalhadas: metasFiltradas };
      setAlunoLocal(novoAlunoLocal);
      persistChanges(novoAlunoLocal);
      if (metaRemovida) addToast(`Meta "${metaRemovida.descricao}" removida.`, 'success');
    }
  };

  const calcularProgressoMeta = (meta: MetaDetalhada): number => {
    if (meta.status !== 'Ativa' && meta.status !== 'Pausada') {
        return meta.status === 'Alcancada' ? 100 : 0;
    }
    if (meta.valorAlvo === meta.valorInicial) return meta.valorAtual >= meta.valorAlvo ? 100 : 0;

    let progresso = 0;
    if (meta.valorAlvo > meta.valorInicial) {
        progresso = ((meta.valorAtual - meta.valorInicial) / (meta.valorAlvo - meta.valorInicial)) * 100;
    } else {
        progresso = ((meta.valorInicial - meta.valorAtual) / (meta.valorInicial - meta.valorAlvo)) * 100;
    }
    return Math.max(0, Math.min(100, progresso));
  };

  const handleSalvarPagamento = (pagamento: Pagamento) => {
    const pagamentosAtualizados = [...(alunoLocal.historicoPagamentos || [])];
    const indexExistente = pagamentosAtualizados.findIndex(p => p.id === pagamento.id);
    const dataFormatadaUser = formatarDataParaExibicao(pagamento.data);

    if (indexExistente > -1) {
        pagamentosAtualizados[indexExistente] = pagamento;
        addToast(`Pagamento de ${dataFormatadaUser} atualizado.`, 'success');
    } else {
        pagamentosAtualizados.push(pagamento);
        addToast(`Pagamento de ${dataFormatadaUser} adicionado.`, 'success');
    }
    pagamentosAtualizados.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const novoAlunoLocal = { ...alunoLocal, historicoPagamentos: pagamentosAtualizados };
    setAlunoLocal(novoAlunoLocal);
    persistChanges(novoAlunoLocal);
    setMostrarFormPagamento(false);
    setEditandoPagamento(null);
  };

  const handleEditarPagamento = (pagamento: Pagamento) => {
    setEditandoPagamento(pagamento);
    setMostrarFormPagamento(true);
  };

  const handleRemoverPagamento = (pagamentoId: string) => {
    const pagamentoRemovido = alunoLocal.historicoPagamentos?.find(p => p.id === pagamentoId);
    if (window.confirm(`Tem certeza que deseja excluir este pagamento de ${pagamentoRemovido ? formatarDataParaExibicao(pagamentoRemovido.data) : 'data desconhecida'}?`)) {
      const pagamentosFiltrados = (alunoLocal.historicoPagamentos || []).filter(p => p.id !== pagamentoId);
      const novoAlunoLocal = { ...alunoLocal, historicoPagamentos: pagamentosFiltrados };
      setAlunoLocal(novoAlunoLocal);
      persistChanges(novoAlunoLocal);
      if (pagamentoRemovido) addToast(`Pagamento de ${formatarDataParaExibicao(pagamentoRemovido.data)} removido.`, 'success');
    }
  };

  const calcularResumoFinanceiro = () => {
    let totalPago = 0;
    let totalPendente = 0;
    let totalAtrasado = 0;
    (alunoLocal.historicoPagamentos || []).forEach(p => {
        if (p.status === 'Pago') totalPago += p.valor;
        else if (p.status === 'Pendente') totalPendente += p.valor;
        else if (p.status === 'Atrasado') totalAtrasado += p.valor;
    });
    return { totalPago, totalPendente, totalAtrasado };
  };

  // v0.1.2 (Parte 22): Funções para Dobras Cutâneas
  const handleSalvarDobraCutanea = (dobra: DobraCutaneaEntry) => {
    const dobrasAtualizadas = [...(alunoLocal.historicoDobrasCutaneas || [])];
    const indexExistente = dobrasAtualizadas.findIndex(d => d.id === dobra.id);
    const dataFormatadaUser = formatarDataParaExibicao(dobra.data);

    if (indexExistente > -1) {
        dobrasAtualizadas[indexExistente] = dobra;
        addToast(`Registro de dobras de ${dataFormatadaUser} atualizado.`, 'success');
    } else {
        dobrasAtualizadas.push(dobra);
        addToast(`Registro de dobras de ${dataFormatadaUser} adicionado.`, 'success');
    }
    dobrasAtualizadas.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    const novoAlunoLocal = { ...alunoLocal, historicoDobrasCutaneas: dobrasAtualizadas };
    setAlunoLocal(novoAlunoLocal);
    persistChanges(novoAlunoLocal);
    setMostrarFormDobraCutanea(false);
    setEditandoDobraCutanea(null);
  };

  const handleEditarDobraCutanea = (dobra: DobraCutaneaEntry) => {
    setEditandoDobraCutanea(dobra);
    setMostrarFormDobraCutanea(true);
  };

  const handleRemoverDobraCutanea = (dobraId: string) => {
    const dobraRemovida = alunoLocal.historicoDobrasCutaneas?.find(d => d.id === dobraId);
    if (window.confirm(`Tem certeza que deseja excluir este registro de dobras de ${dobraRemovida ? formatarDataParaExibicao(dobraRemovida.data) : 'data desconhecida'}?`)) {
      const dobrasFiltradas = (alunoLocal.historicoDobrasCutaneas || []).filter(d => d.id !== dobraId);
      const novoAlunoLocal = { ...alunoLocal, historicoDobrasCutaneas: dobrasFiltradas };
      setAlunoLocal(novoAlunoLocal);
      persistChanges(novoAlunoLocal);
      if (dobraRemovida) addToast(`Registro de dobras de ${formatarDataParaExibicao(dobraRemovida.data)} removido.`, 'success');
    }
  };

  const handleGerarPdfHistoricoDobras = () => {
    const doc = new jsPDF('landscape');
    const today = new Date().toLocaleDateString('pt-BR');
    const sanitizedAlunoNome = sanitizarNomeArquivo(alunoLocal.nome);
    const fileName = `historico_dobras_${sanitizedAlunoNome}.pdf`;

    doc.setFont("Arial", "normal");
    doc.setFontSize(16);
    doc.text("Histórico de Dobras Cutâneas (mm)", doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Aluno: ${alunoLocal.nome}`, 14, 25);

    const head = [[
        "Data", "Peitoral", "Abdominal", "Coxa", "Tricipital",
        "Subescapular", "Suprailíaca", "Axilar Média", "Bicipital",
        "Pant. Medial", "Pescoço", "Supraespinhal", "Obs."
    ]];

    const body = [...(alunoLocal.historicoDobrasCutaneas || [])]
        .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())
        .map(d => [
            formatarDataParaExibicao(d.data),
            d.peitoral?.toString() || '-',
            d.abdominal?.toString() || '-',
            d.coxa?.toString() || '-',
            d.tricipital?.toString() || '-',
            d.subescapular?.toString() || '-',
            d.suprailiaca?.toString() || '-',
            d.axilarMedia?.toString() || '-',
            d.bicipital?.toString() || '-',
            d.panturrilhaMedial?.toString() || '-',
            d.pescoco?.toString() || '-',
            d.supraespinhal?.toString() || '-',
            d.observacoes || '-'
        ]);

    (doc as any).autoTable({
      head: head,
      body: body,
      startY: 35,
      headStyles: { fillColor: [75, 85, 99], fontSize: 8, cellPadding: 1.5 },
      bodyStyles: { fontSize: 7, cellPadding: 1.5 },
      styles: { font: "Arial", overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 18 } }, // Data
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.text(`Gestor Trainer - Gerado em: ${today}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 7);
      }
    });

    doc.save(fileName);
    addToast("PDF do Histórico de Dobras Cutâneas gerado!", "success");
  };


  const dadosGraficoMedidas = alunoLocal.historicoMedidas
    .filter(m => m[medidaParaGrafico] !== undefined && m[medidaParaGrafico] !== null && typeof m[medidaParaGrafico] === 'number')
    .map(m => ({
      data: formatarDataParaExibicao(m.data),
      valor: m[medidaParaGrafico] as number,
    }))
    .sort((a, b) => {
        const dataA = new Date(formatarDataParaInputDate(a.data)).getTime();
        const dataB = new Date(formatarDataParaInputDate(b.data)).getTime();
        return dataA - dataB;
    });

  // v0.1.2 (Parte 17): Funções de Geração de PDF
  const handleGerarPdfPlanoTreino = (plano: PlanoDeTreino) => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');
    const sanitizedAlunoNome = sanitizarNomeArquivo(alunoLocal.nome);
    const sanitizedPlanoNome = sanitizarNomeArquivo(plano.nome);
    const fileName = `plano_treino_${sanitizedAlunoNome}_${sanitizedPlanoNome}.pdf`;

    doc.setFont("Arial", "normal"); // Tenta usar Arial

    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Plano de Treino", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Aluno: ${alunoLocal.nome}`, 14, 30);
    doc.text(`Plano: ${plano.nome}`, 14, 38);
    if (plano.descricao) doc.text(`Descrição: ${plano.descricao}`, 14, 46, { maxWidth: 180 });
    let startY = plano.descricao ? 54 : 46;
    if (plano.dificuldade) doc.text(`Dificuldade: ${plano.dificuldade}`, 14, startY);
    startY += 8;

    // Tabela de Exercícios
    const head = [["Exercício", "Séries", "Repetições", "Descanso", "Observações"]];
    const body = plano.exercicios.map(ex => [
      ex.nome,
      ex.series,
      ex.repeticoes,
      ex.tempoDescanso || '-',
      ex.observacoes || '-'
    ]);

    (doc as any).autoTable({
      head: head,
      body: body,
      startY: startY,
      headStyles: { fillColor: [75, 85, 99] }, // slate-600
      styles: { font: "Arial" }, // Garante que a tabela use Arial
      didDrawPage: (data: any) => {
        // Adiciona rodapé em cada página se necessário
        doc.setFontSize(8);
        doc.text(`Gestor Trainer - Gerado em: ${today}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
      }
    });

    doc.save(fileName);
    addToast(`PDF do plano "${plano.nome}" gerado!`, "success");
  };

  const handleGerarPdfHistoricoPagamentos = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');
    const sanitizedAlunoNome = sanitizarNomeArquivo(alunoLocal.nome);
    const fileName = `historico_pagamentos_${sanitizedAlunoNome}.pdf`;
    const { totalPago, totalPendente, totalAtrasado } = calcularResumoFinanceiro();

    doc.setFont("Arial", "normal");

    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Histórico de Pagamentos", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Aluno: ${alunoLocal.nome}`, 14, 30);
    let startY = 40;

    // Resumo Financeiro
    doc.setFontSize(10);
    doc.text(`Resumo: Total Pago: R$ ${totalPago.toFixed(2)} | Total Pendente: R$ ${totalPendente.toFixed(2)} | Total Atrasado: R$ ${totalAtrasado.toFixed(2)}`, 14, startY, {maxWidth: 180});
    startY += 10;

    // Tabela de Pagamentos
    const head = [["Data", "Descrição", "Valor (R$)", "Status", "Vencimento"]];
    const body = (alunoLocal.historicoPagamentos || [])
      .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()) // Ordena por data mais recente
      .map(pg => [
        formatarDataParaExibicao(pg.data),
        pg.descricao || '-',
        pg.valor.toFixed(2),
        pg.status,
        pg.dataVencimento ? formatarDataParaExibicao(pg.dataVencimento) : '-'
    ]);

    (doc as any).autoTable({
      head: head,
      body: body,
      startY: startY,
      headStyles: { fillColor: [75, 85, 99] },
      styles: { font: "Arial" },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.text(`Gestor Trainer - Gerado em: ${today}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
      }
    });

    doc.save(fileName);
    addToast("PDF do histórico de pagamentos gerado!", "success");
  };

  // v0.1.2 (Parte 19): Geração de PDF para Histórico de Medidas
  const handleGerarPdfHistoricoMedidas = () => {
    const doc = new jsPDF('landscape'); // Orientação paisagem para mais colunas
    const today = new Date().toLocaleDateString('pt-BR');
    const sanitizedAlunoNome = sanitizarNomeArquivo(alunoLocal.nome);
    const fileName = `historico_medidas_${sanitizedAlunoNome}.pdf`;

    doc.setFont("Arial", "normal");
    doc.setFontSize(18);
    doc.text("Histórico de Medidas Corporais", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Aluno: ${alunoLocal.nome}`, 14, 30);

    const head = [[
        "Data", "Peso (kg)", "% Gordura", "Peito (cm)", "Cintura (cm)", "Abdômen (cm)",
        "Quadril (cm)", "Costas (cm)", "Braço D (cm)", "Braço E (cm)",
        "Antebraço D (cm)", "Antebraço E (cm)", "Coxa D (cm)", "Coxa E (cm)",
        "Pant. D (cm)", "Pant. E (cm)", "Obs."
    ]];

    const body = [...alunoLocal.historicoMedidas]
        .sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()) // Mais recentes primeiro
        .map(m => [
            formatarDataParaExibicao(m.data),
            m.peso?.toString() || '-',
            m.percentualGordura?.toString() || '-',
            m.peito?.toString() || '-',
            m.cintura?.toString() || '-',
            m.abdomen?.toString() || '-',
            m.quadril?.toString() || '-',
            m.costas?.toString() || '-',
            m.bracoD?.toString() || '-',
            m.bracoE?.toString() || '-',
            m.antebracoD?.toString() || '-',
            m.antebracoE?.toString() || '-',
            m.coxaD?.toString() || '-',
            m.coxaE?.toString() || '-',
            m.panturrilhaD?.toString() || '-',
            m.panturrilhaE?.toString() || '-',
            m.observacoesAdicionais || '-'
        ]);

    (doc as any).autoTable({
      head: head,
      body: body,
      startY: 40,
      headStyles: { fillColor: [75, 85, 99], fontSize: 7, cellPadding: 1.5 },
      bodyStyles: { fontSize: 7, cellPadding: 1.5 },
      styles: { font: "Arial", overflow: 'linebreak' },
      columnStyles: {
          0: { cellWidth: 18 }, // Data
          1: { cellWidth: 12 }, // Peso
          2: { cellWidth: 15 }, // % Gordura
          // Demais colunas podem ter largura automática ou definida
          16: { cellWidth: 'auto' }, // Obs.
      },
      didDrawPage: (data: any) => {
        doc.setFontSize(8);
        doc.text(`Gestor Trainer - Gerado em: ${today}`, data.settings.margin.left, doc.internal.pageSize.getHeight() - 7);
      }
    });

    doc.save(fileName);
    addToast("PDF do Histórico de Medidas gerado!", "success");
  };

  // v0.1.2 (Parte 19): Geração de PDF para Avaliação Resumida
  const handleGerarPdfAvaliacaoResumida = () => {
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString('pt-BR');
    const sanitizedAlunoNome = sanitizarNomeArquivo(alunoLocal.nome);
    const fileName = `avaliacao_resumida_${sanitizedAlunoNome}.pdf`;

    const ultimaMedida = alunoLocal.historicoMedidas.length > 0
        ? [...alunoLocal.historicoMedidas].sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0]
        : null;

    doc.setFont("Arial", "normal");
    doc.setFontSize(18);
    doc.text("Avaliação Física Resumida", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Aluno: ${alunoLocal.nome}`, 14, 35);
    doc.text(`Data da Avaliação: ${today}`, 14, 42);

    doc.setFontSize(11);
    doc.setFont("Arial", "bold");
    doc.text("Objetivo Principal:", 14, 55);
    doc.setFont("Arial", "normal");
    doc.text(alunoLocal.objetivoPrincipal || "Não definido", 14, 62, { maxWidth: 180 });

    doc.setFont("Arial", "bold");
    doc.text("Últimas Medidas Corporais:", 14, 75);
    doc.setFont("Arial", "normal");
    let startY = 82;
    if (ultimaMedida) {
        doc.text(`Data da Medição: ${formatarDataParaExibicao(ultimaMedida.data)}`, 14, startY);
        startY += 7;
        const medidas = [
            { label: "Peso", valor: ultimaMedida.peso, unidade: "kg" },
            { label: "% Gordura", valor: ultimaMedida.percentualGordura, unidade: "%" },
            { label: "Peito", valor: ultimaMedida.peito, unidade: "cm" },
            { label: "Cintura", valor: ultimaMedida.cintura, unidade: "cm" },
            { label: "Abdômen", valor: ultimaMedida.abdomen, unidade: "cm" },
            { label: "Quadril", valor: ultimaMedida.quadril, unidade: "cm" },
            { label: "Braço D", valor: ultimaMedida.bracoD, unidade: "cm" },
            { label: "Braço E", valor: ultimaMedida.bracoE, unidade: "cm" },
            { label: "Coxa D", valor: ultimaMedida.coxaD, unidade: "cm" },
            { label: "Coxa E", valor: ultimaMedida.coxaE, unidade: "cm" },
        ];
        medidas.forEach(m => {
            if (m.valor !== undefined) {
                doc.text(`${m.label}: ${m.valor} ${m.unidade}`, 14, startY);
                startY += 7;
            }
        });
    } else {
        doc.text("Nenhuma medida corporal registrada.", 14, startY);
        startY += 7;
    }

    startY += 5; // Espaço antes das recomendações
    doc.setFont("Arial", "bold");
    doc.text("Observações e Recomendações do Professor:", 14, startY);
    startY += 8;
    doc.setLineWidth(0.2);
    for (let i = 0; i < 8; i++) { // Adiciona 8 linhas para anotações
        if (startY > doc.internal.pageSize.getHeight() - 20) break; // Evita estourar a página
        doc.line(14, startY, doc.internal.pageSize.getWidth() - 14, startY);
        startY += 10;
    }

    doc.setFontSize(8);
    doc.text(`Gestor Trainer - ${alunoLocal.nome}`, 14, doc.internal.pageSize.getHeight() - 10);

    doc.save(fileName);
    addToast("PDF da Avaliação Resumida gerado!", "success");
  };


  const renderAbaPlanos = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Planos de Treino</h2>
        {!mostrarFormPlano && (
             <button onClick={() => { setEditandoPlano(null); setMostrarFormPlano(true); }} className="btn-primary flex items-center" aria-label="Criar Novo Plano de Treino">
                <IconeAdicionar className="w-5 h-5 mr-2" /> Criar Novo Plano
            </button>
        )}
      </div>

      {mostrarFormPlano ? (
        <PlanoTreinoForm
          planoInicial={editandoPlano}
          onSubmit={handleSalvarPlano}
          onCancel={() => { setMostrarFormPlano(false); setEditandoPlano(null);}}
          getProximoIdPlano={() => getProximoId('plano')}
          getProximoIdExercicio={() => getProximoId('exercicio')}
          addToast={addToast}
          modelosDeTreino={modelosDeTreino}
          exerciciosBiblioteca={exerciciosBiblioteca}
        />
      ) : (
        <>
          {(alunoLocal.planosDeTreino || []).filter(p => p && typeof p === 'object' && p.id && p.nome).length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center">
                <IconePlanoTreino className="w-16 h-16 mb-4 opacity-50" />
                <p className="font-semibold text-lg">Nenhum plano de treino cadastrado.</p>
                <p className="text-sm mt-1">Clique em "Criar Novo Plano" para começar.</p>
            </div>
          ) : (
          (alunoLocal.planosDeTreino || []).filter(p => p && typeof p === 'object' && p.id && p.nome).map(plano => (
            <div key={plano.id} className={`bg-slate-700 p-4 rounded-lg shadow ${plano.ativo ? 'border-2 border-green-500 shadow-green-500/20' : 'border border-transparent'}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-indigo-400 flex items-center">
                        {plano.nome}
                        {plano.ativo && <IconeCheck className="w-5 h-5 ml-2 text-green-400" title="Plano Ativo"/>}
                    </h3>
                    {plano.dificuldade && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 ${
                            plano.dificuldade === 'Iniciante' ? 'bg-blue-500/20 text-blue-400' :
                            plano.dificuldade === 'Intermediário' ? 'bg-yellow-500/20 text-yellow-400' :
                            plano.dificuldade === 'Avançado' ? 'bg-orange-500/20 text-orange-400' :
                            plano.dificuldade === 'Expert' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-500/20 text-slate-400'
                        }`}>
                            {plano.dificuldade}
                        </span>
                    )}
                    {plano.descricao && <p className="text-sm text-slate-300 mt-1">{plano.descricao}</p>}
                </div>
                <div className="flex space-x-2">
                  {/* v0.1.2 (Parte 17): Botão Gerar PDF Plano de Treino */}
                  <button onClick={() => handleGerarPdfPlanoTreino(plano)} className="p-1.5 text-teal-400 hover:text-teal-300" title="Gerar PDF do Plano">
                    <IconeDownload className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleEditarPlano(plano)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Plano"><IconeEditar className="w-5 h-5" /></button>
                  <button onClick={() => handleRemoverPlano(plano.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Plano"><IconeLixeira className="w-5 h-5" /></button>
                </div>
              </div>

              {plano.notasAdicionais && (
                <div className="mb-2 mt-1 p-2 bg-slate-600/50 rounded-md">
                    <p className="text-xs text-slate-400 font-semibold">Notas do Plano:</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{plano.notasAdicionais}</p>
                </div>
              )}

              {(Array.isArray(plano.exercicios) && plano.exercicios.filter(ex => ex && typeof ex === 'object' && ex.id && ex.nome).length > 0) ? (
                <div className="space-y-1.5 pl-2 border-l-2 border-slate-600">
                    {(plano.exercicios.filter(ex => ex && typeof ex === 'object' && ex.id && ex.nome)).map(ex => {
                        const exercicioDaBiblioteca = ex.exercicioBibliotecaId
                            ? exerciciosBiblioteca.find(exBib => exBib.id === ex.exercicioBibliotecaId)
                            : null;
                        return (
                            <div key={ex.id}>
                                <div className="flex items-center">
                                    <p className="text-sm font-medium text-slate-100">{ex.nome}</p>
                                    {exercicioDaBiblioteca && (
                                        <button
                                            onClick={() => abrirModalVisualizarExercicioBiblioteca(exercicioDaBiblioteca)}
                                            className="ml-2 p-0.5 text-indigo-400 hover:text-indigo-300"
                                            title={`Ver detalhes de "${exercicioDaBiblioteca.nome}" na biblioteca`}
                                            aria-label={`Ver detalhes de "${exercicioDaBiblioteca.nome}" na biblioteca`}
                                        >
                                            <IconeInfo className="w-3.5 h-3.5"/>
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-300">
                                    {ex.series} séries / {ex.repeticoes} reps / Desc: {ex.tempoDescanso || 'N/A'}
                                </p>
                                {ex.observacoes && <p className="text-xs text-slate-500 mt-0.5">Obs: {ex.observacoes}</p>}
                            </div>
                        );
                    })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic pl-2">Nenhum exercício neste plano.</p>
              )}
            </div>
          ))
          </>
        )}
    </div>
  );

  const renderAbaMedidas = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold text-white">Progresso e Medidas</h2>
        {!mostrarFormMedida && (
            <div className="flex flex-wrap gap-2">
                {/* v0.1.2 (Parte 19): Botões de PDF para Medidas */}
                {alunoLocal.historicoMedidas.length > 0 && (
                     <button onClick={handleGerarPdfHistoricoMedidas} className="btn-secondary-sm flex items-center" aria-label="Gerar PDF do Histórico de Medidas">
                        <IconeDownload className="w-4 h-4 mr-1.5" /> PDF Histórico
                    </button>
                )}
                 <button onClick={handleGerarPdfAvaliacaoResumida} className="btn-secondary-sm flex items-center" aria-label="Gerar PDF da Avaliação Resumida">
                    <IconeDownload className="w-4 h-4 mr-1.5" /> PDF Avaliação
                </button>
                <button onClick={() => { setEditandoMedida(null); setMostrarFormMedida(true);}} className="btn-primary flex items-center" aria-label="Adicionar Nova Medição">
                    <IconeAdicionar className="w-5 h-5 mr-2" /> Adicionar Medição
                </button>
            </div>
        )}
      </div>

      {alunoLocal.historicoMedidas.length > 1 && !mostrarFormMedida && (
        <div className="bg-slate-700 p-4 rounded-lg shadow mb-6">
            <div className="flex justify-between items-center mb-3">
                 <h3 className="text-md font-semibold text-indigo-400 flex items-center">
                    <IconeGraficoLinha className="w-5 h-5 mr-2" /> Evolução das Medidas
                </h3>
                <select
                    value={medidaParaGrafico}
                    onChange={(e) => setMedidaParaGrafico(e.target.value as TipoMedidaGrafico)}
                    className="input-base-sm py-1 max-w-[150px]"
                    aria-label="Selecionar medida para gráfico"
                >
                    <option value="peso">Peso (kg)</option>
                    <option value="percentualGordura">% Gordura</option>
                    <option value="peito">Peito (cm)</option>
                    <option value="cintura">Cintura (cm)</option>
                    <option value="abdomen">Abdômen (cm)</option>
                    <option value="quadril">Quadril (cm)</option>
                    <option value="costas">Costas (cm)</option>
                    <option value="bracoD">Braço D (cm)</option>
                    <option value="bracoE">Braço E (cm)</option>
                    <option value="antebracoD">Antebraço D (cm)</option>
                    <option value="antebracoE">Antebraço E (cm)</option>
                    <option value="coxaD">Coxa D (cm)</option>
                    <option value="coxaE">Coxa E (cm)</option>
                    <option value="panturrilhaD">Panturrilha D (cm)</option>
                    <option value="panturrilhaE">Panturrilha E (cm)</option>
                </select>
            </div>

            {dadosGraficoMedidas.length > 1 ? (
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dadosGraficoMedidas} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                        <XAxis dataKey="data" stroke="#94A3B8" fontSize={10} />
                        <YAxis stroke="#94A3B8" fontSize={10} domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '0.375rem' }}
                            labelStyle={{ color: '#E2E8F0', fontSize: '12px' }}
                            itemStyle={{ color: '#A78BFA', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{fontSize: '12px'}} />
                        <Line type="monotone" dataKey="valor" name={medidaParaGrafico.charAt(0).toUpperCase() + medidaParaGrafico.slice(1)} stroke="#A78BFA" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <p className="text-slate-500 text-sm text-center py-4">Dados insuficientes para exibir o gráfico para "{medidaParaGrafico}". Adicione pelo menos duas medições com este valor.</p>
            )}
        </div>
      )}


      {mostrarFormMedida ? (
        <MedidaCorporalForm
            medidaInicial={editandoMedida}
            onSubmit={handleSalvarMedida}
            onCancel={() => { setMostrarFormMedida(false); setEditandoMedida(null); }}
            getProximoIdMedida={() => getProximoId('medida')}
            addToast={addToast}
        />
      ) : (
        <>
            {alunoLocal.historicoMedidas.length === 0 && (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center">
                    <IconeMedidas className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-semibold text-lg">Nenhuma medição registrada.</p>
                    <p className="text-sm mt-1">Clique em "Adicionar Medição" para começar.</p>
                </div>
            )}
            {[...alunoLocal.historicoMedidas].sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map(medida => (
                <div key={medida.id} className="bg-slate-700 p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-md font-semibold text-indigo-400">
                            Medição de: {formatarDataParaExibicao(medida.data)}
                        </h3>
                        <div className="flex space-x-2">
                            <button onClick={() => handleEditarMedida(medida)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Medição"><IconeEditar className="w-5 h-5" /></button>
                            <button onClick={() => handleRemoverMedida(medida.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Medição"><IconeLixeira className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                        {medida.peso !== undefined && <p><strong className="text-slate-400">Peso:</strong> {medida.peso} kg</p>}
                        {medida.percentualGordura !== undefined && <p><strong className="text-slate-400">% Gordura:</strong> {medida.percentualGordura}%</p>}
                        {medida.peito !== undefined && <p><strong className="text-slate-400">Peito:</strong> {medida.peito} cm</p>}
                        {medida.cintura !== undefined && <p><strong className="text-slate-400">Cintura:</strong> {medida.cintura} cm</p>}
                        {medida.abdomen !== undefined && <p><strong className="text-slate-400">Abdômen:</strong> {medida.abdomen} cm</p>}
                        {medida.quadril !== undefined && <p><strong className="text-slate-400">Quadril:</strong> {medida.quadril} cm</p>}
                        {medida.costas !== undefined && <p><strong className="text-slate-400">Costas:</strong> {medida.costas} cm</p>}
                        {medida.bracoD !== undefined && <p><strong className="text-slate-400">Braço D:</strong> {medida.bracoD} cm</p>}
                        {medida.bracoE !== undefined && <p><strong className="text-slate-400">Braço E:</strong> {medida.bracoE} cm</p>}
                        {medida.antebracoD !== undefined && <p><strong className="text-slate-400">Antebraço D:</strong> {medida.antebracoD} cm</p>}
                        {medida.antebracoE !== undefined && <p><strong className="text-slate-400">Antebraço E:</strong> {medida.antebracoE} cm</p>}
                        {medida.coxaD !== undefined && <p><strong className="text-slate-400">Coxa D:</strong> {medida.coxaD} cm</p>}
                        {medida.coxaE !== undefined && <p><strong className="text-slate-400">Coxa E:</strong> {medida.coxaE} cm</p>}
                        {medida.panturrilhaD !== undefined && <p><strong className="text-slate-400">Panturrilha D:</strong> {medida.panturrilhaD} cm</p>}
                        {medida.panturrilhaE !== undefined && <p><strong className="text-slate-400">Panturrilha E:</strong> {medida.panturrilhaE} cm</p>}
                    </div>
                    {medida.observacoesAdicionais && <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-600">Obs: {medida.observacoesAdicionais}</p>}
                </div>
            ))}
        </>
      )}
    </div>
  );

  const renderAbaNotas = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Notas de Sessão (Antigas)</h2>
            {!mostrarFormNota && (
                 <button onClick={() => { setEditandoNota(null); setMostrarFormNota(true);}} className="btn-primary flex items-center" aria-label="Adicionar Nova Nota de Sessão">
                    <IconeAdicionar className="w-5 h-5 mr-2" /> Adicionar Nota
                </button>
            )}
        </div>
        {mostrarFormNota ? (
            <NotaSessaoForm
                notaInicial={editandoNota}
                onSubmit={handleSalvarNota}
                onCancel={() => { setMostrarFormNota(false); setEditandoNota(null);}}
                getProximoIdNota={() => getProximoId('nota')}
                addToast={addToast}
            />
        ) : (
            <>
                {alunoLocal.notasSessao.length === 0 && (
                    <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center">
                        <IconeNotas className="w-16 h-16 mb-4 opacity-50" />
                        <p className="font-semibold text-lg">Nenhuma nota de sessão registrada.</p>
                        <p className="text-sm mt-1">Adicione notas para registrar observações importantes.</p>
                    </div>
                )}
                {alunoLocal.notasSessao.map(nota => (
                    <div key={nota.id} className="bg-slate-700 p-4 rounded-lg shadow">
                         <div className="flex justify-between items-start mb-1">
                            <h3 className="text-md font-semibold text-indigo-400">
                                Nota de: {formatarDataParaExibicao(nota.data)}
                            </h3>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEditarNota(nota)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Nota"><IconeEditar className="w-5 h-5" /></button>
                                <button onClick={() => handleRemoverNota(nota.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Nota"><IconeLixeira className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{nota.conteudo}</p>
                    </div>
                ))}
            </>
        )}
    </div>
  );

  const renderAbaDiario = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Diário do Aluno</h2>
        {!mostrarFormDiario && (
            <button
                onClick={() => { setEditandoDiarioEntry(null); setMostrarFormDiario(true); }}
                className="btn-primary flex items-center"
                aria-label="Adicionar Nova Entrada no Diário"
            >
                <IconeAdicionar className="w-5 h-5 mr-2" /> Nova Entrada
            </button>
        )}
      </div>

      {mostrarFormDiario ? (
        <DiarioEntryForm
          entryInitial={editandoDiarioEntry}
          onSubmit={handleSalvarDiarioEntry}
          onCancel={() => { setMostrarFormDiario(false); setEditandoDiarioEntry(null); }}
          getProximoIdDiarioEntry={() => getProximoId('diarioEntry')}
          addToast={addToast}
        />
      ) : (
        <>
          {alunoLocal.diario.length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center">
              <IconeNotas className="w-16 h-16 mb-4 opacity-50" /> {/* Reutilizando ícone de Notas */}
              <p className="font-semibold text-lg">Nenhuma entrada no diário.</p>
              <p className="text-sm mt-1">Registre feedbacks, observações ou treinos realizados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alunoLocal.diario.map(entry => (
                <div key={entry.id} className="bg-slate-700 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-md font-semibold text-indigo-400">
                            {entry.titulo || TIPOS_DIARIO_ENTRY_OPCOES.find(opt => opt.value === entry.tipo)?.label || entry.tipo}
                        </h3>
                        <p className="text-xs text-slate-400">
                            {formatarDataHoraParaExibicao(entry.data)}
                            {entry.titulo && <span className="ml-2 text-slate-500">({TIPOS_DIARIO_ENTRY_OPCOES.find(opt => opt.value === entry.tipo)?.label})</span>}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditarDiarioEntry(entry)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Entrada"><IconeEditar className="w-5 h-5" /></button>
                      <button onClick={() => handleRemoverDiarioEntry(entry.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Entrada"><IconeLixeira className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{entry.conteudo}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderAbaMetas = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Metas Detalhadas</h2>
        {!mostrarFormMeta && (
            <button
                onClick={() => { setEditandoMeta(null); setMostrarFormMeta(true); }}
                className="btn-primary flex items-center"
                aria-label="Adicionar Nova Meta Detalhada"
            >
                <IconeAdicionar className="w-5 h-5 mr-2" /> Nova Meta
            </button>
        )}
      </div>

      {mostrarFormMeta ? (
        <MetaDetalhadaForm
          metaInitial={editandoMeta}
          onSubmit={handleSalvarMetaDetalhada}
          onCancel={() => { setMostrarFormMeta(false); setEditandoMeta(null); }}
          getProximoIdMetaDetalhada={() => getProximoId('metaDetalhada')}
          addToast={addToast}
        />
      ) : (
        <>
          {alunoLocal.metasDetalhadas.length === 0 ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center">
              <IconeAlvo className="w-16 h-16 mb-4 opacity-50" />
              <p className="font-semibold text-lg">Nenhuma meta detalhada definida.</p>
              <p className="text-sm mt-1">Defina metas claras para acompanhar o progresso do aluno.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alunoLocal.metasDetalhadas.map(meta => {
                const progresso = calcularProgressoMeta(meta);
                const statusCor = CORES_STATUS_META[meta.status];
                return (
                    <div key={meta.id} className="bg-slate-700 p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-md font-semibold text-indigo-400">{meta.descricao}</h3>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusCor.bg} ${statusCor.text} border ${statusCor.border || 'border-transparent'}`}>
                                {meta.status}
                                </span>
                                <p className="text-xs text-slate-400 mt-1">
                                {meta.tipoMetrica}
                                {meta.detalheMetrica && ` (${meta.detalheMetrica})`}
                                {" | "}
                                Início: {formatarDataParaExibicao(meta.dataInicio)}
                                {meta.dataAlvo && ` | Alvo: ${formatarDataParaExibicao(meta.dataAlvo)}`}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEditarMetaDetalhada(meta)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Meta"><IconeEditar className="w-5 h-5" /></button>
                                <button onClick={() => handleRemoverMetaDetalhada(meta.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Meta"><IconeLixeira className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="w-full bg-slate-500 rounded-full h-2.5 mb-1">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${statusCor.progressBarClass || 'bg-blue-500'}`}
                                style={{ width: `${progresso}%` }}
                                role="progressbar"
                                aria-valuenow={progresso}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            ></div>
                        </div>
                        <p className="text-xs text-slate-300 text-right">
                            {meta.valorAtual}{meta.unidade} / {meta.valorAlvo}{meta.unidade} ({progresso.toFixed(0)}%)
                        </p>
                        {/* Aqui poderia ser adicionado um botão para ver/adicionar histórico de atualizações */}
                    </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderAbaFinanceiro = () => {
    const resumo = calcularResumoFinanceiro();
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <h2 className="text-xl font-semibold text-white">Histórico Financeiro</h2>
                <div className="flex gap-2">
                    {alunoLocal.historicoPagamentos && alunoLocal.historicoPagamentos.length > 0 && (
                        <button onClick={handleGerarPdfHistoricoPagamentos} className="btn-secondary-sm flex items-center" aria-label="Gerar PDF do Histórico de Pagamentos">
                            <IconeDownload className="w-4 h-4 mr-1.5" /> Gerar PDF
                        </button>
                    )}
                    {!mostrarFormPagamento && (
                        <button
                            onClick={() => { setEditandoPagamento(null); setMostrarFormPagamento(true); }}
                            className="btn-primary flex items-center"
                            aria-label="Adicionar Novo Pagamento"
                        >
                            <IconeAdicionar className="w-5 h-5 mr-2" /> Novo Pagamento
                        </button>
                    )}
                </div>
            </div>

            {/* Resumo Financeiro do Aluno */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-md text-center">
                    <p className="text-xs text-green-300 uppercase">Total Pago</p>
                    <p className="text-lg font-bold text-green-200">R$ {resumo.totalPago.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-md text-center">
                    <p className="text-xs text-yellow-300 uppercase">Total Pendente</p>
                    <p className="text-lg font-bold text-yellow-200">R$ {resumo.totalPendente.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-md text-center">
                    <p className="text-xs text-red-300 uppercase">Total Atrasado</p>
                    <p className="text-lg font-bold text-red-200">R$ {resumo.totalAtrasado.toFixed(2)}</p>
                </div>
            </div>


            {mostrarFormPagamento ? (
                <PagamentoForm
                    pagamentoInitial={editandoPagamento}
                    onSubmit={handleSalvarPagamento}
                    onCancel={() => { setMostrarFormPagamento(false); setEditandoPagamento(null); }}
                    getProximoIdPagamento={() => getProximoId('pagamento')}
                    addToast={addToast}
                />
            ) : (
                <>
                {(!alunoLocal.historicoPagamentos || alunoLocal.historicoPagamentos.length === 0) ? (
                    <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center">
                    <IconeFinanceiro className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-semibold text-lg">Nenhum pagamento registrado para este aluno.</p>
                    <p className="text-sm mt-1">Adicione pagamentos para acompanhar o financeiro.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                    {alunoLocal.historicoPagamentos.map(pg => {
                        const statusCor = CORES_STATUS_PAGAMENTO[pg.status];
                        return (
                        <div key={pg.id} className="bg-slate-700 p-4 rounded-lg shadow">
                            <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-md font-semibold text-indigo-400">
                                Pagamento de: {formatarDataParaExibicao(pg.data)} - R$ {pg.valor.toFixed(2)}
                                </h3>
                                <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${statusCor.bg} ${statusCor.text} border ${statusCor.border || 'border-transparent'}`}>
                                {pg.status}
                                </span>
                                {pg.dataVencimento && <p className="text-xs text-slate-400 mt-0.5">Vencimento: {formatarDataParaExibicao(pg.dataVencimento)}</p>}
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEditarPagamento(pg)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Pagamento"><IconeEditar className="w-5 h-5" /></button>
                                <button onClick={() => handleRemoverPagamento(pg.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Pagamento"><IconeLixeira className="w-5 h-5" /></button>
                            </div>
                            </div>
                            {pg.descricao && <p className="text-sm text-slate-200 whitespace-pre-wrap">{pg.descricao}</p>}
                        </div>
                        );
                    })}
                    </div>
                )}
                </>
            )}
        </div>
    );
  };

  // v0.1.2 (Parte 22): Renderização da aba de Dobras Cutâneas
  const renderAbaDobrasCutaneas = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-xl font-semibold text-white">Dobras Cutâneas</h2>
        <div className="flex gap-2">
             {alunoLocal.historicoDobrasCutaneas && alunoLocal.historicoDobrasCutaneas.length > 0 && (
                <button onClick={handleGerarPdfHistoricoDobras} className="btn-secondary-sm flex items-center" aria-label="Gerar PDF do Histórico de Dobras Cutâneas">
                    <IconeDownload className="w-4 h-4 mr-1.5" /> Gerar PDF
                </button>
            )}
            {!mostrarFormDobraCutanea && (
                <button
                    onClick={() => { setEditandoDobraCutanea(null); setMostrarFormDobraCutanea(true); }}
                    className="btn-primary flex items-center"
                    aria-label="Adicionar Novo Registro de Dobras Cutâneas"
                >
                    <IconeAdicionar className="w-5 h-5 mr-2" /> Novo Registro
                </button>
            )}
        </div>
      </div>

      {mostrarFormDobraCutanea ? (
        <DobraCutaneaForm
          dobraInicial={editandoDobraCutanea}
          onSubmit={handleSalvarDobraCutanea}
          onCancel={() => { setMostrarFormDobraCutanea(false); setEditandoDobraCutanea(null); }}
          getProximoIdDobra={() => getProximoId('dobraCutanea')}
          addToast={addToast}
        />
      ) : (
        <>
          {(!alunoLocal.historicoDobrasCutaneas || alunoLocal.historicoDobrasCutaneas.length === 0) ? (
            <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center">
              <IconeMedidas className="w-16 h-16 mb-4 opacity-50" /> {/* Reutilizar ícone de medidas */}
              <p className="font-semibold text-lg">Nenhum registro de dobras cutâneas.</p>
              <p className="text-sm mt-1">Adicione registros para acompanhar a composição corporal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alunoLocal.historicoDobrasCutaneas.map(dobra => (
                <div key={dobra.id} className="bg-slate-700 p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-md font-semibold text-indigo-400">
                      Registro de: {formatarDataParaExibicao(dobra.data)} (mm)
                    </h3>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditarDobraCutanea(dobra)} className="p-1 text-blue-400 hover:text-blue-300" title="Editar Registro"><IconeEditar className="w-5 h-5" /></button>
                      <button onClick={() => handleRemoverDobraCutanea(dobra.id)} className="p-1 text-red-400 hover:text-red-300" title="Remover Registro"><IconeLixeira className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                    {dobra.peitoral !== undefined && <p><strong className="text-slate-400">Peitoral:</strong> {dobra.peitoral}</p>}
                    {dobra.abdominal !== undefined && <p><strong className="text-slate-400">Abdominal:</strong> {dobra.abdominal}</p>}
                    {dobra.coxa !== undefined && <p><strong className="text-slate-400">Coxa:</strong> {dobra.coxa}</p>}
                    {dobra.tricipital !== undefined && <p><strong className="text-slate-400">Tricipital:</strong> {dobra.tricipital}</p>}
                    {dobra.subescapular !== undefined && <p><strong className="text-slate-400">Subescapular:</strong> {dobra.subescapular}</p>}
                    {dobra.suprailiaca !== undefined && <p><strong className="text-slate-400">Suprailíaca:</strong> {dobra.suprailiaca}</p>}
                    {dobra.axilarMedia !== undefined && <p><strong className="text-slate-400">Axilar Média:</strong> {dobra.axilarMedia}</p>}
                    {dobra.bicipital !== undefined && <p><strong className="text-slate-400">Bicipital:</strong> {dobra.bicipital}</p>}
                    {dobra.panturrilhaMedial !== undefined && <p><strong className="text-slate-400">Pant. Medial:</strong> {dobra.panturrilhaMedial}</p>}
                    {dobra.pescoco !== undefined && <p><strong className="text-slate-400">Pescoço:</strong> {dobra.pescoco}</p>}
                    {dobra.supraespinhal !== undefined && <p><strong className="text-slate-400">Supraespinhal:</strong> {dobra.supraespinhal}</p>}
                  </div>
                  {dobra.observacoes && <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-600">Obs: {dobra.observacoes}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );


  const abas: { id: AbaAtiva; label: string; icon: React.FC<any>; render: () => JSX.Element }[] = [
    { id: 'planos', label: 'Planos', icon: IconePlanoTreino, render: renderAbaPlanos },
    { id: 'medidas', label: 'Medidas', icon: IconeMedidas, render: renderAbaMedidas },
    { id: 'dobrasCutaneas', label: 'Dobras', icon: IconeMedidas, render: renderAbaDobrasCutaneas }, // Ícone similar
    { id: 'diario', label: 'Diário', icon: IconeNotas, render: renderAbaDiario },
    { id: 'metas', label: 'Metas', icon: IconeAlvo, render: renderAbaMetas },
    { id: 'financeiro', label: 'Financeiro', icon: IconeFinanceiro, render: renderAbaFinanceiro },
    { id: 'notas', label: 'Notas (Legado)', icon: IconeNotas, render: renderAbaNotas },
  ];

  const renderConteudoAba = () => {
    const abaSelecionada = abas.find(a => a.id === abaAtiva);
    return abaSelecionada ? abaSelecionada.render() : null;
  };

  // Definições de estilo reutilizáveis (devem corresponder ao que foi definido no App.tsx e outros componentes modais)
  const inputBaseClasses = "w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500";
  const btnPrimaryClasses = "px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-70";
  const btnSecondaryClasses = "px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:opacity-70";
  const btnSecondarySmClasses = "px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:opacity-70";
  const btnSecondaryXsClasses = "px-2 py-1 text-xs font-medium text-slate-300 bg-slate-500 hover:bg-slate-400 rounded-md transition-colors disabled:opacity-70";
  const btnPrimaryXsClasses = "px-2 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-70";


  return (
    <main className="flex-1 p-4 md:p-6 space-y-6 bg-slate-850 overflow-y-auto">
        <style>{`
            .input-base { @apply ${inputBaseClasses}; }
            .input-base-sm { @apply w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500; }
            .btn-primary { @apply ${btnPrimaryClasses}; }
            .btn-primary-xs { @apply ${btnPrimaryXsClasses}; }
            .btn-secondary { @apply ${btnSecondaryClasses}; }
            .btn-secondary-sm { @apply ${btnSecondarySmClasses}; }
            .btn-secondary-xs { @apply ${btnSecondaryXsClasses}; }
        `}</style>
        {/* Cabeçalho da View */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center">
                <button onClick={onGoBack} className="p-2 mr-3 text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-full transition-colors" aria-label="Voltar para Dashboard">
                    <IconeSetaEsquerda className="w-6 h-6" />
                </button>
                {alunoLocal.fotoPerfil ? (
                    <img src={alunoLocal.fotoPerfil} alt={`Foto de ${alunoLocal.nome}`} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-slate-600" />
                ) : (
                    <div className={`w-12 h-12 rounded-full ${alunoLocal.corAvatar} flex items-center justify-center text-white text-xl font-semibold mr-4 border-2 border-slate-600`}>
                        {alunoLocal.iniciais}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-white">{alunoLocal.nome}</h1>
                    <p className="text-sm text-slate-400">ID: {alunoLocal.id}</p>
                </div>
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0">
                <button onClick={onOpenBasicProfileModal} className="btn-secondary-sm flex items-center" aria-label="Editar Perfil Básico">
                    <IconeEditar className="w-4 h-4 mr-1.5"/> Editar Básico
                </button>
                 <button onClick={() => onDeleteAluno(alunoLocal.id)} className="btn-secondary-sm bg-red-700/30 hover:bg-red-600/50 text-red-300 hover:text-red-200 border border-red-600/50 flex items-center" aria-label="Excluir Aluno">
                    <IconeLixeira className="w-4 h-4 mr-1.5"/> Excluir Aluno
                </button>
            </div>
        </div>

        {/* Abas de Navegação */}
        <div className="border-b border-slate-700 mb-6">
            <nav className="-mb-px flex space-x-1 sm:space-x-2 overflow-x-auto pb-1">
                {abas.map(aba => (
                    <button
                        key={aba.id}
                        onClick={() => setAbaAtiva(aba.id)}
                        className={`whitespace-nowrap py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-medium rounded-t-md transition-colors flex items-center
                            ${abaAtiva === aba.id
                                ? 'border-b-2 border-indigo-500 text-indigo-400 bg-slate-800'
                                : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-700/50'
                            }`
                        }
                        aria-current={abaAtiva === aba.id ? 'page' : undefined}
                    >
                        <aba.icon className="w-4 h-4 mr-1.5 hidden sm:inline" />
                        {aba.label}
                    </button>
                ))}
            </nav>
        </div>

        {/* Conteúdo da Aba Ativa */}
        <div className="bg-slate-800 p-4 md:p-6 rounded-lg shadow-xl">
            {renderConteudoAba()}
        </div>
    </main>
  );
};

export default StudentDetailView;