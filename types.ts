// types.ts

// Define o tipo para um item de dados de gráfico de pizza/rosca
export interface ItemGraficoPizza {
  nome: string;
  valor: number;
  cor: string;
  percentual?: string; // Adicionado para exibir percentual na legenda
}

// Define o tipo para uma nota de atualização (patch note)
export interface NotaAtualizacao {
  versao: string;
  data: string;
  descricao: string;
}

// v0.0.7: Novas interfaces para detalhes do aluno
export interface TreinoExercicio {
  id: string;
  nome: string;
  series: string; // e.g., "3" or "3-4"
  repeticoes: string; // e.g., "8-12" or "15"
  tempoDescanso?: string; // e.g., "60s" or "1m30s"
  observacoes?: string;
  // v0.1.2 (Parte 11) - Campos para possível integração com biblioteca no futuro
  exercicioBibliotecaId?: string; // ID do exercício na biblioteca, se vinculado
}

// v0.1.2 (Parte 2): Define o tipo para dificuldade do plano de treino
export type DificuldadePlanoTreino = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert';

export interface PlanoDeTreino {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean; // Apenas um plano pode ser ativo por vez
  exercicios: TreinoExercicio[];
  // v0.1.2 (Parte 2): Novos campos para PlanoDeTreino
  dificuldade?: DificuldadePlanoTreino;
  notasAdicionais?: string;
}

export interface MedidaCorporalEntry {
  id: string;
  data: string; // Formato YYYY-MM-DD
  peso?: number; // em kg
  percentualGordura?: number; // em %
  peito?: number; // em cm
  cintura?: number; // em cm
  quadril?: number; // em cm
  bracoE?: number; // em cm
  bracoD?: number; // em cm
  coxaE?: number; // em cm
  coxaD?: number; // em cm
  // v0.1.2: Medidas mais detalhadas
  antebracoE?: number; // em cm
  antebracoD?: number; // em cm
  costas?: number; // em cm (ex: largura dorsal ou circunferência)
  abdomen?: number; // em cm (circunferência na altura do umbigo)
  panturrilhaE?: number; // em cm
  panturrilhaD?: number; // em cm
  observacoesAdicionais?: string;
}

// v0.1.2 (Parte 22): Interface para Dobras Cutâneas
export interface DobraCutaneaEntry {
  id: string;
  data: string; // Formato YYYY-MM-DD

  // Dobras comuns (mm)
  peitoral?: number;      // Peitoral / Tórax
  abdominal?: number;
  coxa?: number;          // Coxa medial ou anterior
  tricipital?: number;
  subescapular?: number;
  suprailiaca?: number;
  axilarMedia?: number;
  bicipital?: number;
  panturrilhaMedial?: number;
  pescoco?: number;         // Pescoço
  supraespinhal?: number;   // "Ombros" - Supraespinhal

  observacoes?: string;
}


export interface NotaSessao {
  id: string;
  data: string; // Formato YYYY-MM-DD
  conteudo: string;
}

// Define o tipo para o status de um aluno (v0.1.2: adicionado Inativo, Pausado)
export type StatusAluno = 'Ativo' | 'Expirado' | 'Bloqueado' | 'Inativo' | 'Pausado';

// v0.1.2: Interface para Entradas do Diário do Aluno
export type TipoDiarioEntry = 'Feedback' | 'Observacao' | 'TreinoRealizado' | 'Outro';
export interface DiarioEntry {
  id: string;
  data: string; // Formato YYYY-MM-DD ou YYYY-MM-DDTHH:mm
  tipo: TipoDiarioEntry;
  titulo?: string;
  conteudo: string;
}

// v0.1.2 (Parte 7): Detalhes de Medidas Corporais para Metas
export type DetalheMetricaMedidaCorporal =
  | 'Peso' // Adicionado aqui para simplificar, apesar de ter tipo de métrica próprio
  | 'PercentualGordura'
  | 'Peito'
  | 'Cintura'
  | 'Quadril'
  | 'BracoE'
  | 'BracoD'
  | 'CoxaE'
  | 'CoxaD'
  | 'AntebracoE'
  | 'AntebracoD'
  | 'Costas'
  | 'Abdomen'
  | 'PanturrilhaE'
  | 'PanturrilhaD';

// v0.1.2: Interface para Metas Detalhadas do Aluno
export type TipoMetricaMeta = 'Peso' | 'MedidaCorporal' | 'Performance' | '%Gordura' | 'TempoDistancia' | 'Outro';
export type StatusMeta = 'Ativa' | 'Alcancada' | 'NaoAlcancada' | 'Pausada';

