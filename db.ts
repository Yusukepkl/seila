
// db.ts
import * as dexie from 'dexie'; // Changed import
import { 
    NotaAtualizacao, 
    AlunoConsultoria, 
    PessoaListaEspera, 
    Objetivo, 
    PerfilProfessor, 
    Agendamento, 
    ModeloDeTreino, 
    ExercicioBiblioteca, 
    TemplateComunicacao,
    SubEntidadeIdTipo
} from './types';

export interface AppState {
  key: string; // e.g., 'proximoIdAluno', 'proximaCorIndex', 'proximoIdPlanoTreino_alunoX'
  value: any;
}

export class GestorTrainerDB extends dexie.Dexie { // Changed to dexie.Dexie
  notasDeAtualizacao!: dexie.Table<NotaAtualizacao, string>; // Changed to dexie.Table
  alunosConsultoria!: dexie.Table<AlunoConsultoria, string>; // Changed to dexie.Table
  listaEspera!: dexie.Table<PessoaListaEspera, string>; // Changed to dexie.Table
  objetivos!: dexie.Table<Objetivo, string>; // Changed to dexie.Table
  perfilProfessor!: dexie.Table<PerfilProfessor, string>; // Changed to dexie.Table
  agendamentos!: dexie.Table<Agendamento, string>; // Changed to dexie.Table
  modelosDeTreino!: dexie.Table<ModeloDeTreino, string>; // Changed to dexie.Table
  exerciciosBiblioteca!: dexie.Table<ExercicioBiblioteca, string>; // Changed to dexie.Table
  templatesComunicacao!: dexie.Table<TemplateComunicacao, string>; // Changed to dexie.Table
  appState!: dexie.Table<AppState, string>; // Changed to dexie.Table

  constructor() {
    super('GestorTrainerDB');
    this.version(1).stores({
      notasDeAtualizacao: 'versao, data', // 'versao' is primary key
      alunosConsultoria: 'id, nome, status, objetivoPrincipal, dataInicio', // 'id' is primary key
      listaEspera: 'id, nome, status, dataInclusao', // 'id' is primary key
      objetivos: 'id, nome', // 'id' is primary key
      perfilProfessor: 'id', // 'id' is primary key
      agendamentos: 'id, data, alunoId, status', // 'id' is primary key, index on 'data', 'alunoId', 'status'
      modelosDeTreino: 'id, nome, dificuldade, categoria', // 'id' is primary key
      exerciciosBiblioteca: 'id, nome, grupoMuscularPrincipal', // 'id' is primary key
      templatesComunicacao: 'id, nome, tipo', // 'id' is primary key
      appState: 'key', // 'key' is primary key
    });
  }
}

export const db = new GestorTrainerDB();

// Helper functions for counters using appState table
export async function getNextId(key: string, initialValue: number = 1): Promise<string> {
    const appStateEntry = await db.appState.get(key);
    let nextIdValue = initialValue;
    if (appStateEntry) {
        nextIdValue = Number(appStateEntry.value) + 1;
    }
    await db.appState.put({ key, value: nextIdValue });
    // Use a more specific prefix derived from the key itself, or a generic prefix if needed.
    // For example, 'aluno-1', 'le-1', 'obj-1', etc.
    const prefix = key.replace('proximoId', '').toLowerCase();
    return `${prefix}-${nextIdValue}`;
}


export async function getNextNumericId(key: string, initialValue: number = 1): Promise<number> {
    const appStateEntry = await db.appState.get(key);
    let nextIdValue = initialValue;
    if (appStateEntry) {
        nextIdValue = Number(appStateEntry.value) + 1;
    }
    await db.appState.put({ key, value: nextIdValue });
    return nextIdValue;
}

export async function getNextAlunoId(): Promise<string> {
    return getNextId('aluno');
}
export async function getNextListaEsperaId(): Promise<string> {
    return getNextId('le');
}
export async function getNextObjetivoId(): Promise<string> {
    return getNextId('obj');
}
export async function getNextAgendamentoId(): Promise<string> {
    return getNextId('ag');
}
export async function getNextModeloTreinoId(): Promise<string> {
    return getNextId('mod');
}
export async function getNextExercicioModeloId(): Promise<string> {
    return getNextId('modex');
}
export async function getNextExercicioBibliotecaId(): Promise<string> {
    return getNextId('exlib');
}
export async function getNextTemplateComunicacaoId(): Promise<string> {
    return getNextId('tplcom');
}


// For sub-entities that are specific to an aluno, their IDs might be managed differently or kept simple.
// The provided getProximoIdSubEntidade was complex. With Dexie, if sub-entities are part of Aluno object,
// their IDs only need to be unique within that Aluno object. A simple counter or UUID can be used.
// For now, let's adapt the existing getProximoIdSubEntidade to use Dexie for its counters.

