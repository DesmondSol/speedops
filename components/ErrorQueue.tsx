
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  X, 
  Bug, 
  Search, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Target,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Link as LinkIcon,
  ChevronRight,
  Cpu,
  Layers
} from 'lucide-react';
import { ErrorLog, ErrorSeverity, Project, TeamMember, Task } from '../types';

interface ErrorQueueProps {
  errors: ErrorLog[];
  projects: Project[];
  tasks: Task[];
  onAddError: (error: ErrorLog) => void;
  onUpdateError: (error: ErrorLog) => void;
  onDeleteError: (id: string) => void;
}

export const ErrorQueue: React.FC<ErrorQueueProps> = ({ errors, projects, tasks, onAddError, onUpdateError, onDeleteError }) => {
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // New Error State
  const [newError, setNewError] = useState({
    projectId: '',
    title: '',
    description: '',
    authorId: '',
    assignedToId: '',
    severity: ErrorSeverity.MEDIUM
  });

  // Resolve State
  const [resolveData, setResolveData] = useState({
    resolvedBy: '',
    commitLink: ''
  });

  const allErrors = useMemo(() => errors, [errors]);

  const filteredErrors = useMemo(() => {
    return allErrors.filter(err => {
      const matchesTab = err.status === activeTab;
      const matchesProject = selectedProjectFilter === 'all' || err.projectId === selectedProjectFilter;
      return matchesTab && matchesProject;
    });
  }, [allErrors, activeTab, selectedProjectFilter]);

  const handleCreateError = () => {
    const error: ErrorLog = {
      id: `err-${Date.now()}`,
      ...newError,
      status: 'active',
      timestamp: new Date().toLocaleTimeString()
    };
    onAddError(error);
    setView('list');
    setNewError({ projectId: '', title: '', description: '', authorId: '', assignedToId: '', severity: ErrorSeverity.MEDIUM });
  };

  const handleResolveError = () => {
    if (!selectedError) return;
    const updated: ErrorLog = {
      ...selectedError,
      status: 'resolved',
      resolvedBy: resolveData.resolvedBy,
      commitLink: resolveData.commitLink
    };
    onUpdateError(updated);
    setShowResolveModal(false);
    setSelectedError(null);
    setView('list');
  };

  const handleDelete = () => {
    if (selectedError) {
      if (confirm(`PURGE ERROR LOG ${selectedError.title.toUpperCase()}?`)) {
        onDeleteError(selectedError.id);
        setView('list');
        setSelectedError(null);
      }
    }
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6 border-b border-white/5 pb-6">
        <div className="flex gap-8 items-center">
          {['active', 'resolved'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === tab ? 'text-[#FF6A00] border-[#FF6A00]' : 'text-gray-500 border-transparent hover:text-white'}`}
            >
              {tab} queue
            </button>
          ))}
        </div>
        <button onClick={() => setView('create')} className="btn-primary px-8 py-2.5 text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-[#FF6A00]/20">
          <Plus size={16} /> Signal Error
        </button>
      </div>

      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredErrors.map(err => (
            <div 
              key={err.id} 
              onClick={() => { setSelectedError(err); setView('details'); }}
              className="neon-border bg-[#0F0F0F] p-5 group cursor-pointer hover:bg-[#151515] border-l-2 border-l-transparent hover:border-l-[#FF6A00] shadow-xl"
            >
              <h4 className="text-sm font-bold uppercase mb-4 leading-relaxed tracking-tight group-hover:text-[#FF6A00] transition-colors">{err.title}</h4>
              <div className="text-[9px] font-mono text-gray-600 uppercase">Ref: {err.id}</div>
            </div>
          ))}
        </div>
      ) : view === 'create' ? (
        <div className="max-w-3xl mx-auto w-full neon-border bg-[#0F0F0F] p-8 md:p-12 space-y-10 shadow-2xl mb-12">
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">Initialize Bug Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <select className="input-base" value={newError.projectId} onChange={e => setNewError({...newError, projectId: e.target.value})}>
              <option value="">SELECT PROJECT...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="input-base" placeholder="HEADING" value={newError.title} onChange={e => setNewError({...newError, title: e.target.value})} />
            <textarea className="input-base col-span-full h-32" placeholder="DETAILS" value={newError.description} onChange={e => setNewError({...newError, description: e.target.value})} />
          </div>
          <button onClick={handleCreateError} className="btn-primary w-full py-5 text-sm font-black uppercase">Authorize Log Insertion</button>
        </div>
      ) : dossierView()}

      {showResolveModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl neon-border bg-[#0F0F0F] p-10 space-y-8 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Authorize Resolution</h3>
            <input className="input-base" placeholder="COMMIT LINK" value={resolveData.commitLink} onChange={e => setResolveData({...resolveData, commitLink: e.target.value})} />
            <button onClick={handleResolveError} className="btn-primary w-full py-5 text-sm font-black uppercase">Seal Resolution Marker</button>
          </div>
        </div>
      )}

      <style>{`
        .input-base { width: 100%; background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); padding: 1rem; color: white; font-family: 'JetBrains Mono', monospace; border-radius: 2px; font-size: 0.875rem; }
        .input-base:focus { outline: none; border-color: #FF6A00; }
        .label-sm { display: block; font-size: 10px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; color: #555; margin-bottom: 0.5rem; letter-spacing: 0.2em; font-weight: 700; }
        .btn-primary { background-color: #FF6A00; color: black; font-weight: 900; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 0.75rem; border-radius: 2px; letter-spacing: 0.1em; }
      `}</style>
    </div>
  );

  function dossierView() {
    if (!selectedError) return null;
    return (
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full md:max-w-4xl bg-[#0F0F0F] h-full border-l border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl">
          <div className="p-8 md:p-12 border-b border-white/10 flex justify-between items-start bg-[#121212]">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-none mb-4">{selectedError.title}</h2>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">PROJECT: {getProject(selectedError.projectId)?.name}</div>
            </div>
            <div className="flex gap-4">
              {selectedError.status === 'active' && (
                <button onClick={() => setShowResolveModal(true)} className="text-green-500 hover:text-white p-2">
                  <CheckCircle2 size={24} />
                </button>
              )}
              <button onClick={handleDelete} className="text-red-500 hover:text-white p-2">
                <Trash2 size={24} />
              </button>
              <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors p-2"><X size={32} /></button>
            </div>
          </div>
          <div className="p-8 md:p-12 space-y-8 flex-1 overflow-y-auto bg-[#0F0F0F]">
             <section className="space-y-4">
                <h4 className="label-sm">Description</h4>
                <p className="text-sm font-mono text-gray-300 bg-black/40 p-6 border border-white/5">{selectedError.description}</p>
             </section>
          </div>
        </div>
      </div>
    );
  }
};
