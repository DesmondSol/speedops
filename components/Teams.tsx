
import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  X, 
  ChevronRight, 
  User, 
  Zap, 
  Activity, 
  Calendar, 
  ShieldCheck, 
  Map, 
  BrainCircuit, 
  Clock, 
  Box,
  Target,
  ArrowRight,
  Search,
  CheckCircle2,
  Trash2,
  History,
  Briefcase
} from 'lucide-react';
import { TeamMember, TeamMemberStatus, Role, Project } from '../types';

interface TeamsProps {
  members: TeamMember[];
  projects: Project[];
  onAddMember: (member: TeamMember) => void;
}

const ROLES: Role[] = ['Frontend', 'Backend', 'Tester', 'QA', 'Project Manager', 'Designer', 'DevOps'];

export const Teams: React.FC<TeamsProps> = ({ members, projects, onAddMember }) => {
  const [view, setView] = useState<'list' | 'create' | 'dossier'>('list');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newMember, setNewMember] = useState({
    name: '',
    roles: [] as Role[],
    availability: '100%',
    timezone: 'UTC',
    specialties: '',
    bio: '',
    strength: 80
  });

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const isArchived = activeTab === 'archived';
      const matchesArchive = (m.archived || false) === isArchived;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.roles.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesArchive && matchesSearch;
    });
  }, [members, activeTab, searchQuery]);

  const handleCreateMember = () => {
    const member: TeamMember = {
      id: `mem-${Date.now()}`,
      name: newMember.name,
      roles: newMember.roles,
      status: TeamMemberStatus.IDLE,
      availability: newMember.availability,
      timezone: newMember.timezone,
      strength: newMember.strength,
      specialties: newMember.specialties.split(',').map(s => s.trim()),
      bio: newMember.bio,
      joinDate: new Date().toISOString().split('T')[0],
      archived: false
    };
    onAddMember(member);
    setView('list');
    setNewMember({ name: '', roles: [], availability: '100%', timezone: 'UTC', specialties: '', bio: '', strength: 80 });
  };

  const getMemberProjects = (memberId: string) => {
    return projects.filter(p => p.teamAssignments.some(ta => ta.memberId === memberId));
  };

  const StatusIndicator = ({ status }: { status: TeamMemberStatus }) => {
    const colors = {
      [TeamMemberStatus.ACTIVE]: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]',
      [TeamMemberStatus.IDLE]: 'bg-[#FF6A00] shadow-[0_0_10px_rgba(255,106,0,0.4)]',
      [TeamMemberStatus.BLOCKED]: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]',
    };
    return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-6">
        <div className="flex gap-6 items-center">
          {['active', 'archived'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === tab ? 'text-[#FF6A00] border-[#FF6A00]' : 'text-gray-500 border-transparent hover:text-white'}`}
            >
              {tab} PERSONNEL
            </button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="FILTER BY ROLE/NAME..." 
              className="bg-white/5 border border-white/10 text-[10px] font-mono px-9 py-2 rounded-sm w-full md:w-64 focus:border-[#FF6A00] outline-none uppercase"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setView('create')}
            className="btn-primary px-6 py-2 text-[10px] font-black uppercase flex items-center gap-2"
          >
            <UserPlus size={16} /> Recruit Operator
          </button>
        </div>
      </div>

      {/* 2. Main Viewport */}
      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map(member => {
            const memberProjects = getMemberProjects(member.id);
            return (
              <div 
                key={member.id} 
                onClick={() => { setSelectedMember(member); setView('dossier'); }}
                className="neon-border bg-[#0F0F0F] p-6 group cursor-pointer hover:bg-[#151515] transition-all border-l-2 border-l-transparent hover:border-l-[#FF6A00] flex flex-col h-full shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={member.status} />
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{member.status}</span>
                  </div>
                  <div className="text-[10px] font-bold text-[#FF6A00] font-mono">{member.availability}</div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold uppercase group-hover:text-[#FF6A00] transition-colors mb-1 truncate">{member.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {member.roles.map(role => (
                      <span key={role} className="text-[8px] font-mono bg-white/5 px-1.5 py-0.5 text-gray-400 uppercase border border-white/5">{role}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-[8px] font-mono uppercase text-gray-600 mb-1">
                      <span>Operational Strength</span>
                      <span>{member.strength}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF6A00] shadow-[0_0_8px_rgba(255,106,0,0.5)]" style={{ width: `${member.strength}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2 overflow-hidden">
                    {member.specialties.slice(0, 3).map(s => (
                      <span key={s} className="text-[7px] font-mono text-gray-500 border border-white/5 px-1 whitespace-nowrap">{s}</span>
                    ))}
                    {member.specialties.length > 3 && <span className="text-[7px] font-mono text-gray-500">+{member.specialties.length - 3}</span>}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase size={12} className="text-gray-600" />
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">
                      {memberProjects.length} Active Jobs
                    </span>
                  </div>
                  <ArrowRight size={14} className="text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
          {filteredMembers.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-10">
              <User size={64} className="mb-4" />
              <span className="text-xl font-mono uppercase tracking-[0.5em]">No_Personnel_Detected</span>
            </div>
          )}
        </div>
      ) : view === 'create' ? (
        <div className="max-w-3xl mx-auto w-full neon-border bg-[#0F0F0F] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-6 duration-500 shadow-2xl mb-12">
          <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter">Initialize Personnel</h2>
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors"><X size={28} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="label-sm">Legal Codename</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. JOHN DOE" 
                  value={newMember.name} 
                  onChange={e => setNewMember({...newMember, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="label-sm">Operational Roles</label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {ROLES.map(role => (
                    <button 
                      key={role}
                      onClick={() => {
                        const exists = newMember.roles.includes(role);
                        setNewMember({
                          ...newMember,
                          roles: exists ? newMember.roles.filter(r => r !== role) : [...newMember.roles, role]
                        });
                      }}
                      className={`px-3 py-1 text-[9px] font-mono uppercase border transition-all ${newMember.roles.includes(role) ? 'border-[#FF6A00] text-[#FF6A00] bg-[#FF6A00]/5' : 'border-white/10 text-gray-500 hover:text-white'}`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-sm">Availability Meter ({newMember.availability})</label>
                <input 
                  type="range" 
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#FF6A00]" 
                  min="0" max="100" step="10"
                  onChange={e => setNewMember({...newMember, availability: `${e.target.value}%`})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label-sm">Temporal Sync (Timezone)</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. PST / GMT+2" 
                  value={newMember.timezone}
                  onChange={e => setNewMember({...newMember, timezone: e.target.value})}
                />
              </div>
              <div>
                <label className="label-sm">Specialty Clusters (Comma Separated)</label>
                <input 
                  className="input-base" 
                  placeholder="REACT, RUST, AWS..." 
                  value={newMember.specialties}
                  onChange={e => setNewMember({...newMember, specialties: e.target.value})}
                />
              </div>
              <div>
                <label className="label-sm">Operator Strength (0-100)</label>
                <input 
                  type="number"
                  className="input-base"
                  value={newMember.strength}
                  onChange={e => setNewMember({...newMember, strength: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label className="label-sm">Personnel Dossier / Bio</label>
              <textarea 
                className="input-base h-24" 
                placeholder="MISSION EXPERIENCE AND TECH STACK OVERVIEW..." 
                value={newMember.bio}
                onChange={e => setNewMember({...newMember, bio: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleCreateMember}
            disabled={!newMember.name || newMember.roles.length === 0}
            className="btn-primary w-full py-5 text-sm font-black uppercase shadow-lg shadow-[#FF6A00]/20 disabled:opacity-20 transition-all"
          >
            Authorize Recruitment <ArrowRight size={20} />
          </button>
        </div>
      ) : dossierView()}

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
      `}</style>
    </div>
  );

  function dossierView() {
    if (!selectedMember) return null;
    const memberProjects = getMemberProjects(selectedMember.id);
    const leadingProjects = projects.filter(p => p.lead === selectedMember.name);
    const involvedProjects = memberProjects.filter(p => p.lead !== selectedMember.name);

    return (
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full md:max-w-4xl bg-[#0F0F0F] h-full border-l border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-white/10 flex justify-between items-start bg-[#121212]">
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-[#FF6A00] rounded-sm shadow-inner relative overflow-hidden">
                {selectedMember.name[0]}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FF6A00] shadow-[0_0_10px_#FF6A00]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-none">{selectedMember.name}</h2>
                  <StatusIndicator status={selectedMember.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.roles.map(r => (
                    <span key={r} className="text-[10px] font-mono text-[#FF6A00] border border-[#FF6A00]/30 px-2 py-0.5 uppercase tracking-widest">{r}</span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors p-2"><X size={32} /></button>
          </div>

          {/* Dossier Content */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar bg-[#0F0F0F]">
            {/* Meta Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4 bg-white/5 p-6 border border-white/5 rounded-sm">
                <h4 className="label-sm flex items-center gap-2"><Map size={14} /> Synchronicity</h4>
                <div className="text-xl font-bold font-mono text-white">{selectedMember.timezone}</div>
                <div className="text-[9px] text-gray-500 font-mono uppercase">Temporal Anchor</div>
              </div>
              <div className="space-y-4 bg-white/5 p-6 border border-white/5 rounded-sm">
                <h4 className="label-sm flex items-center gap-2"><Activity size={14} /> Capacity</h4>
                <div className="text-xl font-bold font-mono text-[#FF6A00]">{selectedMember.availability}</div>
                <div className="text-[9px] text-gray-500 font-mono uppercase">Operational Bandwidth</div>
              </div>
              <div className="space-y-4 bg-white/5 p-6 border border-white/5 rounded-sm">
                <h4 className="label-sm flex items-center gap-2"><Zap size={14} /> Strength</h4>
                <div className="text-xl font-bold font-mono text-white">{selectedMember.strength}%</div>
                <div className="text-[9px] text-gray-500 font-mono uppercase">Benchmark Score</div>
              </div>
            </div>

            {/* Bio & Specialties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section>
                <h3 className="label-sm mb-6 flex items-center gap-2"><Box size={16} /> Operational Brief</h3>
                <p className="text-sm text-gray-300 font-mono leading-relaxed bg-black/40 p-6 border border-white/5 rounded-sm whitespace-pre-wrap">
                  {selectedMember.bio || "No dossiers entries found for this operator. Intelligence remains classified."}
                </p>
              </section>
              <section>
                <h3 className="label-sm mb-6 flex items-center gap-2"><BrainCircuit size={16} /> Core Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.specialties.map(s => (
                    <div key={s} className="bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-mono text-white uppercase tracking-widest hover:border-[#FF6A00] transition-colors cursor-default">
                      {s}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Deployment Matrix */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="label-sm m-0 flex items-center gap-2"><Target size={18} /> Deployment Matrix</h3>
                <span className="text-[10px] font-mono text-gray-600 uppercase">Total_Assignments: {memberProjects.length}</span>
              </div>

              {/* Leading Section */}
              {leadingProjects.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-[#FF6A00] uppercase tracking-[0.3em] flex items-center gap-2">
                    <CheckCircle2 size={12} /> Primary Lead
                  </h4>
                  {leadingProjects.map(p => (
                    <div key={p.id} className="bg-white/5 border-l-4 border-[#FF6A00] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="max-w-md">
                        <div className="text-[9px] font-mono text-[#FF6A00] uppercase mb-1">{p.client}</div>
                        <h5 className="text-xl font-bold uppercase mb-2 tracking-tight">{p.name}</h5>
                        <p className="text-xs text-gray-500 font-mono line-clamp-1 italic">"{p.description}"</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-white">{p.progress}%</div>
                        <div className="text-[9px] text-gray-600 font-mono uppercase">Unit Progress</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Involved Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Activity size={12} /> Supporting Assignments
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {involvedProjects.map(p => {
                    const assignment = p.teamAssignments.find(ta => ta.memberId === selectedMember.id);
                    return (
                      <div key={p.id} className="bg-black/40 border border-white/5 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-4">
                          <div className="text-[8px] font-mono text-gray-600 uppercase mb-1">{p.client}</div>
                          <h5 className="text-sm font-bold uppercase truncate">{p.name}</h5>
                        </div>
                        <div className="md:col-span-3">
                          <div className="text-[8px] font-mono text-[#FF6A00] uppercase mb-1">Assigned_Title</div>
                          <div className="text-[10px] font-bold uppercase text-white">{assignment?.roles.join(', ') || 'SUPPORT'}</div>
                        </div>
                        <div className="md:col-span-5">
                          <div className="text-[8px] font-mono text-gray-600 uppercase mb-1">Key_Responsibility</div>
                          <div className="text-[10px] font-mono text-gray-400 italic">"{assignment?.responsibility || 'GENERAL OPERATIONAL SUPPORT'}"</div>
                        </div>
                      </div>
                    );
                  })}
                  {involvedProjects.length === 0 && leadingProjects.length === 0 && (
                    <div className="p-12 border border-dashed border-white/5 text-center opacity-20 flex flex-col items-center">
                      <Activity size={32} className="mb-2" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">No_Active_Assignments</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
            
            {/* Joined Date */}
            <div className="pt-12 border-t border-white/5 flex justify-center">
               <div className="flex items-center gap-2 text-[10px] font-mono text-gray-700 uppercase tracking-widest">
                 <History size={14} /> Registered Since: {selectedMember.joinDate}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
