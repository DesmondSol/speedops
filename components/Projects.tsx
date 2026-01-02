
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  BrainCircuit, 
  UserPlus, 
  Trash2, 
  RefreshCw, 
  ArrowRight,
  ChevronLeft,
  Calendar,
  Layers,
  FileText,
  Users,
  Target,
  Activity,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  Zap,
  Flag
} from 'lucide-react';
import { MOCK_TEAM } from '../constants';
import { ProjectStatus, ProjectStage, Role, Project, Client } from '../types';
import { generateProjectBrief, generateTaskBreakdown } from '../services/geminiService';

const ROLES: Role[] = ['Frontend', 'Backend', 'Tester', 'QA', 'Project Manager'];

interface ProjectsProps {
  projects: Project[];
  clients: Client[];
  onAddProject: (p: Project) => void;
  onUpdateProject?: (p: Project) => void;
  onDeleteProject?: (id: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, clients, onAddProject, onUpdateProject, onDeleteProject }) => {
  const [view, setView] = useState<'list' | 'create' | 'details'>('list');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form State
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

  // Persistent Cache to avoid token bleeding on page reload
  useEffect(() => {
    const draft = localStorage.getItem('speedops_creation_cache');
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
      localStorage.setItem('speedops_creation_cache', JSON.stringify({
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
    // Only trigger AI if the relevant step content is missing from state/cache
    if (step === 2) {
      if (!generatedBrief) {
        setLoading(true);
        const teamData = teamAssignments.map(ta => ({
          ...MOCK_TEAM.find(m => m.id === ta.id),
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
          ...MOCK_TEAM.find(m => m.id === ta.id),
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
    localStorage.removeItem('speedops_creation_cache');
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setView('details');
  };

  if (view === 'details' && selectedProject) {
    return (
      <div className="max-w-7xl mx-auto pb-12 px-2 md:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-6 gap-4">
           <button onClick={() => setView('list')} className="flex items-center gap-2 text-gray-500 hover:text-[#FF6A00] uppercase font-mono text-[10px] transition-colors">
             <ChevronLeft size={14} /> Back
           </button>
           <div className="md:text-right w-full">
             <h2 className="text-xl md:text-3xl font-bold tracking-tight uppercase line-clamp-1">{selectedProject.name}</h2>
             <p className="text-[#FF6A00] font-mono text-[9px] md:text-xs uppercase tracking-widest">{selectedProject.client}</p>
           </div>
        </div>

        <div className="grid grid-cols-12 gap-6 md:gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6 md:space-y-8">
            <section className="neon-border bg-[#0F0F0F] p-5 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-[#FF6A00]" size={20} />
                <h3 className="font-bold uppercase tracking-widest text-sm md:text-lg">AI Project Brief</h3>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 md:p-6 rounded-sm font-mono text-[10px] md:text-sm text-gray-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                {selectedProject.brief || "No brief generated."}
              </div>
            </section>

            {selectedProject.features && selectedProject.features.length > 0 && (
              <section className="neon-border bg-[#0F0F0F] p-5 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <Activity className="text-[#FF6A00]" size={20} />
                  <h3 className="font-bold uppercase tracking-widest text-sm md:text-lg">Unit Roadmap</h3>
                </div>
                <div className="space-y-8 md:space-y-12">
                  {selectedProject.features.map((feature: any, fidx: number) => (
                    <div key={fidx} className="relative pl-6 border-l border-[#FF6A00]/20">
                      <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] bg-[#FF6A00] rounded-full" />
                      <h4 className="text-[#FF6A00] font-bold uppercase text-[10px] md:text-sm mb-4 tracking-widest">{feature.featureName}</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {feature.tasks.map((task: any, tidx: number) => (
                          <div key={tidx} className="bg-white/5 border border-white/10 p-4">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold uppercase text-white truncate max-w-[70%]">{task.name}</span>
                              <span className="text-[9px] font-mono text-[#FF6A00] shrink-0">DAY {task.startDay}-{task.endDay}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
            <section className="neon-border bg-[#0F0F0F] p-5 md:p-6">
              <h3 className="font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                <Users size={16} className="text-[#FF6A00]" /> Personnel
              </h3>
              <div className="space-y-3">
                {selectedProject.teamAssignments.map((assignment, idx) => {
                  const member = MOCK_TEAM.find(m => m.id === assignment.memberId);
                  return (
                    <div key={idx} className="bg-white/5 p-3 flex justify-between items-center border-l-2 border-[#FF6A00]">
                      <div className="truncate">
                        <div className="text-[10px] font-bold uppercase truncate">{member?.name}</div>
                        <div className="text-[8px] font-mono text-gray-500 uppercase truncate">{assignment.roles[0]}</div>
                      </div>
                      <Zap size={12} className="text-[#FF6A00] shrink-0 ml-2" />
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
      <div className="max-w-4xl mx-auto px-2 md:px-0 mb-12">
        <div className="flex justify-between items-center mb-8">
           <button onClick={() => { setView('list'); resetForm(); }} className="text-gray-500 hover:text-[#FF6A00] uppercase font-mono text-[9px] md:text-xs">
             <ChevronLeft size={14} className="inline mr-1" /> Abort
           </button>
           <h2 className="text-lg md:text-2xl font-bold tracking-widest uppercase">Init_Unit</h2>
        </div>

        <div className="flex justify-between mb-10 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex flex-col items-center min-w-[70px]">
              <div className={`w-8 h-8 md:w-10 md:h-10 border flex items-center justify-center font-bold text-xs md:text-sm transition-all ${step >= s ? 'border-[#FF6A00] text-[#FF6A00]' : 'border-white/10 text-white/20'}`}>
                {step > s ? <Check size={16} /> : `0${s}`}
              </div>
              <span className={`text-[8px] md:text-[9px] mt-2 font-mono uppercase tracking-tighter text-center ${step >= s ? 'text-[#FF6A00]' : 'text-gray-700'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Resources' : s === 3 ? 'Brief' : 'Roadmap'}
              </span>
            </div>
          ))}
        </div>

        <div className="neon-border bg-[#0F0F0F] p-5 md:p-8 min-h-[400px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-24 space-y-6">
               <div className="relative w-16 h-16">
                 <div className="absolute inset-0 border-2 border-[#FF6A00] border-t-transparent rounded-full animate-spin" />
               </div>
               <div className="text-xs font-mono text-[#FF6A00] animate-pulse uppercase">Neural Processing (2.5 Lite)...</div>
             </div>
          ) : (
            <div className="space-y-6">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="label-sm">Project Codename</label>
                    <input className="input-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    
                    <label className="label-sm">Partner Entity</label>
                    <select 
                      className="input-base" 
                      value={formData.client} 
                      onChange={e => setFormData({...formData, client: e.target.value})}
                    >
                      <option value="">SELECT PARTNER...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    
                    <label className="label-sm">Purpose & Overview</label>
                    <textarea className="input-base h-24" value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <label className="label-sm">Deal Owner</label>
                    <select className="input-base" value={formData.dealOwner} onChange={e => setFormData({...formData, dealOwner: e.target.value})}>
                      <option value="">SELECT...</option>
                      {MOCK_TEAM.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>

                    <label className="label-sm">Project Lead</label>
                    <select className="input-base" value={formData.projectLead} onChange={e => setFormData({...formData, projectLead: e.target.value})}>
                      <option value="">SELECT...</option>
                      {MOCK_TEAM.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>

                    <label className="label-sm">Timeline Goal</label>
                    <input className="input-base" placeholder="E.G. 8 WEEKS" value={formData.timeline} onChange={e => setFormData({...formData, timeline: e.target.value})} />
                    
                    <button onClick={() => setStep(2)} disabled={!formData.name || !formData.client} className="btn-primary w-full py-4 mt-4 text-[10px] disabled:opacity-30">
                      Proceed <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MOCK_TEAM.map(member => (
                      <div key={member.id} className="p-4 bg-white/5 border border-white/10 rounded-sm">
                        <div className="flex justify-between items-center mb-3">
                          <div className="font-bold uppercase text-[10px]">{member.name}</div>
                          <UserPlus size={14} className="text-gray-600" />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {ROLES.map(role => (
                            <button 
                              key={role}
                              onClick={() => toggleRole(member.id, role)}
                              className={`px-2 py-0.5 text-[7px] font-mono border rounded-full transition-all ${teamAssignments.find(a => a.id === member.id)?.roles.includes(role) ? 'bg-[#FF6A00] border-[#FF6A00] text-black font-bold' : 'border-white/10 text-gray-500 hover:text-white'}`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-6">
                    <button onClick={() => setStep(1)} className="text-gray-600 uppercase text-[10px]">Back</button>
                    <button onClick={handleNext} disabled={teamAssignments.length === 0} className="btn-primary px-8 py-3 text-[10px] disabled:opacity-30">Generate Brief</button>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-black border border-white/5 p-4 md:p-6 h-[400px]">
                    <textarea 
                      className="w-full h-full bg-transparent font-mono text-[10px] md:text-xs text-gray-400 leading-relaxed focus:outline-none resize-none"
                      value={generatedBrief}
                      onChange={(e) => setGeneratedBrief(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between">
                    <button onClick={() => setStep(2)} className="text-gray-600 uppercase text-[10px]">Back</button>
                    <button onClick={handleNext} className="btn-primary px-8 py-3 text-[10px]">Generate Roadmap</button>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                    <div className="p-4 bg-white/5 border border-[#FF6A00]/20 rounded-sm mb-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Flag className="text-[#FF6A00]" size={16} />
                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">Temporal Markers</h4>
                      </div>
                      <div className="space-y-2">
                        {generatedBreakdown.milestones.map((m, i) => (
                          <div key={i} className="flex justify-between items-center text-[10px] bg-black/40 p-2 rounded-sm">
                            <span className="text-gray-300 font-bold uppercase">{m.title}</span>
                            <span className="text-[#FF6A00] font-mono">Day {m.dayOffset}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <Layers className="text-[#FF6A00]" size={16} />
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-white">Work Packages</h4>
                    </div>
                    {generatedBreakdown.features.map((feature, fidx) => (
                      <div key={fidx} className="bg-white/5 p-4 border border-white/5">
                        <div className="text-[#FF6A00] font-bold uppercase text-[10px] mb-2">{feature.featureName}</div>
                        <div className="text-[9px] text-gray-500 font-mono">{feature.tasks.length} sub-units identified.</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-6 border-t border-white/10">
                    <button onClick={() => setStep(3)} className="text-gray-600 uppercase text-[10px]">Back</button>
                    <button onClick={handleInitializeProject} className="btn-primary px-10 py-4 text-[10px]">Finalize Deployment</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
          .input-base {
            width: 100%;
            background-color: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.75rem;
            color: white;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.75rem;
          }
          .label-sm {
            display: block;
            font-size: 9px;
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
            color: #444;
            margin-bottom: 0.25rem;
          }
          .btn-primary {
            background-color: #FF6A00;
            color: black;
            font-weight: 800;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border-radius: 2px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex gap-4">
          <button className="px-2 md:px-4 py-1 text-xs font-bold uppercase border-b-2 border-[#FF6A00]">Deployments</button>
          <button className="px-2 md:px-4 py-1 text-xs font-bold uppercase text-gray-500 hover:text-white transition-colors">Archives</button>
        </div>
        <button 
          onClick={() => setView('create')}
          className="w-full sm:w-auto bg-[#FF6A00] text-black px-6 py-2.5 font-bold flex items-center justify-center gap-2 rounded-sm text-[10px] uppercase tracking-widest"
        >
          <Plus size={16} /> Init_Project
        </button>
      </div>

      {projects.map(project => (
        <div 
          key={project.id} 
          onClick={() => handleProjectSelect(project)}
          className="col-span-12 lg:col-span-6 neon-border bg-[#0F0F0F] p-5 md:p-6 hover:bg-[#151515] transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="max-w-[70%]">
              <div className="text-[9px] font-mono text-[#FF6A00] uppercase mb-1 tracking-widest truncate">{project.client}</div>
              <h3 className="text-lg md:text-2xl font-bold uppercase group-hover:text-[#FF6A00] transition-colors truncate">
                {project.name}
              </h3>
            </div>
            <ArrowUpRight size={18} className="text-[#FF6A00] opacity-0 group-hover:opacity-100 transition-all shrink-0" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
             <div className="space-y-1">
              <div className="text-[8px] font-mono text-gray-600 uppercase">Stage</div>
              <div className="font-bold text-[10px] uppercase text-[#FF6A00]">{project.stage}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[8px] font-mono text-gray-600 uppercase">Load</div>
              <div className="font-bold text-[10px] uppercase">{project.progress}%</div>
            </div>
          </div>

          <div className="w-full bg-white/5 h-1 overflow-hidden">
            <div className="h-full bg-[#FF6A00] orange-glow transition-all duration-700" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};