// v0.1.2 (Parte 7): Histórico de atualização de meta
export interface HistoricoAtualizacaoMeta {
  id: string; // ID único para a entrada do histórico
  data: string; // YYYY-MM-DD ou YYYY-MM-DDTHH:mm
  valor: number;
  nota?: string;
}

export interface MetaDetalhada {
  id: string;
  descricao: string;
  tipoMetrica: TipoMetricaMeta;
  detalheMetrica?: string | DetalheMetricaMedidaCorporal; // e.g., 'Cintura', 'Supino 1RM'
  valorInicial: number;
  valorAtual: number;
  valorAlvo: number;
  unidade?: string; // e.g., 'kg', 'cm', 'min', 'reps'
  dataInicio: string; // YYYY-MM-DD
  dataAlvo?: string; // YYYY-MM-DD
  status: StatusMeta;
  historicoAtualizacoes?: HistoricoAtualizacaoMeta[];
}

// v0.1.2 (Parte 4): Define o tipo para o status de pagamento de um aluno (geral)
export type StatusPagamentoAluno = 'Em Dia' | 'Pendente' | 'Atrasado';

// v0.1.2 (Parte 8): Define o tipo para o status de um pagamento individual
export type StatusPagamentoOpcoes = 'Pago' | 'Pendente' | 'Atrasado';

// v0.1.2 (Parte 8): Interface para um Pagamento
export interface Pagamento {
  id: string;
  data: string; // YYYY-MM-DD - Data do pagamento ou da geração da cobrança
  valor: number;
  status: StatusPagamentoOpcoes;
  descricao?: string;
  dataVencimento?: string; // YYYY-MM-DD
  // v0.1.2 (Parte 10): Adicionar alunoId e alunoNome para facilitar relatórios
  alunoId?: string;
  alunoNome?: string;
}

// Define o tipo para um aluno na lista de consultoria
export interface AlunoConsultoria {
  id: string;
  iniciais: string;
  nome: string;
  dataConsultoria: string; // Formato DD/MM/YYYY para exibição
  progresso: number; // Percentual de 0 a 100
  corAvatar: string;
  status: StatusAluno; 
  fotoPerfil?: string | null; 
  telefone?: string;
  dataNascimento?: string; // Formato YYYY-MM-DD para input
  peso?: number; 
  altura?: number; // em cm
  observacoes?: string; 
  planosDeTreino: PlanoDeTreino[];
  historicoMedidas: MedidaCorporalEntry[];
  notasSessao: NotaSessao[];
  // v0.1.2: Novos campos
  contatoPrincipal?: string; // Telefone ou email principal
  objetivoPrincipal?: string; // Descrição do objetivo principal do aluno
  dataInicio?: string; // Formato YYYY-MM-DD, data que o aluno iniciou
  diario: DiarioEntry[];
  metasDetalhadas: MetaDetalhada[];
  // v0.1.2 (Parte 4): Novo campo de status de pagamento geral
  statusPagamento: StatusPagamentoAluno; // Removido '?' pois será calculado
  // v0.1.2 (Parte 8): Novo campo para histórico de pagamentos
  historicoPagamentos: Pagamento[];
  // v0.1.2 (Parte 22): Novo campo para histórico de dobras cutâneas
  historicoDobrasCutaneas: DobraCutaneaEntry[];
}

// v0.1.2 (Parte 3): Define o tipo para o status de uma pessoa na lista de espera
export type StatusListaEspera = 'Pendente' | 'Contatado' | 'Convertido' | 'Descartado';

// Define o tipo para uma pessoa na lista de espera (v0.0.6)
export interface PessoaListaEspera {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
  dataInclusao: string; // Data ISO de quando foi adicionado
  observacao?: string;
  status: StatusListaEspera; // v0.1.2 (Parte 3)
}

// Define o tipo para dados de alunos cadastrados
export interface DadosAlunosCadastrados {
  ativos: number;
  expirados: number;
  bloqueados: number;
  inativos: number; // v0.1.2
  pausados: number; // v0.1.2
  totalCapacidade: number;
}

// v0.0.9: Interface para Objetivos Personalizados (do Personal Trainer)
export interface Objetivo {
  id: string;
  nome: string;
  valorAtual: number;
  valorMeta: number;
  unidade?: string; // e.g., "clientes", "kg", "certificações"
}

// Define o tipo para dados de objetivos (legado, será substituído)
export interface DadosObjetivos {
  completos: number; 
  total: number;     
}

// v0.1.0: Interface para Perfil do Professor
export interface PerfilProfessor {
  id: string; 
  nome: string;
  iniciais: string;
  email?: string;
  plano: string; 
}

