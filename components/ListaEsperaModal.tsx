// components/ListaEsperaModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { PessoaListaEspera, StatusListaEspera, ToastType } from '../types';
import { IconeEditar, IconeLixeira, IconeInfo } from './icons';
import { STATUS_LISTA_ESPERA_OPCOES, CORES_STATUS_LISTA_ESPERA } from '../constants';

// Ícone de Promover (ex: seta para cima ou check)
const IconePromoverAluno: React.FC<{className?: string, title?: string}> = ({ className, title }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role={title ? "img" : undefined} aria-label={title}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Ícone de Adicionar Pessoa (ex: user-plus)
const IconeAdicionarPessoa: React.FC<{className?: string, title?: string}> = ({ className, title }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" role={title ? "img" : undefined} aria-label={title}>
    {title && <title>{title}</title>}
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </svg>
);


interface ListaEsperaModalProps {
  visivel: boolean;
  aoFechar: () => void;
  listaEspera: PessoaListaEspera[];
  onAdicionarPessoa: (novaPessoa: Omit<PessoaListaEspera, 'id' | 'dataInclusao'>) => void;
  onEditarPessoa: (pessoaEditada: PessoaListaEspera) => void;
  onRemoverPessoa: (pessoaId: string) => void;
  onPromoverPessoa: (pessoa: PessoaListaEspera) => void;
  addToast: (message: string, type?: ToastType) => void;
}

type OrdemListaEspera = 'dataAsc' | 'dataDesc' | 'nomeAsc' | 'nomeDesc' | 'statusAsc' | 'statusDesc';

const ListaEsperaModal: React.FC<ListaEsperaModalProps> = ({
  visivel,
  aoFechar,
  listaEspera,
  onAdicionarPessoa,
  onEditarPessoa,
  onRemoverPessoa,
  onPromoverPessoa,
  addToast,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pessoaEditando, setPessoaEditando] = useState<PessoaListaEspera | null>(null);

  // Estados do formulário
  const [nomeForm, setNomeForm] = useState('');
  const [telefoneForm, setTelefoneForm] = useState('');
  const [emailForm, setEmailForm] = useState('');
  const [observacaoForm, setObservacaoForm] = useState('');
  const [statusForm, setStatusForm] = useState<StatusListaEspera>('Pendente'); // v0.1.2 (Parte 3)

  // v0.1.2 (Parte 3): Estados para filtro e ordenação
  const [filtroStatus, setFiltroStatus] = useState<StatusListaEspera | ''>('');
  const [ordem, setOrdem] = useState<OrdemListaEspera>('dataDesc'); // Mais recentes primeiro

  useEffect(() => {
    if (!visivel) {
      setMostrarFormulario(false);
      setPessoaEditando(null);
      resetFormulario();
      setFiltroStatus(''); // Resetar filtros ao fechar
      setOrdem('dataDesc');
    }
  }, [visivel]);

  const resetFormulario = () => {
    setNomeForm('');
    setTelefoneForm('');
    setEmailForm('');
    setObservacaoForm('');
    setStatusForm('Pendente');
  };

  const handleAbrirFormularioParaAdicionar = () => {
    setPessoaEditando(null);
    resetFormulario();
    setMostrarFormulario(true);
  };

  const handleAbrirFormularioParaEditar = (pessoa: PessoaListaEspera) => {
    setPessoaEditando(pessoa);
    setNomeForm(pessoa.nome);
    setTelefoneForm(pessoa.telefone || '');
    setEmailForm(pessoa.email || '');
    setObservacaoForm(pessoa.observacao || '');
    setStatusForm(pessoa.status || 'Pendente'); // v0.1.2 (Parte 3)
    setMostrarFormulario(true);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setPessoaEditando(null);
    resetFormulario();
  };

  const handleSubmitFormulario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeForm.trim()) {
      addToast("O nome é obrigatório.", "error");
      return;
    }
    const dadosPessoa = {
      nome: nomeForm.trim(),
      telefone: telefoneForm.trim() || undefined,
      email: emailForm.trim() || undefined,
      observacao: observacaoForm.trim() || undefined,
      status: statusForm, // v0.1.2 (Parte 3)
    };

    if (pessoaEditando) {
      onEditarPessoa({ ...pessoaEditando, ...dadosPessoa });
    } else {
      onAdicionarPessoa(dadosPessoa);
    }
    handleCancelarFormulario(); // Fecha o formulário e reseta
  };

  const handleRemover = (pessoa: PessoaListaEspera) => {
    if (window.confirm(`Tem certeza que deseja remover ${pessoa.nome} da lista de espera?`)) {
      onRemoverPessoa(pessoa.id);
    }
  };
  
  const handlePromover = (pessoa: PessoaListaEspera) => {
    if (pessoa.status === 'Convertido' || pessoa.status === 'Descartado') {
        addToast(`${pessoa.nome} já foi ${pessoa.status.toLowerCase()} e não pode ser promovido(a) novamente sem antes ajustar seu status.`, "warning");
        return;
    }
    if (window.confirm(`Tem certeza que deseja promover ${pessoa.nome} para a lista de alunos ativos? Ela será marcada como 'Convertido' na lista de espera.`)) {
      onPromoverPessoa(pessoa);
    }
  };

  // v0.1.2 (Parte 3): Lógica de filtragem e ordenação
  const listaFiltradaEOrdenada = useMemo(() => {
    let processada = [...listaEspera];

    if (filtroStatus) {
      processada = processada.filter(p => p.status === filtroStatus);
    }

    switch (ordem) {
      case 'dataAsc': processada.sort((a, b) => new Date(a.dataInclusao).getTime() - new Date(b.dataInclusao).getTime()); break;
      case 'dataDesc': processada.sort((a, b) => new Date(b.dataInclusao).getTime() - new Date(a.dataInclusao).getTime()); break;
      case 'nomeAsc': processada.sort((a, b) => a.nome.localeCompare(b.nome)); break;
      case 'nomeDesc': processada.sort((a, b) => b.nome.localeCompare(a.nome)); break;
      case 'statusAsc': processada.sort((a, b) => (a.status || '').localeCompare(b.status || '')); break;
      case 'statusDesc': processada.sort((a, b) => (b.status || '').localeCompare(a.status || '')); break;
      default: break;
    }
    return processada;
  }, [listaEspera, filtroStatus, ordem]);

  const ordemOptions: { value: OrdemListaEspera, label: string }[] = [
    { value: 'dataDesc', label: 'Mais Recentes' },
    { value: 'dataAsc', label: 'Mais Antigos' },
    { value: 'nomeAsc', label: 'Nome (A-Z)' },
    { value: 'nomeDesc', label: 'Nome (Z-A)' },
    { value: 'statusAsc', label: 'Status (A-Z)' },
    { value: 'statusDesc', label: 'Status (Z-A)' },
  ];
  
  const inputBaseSmClasses = "w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-1.5 text-xs focus:ring-indigo-500 focus:border-indigo-500";


  return (
    <Modal titulo="Lista de Espera" visivel={visivel} aoFechar={aoFechar} largura="max-w-3xl">
      <style>{`.input-base-sm { @apply ${inputBaseSmClasses}; }`}</style>
      {!mostrarFormulario ? (
        <>
          <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex gap-2 w-full sm:w-auto">
                <select 
                    value={filtroStatus} 
                    onChange={e => setFiltroStatus(e.target.value as StatusListaEspera | '')} 
                    className="input-base-sm flex-grow"
                    aria-label="Filtrar por status"
                >
                    <option value="">Todos Status</option>
                    {STATUS_LISTA_ESPERA_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select 
                    value={ordem} 
                    onChange={e => setOrdem(e.target.value as OrdemListaEspera)} 
                    className="input-base-sm flex-grow"
                    aria-label="Ordenar por"
                >
                    {ordemOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
            <button
              onClick={handleAbrirFormularioParaAdicionar}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-sm flex items-center w-full sm:w-auto"
              aria-label="Adicionar nova pessoa à lista de espera"
            >
              <IconeAdicionarPessoa className="w-4 h-4 mr-2" /> Adicionar à Lista
            </button>
          </div>

          {listaFiltradaEOrdenada.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
                <IconeInfo className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-semibold text-lg">
                    {filtroStatus ? 'Ninguém encontrado com este status.' : 'Sua lista de espera está vazia.'}
                </p>
                <p className="text-sm mt-1">
                    {filtroStatus ? 'Tente um filtro diferente ou adicione novas pessoas.' : 'Quando alguém demonstrar interesse, adicione aqui!'}
                </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {listaFiltradaEOrdenada.map((pessoa) => {
                const statusInfo = CORES_STATUS_LISTA_ESPERA[pessoa.status || 'Pendente'];
                return (
                    <div key={pessoa.id} className="bg-slate-700 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                        <h4 className="text-lg font-semibold text-white">{pessoa.nome}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border || 'border-transparent'}`}>
                                {pessoa.status}
                            </span>
                            <p className="text-xs text-slate-400">
                                Adicionado em: {new Date(pessoa.dataInclusao).toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                        </div>
                        <div className="flex space-x-2 items-center">
                        <button 
                            onClick={() => handlePromover(pessoa)} 
                            title="Promover a Aluno" 
                            className={`p-1.5 transition-colors ${pessoa.status === 'Convertido' || pessoa.status === 'Descartado' ? 'text-slate-500 cursor-not-allowed' : 'text-green-400 hover:text-green-300'}`}
                            disabled={pessoa.status === 'Convertido' || pessoa.status === 'Descartado'}
                        >
                            <IconePromoverAluno className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleAbrirFormularioParaEditar(pessoa)} title="Editar Detalhes" className="p-1.5 text-blue-400 hover:text-blue-300 transition-colors">
                            <IconeEditar className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRemover(pessoa)} title="Remover da Lista" className="p-1.5 text-red-400 hover:text-red-300 transition-colors">
                            <IconeLixeira className="w-5 h-5" />
                        </button>
                        </div>
                    </div>
                    {(pessoa.telefone || pessoa.email) && (
                        <div className="mt-2 text-sm text-slate-300">
                            {pessoa.telefone && <p>Telefone: {pessoa.telefone}</p>}
                            {pessoa.email && <p>Email: {pessoa.email}</p>}
                        </div>
                    )}
                    {pessoa.observacao && (
                        <div className="mt-2 pt-2 border-t border-slate-600">
                        <p className="text-xs text-slate-400 mb-0.5">Observações:</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{pessoa.observacao}</p>
                        </div>
                    )}
                    </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        // FORMULÁRIO DE ADIÇÃO/EDIÇÃO
        <form onSubmit={handleSubmitFormulario} className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-3">
            {pessoaEditando ? 'Editar Pessoa na Lista' : 'Adicionar Nova Pessoa à Lista'}
          </h3>
          <div>
            <label htmlFor="nomeListaEspera" className="block text-sm font-medium text-slate-300 mb-1">Nome Completo *</label>
            <input
              type="text" id="nomeListaEspera" value={nomeForm} onChange={(e) => setNomeForm(e.target.value)} required
              className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="telefoneListaEspera" className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
            <input
              type="tel" id="telefoneListaEspera" value={telefoneForm} onChange={(e) => setTelefoneForm(e.target.value)}
              className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="emailListaEspera" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email" id="emailListaEspera" value={emailForm} onChange={(e) => setEmailForm(e.target.value)}
              className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
           {/* v0.1.2 (Parte 3): Campo de Status */}
          <div>
            <label htmlFor="statusListaEspera" className="block text-sm font-medium text-slate-300 mb-1">Status *</label>
            <select
                id="statusListaEspera" value={statusForm}
                onChange={(e) => setStatusForm(e.target.value as StatusListaEspera)} required
                className="w-full bg-slate-600 border border-slate-500 text-slate-200 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
                {STATUS_LISTA_ESPERA_OPCOES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="observacaoListaEspera" className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
            <textarea
              id="observacaoListaEspera" value={observacaoForm} onChange={(e) => setObservacaoForm(e.target.value)} rows={3}
              className="w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={handleCancelarFormulario} className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors">
              {pessoaEditando ? 'Salvar Alterações' : 'Adicionar à Lista'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ListaEsperaModal;
