
// components/NavButton.tsx
import React from 'react';

interface NavButtonProps {
  label: string;
  aoClicar: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ label, aoClicar }) => {
  return (
    <button
      onClick={aoClicar}
      className="w-full bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium py-2.5 px-4 rounded-md transition-colors text-sm"
    >
      {label}
    </button>
  );
};

export default NavButton;
