import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] animate-bounce-in">
      <div className={`glass-card px-6 py-4 flex items-center gap-4 border-l-4 shadow-2xl ${
        toast.type === 'success' ? 'border-l-[#22c55e] bg-[#22c55e]/10' : 'border-l-amber-500 bg-amber-500/10'
      }`}>
        {toast.type === 'success' ? (
          <CheckCircle2 className="text-[#22c55e]" size={24} />
        ) : (
          <AlertTriangle className="text-amber-500" size={24} />
        )}
        <div>
           <p className={`text-sm font-bold ${toast.type === 'success' ? 'text-[#22c55e]' : 'text-amber-400'}`}>
             {toast.type === 'success' ? 'Success' : 'Attention'}
           </p>
           <p className="text-sm font-medium text-white opacity-90">{toast.message}</p>
        </div>
        <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};