// v0.1.0: Interface para um aluno simplificado para agendamentos
export interface AlunoParaAgendamento {
  id: string;
  nome: string;
  corAvatar?: string; 
  iniciais?: string; 
}

// v0.1.0: Interface para Agendamentos
export type TipoAgendamento = 'Consulta' | 'Treino' | 'Avaliação' | 'Pessoal' | 'Outro';

// v0.1.2 (Parte 4): Define o tipo para o status de um agendamento
export type StatusAgendamento = 'Agendado' | 'Concluído' | 'Cancelado';

export interface Agendamento {
  id: string;
  titulo: string;
  data: string; // Formato YYYY-MM-DD
  horaInicio: string; // Formato HH:MM
  horaFim: string; // Formato HH:MM
  alunoId?: string | null; 
  alunoNome?: string; 
  tipo: TipoAgendamento;
  observacoes?: string;
  corEvento?: string; 
  status: StatusAgendamento; // v0.1.2 (Parte 4)
}

// v0.1.2 (Parte 5): Tipos para Modelos de Treino
export interface ExercicioModelo {
  id: string; // ID único dentro do modelo
  nome: string;
  series: string;
  repeticoes: string;
  tempoDescanso?: string;
  observacoes?: string;
}

export type CategoriaModeloTreino = 'Hipertrofia' | 'Força' | 'Resistência' | 'Cardio' | 'Mobilidade' | 'Outro';

export interface ModeloDeTreino {
  id: string; // ID único global para o modelo
  nome: string;
  dificuldade: DificuldadePlanoTreino;
  categoria: CategoriaModeloTreino;
  exercicios: ExercicioModelo[];
  notasModelo?: string;
}

// v0.1.2 (Parte 9): Interface para dados do Painel Financeiro
export interface PainelFinanceiroKPIs {
  receitaRealizadaMes: number;
  pendenteMes: number;
  atrasadoGeral: number;
  novosPagamentosHojeValor: number;
  novosPagamentosHojeQtd: number;
}
export interface PainelFinanceiroChartData {
  name: string; // e.g., 'Mês Atual'
  Realizada: number;
  Pendente: number;
}
export interface PainelFinanceiroData {
  kpis: PainelFinanceiroKPIs;
  chartData: PainelFinanceiroChartData[];
}

// v0.1.2 (Parte 10): Tipos para Relatório Financeiro
export type TipoPeriodoRelatorio = 
  | 'mesAtual' 
  | 'trimestreAtual' 
  | 'anoAtual' 
  | 'ultimos30dias' 
  | 'ultimos90dias' 
  | 'personalizado';

export interface RelatorioFinanceiroFiltros {
  periodo: TipoPeriodoRelatorio;
  dataInicioPersonalizada?: string; // YYYY-MM-DD
  dataFimPersonalizada?: string; // YYYY-MM-DD
}

export interface RelatorioFinanceiroKPIs {
  receitaRealizadaPeriodo: number;
  receitaPrevistaPeriodo: number;
  totalAtrasadoPeriodo: number;
  taxaInadimplenciaPeriodo: number; // Em percentual
}

export interface TransacaoRelatorio extends Pagamento {
  // Herda de Pagamento e pode adicionar campos específicos do relatório se necessário
}

export interface DadosRelatorioFinanceiro {
  filtros: RelatorioFinanceiroFiltros;
  kpis: RelatorioFinanceiroKPIs;
  transacoes: TransacaoRelatorio[];
  // v0.1.2 (Parte 18): Dados para gráfico e ranking
  evolucaoReceitaData?: { dataLabel: string; Realizada: number; Prevista: number; }[];
  rankingAlunosReceita?: { alunoId?: string; alunoNome?: string; receitaTotal: number; }[];
}

// v0.1.2 (Parte 11): Tipos para Biblioteca de Exercícios
export type GrupoMuscular = 
  | 'Peito' | 'Costas' | 'Ombros' | 'Bíceps' | 'Tríceps' | 'Antebraço' 
  | 'Pernas (Quadríceps)' | 'Pernas (Posteriores)' | 'Pernas (Panturrilhas)' 
  | 'Glúteos' | 'Abdômen' | 'Cardio' | 'Corpo Inteiro' | 'Outro';

export interface ExercicioBiblioteca {
  id: string;
  nome: string;
  descricao?: string;
  grupoMuscularPrincipal: GrupoMuscular;
  gruposMuscularesSecundarios?: GrupoMuscular[];
  linkVideo?: string; // URL para vídeo de demonstração
  linkImagem?: string; // URL para imagem
}

// v0.1.2 (Parte 13): Tipos para Templates de Comunicação
export type TipoMensagemTemplate = 'Email' | 'WhatsApp';

