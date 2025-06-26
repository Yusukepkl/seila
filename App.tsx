
// App.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import Modal from './components/Modal';
import PatchNotesModal from './components/PatchNotesModal';
import AdicionarAlunoModal from './components/AdicionarAlunoModal';
import PerfilAlunoModal from './components/PerfilAlunoModal';
import ListaEsperaModal from './components/ListaEsperaModal';
import StudentDetailView from './components/StudentDetailView';
import ObjetivoModal from './components/ObjetivoModal';
import { ActualToastProvider } from './components/ToastContext';
import ToastContainer from './components/ToastContainer';
import MinhaContaModal from './components/MinhaContaModal';
import AgendaView from './components/AgendaView';
import AgendamentoModal from './components/AgendamentoModal';
import ConfirmacaoAcaoModal from './components/ConfirmacaoAcaoModal';
import ModelosTreinoModal from './components/ModelosTreinoModal';
import ModeloTreinoFormModal from './components/ModeloTreinoFormModal';
import RelatorioFinanceiroModal from './components/RelatorioFinanceiroModal';
import BibliotecaExerciciosModal from './components/BibliotecaExerciciosModal';
import ExercicioBibliotecaFormModal from './components/ExercicioBibliotecaFormModal';
import RelatorioPopularidadeExerciciosModal from './components/RelatorioPopularidadeExerciciosModal';
// import RelatorioEngajamentoModal from './components/RelatorioEngajamentoModal'; // File is missing

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

import {
  db,
  popularDadosIniciais,
  getNextAlunoId,
  getNextListaEsperaId,
  getNextObjetivoId,
  getNextAgendamentoId,
  getNextModeloTreinoId,
  getNextExercicioModeloId,
  getNextExercicioBibliotecaId,
  // getNextTemplateComunicacaoId, // Not used directly in App.tsx for ID generation for now
  getProximoIdSubEntidadeDexie,
  getNextAvatarCorIndex,
  NOTAS_ATUALIZACAO_INICIAIS_DEXIE,
  PERFIL_PROFESSOR_MOCK_INICIAL_DEXIE
} from './db'; // Import Dexie db instance and helpers

import {
  NotaAtualizacao, AlunoConsultoria, TipoModalOuView, DadosAlunosCadastrados,
  Objetivo, PessoaListaEspera, ToastMessage, ToastType,
  PerfilProfessor, Agendamento, StatusAluno,
  PlanoDeTreino, TreinoExercicio, StatusListaEspera,
  StatusAgendamento, StatusPagamentoAluno, Pagamento,
  ConfirmacaoAcaoModalProps,
  ModeloDeTreino, ExercicioBiblioteca, TemplateComunicacao,
  SubEntidadeIdTipo,
  PainelFinanceiroData, AddToastFunction, DobraCutaneaEntry
} from './types';
import {
  TEXTOS_MODAIS,
  AVATAR_CORES_DISPONIVEIS,
} from './constants';

// Helper para formatar data para exibição em modais/detalhes (DD/MM/YYYY)
const formatarDataParaExibicaoModal = (dataInput?: string): string => { 
  if (!dataInput) return 'N/A';
  const partes = dataInput.split('-'); 
  if (partes.length === 3 && partes[0].length === 4) { // YYYY-MM-DD
    return `${partes[2]}/${partes[1]}/${partes[0]}`; 
  }
  return dataInput; // Retorna como está se não for o formato esperado
};


