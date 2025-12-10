import React from 'react';
import { Factory, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <header className="glass-nav w-full max-w-4xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Tex-Ops</h1>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Enterprise</p>
          </div>
        </div>
        
        <button 
          onClick={onOpenSettings}
          className="p-2.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>
    </div>
  );
};