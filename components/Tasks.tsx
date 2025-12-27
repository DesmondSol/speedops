
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Filter, 
  LayoutGrid,
  History,
  ShieldCheck,
  User,
  ArrowRight,
  ChevronDown,
  Box,
  Link as LinkIcon,
  Target,
  MessageSquare,
  AlertCircle,
  Bug,
  Smartphone,
  Info,
  Send,
  UserPlus,
  ArrowLeft,
  Calendar,
  ChevronLeft,
  Activity,
  Rows3,
  Columns3,
  Hash,
  Terminal,
  FileText,
  // Fix: Added missing Zap import from lucide-react
  Zap
} from 'lucide-react';
import { Project, Task, TaskStatus, TeamMember, TaskProof, TaskComment, CommentTag, Role } from '../types';
import { MOCK_TEAM } from '../constants';

interface TasksProps {
  projects: Project[];
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
}

const STATUS_COLUMNS = [
  TaskStatus.BACKLOG,
  TaskStatus.IN_PROGRESS,
  TaskStatus.TESTING,
  TaskStatus.QA,
  TaskStatus.REVIEW,
  TaskStatus.COMPLETED
];

const COMMENT_TAGS: { tag: CommentTag; icon: any; color: string }[] = [
  { tag: 'Bug', icon: Bug, color: 'text-red-500' },
  { tag: 'Error', icon: AlertCircle, color: 'text-red-400' },
  { tag: 'Incomplete', icon: Clock, color: 'text-orange-400' },
  { tag: 'UI/UX', icon: Smartphone, color: 'text-purple-400' },
  { tag: 'Improvement', icon: Zap, color: 'text-blue-400' },
  { tag: 'Note', icon: Info, color: 'text-gray-400' },
];

