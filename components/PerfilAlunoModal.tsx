// components/PerfilAlunoModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { AlunoConsultoria, StatusAluno, ToastType } from '../types';
import { IconeEditar, IconeLixeira, IconeFechar, IconeSpinner } from './icons'; 
import { CORES_STATUS_ALUNO } from '../constants';


interface PerfilAlunoModalProps {
  visivel: boolean;
  aluno: AlunoConsultoria;
  aoFechar: () => void;
  aoSalvarEdicao: (alunoEditado: AlunoConsultoria) => void;
  aoExcluirAluno: (alunoId: string) => void;
  addToast: (message: string, type?: ToastType) => void;
}

const formatarDataParaInput = (dataDDMMYYYY?: string): string => {
  if (!dataDDMMYYYY) return '';
  const partesIso = dataDDMMYYYY.split('-');
  if (partesIso.length === 3 && partesIso[0].length === 4) {
      return dataDDMMYYYY;
  }
  const partes = dataDDMMYYYY.split('/');
  if (partes.length === 3) {
    return `${partes[2]}-${partes[1]}-${partes[0]}`; 
  }
  return '';
};

const formatarDataParaExibicao = (dataInput?: string): string => { 
  if (!dataInput) return 'Não informada';
  let partes = dataInput.split('-'); 
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`; 
  }
  partes = dataInput.split('/'); 
  if (partes.length === 3 && partes[2].length === 4) {
      return dataInput; 
  }
  return dataInput; 
};

const calcularIdade = (dataNascimento?: string): string => {
    if (!dataNascimento) return 'N/A';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    if (isNaN(nascimento.getTime())) return 'Inválida';

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade >= 0 ? `${idade} anos` : 'Inválida';
};


const PerfilAlunoModal: React.FC<PerfilAlunoModalProps> = ({
  visivel,
  aluno,
  aoFechar,
  aoSalvarEdicao,
  aoExcluirAluno,
  addToast,
}) => {
  const [modoEdicao, setModoEdicao] = useState(false);
  
  const [nomeEdit, setNomeEdit] = useState('');
  const [iniciaisEdit, setIniciaisEdit] = useState('');
  const [dataConsultoriaEdit, setDataConsultoriaEdit] = useState('');
  const [progressoEdit, setProgressoEdit] = useState(0);
  const [fotoPerfilEdit, setFotoPerfilEdit] = useState<string | null | undefined>(null);
  const [telefoneEdit, setTelefoneEdit] = useState('');
  const [dataNascimentoEdit, setDataNascimentoEdit] = useState('');
  const [pesoEdit, setPesoEdit] = useState<number | ''>('');
  const [alturaEdit, setAlturaEdit] = useState<number | ''>('');
  const [observacoesEdit, setObservacoesEdit] = useState('');
  const [statusEdit, setStatusEdit] = useState<StatusAluno>('Ativo');
  const [contatoPrincipalEdit, setContatoPrincipalEdit] = useState('');
  const [objetivoPrincipalEdit, setObjetivoPrincipalEdit] = useState('');
  const [dataInicioEdit, setDataInicioEdit] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const [iniciaisManualmenteEditadas, setIniciaisManualmenteEditadas] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visivel && aluno) {
      setNomeEdit(aluno.nome);
      setIniciaisEdit(aluno.iniciais);
      setDataConsultoriaEdit(formatarDataParaInput(aluno.dataConsultoria));
      setProgressoEdit(aluno.progresso);
      setFotoPerfilEdit(aluno.fotoPerfil);
      setTelefoneEdit(aluno.telefone || '');
      setDataNascimentoEdit(aluno.dataNascimento || ''); 
      setPesoEdit(aluno.peso === undefined ? '' : aluno.peso);
      setAlturaEdit(aluno.altura === undefined ? '' : aluno.altura);
      setObservacoesEdit(aluno.observacoes || '');
      setStatusEdit(aluno.status || 'Ativo'); 
      setContatoPrincipalEdit(aluno.contatoPrincipal || '');
      setObjetivoPrincipalEdit(aluno.objetivoPrincipal || '');
      setDataInicioEdit(aluno.dataInicio || ''); 
      setModoEdicao(false);
      setIniciaisManualmenteEditadas(false);
      setIsLoading(false);
    }
  }, [aluno, visivel]);

  const derivarIniciais = (nomeCompleto: string): string => {
    if (!nomeCompleto.trim()) return '';
    const partes = nomeCompleto.trim().split(/\s+/).filter(p => p.length > 0);
    if (partes.length === 0) return '';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + (partes[partes.length - 1][0] || '')).toUpperCase();
  };

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novoNome = e.target.value;
    setNomeEdit(novoNome);
    if (!iniciaisManualmenteEditadas) setIniciaisEdit(derivarIniciais(novoNome));
  };
  
  const handleIniciaisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIniciaisEdit(e.target.value.toUpperCase().substring(0,2));
    setIniciaisManualmenteEditadas(true); 
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPerfilEdit(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverFoto = () => setFotoPerfilEdit(null);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (nomeEdit.trim() && iniciaisEdit.trim() && dataConsultoriaEdit) {
      setIsLoading(true);
      const alunoEditado: AlunoConsultoria = {
        ...aluno,
        nome: nomeEdit.trim(),
        iniciais: iniciaisEdit.trim().toUpperCase(),
        dataConsultoria: formatarDataParaExibicao(dataConsultoriaEdit), 
        progresso: Number(progressoEdit),
        status: statusEdit, 
        fotoPerfil: fotoPerfilEdit,
        telefone: telefoneEdit.trim() || undefined, 
        dataNascimento: dataNascimentoEdit.trim() || undefined, 
        peso: pesoEdit === '' ? undefined : Number(pesoEdit),
        altura: alturaEdit === '' ? undefined : Number(alturaEdit),
        observacoes: observacoesEdit.trim() || undefined,
        contatoPrincipal: contatoPrincipalEdit.trim() || undefined,
        objetivoPrincipal: objetivoPrincipalEdit.trim() || undefined,
        dataInicio: dataInicioEdit.trim() || undefined,
      };
      aoSalvarEdicao(alunoEditado);
      // O App.tsx vai fechar o modal e mostrar o toast.
      // setIsLoading(false); // O App.tsx cuida de fechar o modal, o que reseta o estado.
      // setModoEdicao(false); //Também resetado pelo App.tsx ao fechar/reabrir.
    } else {
      addToast("Nome, Iniciais e Data da Consultoria são obrigatórios.", "error");
      setIsLoading(false);
    }
  };

  const handleExcluir = () => {
    if (window.confirm(`Tem certeza que deseja excluir o perfil de ${aluno.nome}? Esta ação não pode ser desfeita.`)) {
      aoExcluirAluno(aluno.id);
    }
  };
  
  const inputBaseClasses = "w-full bg-slate-600 border border-slate-500 text-slate-200 placeholder-slate-400 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500";
  const btnPrimaryClasses = "px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-70";
  const btnSecondaryClasses = "px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors disabled:opacity-70";
  const btnDangerClasses = "px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-70";


  if (!visivel || !aluno) return null;

  return (
    <Modal titulo={modoEdicao ? `Editar Perfil de ${aluno.nome}` : `Perfil de ${aluno.nome}`} visivel={visivel} aoFechar={aoFechar} largura="max-w-2xl">
        <style>{`
            .input-base { @apply ${inputBaseClasses}; }
            .btn-primary { @apply ${btnPrimaryClasses}; }
            .btn-secondary { @apply ${btnSecondaryClasses}; }
            .btn-danger { @apply ${btnDangerClasses}; }
        `}</style>
      {!modoEdicao ? (
        // MODO VISUALIZAÇÃO
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {fotoPerfilEdit ? (
                <img src={fotoPerfilEdit} alt={`Foto de ${nomeEdit}`} className="w-28 h-28 rounded-full object-cover border-2 border-slate-500" />
            ) : (
                <div className={`w-28 h-28 rounded-full ${aluno.corAvatar} flex items-center justify-center text-white text-4xl font-semibold border-2 border-slate-500`}>
                {iniciaisEdit}
                </div>
            )}
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-2xl font-semibold text-white">{nomeEdit}</h3>
              <p className="text-sm text-slate-400">Consultoria desde: {formatarDataParaExibicao(dataConsultoriaEdit)}</p>
              <p className="text-sm text-slate-400">Progresso: {progressoEdit}%</p>
              <span className={`mt-1 inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${CORES_STATUS_ALUNO[statusEdit]?.bg || 'bg-slate-500/20'} ${CORES_STATUS_ALUNO[statusEdit]?.text || 'text-slate-300'}`}>
                Status: {statusEdit}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm pt-3 border-t border-slate-700">
            <p><strong className="text-slate-400">Telefone:</strong> {telefoneEdit || 'Não informado'}</p>
            <p><strong className="text-slate-400">Data de Nascimento:</strong> {dataNascimentoEdit ? `${formatarDataParaExibicao(dataNascimentoEdit)} (${calcularIdade(dataNascimentoEdit)})` : 'Não informada'}</p>
            <p><strong className="text-slate-400">Peso Atual:</strong> {pesoEdit !== '' ? `${pesoEdit} kg` : 'Não informado'}</p>
            <p><strong className="text-slate-400">Altura:</strong> {alturaEdit !== '' ? `${alturaEdit} cm` : 'Não informada'}</p>
            <p className="md:col-span-2"><strong className="text-slate-400">Contato Principal:</strong> {contatoPrincipalEdit || 'Não informado'}</p>
            <p className="md:col-span-2"><strong className="text-slate-400">Objetivo Principal:</strong> {objetivoPrincipalEdit || 'Não informado'}</p>
             <p className="md:col-span-2"><strong className="text-slate-400">Data de Início (Aluno):</strong> {dataInicioEdit ? formatarDataParaExibicao(dataInicioEdit) : 'Não informada'}</p>
          </div>

          {observacoesEdit && (
            <div className="pt-2 border-t border-slate-700/50">
                <p className="text-sm font-semibold text-slate-400 mb-1">Observações:</p>
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{observacoesEdit}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button onClick={handleExcluir} className="btn-danger flex items-center justify-center order-last sm:order-first">
                <IconeLixeira className="w-4 h-4 mr-2"/> Excluir Aluno
            </button>
            <button onClick={() => setModoEdicao(true)} className="btn-primary flex items-center justify-center">
                <IconeEditar className="w-4 h-4 mr-2"/> Editar Perfil
            </button>
          </div>
        </div>
      ) : (
        // MODO EDIÇÃO
        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
             {fotoPerfilEdit ? (
                <img src={fotoPerfilEdit} alt={`Preview de ${nomeEdit}`} className="w-24 h-24 rounded-full object-cover border-2 border-slate-500" />
            ) : (
                <div className={`w-24 h-24 rounded-full ${aluno.corAvatar} flex items-center justify-center text-white text-3xl font-semibold border-2 border-slate-500`}>
                {iniciaisEdit || '??'}
                </div>
            )}
            <div className="flex space-x-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-xs px-3 py-1">Carregar Foto</button>
                {fotoPerfilEdit && <button type="button" onClick={handleRemoverFoto} className="text-red-400 hover:text-red-300 text-xs px-3 py-1 border border-red-500/50 rounded-md">Remover Foto</button>}
            </div>
            <input type="file" accept="image/*" onChange={handleFotoChange} ref={fileInputRef} className="hidden" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="nomeAlunoEdit" className="block text-xs font-medium text-slate-400 mb-1">Nome Completo *</label>
                <input type="text" id="nomeAlunoEdit" value={nomeEdit} onChange={handleNomeChange} required className="input-base" disabled={isLoading} />
            </div>
             <div>
                <label htmlFor="iniciaisAlunoEdit" className="block text-xs font-medium text-slate-400 mb-1">Iniciais (2 letras) *</label>
                <input type="text" id="iniciaisAlunoEdit" value={iniciaisEdit} onChange={handleIniciaisChange} maxLength={2} required pattern="[A-Za-zÀ-ú]{1,2}" className="input-base" disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="dataConsultoriaEdit" className="block text-xs font-medium text-slate-400 mb-1">Data da Consultoria *</label>
                <input type="date" id="dataConsultoriaEdit" value={dataConsultoriaEdit} onChange={(e) => setDataConsultoriaEdit(e.target.value)} required className="input-base appearance-none" disabled={isLoading}/>
            </div>
            <div>
                <label htmlFor="progressoEdit" className="block text-xs font-medium text-slate-400 mb-1">Progresso (%) *</label>
                <input type="number" id="progressoEdit" value={progressoEdit} onChange={(e) => setProgressoEdit(Number(e.target.value))} min="0" max="100" required className="input-base" disabled={isLoading}/>
            </div>
             <div>
                <label htmlFor="statusEdit" className="block text-xs font-medium text-slate-400 mb-1">Status do Aluno *</label>
                <select id="statusEdit" value={statusEdit} onChange={e => setStatusEdit(e.target.value as StatusAluno)} required className="input-base" disabled={isLoading}>
                    {Object.keys(CORES_STATUS_ALUNO).map(statusKey => (
                        <option key={statusKey} value={statusKey}>{statusKey}</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="telefoneEdit" className="block text-xs font-medium text-slate-400 mb-1">Telefone</label>
                <input type="tel" id="telefoneEdit" value={telefoneEdit} onChange={e => setTelefoneEdit(e.target.value)} className="input-base" disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="dataNascimentoEdit" className="block text-xs font-medium text-slate-400 mb-1">Data de Nascimento</label>
                <input type="date" id="dataNascimentoEdit" value={dataNascimentoEdit} onChange={e => setDataNascimentoEdit(e.target.value)} className="input-base appearance-none" disabled={isLoading} />
            </div>
             <div>
                <label htmlFor="pesoEdit" className="block text-xs font-medium text-slate-400 mb-1">Peso (kg)</label>
                <input type="number" id="pesoEdit" value={pesoEdit} onChange={e => setPesoEdit(e.target.value === '' ? '' : Number(e.target.value))} step="0.1" className="input-base" disabled={isLoading} />
            </div>
             <div>
                <label htmlFor="alturaEdit" className="block text-xs font-medium text-slate-400 mb-1">Altura (cm)</label>
                <input type="number" id="alturaEdit" value={alturaEdit} onChange={e => setAlturaEdit(e.target.value === '' ? '' : Number(e.target.value))} step="1" className="input-base" disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="dataInicioEdit" className="block text-xs font-medium text-slate-400 mb-1">Data de Início (Aluno)</label>
                <input type="date" id="dataInicioEdit" value={dataInicioEdit} onChange={e => setDataInicioEdit(e.target.value)} className="input-base appearance-none" disabled={isLoading} />
            </div>
          </div>
           <div className="md:col-span-2">
                <label htmlFor="contatoPrincipalEdit" className="block text-xs font-medium text-slate-400 mb-1">Contato Principal</label>
                <input type="text" id="contatoPrincipalEdit" value={contatoPrincipalEdit} onChange={e => setContatoPrincipalEdit(e.target.value)} className="input-base" disabled={isLoading} />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="objetivoPrincipalEdit" className="block text-xs font-medium text-slate-400 mb-1">Objetivo Principal</label>
                <textarea id="objetivoPrincipalEdit" value={objetivoPrincipalEdit} onChange={e => setObjetivoPrincipalEdit(e.target.value)} rows={2} className="input-base" disabled={isLoading}></textarea>
            </div>
            <div>
              <label htmlFor="observacoesEdit" className="block text-xs font-medium text-slate-400 mb-1">Observações</label>
              <textarea id="observacoesEdit" value={observacoesEdit} onChange={e => setObservacoesEdit(e.target.value)} rows={3} className="input-base" disabled={isLoading}></textarea>
            </div>
            
          <div className="flex justify-end space-x-3 pt-3">
            <button type="button" onClick={() => setModoEdicao(false)} className="btn-secondary" disabled={isLoading}>Cancelar</button>
            <button type="submit" className="btn-primary flex items-center justify-center" disabled={isLoading}>
                {isLoading ? <><IconeSpinner className="w-4 h-4 mr-2"/> Salvando...</> : "Salvar Alterações"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PerfilAlunoModal;
