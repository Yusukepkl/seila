
import { NotaAtualizacao, AlunoConsultoria, DadosAlunosCadastrados, DadosObjetivos, PessoaListaEspera, Objetivo, PerfilProfessor, Agendamento, StatusAluno, DificuldadePlanoTreino, StatusListaEspera, StatusAgendamento, StatusPagamentoAluno, CategoriaModeloTreino, ModeloDeTreino, DiarioEntry, TipoMetricaMeta, StatusMeta, DetalheMetricaMedidaCorporal, StatusPagamentoOpcoes, TipoPeriodoRelatorio, GrupoMuscular, ExercicioBiblioteca, TemplateComunicacao } from './types'; 
import { IconeCheckCircle, IconeExclamationTriangle, IconeXCircle } from './components/icons'; 
import React from 'react'; 


// Notas de atualização iniciais
export const NOTAS_ATUALIZACAO_INICIAIS: NotaAtualizacao[] = [
  { versao: 'v0.0.1', data: '2024-07-31', descricao: 'Lançamento inicial do Gestor Trainer com dashboard principal, cards de visualização e sistema de Patch Notes funcional com persistência em localStorage. Estrutura baseada na imagem fornecida.' },
  { versao: 'v0.0.2', data: '2024-08-01', descricao: 'Implementada funcionalidade "Adicionar Aluno".'},
  { versao: 'v0.0.3', data: '2024-08-02', descricao: 'Modal de Perfil do Aluno aprimorado.'},
  { versao: 'v0.0.4', data: '2024-08-03', descricao: 'Implementada persistência de dados dos alunos e contadores no localStorage.'},
  { versao: 'v0.0.5', data: '2024-08-04', descricao: 'Perfil do Aluno detalhado: foto, telefone, etc.' },
  { versao: 'v0.0.6', data: '2024-08-05', descricao: 'Implementada funcionalidade "Lista de Espera".' },
  { versao: 'v0.0.7', data: '2024-08-06', descricao: 'Introduzida Visão Detalhada do Aluno: Planos de Treino, Medidas, Notas.'},
  { versao: 'v0.0.8', data: '2024-08-07', descricao: 'Mega Pack Update: Progresso e Medidas, Notas de Sessão.'},
  { versao: 'v0.0.9', data: '2024-08-08', descricao: 'Mega Pack Update Premium: Card de Objetivos, Gráficos, Toasts.'},
  { versao: 'v0.1.0', data: '2024-08-09', descricao: 'Edição Comemorativa Gigante: Agenda completa, Minha Conta.'},
  { versao: 'v0.1.1', data: '2024-08-10', descricao: 'Refinamentos: Status do Aluno, Adicionar Agendamento Rápido.'},
  { versao: 'v0.1.2', data: '2024-08-11', descricao: "Mega Pack Aniversário (Pt 1): Novos status aluno, Diário, Metas Detalhadas."},
  { versao: 'v0.1.2 (Parte 2)', data: '2024-08-12', descricao: "Mega Pack Aniversário (Pt 2): Dificuldade Plano Treino, Filtros Alunos."},
  { versao: 'v0.1.2 (Parte 3)', data: '2024-08-13', descricao: "Mega Pack Aniversário (Pt 3): Lista de Espera com status detalhados."},
  { versao: 'v0.1.2 (Parte 4)', data: '2024-08-14', descricao: "Mega Pack Aniversário (Pt 4): Agenda com status, Status Pagamento (placeholder)."},
  { versao: 'v0.1.2 (Parte 5)', data: '2024-08-15', descricao: "Mega Pack Aniversário (Pt 5): Modelos de Treino (Templates) CRUD."},
  { versao: 'v0.1.2 (Parte 6)', data: '2024-08-16', descricao: "Mega Pack Aniversário (Pt 6): CRUD Diário do Aluno."},
  { versao: 'v0.1.2 (Parte 7)', data: '2024-08-17', descricao: "Mega Pack Aniversário (Pt 7): CRUD Metas Detalhadas do Aluno."},
  { versao: 'v0.1.2 (Parte 8)', data: '2024-08-18', descricao: "Mega Pack Aniversário (Pt 8): Gestão Financeira com Histórico de Pagamentos."},
  { versao: 'v0.1.2 (Parte 9)', data: '2024-08-19', descricao: "Mega Pack Aniversário (Pt 9): Painel Financeiro Avançado no Dashboard."},
  { versao: 'v0.1.2 (Parte 10)', data: '2024-08-20', descricao: "Mega Pack Aniversário (Pt 10): Relatório Financeiro Detalhado."},
  { versao: 'v0.1.2 (Parte 11)', data: '2024-08-21', descricao: "Mega Pack Aniversário (Pt 11): Biblioteca de Exercícios centralizada."},
  { versao: 'v0.1.2 (Parte 12)', data: '2024-08-22', descricao: "Mega Pack Aniversário (Pt 12): Integração Biblioteca de Exercícios aos Planos."},
  { versao: 'v0.1.2 (Parte 13)', data: '2024-08-23', descricao: "Mega Pack Aniversário (Pt 13): Templates de Comunicação e Mensagem Rápida."},
  { versao: 'v0.1.2 (Parte 14)', data: '2024-08-24', descricao: "Mega Pack Aniversário (Pt 14): Relatório de Engajamento e Atividade do Aluno."},
  { versao: 'v0.1.2 (Parte 15)', data: '2024-08-25', descricao: "Mega Pack Aniversário (Pt 15): Relatório de Popularidade de Exercícios."},
  { versao: 'v0.1.2 (Parte 16)', data: '2024-08-26', descricao: "Acompanhamento de Progresso - Sugestão Inteligente para Atualizar Metas."},
  { versao: 'v0.1.2 (Parte 17)', data: '2024-08-27', descricao: "Geração de Documentos PDF: Planos de Treino e Histórico de Pagamentos."},
  { versao: 'v0.1.2 (Parte 18)', data: '2024-08-28', descricao: "Melhorias Relatório Financeiro: Gráfico Evolução Receita e Ranking Alunos."},
  { versao: 'v0.1.2 (Parte 19)', data: '2024-08-29', descricao: "Geração de Documentos PDF (Módulo 2): Histórico Medidas e Avaliação Resumida."},
  { versao: 'v0.1.2 (Parte 20)', data: '2024-08-30', descricao: "Refinamentos na Agenda: Ação \"Reagendar\" agendamentos."},
  { versao: 'v0.1.2 (Parte 21)', data: '2024-08-31', descricao: "KPI Adicional - Tempo Médio de Permanência de Ex-Alunos."},
  { versao: 'v0.1.2 (Parte 22)', data: '2024-09-01', descricao: "Detalhes do Aluno - Dobras Cutâneas: CRUD e PDF."},
  { versao: 'v0.2.0', data: new Date().toISOString().split('T')[0], descricao: 'Grande Refatoração: Migração da persistência de dados de localStorage para IndexedDB usando Dexie.js. Isso melhora a capacidade de armazenamento, performance para grandes volumes de dados e prepara o app para funcionalidades offline mais robustas.'}
];

