import React, { useRef } from 'react';
import { Camera, Upload, X, Sparkles } from 'lucide-react';

interface UploadSectionProps {
  onImageSelected: (file: File) => void;
  previewUrl: string | null;
  onClear: () => void;
  loading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onImageSelected, previewUrl, onClear, loading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (previewUrl) {
    return (
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-card shadow-2xl group transition-all border border-slate-700/50">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
        />
        {!loading && (
            <button 
            onClick={onClear}
            className="absolute top-4 right-4 p-3 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all border border-white/10 shadow-lg"
            aria-label="Remove image"
            >
            <X size={20} />
            </button>
        )}
        {loading && (
           <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center">
             <div className="flex flex-col items-center gap-6">
               <div className="relative">
                 <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full"></div>
                 <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
               <div className="text-center">
                 <p className="text-white text-lg font-bold animate-pulse">Analyzing with Gemini AI...</p>
                 <p className="text-indigo-400 text-xs mt-1 uppercase tracking-widest">Extracting Data</p>
               </div>
             </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full perspective-1000">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        capture="environment"
      />
      
      <button 
        onClick={triggerUpload}
        className="w-full py-24 px-6 rounded-[32px] border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/20 hover:bg-slate-800/40 transition-all group flex flex-col items-center justify-center gap-6 relative overflow-hidden group hover:scale-[1.01] duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse-glow"></div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-2xl shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-300 ring-4 ring-white/5">
             <Camera size={40} className="text-white" />
          </div>
        </div>
        
        <div className="text-center relative z-10 space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">Tap to Scan</h3>
          <p className="text-slate-400 font-medium">Invoices, Shelves, or Sketches</p>
        </div>
        
        <div className="flex gap-4 mt-2 relative z-10">
           <span className="flex items-center gap-1.5 text-xs bg-white/5 px-4 py-2 rounded-full text-slate-300 border border-white/10 font-medium backdrop-blur-sm">
             <Upload size={12} /> JPG / PNG Supported
           </span>
        </div>
      </button>
    </div>
  );
};