const subEntityCounterKeys: Record<SubEntidadeIdTipo, string> = {
    plano: 'proximoIdPlano',
    exercicio: 'proximoIdExercicioPlano', // Renamed for clarity as it's per plan within an aluno
    medida: 'proximoIdMedida',
    nota: 'proximoIdNotaSessao',
    diarioEntry: 'proximoIdDiarioEntry',
    metaDetalhada: 'proximoIdMetaDetalhada',
    historicoMeta: 'proximoIdHistoricoMeta',
    pagamento: 'proximoIdPagamento',
    dobraCutanea: 'proximoIdDobraCutanea',
    // 'templateComunicacao' was removed from SubEntidadeIdTipo as it's global
};

export async function getProximoIdSubEntidadeDexie(tipo: SubEntidadeIdTipo, alunoId?: string): Promise<string> {
    const counterKeyBase = subEntityCounterKeys[tipo];
    if (!counterKeyBase) throw new Error(`Tipo de sub-entidade desconhecido: ${tipo}`);
    
    const counterKey = alunoId ? `${counterKeyBase}_aluno${alunoId}` : counterKeyBase;
    
    const nextNumericValue = await getNextNumericId(counterKey);

    const prefixMap: Record<SubEntidadeIdTipo, string> = {
        plano: 'pl', exercicio: 'ex', medida: 'md', nota: 'nt', diarioEntry: 'de',
        metaDetalhada: 'mt', historicoMeta: 'hm', pagamento: 'pg', dobraCutanea: 'dc',
    };
    const prefix = prefixMap[tipo] || 'sub';
    
    return `${prefix}-${alunoId ? `${alunoId}-` : ''}${nextNumericValue}`;
}


export async function getNextAvatarCorIndex(): Promise<number> {
    const key = 'proximaCorIndex';
    const entry = await db.appState.get(key);
    let currentIndex = 0;
    if (entry) {
        currentIndex = Number(entry.value);
    }
    const nextIndex = currentIndex + 1;
    await db.appState.put({ key, value: nextIndex });
    return currentIndex; // Return the current index before incrementing for use
}

// Initial data seeding function
export async function popularDadosIniciais() {
  const initialAppStateCounters: AppState[] = [
    { key: 'aluno', value: 0 },
    { key: 'proximaCorIndex', value: 0 },
    { key: 'le', value: 0 },
    { key: 'obj', value: 0 },
    { key: 'ag', value: 0 },
    { key: 'mod', value: 0 },
    { key: 'modex', value: 0 },
    { key: 'exlib', value: 0 },
    { key: 'tplcom', value: 0 },
    // Add other sub-entity counters here if they are global
    // This will create global counters for sub-entities, 
    // and getProximoIdSubEntidadeDexie will create aluno-specific ones if alunoId is passed.
    ...(Object.values(subEntityCounterKeys) as string[]).map(subKey => ({ key: subKey, value: 0 }))
  ];

  // Batch operations for seeding
  await db.transaction('rw', db.notasDeAtualizacao, db.perfilProfessor, db.appState, async () => {
    if (await db.notasDeAtualizacao.count() === 0) {
      await db.notasDeAtualizacao.bulkAdd(NOTAS_ATUALIZACAO_INICIAIS_DEXIE);
    }
    if (await db.perfilProfessor.count() === 0) {
      await db.perfilProfessor.add(PERFIL_PROFESSOR_MOCK_INICIAL_DEXIE);
    }
    // Check if appState has any counters, if not, add all.
    // This is a simpler check than checking each key.
    if (await db.appState.count() === 0) { 
        await db.appState.bulkAdd(initialAppStateCounters);
    } else { // If some exist, ensure all expected global counters are there
        for (const counter of initialAppStateCounters) {
            if (!(await db.appState.get(counter.key))) {
                await db.appState.add(counter);
            }
        }
    }
  });
}

// Mocks adapted for Dexie (e.g., if primary keys can't be auto-generated easily for some mocks)
export const NOTAS_ATUALIZACAO_INICIAIS_DEXIE: NotaAtualizacao[] = [
  // Patch notes with 'versao' as primary key
  { versao: 'v0.0.1', data: '2024-07-31', descricao: 'Lançamento inicial.' },
  // ... (add other initial patch notes if needed for seeding)
   { versao: 'v0.2.0', data: new Date().toISOString().split('T')[0], descricao: 'Grande Refatoração: Migração da persistência de dados de localStorage para IndexedDB usando Dexie.js. Isso melhora a capacidade de armazenamento, performance para grandes volumes de dados e prepara o app para funcionalidades offline mais robustas.'}
];

export const PERFIL_PROFESSOR_MOCK_INICIAL_DEXIE: PerfilProfessor = {
  id: 'professorUnico', // Fixed ID for singleton
  nome: 'Professor Trainer',
  iniciais: 'PT',
  email: 'professor@example.com',
  plano: 'Plano PRO',
};

// ALUNOS_CONSULTORIA_MOCK_INICIAL_DEXIE etc. would be needed if we seed them.
// For now, focusing on notas and perfil.