// Dados mock para alunos na lista de consultoria - USADO SOMENTE SE O BANCO DE DADOS ESTIVER VAZIO
export const ALUNOS_CONSULTORIA_MOCK_INICIAL: AlunoConsultoria[] = [];

// Dados mock para lista de espera - USADO SOMENTE SE O BANCO DE DADOS ESTIVER VAZIO
export const LISTA_ESPERA_MOCK_INICIAL: PessoaListaEspera[] = []; 

// Dados mock para alunos cadastrados - USADO SOMENTE SE O BANCO DE DADOS ESTIVER VAZIO
export const DADOS_ALUNOS_CADASTRADOS_MOCK_INICIAL: DadosAlunosCadastrados = {
  ativos: ALUNOS_CONSULTORIA_MOCK_INICIAL.filter(a => a.status === 'Ativo').length,
  expirados: ALUNOS_CONSULTORIA_MOCK_INICIAL.filter(a => a.status === 'Expirado').length,
  bloqueados: ALUNOS_CONSULTORIA_MOCK_INICIAL.filter(a => a.status === 'Bloqueado').length,
  inativos: ALUNOS_CONSULTORIA_MOCK_INICIAL.filter(a => a.status === 'Inativo').length, 
  pausados: ALUNOS_CONSULTORIA_MOCK_INICIAL.filter(a => a.status === 'Pausado').length, 
  totalCapacidade: 100,
};

// Cores para o gráfico de alunos cadastrados e status (v0.1.2)
export const CORES_GRAFICO_ALUNOS: Record<StatusAluno | 'padrao', string> = {
  Ativo: '#10B981', // green-500
  Expirado: '#F59E0B', // amber-500
  Bloqueado: '#EF4444', // red-500
  Inativo: '#64748B', // slate-500  
  Pausado: '#38BDF8', // sky-400 
  padrao: '#6B7280', // gray-500
};