export interface TemplateComunicacao {
  id: string;
  nome: string;
  tipo: TipoMensagemTemplate;
  conteudo: string; // Inclui placeholders como {nomeAluno}
}

export interface ContextoMensagemRapida {
  aluno?: AlunoConsultoria;
  agendamento?: Agendamento;
  // Adicionar outros contextos conforme necessário
}

// v0.1.2 (Parte 14): Tipos para Relatório de Engajamento
export interface RelatorioEngajamentoFiltros {
  periodo: TipoPeriodoRelatorio;
  dataInicioPersonalizada?: string;
  dataFimPersonalizada?: string;
  statusAluno: StatusAluno | '';
}

export interface RelatorioEngajamentoKPIs {
  mediaTreinosConcluidosPorAluno: number;
  mediaAtualizacoesProgressoPorAluno: number;
  totalAlunosAtivosConsiderados: number;
  tempoMedioPermanencia?: string; // v0.1.2 (Parte 21) - Formato: "X meses Y dias" ou "N/A"
}

export interface AtividadeTreinoConcluido {
  id: string; // ID do agendamento
  data: string; // Data da conclusão (do agendamento)
  alunoNome: string;
  alunoId: string;
  tituloTreino: string; // Título do agendamento
}

export interface AtividadeMedidaRegistrada {
  id: string; // ID da MedidaCorporalEntry
  data: string;
  alunoNome: string;
  alunoId: string;
  resumoMedida: string; // Ex: "Peso: 70kg, Cintura: 80cm"
}

export interface AtividadeDiarioRegistrada {
  id: string; // ID da DiarioEntry
  data: string;
  alunoNome: string;
  alunoId: string;
  tipoDiario: TipoDiarioEntry;
  tituloDiario?: string;
  conteudo: string; // Adicionado para corrigir erro
}

export interface DadosRelatorioEngajamento {
  filtros: RelatorioEngajamentoFiltros;
  kpis: RelatorioEngajamentoKPIs;
  treinosConcluidos: AtividadeTreinoConcluido[];
  medidasRegistradas: AtividadeMedidaRegistrada[];
  diarioRegistrados: AtividadeDiarioRegistrada[];
}


// Define os tipos de modais/views que podem ser abertos/exibidos
export type TipoModalOuView = 
  | 'patchNotes' 
  | 'minhaContaModal' 
  | 'verListaEspera' 
  | 'adicionarAluno' 
  | 'perfilAluno' 
  | 'confirmarNovaNota'
  | 'studentDetailView' 
  | 'objetivo' 
  | 'agendaView' 
  | 'agendamentoModal' 
  | 'confirmarAcaoAgenda'
  | 'gerenciarModelosTreino'
  | 'modeloTreinoForm'
  | 'relatorioFinanceiro'
  | 'gerenciarBibliotecaExercicios'
  | 'exercicioBibliotecaForm'
  | 'visualizarExercicioBiblioteca'
  | 'gerenciarTemplatesComunicacao' 
  | 'templateComunicacaoForm'      
  | 'mensagemRapida'                 
  | 'relatorioEngajamento' // v0.1.2 (Parte 14), este modal ainda não está sendo renderizado em App.tsx
  | 'relatorioPopularidadeExercicios' // v0.1.2 (Parte 15)
  | null;

// v0.0.9: Interface para Mensagens Toast
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  onClick?: () => void;      // v0.1.2 (Parte 16): Ação ao clicar no Toast
  onClickLabel?: string; // v0.1.2 (Parte 16): Texto para o botão/link de ação do Toast
}

// v0.1.2 (Parte 4): Interface para modal de confirmação genérico
export interface ConfirmacaoAcaoModalProps {
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  textoBotaoConfirmar?: string;
  corBotaoConfirmar?: string; // e.g., 'bg-red-600 hover:bg-red-700'
}

// v0.1.2 (Parte 8): Tipo para IDs de sub-entidades do aluno, usado em getProximoId
export type SubEntidadeIdTipo = 
  | 'plano' 
  | 'exercicio' 
  | 'medida' 
  | 'nota' 
  | 'diarioEntry' 
  | 'metaDetalhada' 
  | 'historicoMeta'
  | 'pagamento'
  // | 'templateComunicacao' // Removido - templateComunicacao IDs são globais
  | 'dobraCutanea'; // v0.1.2 (Parte 22)
  
// Define o tipo para a função addToast no Context
export type AddToastFunction = (
  message: string, 
  type?: ToastType,
  onClick?: () => void,      // v0.1.2 (Parte 16): Ação ao clicar no Toast
  onClickLabel?: string  // v0.1.2 (Parte 16): Texto para o botão/link de ação
) => void;