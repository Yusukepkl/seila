
// components/DiarioEntryForm.tsx
import React, { useState, useEffect } from 'react';
import { DiarioEntry, ToastType } from '../types';
import { TIPOS_DIARIO_ENTRY_OPCOES } from '../constants';

interface DiarioEntryFormProps {
  entryInitial?: DiarioEntry | null;
  onSubmit: (entry: DiarioEntry) => void;
  onCancel: () => void;
  getProximoIdDiarioEntry: () => Promise<string>;
  addToast: (message: string, type?: ToastType) => void;
}

const DiarioEntryForm: React.FC<DiarioEntryFormProps> = ({
  entryInitial,
  onSubmit,
  onCancel,
  getProximoIdDiarioEntry,
  addToast,
}) => {
  const [data, setData] = useState('');
  const [tipo, setTipo] = useState<DiarioEntry['tipo']>('Observacao');
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');

  useEffect(() => {
    if (entryInitial) {
      setData(entryInitial.data); // Espera-se YYYY-MM-DDTHH:mm
      setTipo(entryInitial.tipo);
      setTitulo(entryInitial.titulo || '');
      setConteudo(entryInitial.conteudo);
    } else {
      // Valor padrão para nova entrada: data e hora atuais
      const agora = new Date();
      // Formato para datetime-local input: YYYY-MM-DDTHH:MM
      const offset = agora.getTimezoneOffset();
      const agoraLocal = new Date(agora.getTime() - (offset*60*1000));
      setData(agoraLocal.toISOString().slice(0,16));

      setTipo('Observacao');
      setTitulo('');
      setConteudo('');
    }
  }, [entryInitial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !conteudo.trim()) {
      addToast('Data/Hora e Conteúdo são obrigatórios para a entrada do diário.', 'error');
      return;
    }
    const finalId = entryInitial?.id || await getProximoIdDiarioEntry();
    onSubmit({
      id: finalId,
      data, // Deve ser YYYY-MM-DDTHH:mm
      tipo,
      titulo: titulo.trim() || undefined,
      conteudo: conteudo.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-700 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold text-white">
        {entryInitial ? 'Editar Entrada do Diário' : 'Nova Entrada no Diário'}
      </h3>
      <div>
        <label htmlFor="diarioData" className="block text-sm font-medium text-slate-300 mb-1">Data e Hora *</label>
        <input
          type="datetime-local"
          id="diarioData"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
          className="w-full input-base"
        />
      </div>
      <div>
        <label htmlFor="diarioTipo" className="block text-sm font-medium text-slate-300 mb-1">Tipo de Registro *</label>
        <select
          id="diarioTipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as DiarioEntry['tipo'])}
          required
          className="w-full input-base"
        >
          {TIPOS_DIARIO_ENTRY_OPCOES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="diarioTitulo" className="block text-sm font-medium text-slate-300 mb-1">Título (Opcional)</label>
        <input
          type="text"
          id="diarioTitulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full input-base"
          placeholder="Ex: Feedback da sessão de pernas"
        />
      </div>
      <div>
        <label htmlFor="diarioConteudo" className="block text-sm font-medium text-slate-300 mb-1">Conteúdo *</label>
        <textarea
          id="diarioConteudo"
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          rows={5}
          required
          className="w-full input-base"
          placeholder="Descreva o feedback, observações, treino realizado, etc."
        />
      </div>
      <div className="flex justify-end space-x-2 pt-3">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button type="submit" className="btn-primary">Salvar Entrada</button>
      </div>
    </form>
  );
};

export default DiarioEntryForm;
