// components/Footer.tsx
import React from 'react';

interface FooterProps {
  versaoApp: string;
}

const Footer: React.FC<FooterProps> = ({ versaoApp }) => {
  return (
    <footer className="bg-slate-800 text-center p-4 text-xs text-slate-500 border-t border-slate-700">
      <p>&copy; {new Date().getFullYear()} Gestor Trainer. Direitos Reservados.</p>
      <p>Versão: {versaoApp}</p>
    </footer>
  );
};

export default Footer;
