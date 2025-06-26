// components/Toast.tsx
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { IconeCheckCircle, IconeInfo, IconeExclamationTriangle, IconeXCircle, IconeFechar } from './icons';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast.onClick) { // Only auto-dismiss non-interactive toasts
      const timer = setTimeout(() => {
        onDismiss(toast.id);
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.onClick, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <IconeCheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <IconeXCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <IconeExclamationTriangle className="w-6 h-6 text-yellow-500" />;
      case 'info':
      default: // Default to info icon
        return <IconeInfo className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'warning': return 'border-yellow-500';
      case 'info': 
      default: // Default to info border
        return 'border-blue-500';
    }
  };

  const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent any default form submission if toast is inside a form
    if (toast.onClick) {
      toast.onClick();
      onDismiss(toast.id); // Dismiss toast after action
    }
  };

  return (
    <div
      className={`bg-slate-700 text-white shadow-lg rounded-md p-4 mb-3 flex items-start w-full max-w-sm border-l-4 ${getBorderColor()} transition-all duration-300 ease-in-out transform`}
      role="alert"
      aria-live={toast.type === 'error' || toast.type === 'warning' ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      <div className="flex-grow text-sm">
        <p>{toast.message}</p>
        {toast.onClick && toast.onClickLabel && (
          <button
            onClick={handleActionClick}
            className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline focus:outline-none focus:ring-1 focus:ring-indigo-300 rounded"
            aria-label={toast.onClickLabel}
          >
            {toast.onClickLabel}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-4 p-1 text-slate-400 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
        aria-label="Fechar notificação"
      >
        <IconeFechar className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;