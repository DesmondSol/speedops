
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
import { MOCK_TEAM } from '../constants';

interface ErrorQueueProps {
  errors: ErrorLog[];
  projects: Project[];
  tasks: Task[];
  onAddError: (error: ErrorLog) => void;
  onUpdateError: (error: ErrorLog) => void;
}

export const ErrorQueue: React.FC<ErrorQueueProps> = ({ errors, projects, tasks, onAddError, onUpdateError }) => {
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

  // Derived: Ingest errors from tester comments in tasks
  const ingestedErrors = useMemo(() => {
    const logs: ErrorLog[] = [];
    tasks.forEach(task => {
      task.comments.forEach(comment => {
        if (comment.tag === 'Error' || comment.tag === 'Bug') {
          logs.push({
            id: `ingested-${comment.id}`,
            projectId: task.projectId,
            title: `[Task] ${task.name}`,
            description: comment.content,
            authorId: comment.authorId,
            assignedToId: task.assigneeId,
            severity: ErrorSeverity.MEDIUM,
            status: 'active',
            timestamp: comment.timestamp
          });
        }
      });
    });
    return logs;
  }, [tasks]);

  const allErrors = useMemo(() => [...errors, ...ingestedErrors], [errors, ingestedErrors]);

  const filteredErrors = useMemo(() => {
    return allErrors.filter(err => {
      const matchesTab = err.status === activeTab;
      const matchesProject = selectedProjectFilter === 'all' || err.projectId === selectedProjectFilter;
      return matchesTab && matchesProject;
    }).sort((a, b) => {
      // Sort by severity or timestamp could be added here
      return 0;
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

  const getMember = (id?: string) => MOCK_TEAM.find(m => m.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* 1. Primary Status Tabs & Action */}
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
        <button 
          onClick={() => setView('create')}
          className="btn-primary px-8 py-2.5 text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-[#FF6A00]/20"
        >
          <Plus size={16} /> Signal Error
        </button>
      </div>

      {/* 2. Project Filter Tab Bar - New Filtering Mechanism */}
      <div className="mb-8 flex items-center gap-4 bg-white/5 p-1 rounded-sm border border-white/5 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setSelectedProjectFilter('all')}
          className={`px-4 py-2 text-[9px] font-mono uppercase whitespace-nowrap transition-all ${selectedProjectFilter === 'all' ? 'bg-[#FF6A00] text-black font-black' : 'text-gray-500 hover:text-white'}`}
        >
          ALL PROJECTS
        </button>
        {projects.map(p => (
          <button 
            key={p.id}
            onClick={() => setSelectedProjectFilter(p.id)}
            className={`px-4 py-2 text-[9px] font-mono uppercase whitespace-nowrap transition-all ${selectedProjectFilter === p.id ? 'bg-white/10 text-white border-b-2 border-[#FF6A00]' : 'text-gray-500 hover:text-white'}`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* 3. Main Viewport */}
      {view === 'list' ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredErrors.map(err => {
              const project = getProject(err.projectId);
              return (
                <div 
                  key={err.id} 
                  onClick={() => { setSelectedError(err); setView('details'); }}
                  className="neon-border bg-[#0F0F0F] p-5 group cursor-pointer hover:bg-[#151515] transition-all border-l-2 border-l-transparent hover:border-l-[#FF6A00] flex flex-col h-full shadow-xl"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className={`text-[8px] font-black font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-tighter mb-1 w-fit ${err.severity === 'Critical' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#FF6A00] text-black'}`}>
                        {err.severity}
                      </span>
                      <span className="text-[9px] font-mono text-gray-600 uppercase tracking-tighter truncate max-w-[120px]">{project?.name || 'UNKNOWN'}</span>
                    </div>
                    <span className="text-[8px] font-mono text-gray-700">ID_{err.id.split('-').pop()}</span>
                  </div>

                  <h4 className="text-sm font-bold uppercase mb-4 line-clamp-2 leading-relaxed tracking-tight group-hover:text-[#FF6A00] transition-colors">
                    {err.title}
                  </h4>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-white/5 rounded-full flex items-center justify-center text-[7px] font-black border border-white/10">
                        {getMember(err.authorId)?.name[0] || '?'}
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">{getMember(err.authorId)?.name.split(' ')[0] || 'Unknown'}</span>
                    </div>
                    <div className="text-[9px] font-mono text-gray-700 flex items-center gap-1">
                      <Clock size={10} /> {err.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredErrors.length === 0 && (
            <div className="py-40 flex flex-col items-center justify-center opacity-10">
              <ShieldCheck size={64} className="mb-4" />
              <span className="text-xl font-mono uppercase tracking-[0.5em]">Operational_Stability_Confirmed</span>
            </div>
          )}
        </div>
      ) : view === 'create' ? (
        <div className="max-w-3xl mx-auto w-full neon-border bg-[#0F0F0F] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-6 duration-500 shadow-2xl mb-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter leading-none">Initialize Bug Report</h2>
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors"><X size={28} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="label-sm">Mission Context</label>
                <select className="input-base" value={newError.projectId} onChange={e => setNewError({...newError, projectId: e.target.value})}>
                  <option value="">SELECT PROJECT...</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-sm">Signal Strength (Severity)</label>
                <select className="input-base" value={newError.severity} onChange={e => setNewError({...newError, severity: e.target.value as any})}>
                  {Object.values(ErrorSeverity).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className="label-sm">Reporter Identity</label>
                <select className="input-base" value={newError.authorId} onChange={e => setNewError({...newError, authorId: e.target.value})}>
                  <option value="">SELECT OPERATOR...</option>
                  {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label-sm">Report Heading</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. API_HANDSHAKE_FAILURE" 
                  value={newError.title} 
                  onChange={e => setNewError({...newError, title: e.target.value})} 
                />
              </div>
              <div>
                <label className="label-sm">Assign Deployment Fixer</label>
                <select className="input-base" value={newError.assignedToId} onChange={e => setNewError({...newError, assignedToId: e.target.value})}>
                  <option value="">AUTO_ASSIGN_PENDING</option>
                  {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            <div className="col-span-full">
              <label className="label-sm">Detailed Intel</label>
              <textarea 
                className="input-base h-32" 
                placeholder="STACK TRACE, STEPS TO REPRODUCE, EXPECTED VS ACTUAL..." 
                value={newError.description}
                onChange={e => setNewError({...newError, description: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleCreateError}
            disabled={!newError.projectId || !newError.title || !newError.authorId}
            className="btn-primary w-full py-5 text-sm font-black uppercase shadow-lg shadow-[#FF6A00]/20 disabled:opacity-20 transition-all"
          >
            Authorize Log Insertion <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        /* Details View */
        dossierView()
      )}

      {/* Resolution Modal Overlay */}
      {showResolveModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-xl neon-border bg-[#0F0F0F] p-10 space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Authorize Resolution</h3>
              <button onClick={() => setShowResolveModal(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="label-sm">Executing Operator</label>
                <select className="input-base" value={resolveData.resolvedBy} onChange={e => setResolveData({...resolveData, resolvedBy: e.target.value})}>
                  <option value="">SELECT PERSON...</option>
                  {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-sm">Commit Reference (Proof of Work)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    className="input-base pl-12" 
                    placeholder="https://github.com/org/repo/commit/..." 
                    value={resolveData.commitLink}
                    onChange={e => setResolveData({...resolveData, commitLink: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={handleResolveError}
                disabled={!resolveData.resolvedBy || !resolveData.commitLink}
                className="btn-primary w-full py-5 text-sm font-black uppercase shadow-lg shadow-[#FF6A00]/20 disabled:opacity-20 transition-all"
              >
                Seal Resolution Marker
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-base {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1rem;
          color: white;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.2s;
          border-radius: 2px;
          font-size: 0.875rem;
        }
        .input-base:focus { outline: none; border-color: #FF6A00; }
        .label-sm {
          display: block;
          font-size: 10px;
          font-family: 'JetBrains Mono', monospace;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 0.5rem;
          letter-spacing: 0.2em;
          font-weight: 700;
        }
        .btn-primary {
          background-color: #FF6A00;
          color: black;
          font-weight: 900;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.2s;
          border-radius: 2px;
          letter-spacing: 0.1em;
        }
        .orange-glow { box-shadow: 0 0 15px rgba(255, 106, 0, 0.4); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );

  function dossierView() {
    if (!selectedError) return null;
    const project = getProject(selectedError.projectId);
    const author = getMember(selectedError.authorId);
    const assignee = getMember(selectedError.assignedToId);

    return (
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full md:max-w-4xl bg-[#0F0F0F] h-full border-l border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-white/10 flex justify-between items-start bg-[#121212]">
            <div className="flex gap-6 items-start">
              <div className={`w-16 h-16 flex items-center justify-center rounded-sm shadow-inner relative overflow-hidden shrink-0 ${selectedError.severity === 'Critical' ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-white/5 border border-white/10 text-[#FF6A00]'}`}>
                <Bug size={32} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-mono text-[#FF6A00] uppercase tracking-widest">{project?.name}</span>
                  <div className="h-1 w-1 rounded-full bg-gray-700" />
                  <span className="text-[10px] font-mono text-gray-500 uppercase">REF: {selectedError.id}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-none mb-4">{selectedError.title}</h2>
                <div className="flex flex-wrap gap-2">
                   <span className={`text-[10px] font-mono px-3 py-0.5 rounded-full border ${selectedError.severity === 'Critical' ? 'border-red-500 text-red-500' : 'border-[#FF6A00] text-[#FF6A00]'} uppercase font-black`}>{selectedError.severity}</span>
                   <span className={`text-[10px] font-mono px-3 py-0.5 rounded-full border border-gray-500 text-gray-500 uppercase font-black`}>{selectedError.status}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors p-2"><X size={32} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar bg-[#0F0F0F]">
             {/* Report Details */}
             <section className="space-y-6">
                <h3 className="label-sm flex items-center gap-2 border-b border-white/5 pb-2"><MessageSquare size={16} /> Intel Breakdown</h3>
                <p className="text-sm md:text-base text-gray-300 font-mono leading-relaxed bg-black/40 p-8 border border-white/5 rounded-sm whitespace-pre-wrap">
                  {selectedError.description}
                </p>
             </section>

             {/* Stakeholders */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white/5 p-6 border border-white/5 rounded-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-lg font-black">{author?.name[0] || '?'}</div>
                  <div>
                    <h4 className="label-sm m-0">Reporter</h4>
                    <div className="text-sm font-bold uppercase tracking-tight">{author?.name || 'Unknown'}</div>
                  </div>
                </section>
                <section className="bg-white/5 p-6 border border-white/5 rounded-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#FF6A00] text-black rounded-full flex items-center justify-center text-lg font-black">{assignee?.name[0] || '?'}</div>
                  <div>
                    <h4 className="label-sm m-0">Assigned Fixer</h4>
                    <div className="text-sm font-bold uppercase tracking-tight">{assignee?.name || 'Awaiting Assignment'}</div>
                  </div>
                </section>
             </div>

             {/* Deployment Specifics */}
             <section className="bg-white/5 p-8 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <h4 className="label-sm mb-2">Timestamp</h4>
                  <div className="text-xs font-mono font-bold">{selectedError.timestamp}</div>
                </div>
                <div>
                  <h4 className="label-sm mb-2">Sync Status</h4>
                  <div className="text-[10px] font-mono text-green-500 flex items-center gap-1">
                    <ShieldCheck size={12} /> ENCRYPTED
                  </div>
                </div>
                <div>
                  <h4 className="label-sm mb-2">Ingestion</h4>
                  <div className="text-[10px] font-mono text-gray-500">
                    {selectedError.id.startsWith('ingested') ? 'AUTO_INGEST' : 'MANUAL_ENTRY'}
                  </div>
                </div>
                <div>
                  <h4 className="label-sm mb-2">Protocol</h4>
                  <div className="text-[10px] font-mono text-gray-500">ALPHA_V1.2</div>
                </div>
             </section>

             {/* Resolution Data (if resolved) */}
             {selectedError.status === 'resolved' && (
               <section className="p-8 border-2 border-green-500/20 bg-green-500/5 space-y-6">
                 <div className="flex items-center gap-3">
                   <CheckCircle2 className="text-green-500" size={24} />
                   <h3 className="text-xl font-black uppercase text-green-500">Resolution Payload</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="label-sm">Resolved By</h4>
                      <div className="flex items-center gap-2 text-sm font-bold uppercase text-white mt-1">
                        {getMember(selectedError.resolvedBy)?.name || 'UNKNOWN'}
                      </div>
                    </div>
                    <div>
                      <h4 className="label-sm">Commit Reference</h4>
                      <a href={selectedError.commitLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-mono text-green-500 hover:underline mt-1 truncate">
                        <LinkIcon size={12} /> {selectedError.commitLink}
                      </a>
                    </div>
                 </div>
               </section>
             )}

             {/* Actions */}
             <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row gap-4 pb-20">
                {selectedError.status === 'active' && (
                  <button 
                    onClick={() => setShowResolveModal(true)}
                    className="btn-primary flex-1 py-5 text-sm font-black uppercase shadow-lg shadow-[#FF6A00]/20"
                  >
                    Mark as Resolved <ArrowRight size={20} />
                  </button>
                )}
                <button 
                  onClick={() => setView('list')}
                  className="px-10 py-5 text-[10px] font-bold uppercase border border-white/10 hover:bg-white/5 transition-colors tracking-widest"
                >
                  Return to Matrix
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }
};
