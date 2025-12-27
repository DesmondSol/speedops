
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Clock, 
  Target, 
  User, 
  AlertCircle,
  Filter,
  ArrowRight,
  Maximize2,
  List
} from 'lucide-react';
import { Project, Milestone, TeamMember } from '../types';
import { MOCK_TEAM } from '../constants';

interface SchedulesProps {
  projects: Project[];
  milestones: Milestone[];
  onAddMilestone: (m: Milestone) => void;
}

type ViewType = 'month' | 'week' | 'day';

export const Schedules: React.FC<SchedulesProps> = ({ projects, milestones, onAddMilestone }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['all']);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Form state
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    projectId: '',
    deadline: new Date().toISOString().split('T')[0],
    ownerId: '',
    urgency: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewType === 'month') next.setMonth(next.getMonth() - 1);
    else if (viewType === 'week') next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewType === 'month') next.setMonth(next.getMonth() + 1);
    else if (viewType === 'week') next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const filteredMilestones = useMemo(() => {
    return milestones.filter(m => {
      const isPast = new Date(m.deadline) < new Date();
      const matchesTab = activeTab === 'active' ? !isPast : isPast;
      const matchesProject = selectedProjects.includes('all') || selectedProjects.includes(m.projectId);
      return matchesTab && matchesProject;
    });
  }, [milestones, activeTab, selectedProjects]);

  const toggleProjectFilter = (id: string) => {
    if (id === 'all') {
      setSelectedProjects(['all']);
      return;
    }
    setSelectedProjects(prev => {
      const filtered = prev.filter(p => p !== 'all');
      if (filtered.includes(id)) {
        const next = filtered.filter(p => p !== id);
        return next.length === 0 ? ['all'] : next;
      }
      return [...filtered, id];
    });
  };

  const handleCreate = () => {
    const m: Milestone = {
      id: `ms-${Date.now()}`,
      ...newMilestone,
      archived: false
    };
    onAddMilestone(m);
    setShowCreateModal(false);
  };

  const renderCalendar = () => {
    switch (viewType) {
      case 'month': return renderMonthView();
      case 'week': return renderWeekView();
      case 'day': return renderDayView();
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const renderMonthView = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
      <div className="grid grid-cols-7 border-t border-l border-white/5 h-full min-h-[600px]">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="p-3 border-r border-b border-white/5 bg-white/2 text-[10px] font-mono text-gray-500 uppercase text-center">{d}</div>
        ))}
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="border-r border-b border-white/5 bg-white/1" />;
          
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayMilestones = filteredMilestones.filter(m => m.deadline === dateStr);
          const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

          return (
            <div key={day} className={`p-2 border-r border-b border-white/5 min-h-[100px] transition-colors hover:bg-white/2 relative ${isToday ? 'bg-[#FF6A00]/5' : ''}`}>
              <span className={`text-[10px] font-mono ${isToday ? 'text-[#FF6A00] font-black' : 'text-gray-600'}`}>{day}</span>
              <div className="mt-1 space-y-1">
                {dayMilestones.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => setSelectedMilestone(m)}
                    className="w-full text-left px-1.5 py-0.5 bg-[#FF6A00] text-black text-[8px] font-bold uppercase truncate rounded-sm shadow-sm hover:scale-[1.02] transition-transform"
                  >
                    {m.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }

    return (
      <div className="grid grid-cols-7 h-full min-h-[600px] border-l border-white/5">
        {days.map((date, i) => {
          const dateStr = date.toISOString().split('T')[0];
          const dayMilestones = filteredMilestones.filter(m => m.deadline === dateStr);
          return (
            <div key={i} className="flex flex-col border-r border-white/5">
              <div className="p-4 border-b border-white/5 bg-white/2 text-center">
                <div className="text-[10px] font-mono text-gray-500 uppercase">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}</div>
                <div className="text-xl font-bold">{date.getDate()}</div>
              </div>
              <div className="flex-1 p-3 space-y-2 bg-white/1">
                {dayMilestones.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => setSelectedMilestone(m)}
                    className="p-3 bg-[#0F0F0F] border-l-2 border-[#FF6A00] cursor-pointer hover:bg-[#151515] transition-all"
                  >
                    <div className="text-[8px] font-mono text-[#FF6A00] uppercase mb-1">{projects.find(p => p.id === m.projectId)?.name}</div>
                    <div className="text-[10px] font-black uppercase tracking-tight leading-tight">{m.title}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayMilestones = filteredMilestones.filter(m => m.deadline === dateStr);
    return (
      <div className="flex flex-col h-full bg-[#0F0F0F] neon-border">
        <div className="p-8 border-b border-white/5 bg-white/2">
          <div className="text-sm font-mono text-[#FF6A00] uppercase tracking-[0.2em] mb-2">{currentDate.toLocaleDateString('en-US', { weekday: 'long' })}</div>
          <h2 className="text-4xl font-black uppercase tracking-tighter">{currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h2>
        </div>
        <div className="flex-1 p-8 space-y-6">
          <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Unit Agenda ({dayMilestones.length})</h3>
          {dayMilestones.length === 0 ? (
            <div className="py-20 text-center opacity-20 flex flex-col items-center">
              <CalendarIcon size={48} className="mb-4" />
              <span className="text-xs font-mono uppercase tracking-[0.5em]">No_Operational_Markers</span>
            </div>
          ) : (
            dayMilestones.map(m => (
              <div 
                key={m.id} 
                onClick={() => setSelectedMilestone(m)}
                className="bg-white/5 border border-white/10 p-6 flex justify-between items-center group cursor-pointer hover:border-[#FF6A00] transition-all"
              >
                <div>
                  <div className="text-[9px] font-mono text-gray-600 uppercase mb-1">{projects.find(p => p.id === m.projectId)?.name}</div>
                  <h4 className="text-xl font-bold uppercase tracking-tight group-hover:text-[#FF6A00] transition-colors">{m.title}</h4>
                  <div className="text-[10px] text-gray-500 font-mono mt-2 italic">Ref_ID: {m.id}</div>
                </div>
                <ArrowRight className="text-gray-700 group-hover:text-[#FF6A00] transition-colors" />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6 bg-[#050505]">
      {/* Navigation & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-4">
          <div className="flex gap-6 items-center">
            {['active', 'past'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === tab ? 'text-[#FF6A00] border-[#FF6A00]' : 'text-gray-500 border-transparent hover:text-white'}`}
              >
                {tab} markers
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1 rounded-sm border border-white/10">
              {(['month', 'week', 'day'] as ViewType[]).map(v => (
                <button 
                  key={v}
                  onClick={() => setViewType(v)}
                  className={`px-4 py-1.5 text-[9px] font-mono uppercase rounded-sm transition-all ${viewType === v ? 'bg-[#FF6A00] text-black font-black' : 'text-gray-500 hover:text-white'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-sm border border-white/10">
              <button onClick={handlePrev} className="p-1.5 hover:text-[#FF6A00] transition-colors"><ChevronLeft size={16} /></button>
              <span className="text-[10px] font-mono font-bold uppercase min-w-[120px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: viewType !== 'month' ? 'numeric' : undefined })}
              </span>
              <button onClick={handleNext} className="p-1.5 hover:text-[#FF6A00] transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary px-8 py-3 text-[10px] font-black uppercase shadow-lg shadow-[#FF6A00]/20 flex items-center gap-2"
        >
          <Plus size={16} /> New Marker
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        {/* Project Filters */}
        <div className="lg:w-72 flex-none space-y-4">
          <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Filter size={14} /> Deployment Filter
          </h3>
          <div className="flex flex-wrap lg:flex-col gap-2">
            <button 
              onClick={() => toggleProjectFilter('all')}
              className={`px-4 py-3 text-left border rounded-sm transition-all ${selectedProjects.includes('all') ? 'bg-[#FF6A00] text-black border-[#FF6A00] font-black' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
            >
              <div className="text-[10px] uppercase font-mono tracking-widest">All Units</div>
            </button>
            {projects.map(p => (
              <button 
                key={p.id}
                onClick={() => toggleProjectFilter(p.id)}
                className={`px-4 py-3 text-left border rounded-sm transition-all ${selectedProjects.includes(p.id) ? 'bg-[#FF6A00]/10 text-[#FF6A00] border-[#FF6A00]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}
              >
                <div className="text-[8px] font-mono opacity-50 uppercase mb-1">{p.client}</div>
                <div className="text-[10px] uppercase font-bold truncate tracking-tight">{p.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-[#0F0F0F] border border-white/5 overflow-y-auto custom-scrollbar shadow-2xl">
          {renderCalendar()}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-xl neon-border bg-[#0F0F0F] p-8 md:p-12 space-y-8 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Initialize Marker</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white"><X size={28} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="label-sm">Deployment Project</label>
                  <select className="input-base" value={newMilestone.projectId} onChange={e => setNewMilestone({...newMilestone, projectId: e.target.value})}>
                    <option value="">SELECT PROJECT...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-sm">Marker Title</label>
                  <input className="input-base" placeholder="E.G. BETA RELEASE" value={newMilestone.title} onChange={e => setNewMilestone({...newMilestone, title: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="label-sm">Target Date</label>
                    <input type="date" className="input-base" value={newMilestone.deadline} onChange={e => setNewMilestone({...newMilestone, deadline: e.target.value})} />
                  </div>
                  <div>
                    <label className="label-sm">Urgency Protocol</label>
                    <select className="input-base" value={newMilestone.urgency} onChange={e => setNewMilestone({...newMilestone, urgency: e.target.value as any})}>
                      <option value="Low">LOW</option>
                      <option value="Medium">MEDIUM</option>
                      <option value="High">HIGH</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label-sm">Briefing Details</label>
                  <textarea className="input-base h-24" placeholder="DESCRIBE MISSION GOAL..." value={newMilestone.description} onChange={e => setNewMilestone({...newMilestone, description: e.target.value})} />
                </div>
                <button onClick={handleCreate} className="btn-primary w-full py-5 text-sm font-black uppercase shadow-lg shadow-[#FF6A00]/20">Authorize Placement</button>
              </div>
           </div>
        </div>
      )}

      {selectedMilestone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg neon-border bg-[#0F0F0F] p-10 space-y-10 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono text-[#FF6A00] uppercase tracking-[0.3em] font-bold mb-2">
                    {projects.find(p => p.id === selectedMilestone.projectId)?.name}
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight">{selectedMilestone.title}</h3>
                </div>
                <button onClick={() => setSelectedMilestone(null)} className="text-gray-500 hover:text-white"><X size={32} /></button>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                <div className="space-y-4">
                  <h4 className="label-sm flex items-center gap-2"><Clock size={14} /> Arrival</h4>
                  <div className="text-xl font-bold font-mono text-white">{selectedMilestone.deadline}</div>
                </div>
                <div className="space-y-4">
                  <h4 className="label-sm flex items-center gap-2"><AlertCircle size={14} /> Priority</h4>
                  <div className={`text-xl font-bold font-mono uppercase ${selectedMilestone.urgency === 'High' ? 'text-red-500' : 'text-[#FF6A00]'}`}>{selectedMilestone.urgency}</div>
                </div>
              </div>

              <div className="space-y-4">
                 <h4 className="label-sm">Operational Brief</h4>
                 <p className="text-sm text-gray-400 font-mono italic leading-relaxed bg-black/40 p-6 border border-white/5">
                   "{selectedMilestone.description || "Intelligence missing for this marker. Proceed with caution."}"
                 </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setSelectedMilestone(null)}
                  className="flex-1 py-4 text-[10px] font-black uppercase border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Return to Intel
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
        .input-base:focus {
          outline: none;
          border-color: #FF6A00;
        }
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
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 0; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF6A00; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};
