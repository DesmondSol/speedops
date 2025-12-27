
import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Cpu,
  Target
} from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  targetId?: string;
  icon: any;
}

const STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'System Initialized',
    description: 'Welcome to speedOps. This is your neural operational core. We have prepared a brief synchronization sequence to calibrate your command of the platform.',
    icon: Terminal
  },
  {
    id: 'sidebar',
    title: 'Mission Control',
    description: 'Use the primary navigation hub to migrate between Operational Dashboards, Project Deployments, and Personnel Dossiers.',
    icon: Target
  },
  {
    id: 'intelligence',
    title: 'Neural Link',
    description: 'The global search and live sync status indicators keep you tethered to the operational cloud. Every action is synchronized across all terminals in < 1.2s.',
    icon: Cpu
  },
  {
    id: 'stats',
    title: 'Fleet Telemetry',
    description: 'Monitor high-level operational health. Track active deployments, threat markers (bugs), and unit success rates in real-time.',
    icon: Activity
  },
  {
    id: 'feed',
    title: 'Intelligence Stream',
    description: 'Your real-time feedback loop. Every task migration and operational signal is logged here. High-signal, low-noise communication for technical depth.',
    icon: Zap
  }
];

interface WalkthroughProps {
  onComplete: () => void;
}

export const Walkthrough: React.FC<WalkthroughProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const step = STEPS[currentStep];

  const next = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onComplete} />
      
      <div className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#FF6A00]/30 shadow-[0_0_50px_rgba(255,106,0,0.2)] p-8 md:p-10 animate-in zoom-in-95 duration-300 pointer-events-auto">
        {/* Futuristic Scanline on the walkthrough card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
          <div className="w-full h-[1px] bg-[#FF6A00] shadow-[0_0_10px_#FF6A00] animate-[scan_2s_infinite_linear]" />
        </div>

        <button 
          onClick={onComplete}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#FF6A00]/10 border border-[#FF6A00]/30 flex items-center justify-center text-[#FF6A00] rounded-sm">
              <step.icon size={24} />
            </div>
            <div>
              <div className="text-[9px] font-mono text-[#FF6A00] uppercase tracking-[0.3em] font-bold">Step {currentStep + 1} / {STEPS.length}</div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{step.title}</h3>
            </div>
          </div>

          <p className="text-sm md:text-base text-gray-400 font-mono leading-relaxed mb-10 min-h-[80px]">
            {step.description}
          </p>

          <div className="flex items-center justify-between border-t border-white/5 pt-8">
            <button 
              onClick={onComplete}
              className="text-[10px] font-mono uppercase text-gray-600 hover:text-white transition-colors tracking-widest"
            >
              Skip Sync
            </button>
            
            <div className="flex gap-4">
              {currentStep > 0 && (
                <button 
                  onClick={prev}
                  className="p-3 border border-white/10 text-gray-400 hover:text-white transition-all rounded-sm"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <button 
                onClick={next}
                className="flex items-center gap-2 px-8 py-3 bg-[#FF6A00] text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#ff8533] transition-all rounded-sm shadow-lg shadow-[#FF6A00]/10"
              >
                {currentStep === STEPS.length - 1 ? 'Execute' : 'Synchronize'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative corner markers */}
        <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#FF6A00]" />
        <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#FF6A00]" />
      </div>
    </div>
  );
};
