// components/ToastContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage, ToastType, AddToastFunction } from '../types'; // Import AddToastFunction

interface ToastContextType {
  addToast: AddToastFunction;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

// Esta é uma implementação SIMPLIFICADA para o contexto.
// O App.tsx vai prover a função real para o ToastProvider.
// Não será mais usada diretamente, ActualToastProvider é a que vale.
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [_, setToastsStateInProvider] = useState<ToastMessage[]>([]);

  const addToastCallback: AddToastFunction = useCallback((message, type = 'info', onClick, onClickLabel) => {
    const newToast: ToastMessage = { 
      id: Date.now().toString() + Math.random().toString(36).substring(2,7), 
      message, 
      type,
      onClick,
      onClickLabel
    };
    setToastsStateInProvider(prevToasts => [newToast, ...prevToasts.slice(0, 4)]);
  }, []);
  
  return (
    <ToastContext.Provider value={{ addToast: addToastCallback }}> 
      {children}
    </ToastContext.Provider>
  );
};

// Interface para as props do ToastProvider que virão do App.tsx
export interface ActualToastProviderProps {
  children: ReactNode;
  addToastFunc: AddToastFunction; 
}

// O componente que será realmente usado no App.tsx
export const ActualToastProvider: React.FC<ActualToastProviderProps> = ({ children, addToastFunc }) => {
  return (
    <ToastContext.Provider value={{ addToast: addToastFunc }}>
      {children}
    </ToastContext.Provider>
  );
};