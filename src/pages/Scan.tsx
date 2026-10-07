import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Image as ImageIcon, X, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { analyzeCropImage } from '../services/geminiService';
import { DiagnosisResult } from '../types';

interface ScanProps {
  onDiagnosisComplete: (result: DiagnosisResult) => void;
  onCancel: () => void;
}

export const Scan: React.FC<ScanProps> = ({ onDiagnosisComplete, onCancel }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setImage(imageData);
        setError(null);
        // Auto-analyze immediately after image is selected
        runAnalysis(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imageData: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeCropImage(imageData);
      onDiagnosisComplete(result);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try a clearer image of a crop or plant leaf.");
    } finally {
      setIsLoading(false);
    }
  };

  const startAnalysis = () => {
    if (image) runAnalysis(image);
  };

  const reset = () => {
    setImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-screen max-h-screen pb-20 overflow-hidden bg-slate-950 text-white px-6">
      <header className="py-6 flex justify-between items-center sticky top-0 z-10 -mx-6 px-6">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <X size={22} />
        </button>
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Diagnosis Scan</h2>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 flex flex-col justify-center gap-8 relative pb-10">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div 
              key="picker"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col gap-8"
            >
              <div className="relative aspect-square w-full max-w-sm mx-auto bg-slate-900 rounded-3xl border border-white/10 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
                <Camera size={48} className="text-slate-800 mb-4" />
                <p className="text-slate-500 text-center px-10 text-[11px] font-medium leading-relaxed">
                  Position the crop or leaf clearly within the frame for best detection.
                </p>
                {/* Minimal crosshair corners */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-primary opacity-50"></div>
                <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-primary opacity-50"></div>
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-primary opacity-50"></div>
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-primary opacity-50"></div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest shadow-lg"
                >
                  <Camera size={18} />
                  New Scan
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="aspect-square w-full max-w-sm mx-auto bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8">
                    <Loader2 size={40} className="animate-spin text-primary mb-4" />
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Analyzing...</h3>
                    <p className="text-slate-500 text-[11px] font-medium">Cloud AI is processing your request</p>
                    
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-primary/50 shadow-[0_0_15px_rgba(45,106,79,1)] z-10"
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-danger/10 border border-danger/20 p-4 rounded-xl flex items-center gap-3 text-danger text-[11px] font-bold">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button
                  disabled={isLoading}
                  onClick={startAnalysis}
                  className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-800 text-white h-14 rounded-xl font-bold flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest shadow-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  {isLoading ? 'Processing' : 'Analyze Now'}
                </button>
                <button
                  disabled={isLoading}
                  onClick={reset}
                  className="w-full bg-white/5 hover:bg-white/10 text-white h-12 rounded-xl font-bold flex items-center justify-center transition-all text-xs uppercase tracking-widest border border-white/10"
                >
                  Retake
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mb-10 text-center">
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest px-10 leading-relaxed">
          Ensure good lighting for better detection.
        </p>
      </div>
    </div>
  );
};
