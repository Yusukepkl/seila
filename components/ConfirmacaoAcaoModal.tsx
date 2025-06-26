// components/ConfirmacaoAcaoModal.tsx
import React from 'react';
import Modal from './Modal';
import { ConfirmacaoAcaoModalProps as ModalContentProps } from '../types'; // Renomeado para evitar conflito

interface ConfirmacaoAcaoModalComponentProps extends ModalContentProps {
  visivel: boolean;
}

const ConfirmacaoAcaoModal: React.FC<ConfirmacaoAcaoModalComponentProps> = ({
  visivel,
  titulo,
  mensagem,
  onConfirmar,
  onCancelar,
  textoBotaoConfirmar = "Confirmar",
  corBotaoConfirmar = "bg-red-600 hover:bg-red-700",
}) => {
  if (!visivel) return null;

  return (
    <Modal titulo={titulo} visivel={visivel} aoFechar={onCancelar} largura="max-w-md">
      <div className="space-y-4">
        <p className="text-sm text-slate-300">{mensagem}</p>
        <div className="flex justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className={`px-4 py-2 text-sm font-medium text-white ${corBotaoConfirmar} rounded-md transition-colors`}
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmacaoAcaoModal;