import React, { useRef } from 'react';
import { X, Download, Upload, AlertTriangle, Database } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onBackup, onRestore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onRestore(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass rounded-lg overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Database className="text-blue-400" size={20} />
            <h2 className="text-lg font-bold text-white tracking-tight">Data Management</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Backup Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Backup</h3>
            <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Download a secure snapshot of your current Inventory, Invoices, and Order History. 
                The file includes a timestamp for version control.
              </p>
              <button 
                onClick={onBackup}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-900/20"
              >
                <Download size={16} /> Download Snapshot
              </button>
            </div>
          </div>

          {/* Restore Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Restore</h3>
            <div className="p-4 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5">
              <div className="flex items-start gap-3 mb-4">
                 <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                 <p className="text-xs text-amber-200/80 leading-relaxed">
                   <strong>Warning:</strong> Restoring from a file will <span className="underline">overwrite</span> all current application data. This action cannot be undone.
                 </p>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-lg text-sm font-medium border border-slate-600 transition-all hover:border-slate-500"
              >
                <Upload size={16} /> Restore from File
              </button>
            </div>
          </div>

        </div>
        
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-500">Tex-Ops Secure Backup System v1.0</p>
        </div>
      </div>
    </div>
  );
};