const App: React.FC = () => {
  const [isDBLoading, setIsDBLoading] = useState(true);
  const [notasDeAtualizacao, setNotasDeAtualizacao] = useState<NotaAtualizacao[]>([]);
  const [activeViewOrModal, setActiveViewOrModal] = useState<TipoModalOuView>(null);
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoConsultoria | null>(null);
  const [alunosConsultoria, setAlunosConsultoria] = useState<AlunoConsultoria[]>([]);
  const [dadosAlunos, setDadosAlunos] = useState<DadosAlunosCadastrados>({
    ativos: 0, expirados: 0, bloqueados: 0, inativos: 0, pausados: 0, totalCapacidade: 100,
  });
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [objetivoSelecionadoParaModal, setObjetivoSelecionadoParaModal] = useState<Objetivo | null>(null);
  const [listaEspera, setListaEspera] = useState<PessoaListaEspera[]>([]);
  const [perfilProfessor, setPerfilProfessor] = useState<PerfilProfessor>(PERFIL_PROFESSOR_MOCK_INICIAL_DEXIE);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [agendamentoSelecionadoParaModal, setAgendamentoSelecionadoParaModal] = useState<Agendamento | Partial<Agendamento> | null>(null); // Allow Partial for prefill
  const [agendamentoOriginalParaReagendar, setAgendamentoOriginalParaReagendar] = useState<Agendamento | null>(null);
  const [filtroStatusAlunos, setFiltroStatusAlunos] = useState<StatusAluno | ''>('');
  const [filtroObjetivoAlunos, setFiltroObjetivoAlunos] = useState<string>('');
  const [confirmacaoAcaoModalProps, setConfirmacaoAcaoModalProps] = useState<ConfirmacaoAcaoModalProps | null>(null);
  const [modelosDeTreino, setModelosDeTreino] = useState<ModeloDeTreino[]>([]);
  const [modeloSelecionadoParaForm, setModeloSelecionadoParaForm] = useState<ModeloDeTreino | null>(null);
  const [painelFinanceiroData, setPainelFinanceiroData] = useState<PainelFinanceiroData | null>(null);
  const [exerciciosBiblioteca, setExerciciosBiblioteca] = useState<ExercicioBiblioteca[]>([]);
  const [exercicioBibliotecaSelecionadoParaForm, setExercicioBibliotecaSelecionadoParaForm] = useState<ExercicioBiblioteca | null>(null);
  const [exercicioBibliotecaParaVisualizar, setExercicioBibliotecaParaVisualizar] = useState<ExercicioBiblioteca | null>(null); 
  const [templatesComunicacao, setTemplatesComunicacao] = useState<TemplateComunicacao[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  const addToast: AddToastFunction = useCallback((
    message: string, 
    type: ToastType = 'info', 
    onClick?: () => void, 
    onClickLabel?: string
  ) => {
    const newToast: ToastMessage = { 
      id: Date.now().toString() + Math.random().toString(36).substring(2,7), 
      message, 
      type,
      onClick,
      onClickLabel,
    };
    setToasts(prevToasts => [newToast, ...prevToasts.slice(0, 4)]);
  }, []);

  const ai = useRef<GoogleGenAI | null>(null);
  useEffect(() => {
    if (process.env.API_KEY) {
      try {
        ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } catch (error) {
        console.error("Erro ao inicializar GoogleGenAI:", error);
        addToast("Falha ao conectar com o serviço de IA.", "error");
      }
    } else {
        console.warn("Chave de API do Gemini não configurada. Funcionalidades de IA estarão desabilitadas.");
    }
  }, [addToast]);

  const handleGerarDescricaoExercicioIA = useCallback(async (nomeExercicio: string): Promise<string | null> => {
    if (!ai.current) {
      addToast("Serviço de IA não inicializado. Verifique a configuração da API Key.", "error");
      return null;
    }
    if (!nomeExercicio.trim()) {
        addToast("Por favor, insira um nome para o exercício antes de gerar a descrição.", "warning");
        return null;
    }
    const prompt = `Forneça uma breve descrição concisa e dicas de execução para o exercício de musculação: "${nomeExercicio}". Foque em segurança e forma correta. Limite a resposta a aproximadamente 100 palavras.`;
    try {
      const response: GenerateContentResponse = await ai.current.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Erro ao gerar descrição com Gemini API:", error);
      addToast("Falha ao gerar descrição com IA. Tente novamente.", "error");
      return null;
    }
  }, [addToast]);

  // Carregamento inicial dos dados do Dexie
  useEffect(() => {
    const carregarDados = async () => {
      setIsDBLoading(true);
      try {
        await popularDadosIniciais(); 

        const [
          loadedNotas, loadedAlunos, loadedListaEspera, loadedObjetivos,
          loadedPerfil, loadedAgendamentos, loadedModelos, loadedExerciciosBib, loadedTemplates
        ] = await Promise.all([
          db.notasDeAtualizacao.orderBy('data').reverse().toArray(),
          db.alunosConsultoria.toArray(),
          db.listaEspera.orderBy('dataInclusao').reverse().toArray(),
          db.objetivos.toArray(),
          db.perfilProfessor.get(PERFIL_PROFESSOR_MOCK_INICIAL_DEXIE.id), 
          db.agendamentos.orderBy('data').toArray(),
          db.modelosDeTreino.toArray(),
          db.exerciciosBiblioteca.toArray(),
          db.templatesComunicacao.toArray()
        ]);

        setNotasDeAtualizacao(loadedNotas.length > 0 ? loadedNotas : NOTAS_ATUALIZACAO_INICIAIS_DEXIE);
        setAlunosConsultoria(loadedAlunos);
        setListaEspera(loadedListaEspera);
        setObjetivos(loadedObjetivos);
        setPerfilProfessor(loadedPerfil || PERFIL_PROFESSOR_MOCK_INICIAL_DEXIE);
        setAgendamentos(loadedAgendamentos);
        setModelosDeTreino(loadedModelos);
        setExerciciosBiblioteca(loadedExerciciosBib);
        setTemplatesComunicacao(loadedTemplates);

      } catch (error) {
        console.error("Erro ao carregar dados do IndexedDB:", error);
        addToast("Erro ao carregar dados do banco. Tente recarregar a página.", "error");
        setNotasDeAtualizacao(NOTAS_ATUALIZACAO_INICIAIS_DEXIE);
        setPerfilProfessor(PERFIL_PROFESSOR_MOCK_INICIAL_DEXIE);
      } finally {
        setIsDBLoading(false);
      }
    };
    carregarDados();
  }, [addToast]);
  
  const calcularStatusPagamentoAluno = useCallback((aluno: AlunoConsultoria): StatusPagamentoAluno => {
    if (!aluno.historicoPagamentos || aluno.historicoPagamentos.length === 0) return 'Em Dia';
    const temAtrasado = aluno.historicoPagamentos.some(p => p.status === 'Atrasado');
    if (temAtrasado) return 'Atrasado';
    const temPendente = aluno.historicoPagamentos.some(p => p.status === 'Pendente');
    if (temPendente) return 'Pendente';
    return 'Em Dia';
  }, []);

  useEffect(() => {
    const ativos = alunosConsultoria.filter(a => a.status === 'Ativo').length;
    const expirados = alunosConsultoria.filter(a => a.status === 'Expirado').length;
    const bloqueados = alunosConsultoria.filter(a => a.status === 'Bloqueado').length;
    const inativos = alunosConsultoria.filter(a => a.status === 'Inativo').length;
    const pausados = alunosConsultoria.filter(a => a.status === 'Pausado').length;

    setDadosAlunos(prevDados => ({
        ...prevDados, 
        ativos, expirados, bloqueados, inativos, pausados,
    }));
  }, [alunosConsultoria]);

  const getUltimaVersao = useCallback((): string => {
    if (notasDeAtualizacao.length === 0) return 'v0.0.0';
    // Ensure notas are sorted descending by version string or date for more robust "latest"
     const sortedNotas = [...notasDeAtualizacao].sort((a, b) => {
        // Simple version compare 'vX.Y.Z'
        const verA = a.versao.substring(1).split('.').map(Number);
        const verB = b.versao.substring(1).split('.').map(Number);
        for (let i = 0; i < Math.max(verA.length, verB.length); i++) {
            if ((verA[i] || 0) !== (verB[i] || 0)) return (verB[i] || 0) - (verA[i] || 0);
        }
        // If versions are identical, sort by date
        return new Date(b.data).getTime() - new Date(a.data).getTime();
    });
    return sortedNotas[0]?.versao || 'v0.0.0';
  }, [notasDeAtualizacao]);

  const adicionarNovaNotaPatch = useCallback(async (novaNotaParcial: Omit<NotaAtualizacao, 'data'>) => {
    const dataAtual = new Date().toISOString().split('T')[0]; 
    const notaCompleta: NotaAtualizacao = { ...novaNotaParcial, data: dataAtual };
    try {
      await db.notasDeAtualizacao.put(notaCompleta); 
      setNotasDeAtualizacao(prevNotas => [notaCompleta, ...prevNotas].sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      addToast(`Patch Note ${notaCompleta.versao} adicionado!`, 'success');
    } catch (error) {
      console.error("Erro ao salvar Patch Note no DB:", error);
      addToast("Erro ao salvar Patch Note.", "error");
    }
  }, [addToast]);

  const derivarIniciais = (nomeCompleto: string): string => {
    if (!nomeCompleto?.trim()) return '??';
    const partes = nomeCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (partes.length === 0) return '??';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + (partes[partes.length - 1][0] || '')).toUpperCase();
  };

  const formatarDataParaDDMMYYYY = (data: Date): string => {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const handleAdicionarNovoAluno = useCallback(async (alunoData: Pick<AlunoConsultoria, 'nome' | 'iniciais' | 'dataConsultoria' | 'contatoPrincipal' | 'objetivoPrincipal' | 'dataInicio'> & { telefone?: string, observacoes?: string}) => {
    const novoId = await getNextAlunoId();
    const proximaCorIdx = await getNextAvatarCorIndex();

    const novoAluno: AlunoConsultoria = {
      id: novoId,
      nome: alunoData.nome,
      iniciais: alunoData.iniciais,
      dataConsultoria: alunoData.dataConsultoria, 
      progresso: 0, status: 'Ativo',
      corAvatar: AVATAR_CORES_DISPONIVEIS[proximaCorIdx % AVATAR_CORES_DISPONIVEIS.length],
      fotoPerfil: null, telefone: alunoData.telefone || '', dataNascimento: '',
      peso: undefined, altura: undefined, observacoes: alunoData.observacoes || '',
      planosDeTreino: [], historicoMedidas: [], notasSessao: [],
      contatoPrincipal: alunoData.contatoPrincipal || '', objetivoPrincipal: alunoData.objetivoPrincipal || '',
      dataInicio: alunoData.dataInicio || '', 
      diario: [], metasDetalhadas: [],
      statusPagamento: 'Em Dia', historicoPagamentos: [], historicoDobrasCutaneas: [],
    };
    try {
      await db.alunosConsultoria.add(novoAluno);
      setAlunosConsultoria(prevAlunos => [...prevAlunos, novoAluno]);
      setActiveViewOrModal(null);
      addToast(`Aluno ${novoAluno.nome} adicionado!`, 'success');
    } catch (error) {
      console.error("Erro ao adicionar aluno ao DB:", error);
      addToast("Erro ao adicionar aluno.", "error");
    }
  }, [addToast]);

  const handleEditarAluno = useCallback(async (alunoEditado: AlunoConsultoria) => {
    const alunoProcessado = {
      ...alunoEditado,
      historicoPagamentos: (alunoEditado.historicoPagamentos || []).map(pg => ({
        ...pg, alunoId: alunoEditado.id, alunoNome: alunoEditado.nome,
      })),
      historicoDobrasCutaneas: alunoEditado.historicoDobrasCutaneas || [],
    };
    alunoProcessado.statusPagamento = calcularStatusPagamentoAluno(alunoProcessado);

    try {
      await db.alunosConsultoria.put(alunoProcessado);
      setAlunosConsultoria(prevAlunos => prevAlunos.map(a => a.id === alunoProcessado.id ? alunoProcessado : a));
      addToast(`Dados de ${alunoProcessado.nome} atualizados.`, 'success');
    } catch (error) {
      console.error("Erro ao editar aluno no DB:", error);
      addToast(`Erro ao atualizar ${alunoProcessado.nome}.`, "error");
    }
  }, [addToast, calcularStatusPagamentoAluno]);

  const handleExcluirAluno = useCallback(async (alunoId: string) => {
    const alunoExcluido = alunosConsultoria.find(a => a.id === alunoId);
    try {
      await db.transaction('rw', db.alunosConsultoria, db.agendamentos, async () => {
        await db.alunosConsultoria.delete(alunoId);
        const agsParaRemover = await db.agendamentos.where('alunoId').equals(alunoId).toArray();
        await db.agendamentos.bulkDelete(agsParaRemover.map(ag => ag.id));
      });
      setAlunosConsultoria(prevAlunos => prevAlunos.filter(aluno => aluno.id !== alunoId));
      setAgendamentos(prevAgs => prevAgs.filter(ag => ag.alunoId !== alunoId));
      setActiveViewOrModal(null); setAlunoSelecionado(null);
      if(alunoExcluido) addToast(`Aluno ${alunoExcluido.nome} e seus agendamentos foram excluídos.`, 'success');
    } catch (error) {
      console.error("Erro ao excluir aluno do DB:", error);
      addToast("Erro ao excluir aluno.", "error");
    }
  }, [addToast, alunosConsultoria]);

  const handleAdicionarPessoaListaEspera = useCallback(async (dadosPessoa: Omit<PessoaListaEspera, 'id' | 'dataInclusao'>) => {
    const novoId = await getNextListaEsperaId();
    const novaPessoa: PessoaListaEspera = {
      ...dadosPessoa, id: novoId, dataInclusao: new Date().toISOString(), status: dadosPessoa.status || 'Pendente',
    };
    try {
      await db.listaEspera.add(novaPessoa);
      setListaEspera(prevLista => [novaPessoa, ...prevLista].sort((a,b) => new Date(b.dataInclusao).getTime() - new Date(a.dataInclusao).getTime()));
      addToast(`${novaPessoa.nome} adicionado(a) à lista de espera.`, 'success');
    } catch (error) {
      console.error("Erro ao adicionar pessoa à lista de espera no DB:", error);
      addToast("Erro ao adicionar à lista de espera.", "error");
    }
  }, [addToast]);

  const handleEditarPessoaListaEspera = useCallback(async (pessoaEditada: PessoaListaEspera) => {
    try {
      await db.listaEspera.put(pessoaEditada);
      setListaEspera(prevLista => prevLista.map(p => (p.id === pessoaEditada.id ? pessoaEditada : p)));
      addToast(`Dados de ${pessoaEditada.nome} atualizados na lista.`, 'success');
    } catch (error) {
      console.error("Erro ao editar pessoa na lista de espera no DB:", error);
      addToast("Erro ao atualizar dados na lista.", "error");
    }
  }, [addToast]);

  const handleRemoverPessoaListaEspera = useCallback(async (pessoaId: string) => {
    const pessoaRemovida = listaEspera.find(p => p.id === pessoaId);
    try {
      await db.listaEspera.delete(pessoaId);
      setListaEspera(prevLista => prevLista.filter(p => p.id !== pessoaId));
      if(pessoaRemovida) addToast(`${pessoaRemovida.nome} removido(a) da lista.`, 'success');
    } catch (error) {
      console.error("Erro ao remover pessoa da lista de espera no DB:", error);
      addToast("Erro ao remover da lista.", "error");
    }
  }, [addToast, listaEspera]);

  const handlePromoverPessoaParaAluno = useCallback(async (pessoaLE: PessoaListaEspera) => {
    const dataAtualDDMMYYYY = formatarDataParaDDMMYYYY(new Date());
    const dataAtualYYYYMMDD = new Date().toISOString().split('T')[0];
    const novoIdAluno = await getNextAlunoId();
    const proximaCorIdx = await getNextAvatarCorIndex();

    const novoAluno: AlunoConsultoria = {
      id: novoIdAluno, nome: pessoaLE.nome, iniciais: derivarIniciais(pessoaLE.nome),
      dataConsultoria: dataAtualDDMMYYYY, progresso: 0, status: 'Ativo',
      corAvatar: AVATAR_CORES_DISPONIVEIS[proximaCorIdx % AVATAR_CORES_DISPONIVEIS.length],
      fotoPerfil: null, telefone: pessoaLE.telefone || '', dataNascimento: '', peso: undefined, altura: undefined,
      observacoes: `Promovido da lista de espera. Obs: ${pessoaLE.observacao || 'Nenhuma'}`.trim(),
      planosDeTreino: [], historicoMedidas: [], notasSessao: [],
      contatoPrincipal: pessoaLE.telefone || pessoaLE.email || '', objetivoPrincipal: 'Definir objetivo principal',
      dataInicio: dataAtualYYYYMMDD, diario: [], metasDetalhadas: [],
      statusPagamento: 'Em Dia', historicoPagamentos: [], historicoDobrasCutaneas: [],
    };
    const pessoaLEAtualizada = { ...pessoaLE, status: 'Convertido' as StatusListaEspera };
    try {
      await db.transaction('rw', db.alunosConsultoria, db.listaEspera, async () => {
        await db.alunosConsultoria.add(novoAluno);
        await db.listaEspera.put(pessoaLEAtualizada);
      });
      setAlunosConsultoria(prevAlunos => [...prevAlunos, novoAluno]);
      setListaEspera(prevLista => prevLista.map(p => (p.id === pessoaLEAtualizada.id ? pessoaLEAtualizada : p)));
      addToast(`${novoAluno.nome} promovido para aluno! Status na lista de espera atualizado.`, 'success');
    } catch (error) {
      console.error("Erro ao promover pessoa para aluno no DB:", error);
      addToast("Erro ao promover aluno.", "error");
    }
  }, [addToast]);
  
  const handleSalvarObjetivo = useCallback(async (objetivoData: Objetivo | Omit<Objetivo, 'id'>) => {
    let objetivoFinal: Objetivo;
    if ('id' in objetivoData) { 
        objetivoFinal = objetivoData as Objetivo;
    } else { 
        const novoId = await getNextObjetivoId();
        objetivoFinal = { ...objetivoData, id: novoId };
    }

    try {
      await db.objetivos.put(objetivoFinal); 
      setObjetivos(prev => {
        const index = prev.findIndex(o => o.id === objetivoFinal.id);
        if (index > -1) {
          const atualizados = [...prev];
          atualizados[index] = objetivoFinal;
          return atualizados;
        }
        return [...prev, objetivoFinal];
      });
      addToast(`Objetivo "${objetivoFinal.nome}" salvo!`, 'success');
    } catch (error) {
      console.error("Erro ao salvar objetivo no DB:", error);
      addToast("Erro ao salvar objetivo.", "error");
    }
  }, [addToast]);


  const handleRemoverObjetivo = useCallback(async (objetivoId: string) => {
    const objetivoRemovido = objetivos.find(obj => obj.id === objetivoId);
    try {
      await db.objetivos.delete(objetivoId);
      setObjetivos(prev => prev.filter(obj => obj.id !== objetivoId));
      if (objetivoRemovido) addToast(`Objetivo "${objetivoRemovido.nome}" removido.`, 'success');
    } catch (error) {
      console.error("Erro ao remover objetivo do DB:", error);
      addToast("Erro ao remover objetivo.", "error");
    }
  }, [objetivos, addToast]);

  const handleSalvarPerfilProfessor = useCallback(async (perfilAtualizado: PerfilProfessor) => {
    try {
      await db.perfilProfessor.put(perfilAtualizado); 
      setPerfilProfessor(perfilAtualizado);
      addToast('Perfil atualizado com sucesso!', 'success');
      setActiveViewOrModal(null);
    } catch (error) {
      console.error("Erro ao salvar perfil do professor no DB:", error);
      addToast("Erro ao atualizar perfil.", "error");
    }
  }, [addToast]);

  const handleSalvarAgendamento = useCallback(async (agendamentoData: Agendamento | Omit<Agendamento, 'id'>) => {
    let agendamentoFinal: Agendamento;

    if (agendamentoOriginalParaReagendar) { 
        const reagendadoId = await getNextAgendamentoId();
        // Ensure agendamentoData (which is Omit<Agendamento, 'id'> in this branch) gets the new ID.
        agendamentoFinal = { ...(agendamentoData as Omit<Agendamento, 'id'>), id: reagendadoId, status: 'Agendado' as StatusAgendamento };
        const originalAtualizado = {
          ...agendamentoOriginalParaReagendar, status: 'Cancelado' as StatusAgendamento,
          observacoes: `${agendamentoOriginalParaReagendar.observacoes || ''}\nReagendado para ${formatarDataParaExibicaoModal(agendamentoFinal.data)} às ${agendamentoFinal.horaInicio}.`.trim(),
        };
        try {
            await db.transaction('rw', db.agendamentos, async () => {
              await db.agendamentos.put(originalAtualizado);
              await db.agendamentos.add(agendamentoFinal);
            });
            setAgendamentos(prevAgs => {
              const indexOriginal = prevAgs.findIndex(ag => ag.id === originalAtualizado.id);
              const novosAgs = [...prevAgs];
              if (indexOriginal !== -1) novosAgs[indexOriginal] = originalAtualizado;
              novosAgs.push(agendamentoFinal);
              return novosAgs.sort((a, b) => new Date(a.data + 'T' + a.horaInicio).getTime() - new Date(b.data + 'T' + b.horaInicio).getTime());
            });
            addToast(`Agendamento "${originalAtualizado.titulo}" reagendado.`, 'success');
            setAgendamentoOriginalParaReagendar(null);
        } catch (error) {
             console.error("Erro ao reagendar agendamento no DB:", error);
            addToast("Erro ao reagendar agendamento.", "error");
        }
    } else { 
        if ('id' in agendamentoData) { 
            agendamentoFinal = agendamentoData as Agendamento;
        } else { 
            const novoId = await getNextAgendamentoId();
            agendamentoFinal = { ...agendamentoData, id: novoId };
        }
        try {
            await db.agendamentos.put(agendamentoFinal); 
            setAgendamentos(prev => {
                const index = prev.findIndex(a => a.id === agendamentoFinal.id);
                if (index > -1) {
                    const atualizados = [...prev];
                    atualizados[index] = agendamentoFinal;
                    return atualizados.sort((a,b) => new Date(a.data + 'T' + a.horaInicio).getTime() - new Date(b.data + 'T' + b.horaInicio).getTime());
                }
                return [...prev, agendamentoFinal].sort((a,b) => new Date(a.data + 'T' + a.horaInicio).getTime() - new Date(b.data + 'T' + b.horaInicio).getTime());
            });
            addToast(`Agendamento "${agendamentoFinal.titulo}" salvo!`, 'success');
        } catch (error) {
            console.error("Erro ao salvar agendamento no DB:", error);
            addToast("Erro ao salvar agendamento.", "error");
        }
    }
  }, [addToast, agendamentoOriginalParaReagendar]);


  const handleAbrirModalParaReagendar = useCallback((agOriginal: Agendamento) => {
    setAgendamentoOriginalParaReagendar(agOriginal);
    const prefillData: Partial<Agendamento> = {
        titulo: agOriginal.titulo, alunoId: agOriginal.alunoId, tipo: agOriginal.tipo,
        observacoes: agOriginal.observacoes, 
    };
    setAgendamentoSelecionadoParaModal(prefillData); // Pass partial data for prefill
    setActiveViewOrModal('agendamentoModal');
  }, []);

  const handleRemoverAgendamento = useCallback(async (agendamentoId: string) => {
    const agendamentoRemovido = agendamentos.find(ag => ag.id === agendamentoId);
    try {
      await db.agendamentos.delete(agendamentoId);
      setAgendamentos(prev => prev.filter(ag => ag.id !== agendamentoId));
      if (agendamentoRemovido) addToast(`Agendamento "${agendamentoRemovido.titulo}" removido.`, 'success');
    } catch (error) {
      console.error("Erro ao remover agendamento do DB:", error);
      addToast("Erro ao remover agendamento.", "error");
    }
  }, [agendamentos, addToast]);

  const handleAtualizarStatusAgendamento = useCallback(async (agendamentoId: string, novoStatus: StatusAgendamento) => {
    const agendamentoAtual = agendamentos.find(ag => ag.id === agendamentoId);
    if (!agendamentoAtual) return;
    const atualizado = { ...agendamentoAtual, status: novoStatus };
    try {
      await db.agendamentos.put(atualizado);
      setAgendamentos(prevAgs => prevAgs.map(ag => ag.id === agendamentoId ? atualizado : ag));
      addToast(`Agendamento "${atualizado.titulo}" marcado como ${novoStatus.toLowerCase()}.`, 'success');
    } catch (error) {
      console.error("Erro ao atualizar status do agendamento no DB:", error);
      addToast("Erro ao atualizar status.", "error");
    }
  }, [agendamentos, addToast]);

  const handleAbrirModalAgendamentoRapido = useCallback((dataPreenchida?: string) => {
    setAgendamentoOriginalParaReagendar(null);
    abrirViewOuModal('agendamentoModal', dataPreenchida ? { data: dataPreenchida } as Partial<Agendamento> : undefined);
  }, []);
  
  const handleSalvarModeloDeTreino = useCallback(async (modeloData: ModeloDeTreino | Omit<ModeloDeTreino, 'id'>) => {
    let modeloFinal: ModeloDeTreino;
    if ('id' in modeloData) { 
        modeloFinal = modeloData as ModeloDeTreino;
    } else { 
        const novoId = await getNextModeloTreinoId();
        modeloFinal = { ...modeloData, id: novoId };
    }
    modeloFinal.exercicios = await Promise.all(
      (modeloFinal.exercicios || []).map(async (ex) => 
        ex.id ? ex : { ...ex, id: await getNextExercicioModeloId() }
      )
    );

    try {
      await db.modelosDeTreino.put(modeloFinal); 
      setModelosDeTreino(prevModelos => {
          const indexExistente = prevModelos.findIndex(m => m.id === modeloFinal.id);
          if (indexExistente > -1) {
              const atualizados = [...prevModelos];
              atualizados[indexExistente] = modeloFinal;
              return atualizados;
          }
          return [...prevModelos, modeloFinal];
      });
      addToast(`Modelo "${modeloFinal.nome}" salvo!`, 'success');
      setActiveViewOrModal('gerenciarModelosTreino');
      setModeloSelecionadoParaForm(null);
    } catch (error) {
      console.error("Erro ao salvar modelo de treino no DB:", error);
      addToast("Erro ao salvar modelo.", "error");
    }
  }, [addToast]);

  const handleRemoverModeloDeTreino = useCallback(async (modeloId: string) => {
    const modeloRemovido = modelosDeTreino.find(m => m.id === modeloId);
    try {
      await db.modelosDeTreino.delete(modeloId);
      setModelosDeTreino(prev => prev.filter(m => m.id !== modeloId));
      if (modeloRemovido) addToast(`Modelo "${modeloRemovido.nome}" removido.`, 'success');
    } catch (error) {
      console.error("Erro ao remover modelo de treino do DB:", error);
      addToast("Erro ao remover modelo.", "error");
    }
  }, [modelosDeTreino, addToast]);

  const handleDuplicarModeloDeTreino = useCallback(async (modeloOriginal: ModeloDeTreino) => {
    const novoNome = `Cópia de ${modeloOriginal.nome}`;
    const novoIdModelo = await getNextModeloTreinoId();
    const novosExercicios = await Promise.all(
      modeloOriginal.exercicios.map(async ex => ({ ...ex, id: await getNextExercicioModeloId() }))
    );
    const modeloDuplicado: ModeloDeTreino = { ...modeloOriginal, id: novoIdModelo, nome: novoNome, exercicios: novosExercicios };
    try {
      await db.modelosDeTreino.add(modeloDuplicado);
      setModelosDeTreino(prev => [...prev, modeloDuplicado]);
      addToast(`Modelo "${modeloOriginal.nome}" duplicado como "${novoNome}".`, 'success');
      abrirViewOuModal('modeloTreinoForm', modeloDuplicado);
    } catch (error) {
      console.error("Erro ao duplicar modelo de treino no DB:", error);
      addToast("Erro ao duplicar modelo.", "error");
    }
  }, [addToast]);

  const handleSalvarExercicioBiblioteca = useCallback(async (exercicioData: ExercicioBiblioteca | Omit<ExercicioBiblioteca, 'id'>) => {
    let exercicioFinal: ExercicioBiblioteca;
    if ('id' in exercicioData && exercicioData.id) { 
        exercicioFinal = exercicioData as ExercicioBiblioteca;
    } else { 
        const novoId = await getNextExercicioBibliotecaId();
        exercicioFinal = { ...(exercicioData as Omit<ExercicioBiblioteca, 'id'>), id: novoId };
    }

    try {
      await db.exerciciosBiblioteca.put(exercicioFinal);
      setExerciciosBiblioteca(prevExercicios => {
          const indexExistente = prevExercicios.findIndex(ex => ex.id === exercicioFinal.id);
          if (indexExistente > -1) {
              const atualizados = [...prevExercicios];
              atualizados[indexExistente] = exercicioFinal;
              return atualizados;
          }
          return [...prevExercicios, exercicioFinal];
      });
      addToast(`Exercício "${exercicioFinal.nome}" salvo na biblioteca!`, 'success');
      setActiveViewOrModal('gerenciarBibliotecaExercicios');
      setExercicioBibliotecaSelecionadoParaForm(null);
    } catch (error) {
      console.error("Erro ao salvar exercício na biblioteca DB:", error);
      addToast("Erro ao salvar exercício.", "error");
    }
  }, [addToast]);

  const handleRemoverExercicioBiblioteca = useCallback(async (exercicioId: string) => {
    const exercicioRemovido = exerciciosBiblioteca.find(ex => ex.id === exercicioId);
    try {
      await db.exerciciosBiblioteca.delete(exercicioId);
      setExerciciosBiblioteca(prev => prev.filter(ex => ex.id !== exercicioId));
      if (exercicioRemovido) addToast(`Exercício "${exercicioRemovido.nome}" removido da biblioteca.`, 'success');
    } catch (error) {
      console.error("Erro ao remover exercício da biblioteca DB:", error);
      addToast("Erro ao remover exercício.", "error");
    }
  }, [exerciciosBiblioteca, addToast]);

  const handleAbrirModalVisualizarExercicioBiblioteca = (exercicio: ExercicioBiblioteca) => {
    setExercicioBibliotecaParaVisualizar(exercicio);
    setActiveViewOrModal('visualizarExercicioBiblioteca');
  };

  const getProximoIdSubEntidadeLocal = useCallback(async (tipo: SubEntidadeIdTipo, alunoIdParam?: string): Promise<string> => {
    const idAlunoUsar = alunoIdParam || alunoSelecionado?.id;
    return getProximoIdSubEntidadeDexie(tipo, idAlunoUsar);
  }, [alunoSelecionado]);


  useEffect(() => {
    const calcularDadosFinanceiros = (): PainelFinanceiroData => {
        let receitaRealizadaMes = 0, pendenteMes = 0, atrasadoGeral = 0, novosPagamentosHojeValor = 0, novosPagamentosHojeQtd = 0;
        const agora = new Date(), anoCorrente = agora.getFullYear(), mesCorrente = agora.getMonth(), hojeStr = agora.toISOString().split('T')[0];
        alunosConsultoria.forEach(aluno => {
            (aluno.historicoPagamentos || []).forEach(pg => {
                const dataPg = new Date(pg.data + 'T00:00:00Z');
                if (pg.status === 'Pago') {
                    if (dataPg.getUTCFullYear() === anoCorrente && dataPg.getUTCMonth() === mesCorrente) receitaRealizadaMes += pg.valor;
                    if (pg.data === hojeStr) { novosPagamentosHojeValor += pg.valor; novosPagamentosHojeQtd++; }
                } else if (pg.status === 'Pendente' && pg.dataVencimento) {
                    const dataVenc = new Date(pg.dataVencimento + 'T00:00:00Z');
                    if (dataVenc.getUTCFullYear() === anoCorrente && dataVenc.getUTCMonth() === mesCorrente) pendenteMes += pg.valor;
                } else if (pg.status === 'Atrasado') atrasadoGeral += pg.valor;
            });
        });
        return {
            kpis: { receitaRealizadaMes, pendenteMes, atrasadoGeral, novosPagamentosHojeValor, novosPagamentosHojeQtd },
            chartData: [{ name: 'Mês Atual', Realizada: receitaRealizadaMes, Pendente: pendenteMes }]
        };
    };
    if (!isDBLoading && alunosConsultoria) { 
        setPainelFinanceiroData(calcularDadosFinanceiros());
    }
  }, [alunosConsultoria, isDBLoading]);


  const abrirViewOuModal = (tipo: TipoModalOuView, data?: AlunoConsultoria | Objetivo | Agendamento | Partial<Agendamento> | ConfirmacaoAcaoModalProps | ModeloDeTreino | ExercicioBiblioteca) => {
    if (tipo !== 'agendamentoModal' && agendamentoOriginalParaReagendar) {
        setAgendamentoOriginalParaReagendar(null);
    }
    setActiveViewOrModal(tipo);
    if ((tipo === 'perfilAluno' || tipo === 'studentDetailView') && data && 'corAvatar' in data) setAlunoSelecionado(data as AlunoConsultoria);
    else if (tipo === 'objetivo' && data && 'valorMeta' in data) setObjetivoSelecionadoParaModal(data as Objetivo);
    else if (tipo === 'agendamentoModal' && data) setAgendamentoSelecionadoParaModal(data as Agendamento | Partial<Agendamento>);
    else if (tipo === 'confirmarAcaoAgenda' && data && 'onConfirmar' in data) setConfirmacaoAcaoModalProps(data as ConfirmacaoAcaoModalProps);
    else if (tipo === 'modeloTreinoForm' && data && 'categoria' in data) setModeloSelecionadoParaForm(data as ModeloDeTreino);
    else if (tipo === 'exercicioBibliotecaForm' && data && 'grupoMuscularPrincipal' in data) setExercicioBibliotecaSelecionadoParaForm(data as ExercicioBiblioteca);
    else if (tipo === 'visualizarExercicioBiblioteca' && data && 'grupoMuscularPrincipal' in data) setExercicioBibliotecaParaVisualizar(data as ExercicioBiblioteca);
    else if (tipo === 'objetivo') setObjetivoSelecionadoParaModal(null);
    else if (tipo === 'agendamentoModal' && !agendamentoOriginalParaReagendar) setAgendamentoSelecionadoParaModal(null);
    else if (tipo === 'modeloTreinoForm') setModeloSelecionadoParaForm(null);
    else if (tipo === 'exercicioBibliotecaForm') setExercicioBibliotecaSelecionadoParaForm(null);
    else {
      if (tipo !== 'visualizarExercicioBiblioteca' && tipo !== 'relatorioPopularidadeExercicios') {
          setAlunoSelecionado(null); setObjetivoSelecionadoParaModal(null);
          if (!agendamentoOriginalParaReagendar) setAgendamentoSelecionadoParaModal(null);
          setModeloSelecionadoParaForm(null); setExercicioBibliotecaSelecionadoParaForm(null); setExercicioBibliotecaParaVisualizar(null);
      }
      if (tipo !== 'confirmarAcaoAgenda' && tipo !== 'relatorioFinanceiro' && tipo !== 'visualizarExercicioBiblioteca' && tipo !== 'relatorioPopularidadeExercicios') {
          setConfirmacaoAcaoModalProps(null);
      }
    }
  };

  const fecharViewOuModalEspecial = (tipoFechado: TipoModalOuView) => {
    if (tipoFechado === 'agendamentoModal' && agendamentoOriginalParaReagendar) setAgendamentoOriginalParaReagendar(null);
    switch (tipoFechado) {
      case 'modeloTreinoForm': setActiveViewOrModal('gerenciarModelosTreino'); setModeloSelecionadoParaForm(null); return;
      case 'exercicioBibliotecaForm': setActiveViewOrModal('gerenciarBibliotecaExercicios'); setExercicioBibliotecaSelecionadoParaForm(null); return;
      case 'perfilAluno': if (alunoSelecionado) { setActiveViewOrModal('studentDetailView'); return; } break; 
      case 'visualizarExercicioBiblioteca': setActiveViewOrModal(activeViewOrModal === 'visualizarExercicioBiblioteca' ? 'studentDetailView' : activeViewOrModal); setExercicioBibliotecaParaVisualizar(null); return;
      default: break;
    }
    setActiveViewOrModal(null); 
    if (tipoFechado === 'objetivo') setObjetivoSelecionadoParaModal(null);
    if (tipoFechado === 'agendamentoModal') setAgendamentoSelecionadoParaModal(null);
    if (tipoFechado === 'confirmarAcaoAgenda') setConfirmacaoAcaoModalProps(null);
    if (tipoFechado !== 'studentDetailView' && activeViewOrModal !== 'studentDetailView' && tipoFechado !== 'perfilAluno') setAlunoSelecionado(null);
  };

  const handleVoltarParaDashboard = () => { setActiveViewOrModal(null); setAlunoSelecionado(null); setAgendamentoOriginalParaReagendar(null); };
  const handleFecharApp = () => {
    if (activeViewOrModal) {
      const isDashboardView = ['studentDetailView', 'agendaView', 'gerenciarModelosTreino', 'gerenciarBibliotecaExercicios', 'relatorioPopularidadeExercicios'].includes(activeViewOrModal as string);
      if (isDashboardView) handleVoltarParaDashboard();
      else fecharViewOuModalEspecial(activeViewOrModal);
    } else console.log("Tentativa de fechar o app (no modo dashboard ou app já fechado).");
  };

  const alunosParaAgendamentoDropdown = alunosConsultoria.map(al => ({ id: al.id, nome: al.nome, corAvatar: al.corAvatar, iniciais: al.iniciais }));
  const contagemListaEsperaPendente = listaEspera.filter(p => p.status === 'Pendente').length;
  const hojeStr = new Date().toISOString().split('T')[0];
  const amanha = new Date(); amanha.setDate(amanha.getDate() + 1); const amanhaStr = amanha.toISOString().split('T')[0];
  const contagemAgendamentosHoje = agendamentos.filter(ag => ag.data === hojeStr && ag.status === 'Agendado').length;
  const contagemAgendamentosAmanha = agendamentos.filter(ag => ag.data === amanhaStr && ag.status === 'Agendado').length;
  const handleFiltroStatusAlunosChange = (status: StatusAluno | '') => setFiltroStatusAlunos(status);
  const handleFiltroObjetivoAlunosChange = (objetivo: string) => setFiltroObjetivoAlunos(objetivo);
  const alunosFiltrados = alunosConsultoria.filter(aluno => {
    const matchStatus = filtroStatusAlunos ? aluno.status === filtroStatusAlunos : true;
    const matchObjetivo = filtroObjetivoAlunos ? (aluno.objetivoPrincipal || '').toLowerCase().includes(filtroObjetivoAlunos.toLowerCase()) : true;
    return matchStatus && matchObjetivo;
  });

   const renderModalOuViewAtiva = () => {
    if (!activeViewOrModal) return null;

    switch (activeViewOrModal) {
      case 'patchNotes': return <PatchNotesModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('patchNotes')} notas={notasDeAtualizacao} aoAdicionarNota={adicionarNovaNotaPatch} />;
      case 'adicionarAluno': return <AdicionarAlunoModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('adicionarAluno')} aoSalvarAluno={handleAdicionarNovoAluno} addToast={addToast} />;
      case 'perfilAluno': if (alunoSelecionado) return <PerfilAlunoModal visivel={true} aluno={alunoSelecionado} aoFechar={() => fecharViewOuModalEspecial('perfilAluno')} aoSalvarEdicao={handleEditarAluno} aoExcluirAluno={handleExcluirAluno} addToast={addToast} />; return null;
      case 'verListaEspera': return <ListaEsperaModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('verListaEspera')} listaEspera={listaEspera} onAdicionarPessoa={handleAdicionarPessoaListaEspera} onEditarPessoa={handleEditarPessoaListaEspera} onRemoverPessoa={handleRemoverPessoaListaEspera} onPromoverPessoa={handlePromoverPessoaParaAluno} addToast={addToast} />;
      case 'objetivo': return <ObjetivoModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('objetivo')} aoSalvar={handleSalvarObjetivo} objetivoExistente={objetivoSelecionadoParaModal} addToast={addToast} />;
      case 'minhaContaModal': return <MinhaContaModal visivel={true} perfil={perfilProfessor} aoFechar={() => fecharViewOuModalEspecial('minhaContaModal')} aoSalvar={handleSalvarPerfilProfessor} addToast={addToast} />;
      case 'agendamentoModal': return <AgendamentoModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('agendamentoModal')} aoSalvar={handleSalvarAgendamento} agendamentoExistente={agendamentoSelecionadoParaModal} alunos={alunosParaAgendamentoDropdown} dataSelecionada={agendamentoSelecionadoParaModal && !('id' in agendamentoSelecionadoParaModal) && agendamentoSelecionadoParaModal.data ? agendamentoSelecionadoParaModal.data : undefined} addToast={addToast} />;
      case 'confirmarAcaoAgenda': if (confirmacaoAcaoModalProps) return <ConfirmacaoAcaoModal visivel={true} {...confirmacaoAcaoModalProps} onCancelar={() => { confirmacaoAcaoModalProps.onCancelar?.(); fecharViewOuModalEspecial('confirmarAcaoAgenda'); }} onConfirmar={() => { confirmacaoAcaoModalProps.onConfirmar(); fecharViewOuModalEspecial('confirmarAcaoAgenda'); }} />; return null;
      case 'gerenciarModelosTreino': return <ModelosTreinoModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('gerenciarModelosTreino')} modelosDeTreino={modelosDeTreino} onRemoverModelo={handleRemoverModeloDeTreino} onDuplicarModelo={handleDuplicarModeloDeTreino} abrirFormModelo={(modelo) => abrirViewOuModal('modeloTreinoForm', modelo)} />;
      case 'modeloTreinoForm': return <ModeloTreinoFormModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('modeloTreinoForm')} aoSalvar={handleSalvarModeloDeTreino} modeloExistente={modeloSelecionadoParaForm} getProximoIdExercicioModelo={async () => await getNextExercicioModeloId()} addToast={addToast} />;
      case 'relatorioFinanceiro': return <RelatorioFinanceiroModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('relatorioFinanceiro')} alunos={alunosConsultoria} />;
      case 'gerenciarBibliotecaExercicios': return <BibliotecaExerciciosModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('gerenciarBibliotecaExercicios')} exerciciosBiblioteca={exerciciosBiblioteca} onRemoverExercicio={handleRemoverExercicioBiblioteca} abrirFormExercicio={(ex) => abrirViewOuModal('exercicioBibliotecaForm', ex)} />;
      case 'exercicioBibliotecaForm': return <ExercicioBibliotecaFormModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('exercicioBibliotecaForm')} aoSalvar={handleSalvarExercicioBiblioteca} exercicioExistente={exercicioBibliotecaSelecionadoParaForm} addToast={addToast} onGerarDescricaoIA={handleGerarDescricaoExercicioIA} aiServiceInitialized={!!ai.current} />;
      case 'visualizarExercicioBiblioteca': if (exercicioBibliotecaParaVisualizar) { const ex = exercicioBibliotecaParaVisualizar; return (<Modal titulo={`Detalhes: ${ex.nome}`} visivel={true} aoFechar={() => fecharViewOuModalEspecial('visualizarExercicioBiblioteca')} largura="max-w-lg"><div className="space-y-3 text-sm"><p><strong className="text-slate-400">Nome:</strong> {ex.nome}</p><p><strong className="text-slate-400">Grupo Muscular Principal:</strong> {ex.grupoMuscularPrincipal}</p>{ex.gruposMuscularesSecundarios && ex.gruposMuscularesSecundarios.length > 0 && (<p><strong className="text-slate-400">Grupos Secundários:</strong> {ex.gruposMuscularesSecundarios.join(', ')}</p>)}{ex.descricao && <p className="whitespace-pre-wrap"><strong className="text-slate-400">Descrição:</strong> {ex.descricao}</p>}{ex.linkVideo && <p><a href={ex.linkVideo} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Ver Vídeo</a></p>}{ex.linkImagem && <p><a href={ex.linkImagem} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Ver Imagem</a></p>}</div></Modal>); } return null;
      case 'relatorioPopularidadeExercicios': return <RelatorioPopularidadeExerciciosModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('relatorioPopularidadeExercicios')} alunos={alunosConsultoria} exerciciosBiblioteca={exerciciosBiblioteca} />;
      // case 'relatorioEngajamento': return <RelatorioEngajamentoModal visivel={true} aoFechar={() => fecharViewOuModalEspecial('relatorioEngajamento')} alunos={alunosConsultoria} agendamentos={agendamentos} />;
      case 'studentDetailView': case 'agendaView': return null; 
      default: if (activeViewOrModal && TEXTOS_MODAIS.hasOwnProperty(activeViewOrModal as keyof typeof TEXTOS_MODAIS)) { const modalInfo = TEXTOS_MODAIS[activeViewOrModal as keyof typeof TEXTOS_MODAIS]; if (modalInfo) return <Modal titulo={modalInfo.titulo} visivel={true} aoFechar={() => fecharViewOuModalEspecial(activeViewOrModal)}><p>{modalInfo.conteudo}</p></Modal>; } return null;
    }
  };

  if (isDBLoading) {
    return <div className="flex items-center justify-center h-screen bg-slate-900 text-white text-xl">Carregando banco de dados...</div>;
  }

  return (
    <ActualToastProvider addToastFunc={addToast}>
        <div className="flex flex-col h-screen bg-slate-900">
        <Header versaoAtual={getUltimaVersao()} aoAbrirPatchNotes={() => abrirViewOuModal('patchNotes')} aoFecharApp={handleFecharApp} />
        <div className="flex flex-1 overflow-hidden">
            <Sidebar
              perfilProfessor={perfilProfessor}
              aoAbrirMinhaContaModal={() => abrirViewOuModal('minhaContaModal')}
              aoAbrirListaEspera={() => abrirViewOuModal('verListaEspera')}
              aoAbrirViewAgenda={() => abrirViewOuModal('agendaView')}
              aoAbrirGerenciarModelosTreino={() => abrirViewOuModal('gerenciarModelosTreino')}
              aoAbrirRelatorioFinanceiro={() => abrirViewOuModal('relatorioFinanceiro')}
              aoAbrirBibliotecaExercicios={() => abrirViewOuModal('gerenciarBibliotecaExercicios')}
              aoAbrirRelatorioPopularidadeExercicios={() => abrirViewOuModal('relatorioPopularidadeExercicios')}
              contagemListaEspera={contagemListaEsperaPendente}
            />
            {activeViewOrModal === 'studentDetailView' && alunoSelecionado ? (
              <StudentDetailView
                aluno={alunoSelecionado} onUpdateAluno={handleEditarAluno} onDeleteAluno={handleExcluirAluno}
                onGoBack={handleVoltarParaDashboard} onOpenBasicProfileModal={() => abrirViewOuModal('perfilAluno', alunoSelecionado)}
                getProximoId={getProximoIdSubEntidadeLocal} addToast={addToast}
                modelosDeTreino={modelosDeTreino} exerciciosBiblioteca={exerciciosBiblioteca} 
                abrirModalVisualizarExercicioBiblioteca={handleAbrirModalVisualizarExercicioBiblioteca} 
              />
            ) : activeViewOrModal === 'agendaView' ? (
              <AgendaView
                agendamentos={agendamentos}
                onAdicionarAgendamento={(dataSelecionada) => { setAgendamentoOriginalParaReagendar(null); abrirViewOuModal('agendamentoModal', dataSelecionada ? {data: dataSelecionada} as Partial<Agendamento> : undefined)}}
                onEditarAgendamento={(ag) => { setAgendamentoOriginalParaReagendar(null); abrirViewOuModal('agendamentoModal', ag)}}
                onReagendarAgendamento={handleAbrirModalParaReagendar} onRemoverAgendamento={handleRemoverAgendamento}
                onAtualizarStatusAgendamento={handleAtualizarStatusAgendamento} alunos={alunosParaAgendamentoDropdown}
                abrirModalConfirmacao={(tipo, dados) => abrirViewOuModal(tipo, dados)}
              />
            ) : (
              <MainContent
                  dadosAlunos={dadosAlunos} objetivos={objetivos}
                  onAbrirModalObjetivo={(obj?: Objetivo) => abrirViewOuModal('objetivo', obj)} 
                  onRemoverObjetivo={handleRemoverObjetivo} 
                  alunosConsultoria={alunosFiltrados} aoAdicionarAluno={() => abrirViewOuModal('adicionarAluno')}
                  aoAbrirPerfilAluno={(aluno) => abrirViewOuModal('studentDetailView', aluno)}
                  agendamentos={agendamentos} onAbrirAgenda={() => abrirViewOuModal('agendaView')}
                  onAdicionarAgendamentoRapido={() => handleAbrirModalAgendamentoRapido(new Date().toISOString().split('T')[0])}
                  contagemAgendamentosHoje={contagemAgendamentosHoje} contagemAgendamentosAmanha={contagemAgendamentosAmanha}
                  filtroStatusAlunos={filtroStatusAlunos} onFiltroStatusAlunosChange={handleFiltroStatusAlunosChange}
                  filtroObjetivoAlunos={filtroObjetivoAlunos} onFiltroObjetivoAlunosChange={handleFiltroObjetivoAlunosChange}
                  painelFinanceiroData={painelFinanceiroData} addToast={addToast} 
              />
            )}
        </div>
        <Footer versaoApp={getUltimaVersao()} />
        {renderModalOuViewAtiva()}
        <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
        </div>
    </ActualToastProvider>
  );
};

export default App;