export const Tasks: React.FC<TasksProps> = ({ projects, tasks, onAddTask, onUpdateTask }) => {
  const [view, setView] = useState<'board' | 'create'>('board');
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('horizontal');
  const [activeProjectTab, setActiveProjectTab] = useState<'all' | string>('all');
  const [activeMainTab, setActiveMainTab] = useState<'active' | 'archived'>('active');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Transition State
  const [showTransitionModal, setShowTransitionModal] = useState<{task: Task, targetStatus: TaskStatus} | null>(null);
  const [transitionData, setTransitionData] = useState({
    proofLink: '',
    note: '',
    nextAssignee: ''
  });

  // Comment State
  const [commentInput, setCommentInput] = useState('');
  const [selectedCommentTag, setSelectedCommentTag] = useState<CommentTag>('Note');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setLayoutMode('vertical');
      else setLayoutMode('horizontal');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const jumpToColumn = (status: TaskStatus) => {
    const el = columnRefs.current[status];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesProject = activeProjectTab === 'all' ? true : t.projectId === activeProjectTab;
      if (activeMainTab === 'archived') {
        return (t.status === TaskStatus.COMPLETED || t.archived) && matchesProject;
      }
      return !t.archived && (t.status !== TaskStatus.COMPLETED || activeMainTab === 'active') && matchesProject;
    });
  }, [tasks, activeMainTab, activeProjectTab]);

  const [newTaskData, setNewTaskData] = useState({
    projectId: '',
    name: '',
    description: '',
    assigneeId: '',
    start: new Date().toISOString().split('T')[0],
    end: new Date(Date.now() + 604800000).toISOString().split('T')[0]
  });

  const handleCreateTask = () => {
    const task: Task = {
      id: `task-${Date.now()}`,
      projectId: newTaskData.projectId,
      name: newTaskData.name,
      description: newTaskData.description,
      assigneeId: newTaskData.assigneeId,
      testerIds: [],
      qaIds: [],
      status: TaskStatus.BACKLOG,
      acceptanceCriteria: [],
      timeInStage: '0h',
      proofs: [],
      comments: [],
      timeline: {
        start: new Date(newTaskData.start).toISOString(),
        end: new Date(newTaskData.end).toISOString()
      },
      archived: false
    };
    onAddTask(task);
    setView('board');
  };

  const initiateStatusChange = (task: Task, targetStatus: TaskStatus) => {
    setTransitionData({
      proofLink: '',
      note: '',
      nextAssignee: task.assigneeId
    });
    setShowTransitionModal({ task, targetStatus });
  };

  const confirmStatusChange = () => {
    if (!showTransitionModal) return;
    const { task, targetStatus } = showTransitionModal;
    
    const newProof: TaskProof = {
      stage: task.status,
      link: transitionData.proofLink || 'N/A',
      timestamp: new Date().toLocaleString(),
      note: transitionData.note
    };

    const updatedTask: Task = { 
      ...task, 
      status: targetStatus,
      assigneeId: transitionData.nextAssignee || task.assigneeId,
      proofs: [...task.proofs, newProof]
    };
    
    onUpdateTask(updatedTask);
    setShowTransitionModal(null);
    if (selectedTask?.id === updatedTask.id) setSelectedTask(updatedTask);
  };

  const handleAddComment = () => {
    if (!selectedTask || !commentInput.trim()) return;
    
    // For demo purposes, we'll assume current user is "Alex Rivera" (id: 1)
    const currentUser = MOCK_TEAM[0]; 
    
    const newComment: TaskComment = {
      id: `comment-${Date.now()}`,
      authorId: currentUser.id,
      authorRole: currentUser.roles[0],
      content: commentInput,
      tag: selectedCommentTag,
      timestamp: new Date().toLocaleString()
    };

    const updatedTask = {
      ...selectedTask,
      comments: [newComment, ...selectedTask.comments]
    };

    onUpdateTask(updatedTask);
    setSelectedTask(updatedTask);
    setCommentInput('');
  };

  const getMember = (id: string) => MOCK_TEAM.find(m => m.id === id);
  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-180px)] overflow-hidden bg-[#050505]">
      {/* 1. Header Controls */}
      <div className="flex-none space-y-4 mb-4 bg-[#050505]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-4">
          <div className="flex gap-4 items-center">
            <div className="flex p-1 bg-white/5 border border-white/10 rounded-sm">
              <button onClick={() => setLayoutMode('horizontal')} className={`p-1.5 rounded-sm transition-all ${layoutMode === 'horizontal' ? 'bg-[#FF6A00] text-black' : 'text-gray-500 hover:text-white'}`}><Columns3 size={16} /></button>
              <button onClick={() => setLayoutMode('vertical')} className={`p-1.5 rounded-sm transition-all ${layoutMode === 'vertical' ? 'bg-[#FF6A00] text-black' : 'text-gray-500 hover:text-white'}`}><Rows3 size={16} /></button>
            </div>
            <div className="h-6 w-[1px] bg-white/10 mx-2" />
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
              {['active', 'archived'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveMainTab(tab as any)}
                  className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] pb-1 transition-all border-b-2 ${activeMainTab === tab ? 'text-[#FF6A00] border-[#FF6A00]' : 'text-gray-500 border-transparent'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setView('create')} className="btn-primary px-6 py-2 text-[10px] uppercase font-black w-full md:w-auto shadow-lg shadow-[#FF6A00]/10">
            <Plus size={16} /> Initialise unit
          </button>
        </div>

        {/* 2. Pipeline Navigator */}
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar pb-1 bg-[#050505]">
          {STATUS_COLUMNS.map((status, i) => (
            <button 
              key={status}
              onClick={() => jumpToColumn(status)}
              className="flex-none px-4 py-2 bg-white/5 border border-white/10 text-[8px] md:text-[9px] font-mono font-bold uppercase tracking-widest text-gray-500 hover:text-[#FF6A00] hover:border-[#FF6A00]/50 transition-all rounded-sm flex items-center gap-2"
            >
              <span className="opacity-30">{i+1}</span> {status}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Adaptive Board Container */}
      <div className="flex-1 overflow-hidden relative bg-[#050505]">
        {view === 'board' ? (
          <div 
            ref={scrollContainerRef}
            className={`h-full overflow-auto custom-scrollbar bg-[#050505] ${layoutMode === 'horizontal' ? 'flex flex-row gap-6 snap-x snap-mandatory' : 'flex flex-col gap-12 pb-20'}`}
          >
            {STATUS_COLUMNS.map(column => (
              <div 
                key={column} 
                ref={el => { columnRefs.current[column] = el; }}
                className={`flex-none flex flex-col bg-[#050505] ${layoutMode === 'horizontal' ? 'w-[85vw] md:w-[350px] h-full snap-start' : 'w-full px-1'}`}
              >
                <div className="sticky top-0 z-10 bg-[#050505] flex items-center justify-between mb-4 border-b border-[#FF6A00]/20 pb-2">
                  <h3 className="text-[10px] font-mono font-bold text-[#FF6A00] uppercase tracking-[0.3em] flex items-center gap-2">
                    <Activity size={12} className="animate-pulse" /> {column}
                  </h3>
                  <span className="text-[9px] font-mono text-gray-600 bg-white/5 px-2 py-0.5 border border-white/5">
                    {filteredTasks.filter(t => t.status === column).length} units
                  </span>
                </div>

                <div className={`${layoutMode === 'horizontal' ? 'flex-1 overflow-y-auto custom-scrollbar pr-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'}`}>
                  {filteredTasks.filter(t => t.status === column).map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => setSelectedTask(task)}
                      className="neon-border bg-[#0F0F0F] p-5 group cursor-pointer hover:bg-[#151515] transition-all border-l-2 border-l-transparent hover:border-l-[#FF6A00] shadow-xl relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[8px] font-mono text-[#FF6A00] uppercase tracking-tighter opacity-70 font-bold">{getProject(task.projectId)?.name || 'UNMAPPED'}</span>
                        <div className="flex gap-2">
                          {task.comments.length > 0 && <span className="flex items-center gap-1 text-[9px] text-gray-600"><MessageSquare size={10} /> {task.comments.length}</span>}
                          {task.proofs.length > 0 && <ShieldCheck size={11} className="text-green-500" />}
                        </div>
                      </div>
                      <h4 className="font-bold text-xs md:text-sm uppercase mb-4 line-clamp-2 group-hover:text-[#FF6A00] transition-colors leading-relaxed tracking-tight">{task.name}</h4>
                      <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-[8px] font-black text-[#FF6A00]">
                            {getMember(task.assigneeId)?.name[0]}
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 uppercase">{getMember(task.assigneeId)?.name.split(' ')[0]}</span>
                        </div>
                        <div className="text-[9px] font-mono text-gray-700 flex items-center gap-1"><Clock size={10} /> {task.timeInStage}</div>
                      </div>
                    </div>
                  ))}
                  {filteredTasks.filter(t => t.status === column).length === 0 && (
                    <div className="h-32 border border-dashed border-white/5 flex flex-col items-center justify-center opacity-10">
                      <Box size={24} className="mb-2" /><span className="text-[9px] font-mono uppercase tracking-widest">Buffer_Empty</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Create View */
          <div className="h-full overflow-y-auto custom-scrollbar p-1 bg-[#050505]">
             <div className="max-w-3xl mx-auto neon-border bg-[#0F0F0F] p-8 space-y-8 animate-in slide-in-from-bottom-6 duration-500 mb-10">
                <div className="flex justify-between items-center border-b border-white/10 pb-6">
                  <h2 className="text-2xl font-bold uppercase tracking-tighter">New Operational Unit</h2>
                  <button onClick={() => setView('board')} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="label-sm">Mission Context</label>
                    <select className="input-base" value={newTaskData.projectId} onChange={e => setNewTaskData({...newTaskData, projectId: e.target.value})}>
                      <option value="">SELECT PROJECT...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="label-sm">Unit Name</label>
                      <input className="input-base" value={newTaskData.name} onChange={e => setNewTaskData({...newTaskData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="label-sm">Primary Operator</label>
                      <select className="input-base" value={newTaskData.assigneeId} onChange={e => setNewTaskData({...newTaskData, assigneeId: e.target.value})}>
                        <option value="">SELECT PERSON...</option>
                        {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label-sm">Intelligence Briefing</label>
                    <textarea className="input-base h-32" value={newTaskData.description} onChange={e => setNewTaskData({...newTaskData, description: e.target.value})} />
                  </div>
                  <button onClick={handleCreateTask} className="btn-primary w-full py-4 text-sm font-black uppercase">Launch Unit</button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* 4. Task Detail Modal (With Comment Section) */}
      {selectedTask && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full md:max-w-5xl bg-[#0F0F0F] h-full border-l border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl">
            <div className="p-8 border-b border-white/10 flex justify-between items-start bg-[#121212]">
              <div>
                <div className="text-[9px] font-mono text-[#FF6A00] uppercase mb-2 tracking-[0.3em] font-bold">{getProject(selectedTask.projectId)?.name}</div>
                <h2 className="text-2xl md:text-3xl font-bold uppercase leading-tight">{selectedTask.name}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-white transition-colors p-2"><X size={28} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left Column: Info & History */}
              <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar border-r border-white/5">
                <section>
                  <h3 className="label-sm mb-4 flex items-center gap-2"><FileText size={14} /> Intelligence Briefing</h3>
                  <p className="text-xs md:text-sm text-gray-300 font-mono bg-black/40 p-6 border border-white/5 rounded-sm leading-relaxed">{selectedTask.description}</p>
                </section>

                <div className="grid grid-cols-2 gap-6">
                  <section>
                    <h3 className="label-sm mb-4 flex items-center gap-2"><User size={14} /> Current Operator</h3>
                    <div className="flex items-center gap-3 bg-white/5 p-4 border border-white/5">
                      <div className="w-10 h-10 bg-[#FF6A00] text-black font-black flex items-center justify-center rounded-full">{getMember(selectedTask.assigneeId)?.name[0]}</div>
                      <div className="text-xs font-bold uppercase">{getMember(selectedTask.assigneeId)?.name}</div>
                    </div>
                  </section>
                  <section>
                    <h3 className="label-sm mb-4 flex items-center gap-2"><Target size={14} /> Operational Stage</h3>
                    <div className="bg-[#FF6A00]/5 border border-[#FF6A00]/20 p-4 text-[10px] font-bold text-[#FF6A00] uppercase text-center tracking-widest shadow-inner">{selectedTask.status}</div>
                  </section>
                </div>

                <section>
                  <h3 className="label-sm mb-4 flex items-center gap-2"><ShieldCheck size={14} /> Stage Migration History</h3>
                  <div className="space-y-4">
                    {selectedTask.proofs.length === 0 && <div className="text-gray-600 font-mono text-[10px] uppercase p-4 border border-dashed border-white/10">No migration proofs logged.</div>}
                    {selectedTask.proofs.map((proof, idx) => (
                      <div key={idx} className="bg-white/2 border border-white/5 p-4 rounded-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-mono text-[#FF6A00] uppercase font-bold">{proof.stage} Completion</span>
                          <span className="text-[8px] font-mono text-gray-600">{proof.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 mb-2 truncate">
                          <LinkIcon size={12} className="shrink-0" />
                          <a href={proof.link} target="_blank" className="hover:text-[#FF6A00] underline">{proof.link}</a>
                        </div>
                        {proof.note && <div className="text-[10px] text-gray-500 italic">"{proof.note}"</div>}
                      </div>
                    ))}
                  </div>
                </section>

                <div className="pt-8 border-t border-white/5">
                  <h3 className="label-sm mb-4 uppercase">Protocol Authorization (Stage Shift)</h3>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_COLUMNS.map(s => (
                      <button 
                        key={s} 
                        onClick={() => s !== selectedTask.status && initiateStatusChange(selectedTask, s)}
                        className={`px-4 py-2 text-[10px] font-mono border transition-all ${selectedTask.status === s ? 'bg-[#FF6A00] text-black border-[#FF6A00] font-bold' : 'border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Intelligence Feed (Comments) */}
              <div className="w-full lg:w-[400px] flex flex-col bg-[#050505]">
                <div className="p-8 border-b border-white/5 bg-white/2">
                   <h3 className="label-sm mb-4 flex items-center gap-2"><Terminal size={14} /> Intelligence Feed</h3>
                   
                   <div className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {COMMENT_TAGS.map(({tag, icon: Icon, color}) => (
                          <button 
                            key={tag} 
                            onClick={() => setSelectedCommentTag(tag)}
                            className={`flex items-center gap-1.5 px-2 py-1 border text-[8px] font-mono uppercase tracking-tighter transition-all ${selectedCommentTag === tag ? `bg-white/10 ${color} border-white/20` : 'border-white/5 text-gray-600 hover:text-white'}`}
                          >
                            <Icon size={10} /> {tag}
                          </button>
                        ))}
                      </div>
                      <div className="relative">
                        <textarea 
                          className="w-full bg-white/5 border border-white/10 p-4 text-[11px] font-mono text-white placeholder:text-gray-700 h-24 focus:outline-none focus:border-[#FF6A00] transition-colors resize-none rounded-sm"
                          placeholder="INGEST INTELLIGENCE..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                        />
                        <button 
                          onClick={handleAddComment}
                          disabled={!commentInput.trim()}
                          className="absolute bottom-3 right-3 p-2 bg-[#FF6A00] text-black rounded-sm hover:bg-[#ff8533] transition-colors disabled:opacity-30"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                  {selectedTask.comments.length === 0 && (
                    <div className="py-20 text-center opacity-20 flex flex-col items-center">
                      <MessageSquare size={32} className="mb-2" />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Intel_Stream_Silent</span>
                    </div>
                  )}
                  {selectedTask.comments.map((comment) => {
                    const author = getMember(comment.authorId);
                    const tagMeta = COMMENT_TAGS.find(t => t.tag === comment.tag);
                    return (
                      <div key={comment.id} className="relative pl-4 border-l-2 border-white/5 group">
                        <div className={`absolute -left-[2px] top-0 w-[2px] h-full ${tagMeta?.color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor]`} />
                        <div className="flex justify-between items-start mb-2">
                           <div>
                             <span className="text-[10px] font-bold uppercase text-white block">{author?.name}</span>
                             <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest">{comment.authorRole}</span>
                           </div>
                           <div className="text-right">
                             <div className={`text-[8px] font-mono uppercase flex items-center justify-end gap-1 ${tagMeta?.color}`}>
                               {tagMeta && <tagMeta.icon size={10} />} {comment.tag}
                             </div>
                             <div className="text-[8px] font-mono text-gray-700">{comment.timestamp}</div>
                           </div>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono leading-relaxed bg-white/2 p-3 rounded-sm border border-white/5">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Handover Protocol Modal (Migration Confirmation) */}
      {showTransitionModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-xl neon-border bg-[#0F0F0F] p-10 space-y-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <h3 className="text-2xl font-bold uppercase tracking-tighter flex items-center gap-4">
                  <Terminal size={24} className="text-[#FF6A00]" /> Handover Protocol
                </h3>
                <button onClick={() => setShowTransitionModal(null)} className="text-gray-500 hover:text-white"><X size={24} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-white/5 border border-white/10 mb-6">
                 <div className="text-center">
                   <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Exit Stage</div>
                   <div className="text-sm font-bold text-gray-400 uppercase">{showTransitionModal.task.status}</div>
                 </div>
                 <div className="flex items-center justify-center"><ArrowRight className="text-[#FF6A00]" size={20} /></div>
                 <div className="text-center">
                   <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Entry Stage</div>
                   <div className="text-sm font-bold text-[#FF6A00] uppercase">{showTransitionModal.targetStatus}</div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                   <label className="label-sm">Deployment Proof Link (Gated)</label>
                   <div className="relative">
                     <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                     <input 
                       className="input-base pl-12" 
                       placeholder="https://github.com/..." 
                       value={transitionData.proofLink}
                       onChange={e => setTransitionData({...transitionData, proofLink: e.target.value})}
                     />
                   </div>
                 </div>
                 
                 <div>
                   <label className="label-sm">Assign Next Operator</label>
                   <div className="relative">
                     <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                     <select 
                       className="input-base pl-12"
                       value={transitionData.nextAssignee}
                       onChange={e => setTransitionData({...transitionData, nextAssignee: e.target.value})}
                     >
                       {MOCK_TEAM.map(m => <option key={m.id} value={m.id}>{m.name.toUpperCase()} ({m.roles[0]})</option>)}
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="label-sm">Protocol Notes (Optional)</label>
                   <textarea 
                     className="input-base h-20" 
                     placeholder="HANDOVER BRIEFING..." 
                     value={transitionData.note}
                     onChange={e => setTransitionData({...transitionData, note: e.target.value})}
                   />
                 </div>

                 <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowTransitionModal(null)} className="flex-1 py-4 text-[10px] font-mono uppercase border border-white/10 hover:bg-white/5 transition-colors">Abort</button>
                  <button onClick={confirmStatusChange} className="flex-1 py-4 text-[10px] font-mono uppercase bg-[#FF6A00] text-black font-black hover:bg-[#ff8533] transition-colors">Authorize Migration</button>
                 </div>
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
        .input-base:focus { outline: none; border-color: #FF6A00; box-shadow: 0 0 15px rgba(255, 106, 0, 0.1); }
        .label-sm { display: block; font-size: 10px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; color: #555; margin-bottom: 0.5rem; letter-spacing: 0.2em; font-weight: 700; }
        .btn-primary { background-color: #FF6A00; color: black; font-weight: 900; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.2s; border-radius: 2px; letter-spacing: 0.1em; }
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF6A00; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};
