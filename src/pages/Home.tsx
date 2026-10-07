import React from 'react';
import { motion } from 'motion/react';
import { Camera, Sun, Info, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { Page, DiagnosisResult } from '../types';
import { cn } from '../lib/utils';

interface HomeProps {
  onPageChange: (page: Page) => void;
  lastScan?: DiagnosisResult;
  onViewResult?: (result: DiagnosisResult) => void;
}

export const Home: React.FC<HomeProps> = ({ onPageChange, lastScan, onViewResult }) => {
  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Hero Section */}
      <header className="bg-white pt-10 pb-12 px-6 rounded-b-[32px] border-b border-border shadow-card relative overflow-hidden">
        <div className="relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary text-2xl font-bold tracking-tight mb-1"
          >
            CropCare AI
          </motion.h1>
          <p className="text-text-muted text-sm font-medium">Protect your crops with AI-powered diagnostics</p>
        </div>
        
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-light/40 rounded-full blur-3xl"></div>
      </header>

      {/* Main Action Card */}
      <div className="px-6 -mt-10 relative z-20">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onPageChange('scan')}
          className="w-full bg-primary p-5 rounded-2xl shadow-xl shadow-primary/10 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Camera size={28} />
            </div>
            <div className="text-left text-white">
              <h3 className="text-lg font-bold">Start New Scan</h3>
              <p className="text-white/70 text-xs">Detect pests and diseases instantly</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
            <ArrowRight size={18} />
          </div>
        </motion.button>
      </div>

      {/* Stats / Quick Info */}
      <div className="px-6 grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-2xl border border-border flex flex-col gap-1"
        >
          <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider">Total Scans</span>
          <span className="text-primary font-bold text-xl">12</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-2xl border border-border flex flex-col gap-1"
        >
          <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider">AI Accuracy</span>
          <span className="text-primary font-bold text-xl">98%</span>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-text-dark uppercase tracking-wide">Last Diagnosis</h2>
          <button 
            onClick={() => onPageChange('history')}
            className="text-primary font-bold text-xs"
          >
            VIEW ALL
          </button>
        </div>

        {lastScan ? (
          <div 
            onClick={() => onViewResult ? onViewResult(lastScan) : onPageChange('result')}
            className="bg-white p-4 rounded-2xl border border-border flex gap-4 items-center cursor-pointer shadow-card active:bg-slate-50 transition-colors"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={lastScan.imageUrl} 
                alt="Diagnosis result" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight truncate max-w-[120px]">{lastScan.cropName}</span>
                <span className={cn(
                  "text-[8px] px-2 py-0.5 rounded font-bold uppercase",
                  lastScan.severity === 'Low' ? 'bg-green-100 text-green-700' :
                  lastScan.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {lastScan.severity}
                </span>
              </div>
              <p className={cn(
                "font-bold text-sm truncate",
                lastScan.severity === 'High' || lastScan.severity === 'Critical' ? 'text-danger' : 'text-text-dark'
              )}>{lastScan.diseaseName}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-border p-6 rounded-2xl text-center shadow-card">
            <p className="text-text-muted text-xs font-medium">No recent scans yet.</p>
          </div>
        )}
      </div>

      {/* Farm Tip */}
      <div className="px-6">
        <div className="bg-primary-light text-text-dark p-6 rounded-[24px] border border-secondary/20 relative overflow-hidden flex items-center">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sun size={16} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider">Daily Farm Tip</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed font-medium">
              Crop rotation helps maintain soil health and prevents pest buildup. Try alternating your cereals with legumes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
