
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  UserPlus, 
  ArrowRight,
  ChevronLeft,
  Layers,
  FileText,
  Users,
  Activity,
  ArrowUpRight,
  Zap,
  Flag,
  UserCheck,
  BrainCircuit,
  Trash2
} from 'lucide-react';
import { ProjectStatus, ProjectStage, Role, Project, Client, TeamMember } from '../types';
import { generateProjectBrief, generateTaskBreakdown } from '../services/geminiService';

const ROLES: Role[] = ['Frontend', 'Backend', 'Tester', 'QA', 'Project Manager', 'Designer', 'DevOps'];

interface ProjectsProps {
  projects: Project[];
  clients: Client[];
  members: TeamMember[]; 
  onAddProject: (p: Project) => void;
  onUpdateProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, clients, members, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    purpose: '',
    objectives: '',
    scope: '',
    features: '',
    timeline: '',
    resources: '',
    dealOwner: '',
    projectLead: ''
  });

  const [teamAssignments, setTeamAssignments] = useState<{id: string, roles: Role[]}[]>([]);
  const [generatedBrief, setGeneratedBrief] = useState('');
  const [generatedBreakdown, setGeneratedBreakdown] = useState<{features: any[], milestones: any[]}>({ features: [], milestones: [] });

  // Persistence logic for drafts
  useEffect(() => {
    const draft = localStorage.getItem('speedops_deployment_draft');
    if (draft && view === 'create') {
      const parsed = JSON.parse(draft);
      setFormData(parsed.formData);
      setTeamAssignments(parsed.teamAssignments);
      setGeneratedBrief(parsed.generatedBrief);
      setGeneratedBreakdown(parsed.generatedBreakdown || { features: [], milestones: [] });
      setStep(parsed.step);
    }
  }, [view]);

  useEffect(() => {
    if (view === 'create') {
      localStorage.setItem('speedops_deployment_draft', JSON.stringify({
        formData, teamAssignments, generatedBrief, generatedBreakdown, step
      }));
    }
  }, [formData, teamAssignments, generatedBrief, generatedBreakdown, step, view]);

  const toggleRole = (memberId: string, role: Role) => {
    setTeamAssignments(prev => {
      const existing = prev.find(p => p.id === memberId);
      if (existing) {
        if (existing.roles.includes(role)) {
          const newRoles = existing.roles.filter(r => r !== role);
          if (newRoles.length === 0) return prev.filter(p => p.id !== memberId);
          return prev.map(p => p.id === memberId ? { ...p, roles: newRoles } : p);
        } else {
          return prev.map(p => p.id === memberId ? { ...p, roles: [...p.roles, role] } : p);
        }
      } else {
        return [...prev, { id: memberId, roles: [role] }];
      }
    });
  };

  const handleNext = async () => {
    if (step === 2) {
      if (!generatedBrief) {
        setLoading(true);
        const teamData = teamAssignments.map(ta => ({
          ...members.find(m => m.id === ta.id),
          roles: ta.roles
        }));
        const brief = await generateProjectBrief(formData, teamData);
        setGeneratedBrief(brief);
        setLoading(false);
      }
      setStep(3);
    } else if (step === 3) {
      if (!generatedBreakdown || generatedBreakdown.features.length === 0) {
        setLoading(true);
        const teamData = teamAssignments.map(ta => ({
          ...members.find(m => m.id === ta.id),
          roles: ta.roles
        }));
        const breakdown = await generateTaskBreakdown(generatedBrief, teamData);
        setGeneratedBreakdown(breakdown);
        setLoading(false);
      }
      setStep(4);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleInitializeProject = () => {
    const selectedClientObj = clients.find(c => c.name === formData.client);
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: formData.name,
      client: formData.client,
      clientId: selectedClientObj?.id,
      status: ProjectStatus.ACTIVE,
      stage: ProjectStage.DEV,
      progress: 0,
      lead: formData.projectLead,
      dealOwner: formData.dealOwner,
      description: formData.purpose,
      objectives: formData.objectives.split('\n').filter(o => o.trim()),
      teamAssignments: teamAssignments.map(ta => ({ memberId: ta.id, roles: ta.roles })),
      brief: generatedBrief,
      timeline: formData.timeline,
      resources: formData.resources,
      features: generatedBreakdown.features,
      // @ts-ignore
      aiMilestones: generatedBreakdown.milestones
    };
    onAddProject(newProject);
    setView('list');
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: '', client: '', purpose: '', objectives: '', scope: '', 
      features: '', timeline: '', resources: '', dealOwner: '', projectLead: ''
    });
    setTeamAssignments([]);
    setGeneratedBrief('');
    setGeneratedBreakdown({ features: [], milestones: [] });
    localStorage.removeItem('speedops_deployment_draft');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setView('details');
  };

  const handleDelete = () => {
    if (!selectedProject) return;
    if (confirm(`DECOMMISSION MISSION ${selectedProject.name.toUpperCase()}? THIS CANNOT BE UNDONE.`)) {
      onDeleteProject(selectedProject.id);
      setView('list');
      setSelectedProject(null);
    }
  };

  if (view === 'details' && selectedProject) {
    return (
      <div className="max-w-7xl mx-auto pb-12 px-2 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-6 gap-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-[#FF6A00] uppercase font-mono text-[10px] transition-colors">
             <ChevronLeft size={14} /> Back
           </button>
           <div className="md:text-right w-full flex flex-col md:items-end gap-2">
             <h2 className="text-xl md:text-3xl font-bold tracking-tight uppercase line-clamp-1">{selectedProject.name}</h2>
             <p className="text-[#FF6A00] font-mono text-[9px] md:text-xs uppercase tracking-widest">{selectedProject.client}</p>
             <button 
               onClick={handleDelete}
               className="mt-2 text-red-500 hover:text-white hover:bg-red-500/20 px-3 py-1 border border-red-500/30 rounded-sm text-[9px] font-mono uppercase tracking-widest flex items-center gap-2 w-fit transition-all"
             >
               <Trash2 size={12} /> Decommission Mission
             </button>
           </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <section className="neon-border bg-[#0F0F0F] p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-[#FF6A00]" size={20} />
                <h3 className="font-bold uppercase tracking-widest text-lg">Mission Briefing</h3>
              </div>
              <div className="bg-black/40 border border-white/5 p-6 rounded-sm font-mono text-xs md:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                {selectedProject.brief || "Dossier unavailable."}
              </div>
            </section>

            {selectedProject.features && selectedProject.features.length > 0 && (
              <section className="neon-border bg-[#0F0F0F] p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="text-[#FF6A00]" size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-lg">Deployment Sequence</h3>
                </div>
                <div className="space-y-12">
                  {selectedProject.features.map((feature: any, fidx: number) => (
                    <div key={fidx} className="relative pl-6 border-l border-[#FF6A00]/20">
                      <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-[#FF6A00] rounded-full shadow-[0_0_8px_#FF6A00]" />
                      <h4 className="text-[#FF6A00] font-bold uppercase text-sm mb-6 tracking-widest">{feature.featureName}</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {feature.tasks.map((task: any, tidx: number) => (
                          <div key={tidx} className="bg-white/5 border border-white/10 p-5 group hover:border-[#FF6A00]/40 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-bold uppercase text-white truncate max-w-[70%]">{task.name}</span>
                              <span className="text-[9px] font-mono text-[#FF6A00] shrink-0">WINDOW: {task.startDay}-{task.endDay}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-4 line-clamp-2 italic">"{task.description}"</p>
                            <div className="flex items-center gap-2">
                               <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[7px] font-black text-[#FF6A00]">
                                 {members.find(m => m.id === task.assigneeId)?.name[0] || '?'}
                               </div>
                               <span className="text-[8px] font-mono text-gray-600 uppercase">Operator: {members.find(m => m.id === task.assigneeId)?.name.split(' ')[0] || 'Unassigned'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-8">
            <section className="neon-border bg-[#0F0F0F] p-6">
              <h3 className="font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <Users size={16} className="text-[#FF6A00]" /> Active Cluster
              </h3>
              <div className="space-y-3">
                {selectedProject.teamAssignments.map((assignment, idx) => {
                  const member = members.find(m => m.id === assignment.memberId);
                  return (
                    <div key={idx} className="bg-white/5 p-4 flex justify-between items-center border-l-2 border-[#FF6A00]">
                      <div>
                        <div className="text-[10px] font-bold uppercase">{member?.name}</div>
                        <div className="text-[8px] font-mono text-gray-500 uppercase">{assignment.roles.join(' + ')}</div>
                      </div>
                      <Zap size={14} className="text-[#FF6A00]" />
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="max-w-4xl mx-auto px-2 md:px-0 mb-24">
        <div className="flex justify-between items-center mb-12">
           <button onClick={() => { setView('list'); resetForm(); }} className="text-gray-500 hover:text-[#FF6A00] uppercase font-mono text-xs transition-colors">
             <ChevronLeft size={14} className="inline mr-1" /> ABORT_PROTOCOL
           </button>
           <h2 className="text-2xl font-black tracking-tighter uppercase">Initialize Mission</h2>
        </div>

        <div className="flex justify-between mb-12 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex flex-col items-center min-w-[80px]">
              <div className={`w-10 h-10 border flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s ? 'border-[#FF6A00] text-[#FF6A00] shadow-[0_0_15px_#FF6A0022]' : 'border-white/10 text-white/20'}`}>
                {step > s ? <Check size={18} /> : `0${s}`}
              </div>
              <span className={`text-[9px] mt-3 font-mono uppercase tracking-widest text-center ${step >= s ? 'text-[#FF6A00]' : 'text-gray-700'}`}>
                {s === 1 ? 'LOGISTICS' : s === 2 ? 'RESOURCES' : s === 3 ? 'BRIEF' : 'UNIT_MAP'}
              </span>
            </div>
          ))}
        </div>

        <div className="neon-border bg-[#0F0F0F] p-8 md:p-12 min-h-[450px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-pulse">
               <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
                 <BrainCircuit className="absolute inset-0 m-auto text-[#FF6A00]" size={24} />
               </div>
               <div className="text-[10px] font-mono text-[#FF6A00] uppercase tracking-[0.5em]">Neural Processing (Lite Tier)...</div>
             </div>
          ) : (
            <div className="space-y-8">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                        <label className="label-sm">Mission Codename</label>
                        <input className="input-base" placeholder="E.G. NEON_SHIELD" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="label-sm">Corporate Partner</label>
                        <select className="input-base" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})}>
                        <option value="">SELECT PARTNER...</option>
                        {clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className="label-sm">Mission Objective</label>
                        <textarea className="input-base h-24" placeholder="DESCRIBE CORE PURPOSE..." value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                        <label className="label-sm">Account Lead (Deal Owner)</label>
                        <select className="input-base" value={formData.dealOwner} onChange={e => setFormData({...formData, dealOwner: e.target.value})}>
                        <option value="">SELECT OPERATOR...</option>
                        {members.map(m => <option key={m.id} value={m.name}>{m.name.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="label-sm">Project Technical Lead</label>
                        <select className="input-base" value={formData.projectLead} onChange={e => setFormData({...formData, projectLead: e.target.value})}>
                        <option value="">SELECT OPERATOR...</option>
                        {members.map(m => <option key={m.id} value={m.name}>{m.name.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="label-sm">Temporal Limit (Deadline)</label>
                        <input className="input-base" placeholder="E.G. 12 WEEKS" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} />
                    </div>
                    
                    <button onClick={() => setStep(2)} disabled={!formData.name || !formData.client} className="btn-primary w-full py-5 mt-6 text-[10px] disabled:opacity-20 transition-all">
                      Configure Resources <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-30 italic font-mono text-xs uppercase tracking-widest">No active personnel in cluster registry.</div>
                    ) : members.map(member => (
                      <div key={member.id} className={`p-5 bg-white/5 border transition-all ${teamAssignments.some(ta => ta.id === member.id) ? 'border-[#FF6A00] bg-[#FF6A00]/5' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <div className="font-bold uppercase text-[10px] flex items-center gap-2">
                             {teamAssignments.some(ta => ta.id === member.id) && <UserCheck size={12} className="text-[#FF6A00]" />}
                             {member.name}
                          </div>
                          <span className="text-[8px] font-mono text-gray-600">{member.availability} AVAIL</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ROLES.map(role => (
                            <button 
                              key={role}
                              onClick={() => toggleRole(member.id, role)}
                              className={`px-2 py-1 text-[7px] font-mono border rounded-sm transition-all ${teamAssignments.find(a => a.id === member.id)?.roles.includes(role) ? 'bg-[#FF6A00] border-[#FF6A00] text-black font-bold' : 'border-white/5 text-gray-500 hover:text-white'}`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-10 border-t border-white/5">
                    <button onClick={() => setStep(1)} className="text-gray-500 uppercase text-[10px] font-mono hover:text-white transition-colors">Back</button>
                    <button onClick={handleNext} disabled={teamAssignments.length === 0} className="btn-primary px-10 py-4 text-[10px] disabled:opacity-20 shadow-xl">Synthesize Brief</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="bg-black/50 border border-white/10 p-6 h-[450px] relative">
                    <div className="absolute top-4 right-4 text-[8px] font-mono text-gray-700">EDITABLE_BUFFER</div>
                    <textarea 
                      className="w-full h-full bg-transparent font-mono text-[11px] text-gray-400 leading-relaxed focus:outline-none resize-none custom-scrollbar"
                      value={generatedBrief}
                      onChange={(e) => setGeneratedBrief(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setStep(2)} className="text-gray-500 uppercase text-[10px] font-mono">Back</button>
                    <button onClick={handleNext} className="btn-primary px-10 py-4 text-[10px]">Decompose Units</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div className="space-y-6 max-h-[450px] overflow-y-auto no-scrollbar pr-4">
                    <div className="p-6 bg-white/5 border border-[#FF6A00]/20 relative">
                      <div className="flex items-center gap-2 mb-6">
                        <Flag className="text-[#FF6A00]" size={16} />
                        <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white">Temporal Markers</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedBreakdown.milestones.map((m: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-[10px] bg-black/40 p-3 border border-white/5 rounded-sm">
                            <span className="text-gray-300 font-bold uppercase truncate pr-4">{m.title}</span>
                            <span className="text-[#FF6A00] font-mono shrink-0">DAY {m.dayOffset}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 pt-4">
                      <Layers className="text-[#FF6A00]" size={16} />
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white">Operational Units</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedBreakdown.features.map((feature: any, fidx: number) => (
                        <div key={fidx} className="bg-white/5 p-5 border border-white/10 hover:border-[#FF6A00]/30 transition-all">
                            <div className="text-[#FF6A00] font-bold uppercase text-[10px] mb-2 tracking-widest">{feature.featureName}</div>
                            <div className="text-[9px] text-gray-500 font-mono italic">Mapped Load: {feature.tasks.length} atomic tasks.</div>
                        </div>
                        ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-10 border-t border-white/10">
                    <button onClick={() => setStep(3)} className="text-gray-500 uppercase text-[10px] font-mono">Back</button>
                    <button onClick={handleInitializeProject} className="btn-primary px-12 py-5 text-[10px] shadow-2xl">Authorize Final Deployment</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
          .input-base {
            width: 100%;
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 1rem;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.8rem;
            border-radius: 0;
            transition: border-color 0.3s ease;
          }
          .input-base:focus { outline: none; border-color: #FF6A00; }
          .label-sm {
            display: block;
            font-size: 9px;
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
            border-radius: 1px;
            letter-spacing: 0.1em;
          }
          .custom-scrollbar::-webkit-scrollbar { width: 3px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-6">
        <div className="flex gap-6 border-b border-white/5 pb-2">
          <button className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#FF6A00] pb-2">Cluster Deployments</button>
          <button className="text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors pb-2 border-b-2 border-transparent">Historical Archive</button>
        </div>
        <button 
          onClick={() => setView('create')}
          className="w-full sm:w-auto bg-[#FF6A00] text-black px-8 py-3 font-black flex items-center justify-center gap-3 rounded-sm text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[#FF6A00]/10 hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> Initialise_Unit
        </button>
      </div>

      {projects.length === 0 ? (
          <div className="col-span-12 py-32 text-center opacity-10 flex flex-col items-center">
              <Layers size={64} className="mb-6" />
              <div className="text-xl font-mono uppercase tracking-[0.5em]">No Missions Registered</div>
          </div>
      ) : projects.map(project => (
        <div 
          key={project.id} 
          onClick={() => handleProjectSelect(project)}
          className="col-span-12 lg:col-span-6 neon-border bg-[#0F0F0F] p-8 hover:bg-[#121212] transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-10">
            <div className="max-w-[75%]">
              <div className="text-[9px] font-mono text-[#FF6A00] uppercase mb-2 tracking-[0.3em] font-bold">{project.client}</div>
              <h3 className="text-2xl font-black uppercase tracking-tighter group-hover:text-[#FF6A00] transition-colors leading-none">
                {project.name}
              </h3>
            </div>
            <div className="w-10 h-10 border border-white/10 flex items-center justify-center group-hover:border-[#FF6A00] transition-colors">
                <ArrowUpRight size={20} className="text-gray-700 group-hover:text-[#FF6A00] transition-all" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-10">
             <div className="space-y-2">
              <div className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">Protocol Stage</div>
              <div className="font-bold text-xs uppercase text-white flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
                  {project.stage}
              </div>
            </div>
            <div className="text-right space-y-2">
              <div className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">Operational Load</div>
              <div className="font-black text-2xl font-mono text-white leading-none">{project.progress}%</div>
            </div>
          </div>

          <div className="w-full bg-white/5 h-1 relative">
            <div className="absolute top-0 left-0 h-full bg-[#FF6A00] shadow-[0_0_10px_#FF6A00] transition-all duration-1000 ease-in-out" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
