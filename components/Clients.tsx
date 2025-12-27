
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  X, 
  Building2, 
  Search, 
  Briefcase, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  History,
  Target,
  FileText,
  User,
  ShieldCheck,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { Client, Project } from '../types';

interface ClientsProps {
  clients: Client[];
  projects: Project[];
  onAddClient: (client: Client) => void;
}

export const Clients: React.FC<ClientsProps> = ({ clients, projects, onAddClient }) => {
  const [view, setView] = useState<'list' | 'create' | 'dossier'>('list');
  const [activeTab, setActiveTab] = useState<'Active' | 'Past'>('Active');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newClient, setNewClient] = useState({
    name: '',
    industry: '',
    contactPerson: '',
    email: '',
    phone: '',
    description: '',
    totalBudget: ''
  });

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesTab = c.status === activeTab;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.industry.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [clients, activeTab, searchQuery]);

  const handleCreateClient = () => {
    const client: Client = {
      id: `cli-${Date.now()}`,
      name: newClient.name,
      industry: newClient.industry,
      contactPerson: newClient.contactPerson,
      email: newClient.email,
      phone: newClient.phone,
      description: newClient.description,
      totalBudget: newClient.totalBudget,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    onAddClient(client);
    setView('list');
    setNewClient({ name: '', industry: '', contactPerson: '', email: '', phone: '', description: '', totalBudget: '' });
  };

  const getClientProjects = (clientId: string) => {
    // Current projects link via 'client' string name or 'clientId'
    return projects.filter(p => p.clientId === clientId || p.client === clients.find(c => c.id === clientId)?.name);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* 1. View Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 border-b border-white/5 pb-6">
        <div className="flex gap-6 items-center">
          {['Active', 'Past'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] pb-2 border-b-2 transition-all ${activeTab === tab ? 'text-[#FF6A00] border-[#FF6A00]' : 'text-gray-500 border-transparent hover:text-white'}`}
            >
              {tab} ACCOUNTS
            </button>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH ENTITIES..." 
              className="bg-white/5 border border-white/10 text-[10px] font-mono px-9 py-2 rounded-sm w-full md:w-64 focus:border-[#FF6A00] outline-none uppercase"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setView('create')}
            className="btn-primary px-6 py-2 text-[10px] font-black uppercase flex items-center gap-2"
          >
            <Plus size={16} /> Register Partner
          </button>
        </div>
      </div>

      {/* 2. Content Viewport */}
      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map(client => {
            const clientProjects = getClientProjects(client.id);
            return (
              <div 
                key={client.id} 
                onClick={() => { setSelectedClient(client); setView('dossier'); }}
                className="neon-border bg-[#0F0F0F] p-6 group cursor-pointer hover:bg-[#151515] transition-all border-l-2 border-l-transparent hover:border-l-[#FF6A00] flex flex-col h-full shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] orange-glow" />
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">{client.industry}</span>
                  </div>
                  <TrendingUp size={14} className="text-gray-700" />
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold uppercase group-hover:text-[#FF6A00] transition-colors mb-1 truncate">{client.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                    <User size={10} /> {client.contactPerson}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                   <div className="flex justify-between items-center py-2 border-y border-white/5">
                      <span className="text-[9px] font-mono text-gray-600 uppercase">Deployments</span>
                      <span className="text-sm font-black text-[#FF6A00]">{clientProjects.length}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-gray-600 uppercase">Partner Since</span>
                      <span className="text-[10px] font-mono text-white">{client.joinDate}</span>
                   </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={12} className="text-gray-600" />
                    <span className="text-[9px] font-mono text-gray-500 uppercase">SECURE_SYNC</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
          {filteredClients.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center opacity-10">
              <Building2 size={64} className="mb-4" />
              <span className="text-xl font-mono uppercase tracking-[0.5em]">No_Entities_Catalogued</span>
            </div>
          )}
        </div>
      ) : view === 'create' ? (
        <div className="max-w-3xl mx-auto w-full neon-border bg-[#0F0F0F] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-6 duration-500 shadow-2xl mb-12">
           <div className="flex justify-between items-center border-b border-white/10 pb-6">
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter">Partner Integration</h2>
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors"><X size={28} /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="label-sm">Entity Name</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. STARK INDUSTRIES" 
                  value={newClient.name} 
                  onChange={e => setNewClient({...newClient, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="label-sm">Primary Contact</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. VIRGINIA POTTS" 
                  value={newClient.contactPerson}
                  onChange={e => setNewClient({...newClient, contactPerson: e.target.value})}
                />
              </div>
              <div>
                <label className="label-sm">Industry Vertical</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. DEFENSE" 
                  value={newClient.industry}
                  onChange={e => setNewClient({...newClient, industry: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="label-sm">Comms / Email</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. OFFICE@DOMAIN.COM" 
                  value={newClient.email}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              <div>
                <label className="label-sm">Contact Line</label>
                <input 
                  className="input-base" 
                  placeholder="+1 (000) 000-0000" 
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="label-sm">Projected Budget</label>
                <input 
                  className="input-base" 
                  placeholder="E.G. $50,000" 
                  value={newClient.totalBudget}
                  onChange={e => setNewClient({...newClient, totalBudget: e.target.value})}
                />
              </div>
            </div>

            <div className="col-span-full">
              <label className="label-sm">Corporate Briefing</label>
              <textarea 
                className="input-base h-24" 
                placeholder="MISSION GOALS AND CLIENT BACKGROUND..." 
                value={newClient.description}
                onChange={e => setNewClient({...newClient, description: e.target.value})}
              />
            </div>
          </div>

          <button 
            onClick={handleCreateClient}
            disabled={!newClient.name}
            className="btn-primary w-full py-5 text-sm font-black uppercase shadow-lg shadow-[#FF6A00]/20 disabled:opacity-20 transition-all"
          >
            Authorize Integration <ArrowRight size={20} />
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
    if (!selectedClient) return null;
    const clientProjects = getClientProjects(selectedClient.id);

    return (
      <div className="fixed inset-0 z-[100] flex justify-end bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full md:max-w-4xl bg-[#0F0F0F] h-full border-l border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 shadow-2xl">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-start bg-[#121212] gap-6">
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 bg-[#FF6A00] flex items-center justify-center text-3xl font-black text-black rounded-sm shadow-inner relative overflow-hidden">
                {selectedClient.name[0]}
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-none mb-2">{selectedClient.name}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-mono text-[#FF6A00] border border-[#FF6A00]/30 px-2 py-0.5 uppercase tracking-widest">{selectedClient.industry}</span>
                  <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 uppercase tracking-widest">ID_{selectedClient.id}</span>
                </div>
              </div>
            </div>
            <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors p-2"><X size={32} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar bg-[#0F0F0F]">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white/5 p-6 border border-white/5 space-y-2">
                  <h4 className="label-sm flex items-center gap-2 text-gray-400"><TrendingUp size={14} /> Fiscal Status</h4>
                  <div className="text-2xl font-black font-mono text-white">{selectedClient.totalBudget || 'N/A'}</div>
                  <div className="text-[8px] font-mono text-gray-600 uppercase">Allocated Budget</div>
               </div>
               <div className="bg-white/5 p-6 border border-white/5 space-y-2">
                  <h4 className="label-sm flex items-center gap-2 text-gray-400"><History size={14} /> Partner Longevity</h4>
                  <div className="text-2xl font-black font-mono text-[#FF6A00]">{selectedClient.joinDate}</div>
                  <div className="text-[8px] font-mono text-gray-600 uppercase">Onboarding Date</div>
               </div>
               <div className="bg-white/5 p-6 border border-white/5 space-y-2">
                  <h4 className="label-sm flex items-center gap-2 text-gray-400"><Briefcase size={14} /> Unit Load</h4>
                  <div className="text-2xl font-black font-mono text-white">{clientProjects.length}</div>
                  <div className="text-[8px] font-mono text-gray-600 uppercase">Active Deployments</div>
               </div>
            </div>

            {/* Profile Brief */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <section className="space-y-6">
                  <h3 className="label-sm flex items-center gap-2 border-b border-white/5 pb-2"><FileText size={16} /> Corporate Dossier</h3>
                  <p className="text-sm text-gray-300 font-mono leading-relaxed bg-black/40 p-6 border border-white/5 rounded-sm">
                    {selectedClient.description || "No corporate briefing provided. Basic operational parameters apply."}
                  </p>
               </section>
               <section className="space-y-6">
                  <h3 className="label-sm flex items-center gap-2 border-b border-white/5 pb-2"><Mail size={16} /> Contact Protocol</h3>
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/5">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center"><User size={20} className="text-[#FF6A00]" /></div>
                        <div>
                          <div className="text-[10px] font-mono text-gray-500 uppercase">Key Liason</div>
                          <div className="text-sm font-bold uppercase">{selectedClient.contactPerson}</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 bg-white/5 p-4 border border-white/5">
                        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center"><Mail size={20} className="text-gray-400" /></div>
                        <div>
                          <div className="text-[10px] font-mono text-gray-500 uppercase">Direct Secure Channel</div>
                          <div className="text-sm font-bold lowercase">{selectedClient.email}</div>
                        </div>
                     </div>
                  </div>
               </section>
            </div>

            {/* Project Log */}
            <section className="space-y-8">
               <div className="flex items-center justify-between border-b border-white/10 pb-4">
                 <h3 className="label-sm m-0 flex items-center gap-2"><Target size={18} /> Operation Log</h3>
                 <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Active_Entries: {clientProjects.length}</span>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  {clientProjects.map(project => (
                    <div key={project.id} className="bg-black/40 border border-white/5 p-6 group hover:border-[#FF6A00] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <span className="text-[8px] font-mono bg-[#FF6A00] text-black px-1.5 py-0.5 font-black uppercase tracking-widest">{project.stage}</span>
                             <span className="text-[10px] font-mono text-gray-500 uppercase">REF: {project.id}</span>
                          </div>
                          <h4 className="text-xl font-bold uppercase group-hover:text-[#FF6A00] transition-colors">{project.name}</h4>
                          <div className="text-[9px] font-mono text-gray-600 mt-2 italic leading-relaxed">"{project.description}"</div>
                       </div>
                       <div className="text-right shrink-0">
                          <div className="text-3xl font-black font-mono text-white mb-1">{project.progress}%</div>
                          <div className="w-32 bg-white/5 h-1 rounded-full overflow-hidden ml-auto">
                             <div className="h-full bg-[#FF6A00] orange-glow" style={{ width: `${project.progress}%` }} />
                          </div>
                          <div className="text-[9px] font-mono text-gray-600 uppercase mt-2">Operational Load</div>
                       </div>
                    </div>
                  ))}
                  {clientProjects.length === 0 && (
                    <div className="py-20 border border-dashed border-white/5 text-center opacity-10 flex flex-col items-center">
                       <Zap size={32} className="mb-2" />
                       <span className="text-xs font-mono uppercase tracking-[0.5em]">No_Project_Data_Linked</span>
                    </div>
                  )}
               </div>
            </section>

            <div className="pt-12 border-t border-white/5 flex justify-center">
               <button onClick={() => setView('list')} className="flex items-center gap-2 text-[10px] font-mono text-gray-600 hover:text-white uppercase tracking-[0.2em] transition-colors">
                 <ArrowLeft size={14} /> Exit Entity View
               </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
