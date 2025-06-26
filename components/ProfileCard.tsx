// components/ProfileCard.tsx
import React from 'react';
import { PerfilProfessor } from '../types'; // Import PerfilProfessor type

interface ProfileCardProps {
  perfil: PerfilProfessor; // Use PerfilProfessor type
  aoClicarMinhaConta: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ perfil, aoClicarMinhaConta }) => {
  return (
    <div className="bg-slate-700 p-4 rounded-lg shadow text-center">
      <div className="mx-auto w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3">
        {perfil.iniciais}
      </div>
      <h3 className="text-xl font-semibold text-white">{perfil.nome}</h3>
      <p className="text-sm text-slate-400 mb-4">{perfil.plano}</p>
      <button
        onClick={aoClicarMinhaConta}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Minha Conta
      </button>
    </div>
  );
};

export default ProfileCard;
