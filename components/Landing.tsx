
import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  BrainCircuit, 
  Activity, 
  ArrowRight, 
  Cpu, 
  Layers, 
  Target,
  Terminal as TerminalIcon,
  ChevronRight,
  Globe,
  Monitor,
  Flame
} from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF6A00] selection:text-black overflow-x-hidden font-['Space_Grotesk']">
      {/* 1. Static Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,112,0.06))] bg-[length:100%_4px,3px_100%]" />
      
      {/* 2. Background Grid */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      {/* 3. Navigation Overlay */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-8 z-[60] flex justify-between items-center backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF6A00] flex items-center justify-center font-black text-black rounded-sm shadow-[0_0_20px_rgba(255,106,0,0.4)]">S</div>
          <span className="text-xl font-black tracking-tighter uppercase">speedOps</span>
        </div>
        <button 
          onClick={onEnter}
          className="group flex items-center gap-3 px-6 py-2 border border-[#FF6A00] text-[#FF6A00] text-[10px] font-black uppercase tracking-widest hover:bg-[#FF6A00] hover:text-black transition-all rounded-sm"
        >
          Initialize Terminal
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </nav>

      {/* 4. Hero Section */}
      <section className="relative pt-48 pb-32 px-8 flex flex-col items-center text-center max-w-7xl mx-auto">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#FF6A00]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A00]"></span>
          </span>
          <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-[#FF6A00]">Neural Sync V1.2.0 Live</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black tracking-tighter uppercase leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Neural <br /> <span className="text-[#FF6A00] drop-shadow-[0_0_30px_rgba(255,106,0,0.4)]">Orchestration</span>
        </h1>

        <p className="max-w-2xl text-gray-400 text-lg md:text-xl font-medium mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-400">
          Stop managing tasks. Start orchestrating reality. The high-signal operational core for fast-scaling startups that demand technical precision and zero-friction AI planning.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-600">
          <button 
            onClick={onEnter}
            className="px-10 py-5 bg-[#FF6A00] text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,106,0,0.2)] rounded-sm"
          >
            Access Mainframe
          </button>
          <button className="px-10 py-5 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all rounded-sm">
            View Protocol
          </button>
        </div>
      </section>

      {/* 5. Feature Grid */}
      <section className="py-32 px-8 border-t border-white/5 bg-[#080808]/50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="neon-border bg-[#0F0F0F] p-10 space-y-6 group hover:bg-[#121212] transition-colors">
              <BrainCircuit className="text-[#FF6A00] w-12 h-12" />
              <h3 className="text-2xl font-black uppercase tracking-tighter">Neural Ingestion</h3>
              <p className="text-gray-500 font-mono text-sm leading-relaxed">
                Gemini-powered project decomposition. Feed in a raw idea, receive a full-fidelity technical brief and unit-by-unit task breakdown in seconds.
              </p>
            </div>
            <div className="neon-border bg-[#0F0F0F] p-10 space-y-6 group hover:bg-[#121212] transition-colors">
              <ShieldCheck className="text-[#FF6A00] w-12 h-12" />
              <h3 className="text-2xl font-black uppercase tracking-tighter">Gated Handover</h3>
              <p className="text-gray-500 font-mono text-sm leading-relaxed">
                A hard-coded culture of proof. Units only migrate between stages when validated by deployment links and technical signatures. Zero ambiguity.
              </p>
            </div>
            <div className="neon-border bg-[#0F0F0F] p-10 space-y-6 group hover:bg-[#121212] transition-colors">
              <Monitor className="text-[#FF6A00] w-12 h-12" />
              <h3 className="text-2xl font-black uppercase tracking-tighter">War Room Ready</h3>
              <p className="text-gray-500 font-mono text-sm leading-relaxed">
                Designed for high-density wall displays. Real-time telemetry on every operator's bandwidth and every mission's temporal health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Vision Quote */}
      <section className="py-40 px-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-[#FF6A00]/5 blur-[100px] rounded-full translate-x-1/2" />
        <div className="max-w-4xl mx-auto text-center">
          <TerminalIcon className="text-[#FF6A00] mx-auto mb-8 w-16 h-16 opacity-50" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-12">
            Built for those who <span className="text-[#FF6A00]">ship</span> before the world wakes up.
          </h2>
          <div className="flex items-center justify-center gap-8 border-y border-white/5 py-8">
             <div className="text-center">
               <div className="text-2xl font-black font-mono">1.2s</div>
               <div className="text-[9px] font-mono uppercase text-gray-600 tracking-widest">Global Sync</div>
             </div>
             <div className="w-[1px] h-10 bg-white/10" />
             <div className="text-center">
               <div className="text-2xl font-black font-mono">0.0</div>
               <div className="text-[9px] font-mono uppercase text-gray-600 tracking-widest">Information Loss</div>
             </div>
             <div className="w-[1px] h-10 bg-white/10" />
             <div className="text-center">
               <div className="text-2xl font-black font-mono">100%</div>
               <div className="text-[9px] font-mono uppercase text-gray-600 tracking-widest">Unit Visibility</div>
             </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-12 border-t border-white/5 bg-black px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#FF6A00] flex items-center justify-center font-black text-black rounded-sm">S</div>
            <span className="text-sm font-black tracking-tighter uppercase">speedOps Intelligence</span>
          </div>
          <div className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">
            © 2025 speedOps Operational Command. All neural links secured.
          </div>
          <div className="flex gap-6 text-[10px] font-mono uppercase text-gray-500">
            <a href="#" className="hover:text-white">Github</a>
            <a href="#" className="hover:text-white">Docs</a>
            <a href="#" className="hover:text-white">Legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