// v0.1.2: Cores para badges de status de aluno
export const CORES_STATUS_ALUNO: Record<StatusAluno, { bg: string, text: string, border?: string }> = {
  Ativo: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  Expirado: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Bloqueado: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  Inativo: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' }, 
  Pausado: { bg: 'bg-sky-500/20', text: 'text-sky-400', border: 'border-sky-500/30' }, 
};

// v0.1.2 (Parte 3): Opções e Cores para Status da Lista de Espera
export const STATUS_LISTA_ESPERA_OPCOES: { value: StatusListaEspera, label: string }[] = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Contatado', label: 'Contatado' },
  { value: 'Convertido', label: 'Convertido' },
  { value: 'Descartado', label: 'Descartado' },
];

export const CORES_STATUS_LISTA_ESPERA: Record<StatusListaEspera, { bg: string, text: string, border?: string }> = {
  Pendente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Contatado: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  Convertido: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  Descartado: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

// v0.1.2 (Parte 4): Opções e Cores para Status do Agendamento
export const STATUS_AGENDAMENTO_OPCOES: { value: StatusAgendamento, label: string }[] = [
  { value: 'Agendado', label: 'Agendado' },
  { value: 'Concluído', label: 'Concluído' },
  { value: 'Cancelado', label: 'Cancelado' },
];

export const CORES_STATUS_AGENDAMENTO: Record<StatusAgendamento, { bg: string, text: string, border?: string, iconColor?: string }> = {
  Agendado: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', iconColor: 'text-blue-500' },
  Concluído: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', iconColor: 'text-green-500' },
  Cancelado: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', iconColor: 'text-slate-500' },
};

// v0.1.2 (Parte 4): Cores e Ícones para Status de Pagamento do Aluno (Placeholder para resumo geral)
export const STATUS_PAGAMENTO_ALUNO_INFO: Record<StatusPagamentoAluno, { label: string, icon: React.FC<any>, colorClasses: string, title: string }> = {
  'Em Dia': { label: 'Em Dia', icon: IconeCheckCircle, colorClasses: 'text-green-400', title: 'Pagamento em dia' },
  'Pendente': { label: 'Pendente', icon: IconeExclamationTriangle, colorClasses: 'text-yellow-400', title: 'Pagamento pendente' },
  'Atrasado': { label: 'Atrasado', icon: IconeXCircle, colorClasses: 'text-red-400', title: 'Pagamento atrasado' },
};

// v0.1.2 (Parte 8): Opções e Cores para Status de Pagamentos Individuais
export const STATUS_PAGAMENTO_OPCOES: { value: StatusPagamentoOpcoes, label: string }[] = [
    { value: 'Pago', label: 'Pago' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Atrasado', label: 'Atrasado' },
];

export const CORES_STATUS_PAGAMENTO: Record<StatusPagamentoOpcoes, { bg: string, text: string, border?: string }> = {
  Pago: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  Pendente: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  Atrasado: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

// v0.0.9: Dados mock para a nova estrutura de Objetivos Personalizados
export const OBJETIVOS_MOCK_INICIAL: Objetivo[] = [];

// v0.1.0: Dados mock para Perfil do Professor
export const PERFIL_PROFESSOR_MOCK_INICIAL: PerfilProfessor = {
  id: 'professorUnico', // Será usado como chave no Dexie
  nome: 'Professor Trainer',
  iniciais: 'PT',
  email: 'professor@example.com',
  plano: 'Plano PRO',
};

// v0.1.0: Dados mock para Agendamentos
export const AGENDAMENTOS_MOCK_INICIAL: Agendamento[] = [];

// v0.1.2 (Parte 5): Dados mock para Modelos de Treino
export const MODELOS_TREINO_MOCK_INICIAL: ModeloDeTreino[] = [];

// v0.1.2 (Parte 11): Dados mock para Biblioteca de Exercícios
export const BIBLIOTECA_EXERCICIOS_MOCK_INICIAL: ExercicioBiblioteca[] = [];

// v0.1.2 (Parte 13): Dados mock para Templates de Comunicação
export const TEMPLATES_COMUNICACAO_MOCK_INICIAL: TemplateComunicacao[] = [];


// Texto para modais genéricos (será removido gradualmente)
export const TEXTOS_MODAIS: Record<string, { titulo: string, conteudo: string }> = {};

// Cores de Avatar disponíveis para novos alunos
export const AVATAR_CORES_DISPONIVEIS = [
  'bg-pink-500', 'bg-blue-500', 'bg-green-500',
  'bg-yellow-500', 'bg-purple-500', 'bg-red-500',
  'bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-lime-500'
];

// v0.1.0: Cores para tipos de evento na agenda
export const CORES_EVENTO_AGENDA: Record<string, string> = {
  Consulta: 'bg-blue-500',
  Treino: 'bg-green-500',
  Avaliação: 'bg-yellow-500',
  Pessoal: 'bg-purple-500',
  Outro: 'bg-slate-500',
  padrao: 'bg-gray-500', 
};

// v0.1.2 (Parte 2): Opções para Dificuldade do Plano de Treino (Reutilizado para Modelos)
export const DIFICULDADES_PLANO_TREINO_OPCOES: { value: DificuldadePlanoTreino, label: string }[] = [
  { value: 'Iniciante', label: 'Iniciante' },
  { value: 'Intermediário', label: 'Intermediário' },
  { value: 'Avançado', label: 'Avançado' },
  { value: 'Expert', label: 'Expert' },
];

// v0.1.2 (Parte 5): Opções para Categoria do Modelo de Treino
export const CATEGORIAS_MODELO_TREINO_OPCOES: { value: CategoriaModeloTreino, label: string }[] = [
    { value: 'Hipertrofia', label: 'Hipertrofia' },
    { value: 'Força', label: 'Força' },
    { value: 'Resistência', label: 'Resistência' },
    { value: 'Cardio', label: 'Cardio' },
    { value: 'Mobilidade', label: 'Mobilidade' },
    { value: 'Outro', label: 'Outro' },
];

// v0.1.2 (Parte 6): Opções para Tipo de Entrada do Diário
export const TIPOS_DIARIO_ENTRY_OPCOES: { value: DiarioEntry['tipo'], label: string }[] = [
    { value: 'Feedback', label: 'Feedback do Aluno' },
    { value: 'Observacao', label: 'Observação da Sessão' },
    { value: 'TreinoRealizado', label: 'Treino Realizado' },
    { value: 'Outro', label: 'Outro Registro' },
];

// v0.1.2 (Parte 7): Opções para Metas Detalhadas
export const TIPOS_METRICA_META_OPCOES: { value: TipoMetricaMeta, label: string }[] = [
    { value: 'Peso', label: 'Peso Corporal' },
    { value: 'MedidaCorporal', label: 'Medida Corporal' },
    { value: '%Gordura', label: '% de Gordura Corporal' },
    { value: 'Performance', label: 'Performance (Ex: Carga, Reps)' },
    { value: 'TempoDistancia', label: 'Tempo / Distância (Ex: Corrida)' },
    { value: 'Outro', label: 'Outro Tipo de Métrica' },
];

export const STATUS_META_OPCOES: { value: StatusMeta, label: string }[] = [
    { value: 'Ativa', label: 'Ativa' },
    { value: 'Alcancada', label: 'Alcançada' },
    { value: 'NaoAlcancada', label: 'Não Alcançada' },
    { value: 'Pausada', label: 'Pausada' },
];

export const CORES_STATUS_META: Record<StatusMeta, { bg: string, text: string, border?: string, progressBarClass?: string }> = {
  Ativa: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', progressBarClass: 'bg-blue-500' },
  Alcancada: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', progressBarClass: 'bg-green-500' },
  NaoAlcancada: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', progressBarClass: 'bg-red-500' },
  Pausada: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30', progressBarClass: 'bg-slate-500' },
};


export const DETALHE_METRICA_MEDIDA_CORPORAL_OPCOES: { value: DetalheMetricaMedidaCorporal, label: string, unidadeSugerida: string }[] = [
    { value: 'Peso', label: 'Peso Corporal', unidadeSugerida: 'kg' },
    { value: 'PercentualGordura', label: '% de Gordura', unidadeSugerida: '%' },
    { value: 'Peito', label: 'Peito', unidadeSugerida: 'cm' },
    { value: 'Cintura', label: 'Cintura', unidadeSugerida: 'cm' },
    { value: 'Abdomen', label: 'Abdômen', unidadeSugerida: 'cm' },
    { value: 'Quadril', label: 'Quadril', unidadeSugerida: 'cm' },
    { value: 'Costas', label: 'Costas', unidadeSugerida: 'cm' },
    { value: 'BracoD', label: 'Braço Direito', unidadeSugerida: 'cm' },
    { value: 'BracoE', label: 'Braço Esquerdo', unidadeSugerida: 'cm' },
    { value: 'AntebracoD', label: 'Antebraço Direito', unidadeSugerida: 'cm' },
    { value: 'AntebracoE', label: 'Antebraço Esquerdo', unidadeSugerida: 'cm' },
    { value: 'CoxaD', label: 'Coxa Direita', unidadeSugerida: 'cm' },
    { value: 'CoxaE', label: 'Coxa Esquerda', unidadeSugerida: 'cm' },
    { value: 'PanturrilhaD', label: 'Panturrilha Direita', unidadeSugerida: 'cm' },
    { value: 'PanturrilhaE', label: 'Panturrilha Esquerda', unidadeSugerida: 'cm' },
];

// v0.1.2 (Parte 10): Opções para Filtro de Período do Relatório Financeiro
export const OPCOES_PERIODO_RELATORIO: { value: TipoPeriodoRelatorio, label: string }[] = [
  { value: 'mesAtual', label: 'Mês Atual' },
  { value: 'trimestreAtual', label: 'Trimestre Atual' },
  { value: 'anoAtual', label: 'Ano Atual' },
  { value: 'ultimos30dias', label: 'Últimos 30 Dias' },
  { value: 'ultimos90dias', label: 'Últimos 90 Dias' },
  { value: 'personalizado', label: 'Personalizado' },
];

// v0.1.2 (Parte 11): Opções para Grupos Musculares
export const GRUPOS_MUSCULARES_OPCOES: { value: GrupoMuscular, label: string }[] = [
    { value: 'Peito', label: 'Peito' },
    { value: 'Costas', label: 'Costas' },
    { value: 'Ombros', label: 'Ombros' },
    { value: 'Bíceps', label: 'Bíceps' },
    { value: 'Tríceps', label: 'Tríceps' },
    { value: 'Antebraço', label: 'Antebraço' },
    { value: 'Pernas (Quadríceps)', label: 'Pernas (Quadríceps)' },
    { value: 'Pernas (Posteriores)', label: 'Pernas (Posteriores)' },
    { value: 'Pernas (Panturrilhas)', label: 'Pernas (Panturrilhas)' },
    { value: 'Glúteos', label: 'Glúteos' },
    { value: 'Abdômen', label: 'Abdômen' },
    { value: 'Cardio', label: 'Cardio' },
    { value: 'Corpo Inteiro', label: 'Corpo Inteiro' },
    { value: 'Outro', label: 'Outro' },
];

// Chaves do Dexie (App State Keys for Counters)
export const DS_KEY_PROXIMO_ID_ALUNO = 'proximoIdAluno';
export const DS_KEY_PROXIMA_COR_AVATAR_INDEX = 'proximaCorAvatarIndex';
export const DS_KEY_PROXIMO_ID_LISTA_ESPERA = 'proximoIdListaEspera';
export const DS_KEY_PROXIMO_ID_OBJETIVO = 'proximoIdObjetivo';
export const DS_KEY_PROXIMO_ID_AGENDAMENTO = 'proximoIdAgendamento';
export const DS_KEY_PROXIMO_ID_MODELO_TREINO = 'proximoIdModeloTreino';
export const DS_KEY_PROXIMO_ID_EXERCICIO_MODELO = 'proximoIdExercicioModelo';
export const DS_KEY_PROXIMO_ID_EXERCICIO_BIBLIOTECA = 'proximoIdExercicioBiblioteca';
export const DS_KEY_PROXIMO_ID_TEMPLATE_COMUNICACAO = 'proximoIdTemplateComunicacao';

// Sub-entidades (usadas com prefixo para Dexie, ex: 'proximoIdPlano_alunoX')
export const DS_SUB_KEY_PLANO = 'proximoIdPlano';
export const DS_SUB_KEY_EXERCICIO = 'proximoIdExercicio';
export const DS_SUB_KEY_MEDIDA = 'proximoIdMedida';
export const DS_SUB_KEY_NOTA = 'proximoIdNotaSessao';
export const DS_SUB_KEY_DIARIO = 'proximoIdDiarioEntry';
export const DS_SUB_KEY_META = 'proximoIdMetaDetalhada';
export const DS_SUB_KEY_HISTORICO_META = 'proximoIdHistoricoMeta';
export const DS_SUB_KEY_PAGAMENTO = 'proximoIdPagamento';
export const DS_SUB_KEY_DOBRA_CUTANEA = 'proximoIdDobraCutanea';
