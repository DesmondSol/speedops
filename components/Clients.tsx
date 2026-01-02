
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
  ArrowLeft,
  Trash2,
  Edit3,
  Save
} from 'lucide-react';
import { Client, Project } from '../types';

interface ClientsProps {
  clients: Client[];
  projects: Project[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const Clients: React.FC<ClientsProps> = ({ clients, projects, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [view, setView] = useState<'list' | 'create' | 'dossier'>('list');
  const [activeTab, setActiveTab] = useState<'Active' | 'Past'>('Active');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
      ...newClient,
      status: 'Active',
      joinDate: new Date().toISOString().split('T')[0]
    };
    onAddClient(client);
    setView('list');
    setNewClient({ name: '', industry: '', contactPerson: '', email: '', phone: '', description: '', totalBudget: '' });
  };

  const handleUpdate = () => {
    if (selectedClient) {
      onUpdateClient(selectedClient);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (selectedClient) {
      if (confirm(`PURGE CORPORATE PARTNER ${selectedClient.name.toUpperCase()}?`)) {
        onDeleteClient(selectedClient.id);
        setView('list');
        setSelectedClient(null);
      }
    }
  };

  const getClientProjects = (clientId: string) => {
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
          <button onClick={() => setView('create')} className="btn-primary px-6 py-2 text-[10px] font-black uppercase flex items-center gap-2">
            <Plus size={16} /> Register Partner
          </button>
        </div>
      </div>

      {/* 2. Content Viewport */}
      {view === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredClients.map(client => (
            <div 
              key={client.id} 
              onClick={() => { setSelectedClient(client); setView('dossier'); setIsEditing(false); }}
              className="neon-border bg-[#0F0F0F] p-6 group cursor-pointer hover:bg-[#151515] transition-all border-l-2 border-l-transparent hover:border-l-[#FF6A00] flex flex-col h-full shadow-xl"
            >
              <h3 className="text-lg font-bold uppercase group-hover:text-[#FF6A00] transition-colors mb-1 truncate">{client.name}</h3>
              <div className="text-[10px] text-gray-400 font-mono mb-4">{client.industry}</div>
              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-mono text-gray-500 uppercase">Dossier Profile</span>
                <ArrowRight size={14} className="text-gray-700" />
              </div>
            </div>
          ))}
        </div>
      ) : view === 'create' ? (
        <div className="max-w-3xl mx-auto w-full neon-border bg-[#0F0F0F] p-8 md:p-12 space-y-10 shadow-2xl mb-12">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Partner Integration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <input className="input-base" placeholder="ENTITY NAME" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} />
            <input className="input-base" placeholder="CONTACT PERSON" value={newClient.contactPerson} onChange={e => setNewClient({...newClient, contactPerson: e.target.value})} />
            <input className="input-base" placeholder="INDUSTRY" value={newClient.industry} onChange={e => setNewClient({...newClient, industry: e.target.value})} />
            <input className="input-base" placeholder="FISCAL BUDGET" value={newClient.totalBudget} onChange={e => setNewClient({...newClient, totalBudget: e.target.value})} />
            <textarea className="input-base col-span-full h-24" placeholder="BRIEFING" value={newClient.description} onChange={e => setNewClient({...newClient, description: e.target.value})} />
          </div>
          <button onClick={handleCreateClient} className="btn-primary w-full py-5 text-sm font-black uppercase">Authorize Integration</button>
        </div>
      ) : dossierView()}

      <style>{`
        .input-base { width: 100%; background-color: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); padding: 1rem; color: white; font-family: 'JetBrains Mono', monospace; border-radius: 2px; font-size: 0.875rem; }
        .input-base:focus { outline: none; border-color: #FF6A00; }
        .label-sm { display: block; font-size: 10px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; color: #555; margin-bottom: 0.5rem; letter-spacing: 0.2em; font-weight: 700; }
        .btn-primary { background-color: #FF6A00; color: black; font-weight: 900; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 0.75rem; border-radius: 2px; letter-spacing: 0.1em; }
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
          <div className="p-8 md:p-12 border-b border-white/10 flex justify-between items-start bg-[#121212]">
            <div>
              {isEditing ? (
                <input 
                  className="text-3xl font-bold uppercase tracking-tighter bg-white/5 border border-white/10 p-2 outline-none mb-2"
                  value={selectedClient.name}
                  onChange={e => setSelectedClient({...selectedClient, name: e.target.value})}
                />
              ) : (
                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter leading-none mb-2">{selectedClient.name}</h2>
              )}
            </div>
            <div className="flex gap-4">
              {isEditing ? (
                <button onClick={handleUpdate} className="text-green-500 hover:text-white p-2">
                  <Save size={24} />
                </button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-[#FF6A00] p-2">
                  <Edit3 size={24} />
                </button>
              )}
              <button onClick={handleDelete} className="text-red-500 hover:text-white p-2">
                <Trash2 size={24} />
              </button>
              <button onClick={() => setView('list')} className="text-gray-500 hover:text-white transition-colors p-2"><X size={32} /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 bg-[#0F0F0F]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/5 p-6 border border-white/5">
                <h4 className="label-sm">Budget</h4>
                {isEditing ? (
                  <input className="input-base" value={selectedClient.totalBudget} onChange={e => setSelectedClient({...selectedClient, totalBudget: e.target.value})} />
                ) : (
                  <div className="text-xl font-bold font-mono text-white">{selectedClient.totalBudget || 'N/A'}</div>
                )}
              </div>
              <div className="bg-white/5 p-6 border border-white/5">
                <h4 className="label-sm">Industry</h4>
                {isEditing ? (
                  <input className="input-base" value={selectedClient.industry} onChange={e => setSelectedClient({...selectedClient, industry: e.target.value})} />
                ) : (
                  <div className="text-xl font-bold font-mono text-[#FF6A00]">{selectedClient.industry}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};
