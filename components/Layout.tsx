
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Calendar, 
  Building2, 
  Plus, 
  Menu,
  X,
  Bug,
  Wifi,
  LogOut,
  User,
  Share2,
  Copy,
  Terminal,
  Search,
  Sun,
  Moon
} from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

interface SidebarItem {
  id: string;
  icon: any;
  label: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'projects', icon: FolderKanban, label: 'Projects' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
  { id: 'teams', icon: Users, label: 'Teams' },
  { id: 'schedules', icon: Calendar, label: 'Schedules' },
  { id: 'clients', icon: Building2, label: 'Clients' },
  { id: 'errors', icon: Bug, label: 'Error Queue' },
];

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
  workspaceName: string;
}

export const Layout: React.FC<Props> = ({ children, activeTab, onTabChange, workspaceName }) => {
  const [expanded, setExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    (localStorage.getItem('speedops_theme') as 'dark' | 'light') || 'dark'
  );

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('speedops_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    if (confirm('TERMINATE CURRENT SESSION?')) {
      await signOut(auth);
      window.location.reload();
    }
  };

  const fetchInviteCode = async () => {
    if (!currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      const wsId = userDoc.data().activeWorkspaceId;
      const wsDoc = await getDoc(doc(db, 'workspaces', wsId));
      if (wsDoc.exists()) {
        setInviteCode(wsDoc.data().inviteCode);
      }
    }
    setShowInviteModal(true);
  };

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-[#0F0F0F] border-r border-white/10 z-50 transition-all duration-300 hidden md:flex flex-col ${expanded ? 'w-64' : 'w-20'}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        <div className="flex items-center p-6 mb-8 overflow-hidden shrink-0">
          <div className="min-w-[32px] h-8 bg-[#FF6A00] flex items-center justify-center font-bold text-black rounded-sm mr-4 shadow-[0_0_15px_rgba(255,106,0,0.3)]">S</div>
          {expanded && <span className="text-xl font-bold tracking-tighter uppercase whitespace-nowrap">speedOps</span>}
        </div>

        <nav className="px-3 space-y-2 flex-1 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center p-3 rounded transition-colors group ${
                activeTab === item.id 
                  ? 'bg-[#FF6A00] text-black shadow-[0_0_15px_rgba(255,106,0,0.3)]' 
                  : 'hover:bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <item.icon size={24} className="min-w-[24px]" />
              {expanded && <span className="ml-4 font-medium uppercase text-xs tracking-widest">{item.label}</span>}
            </button>
          ))}
          
          <button
            onClick={fetchInviteCode}
            className={`w-full flex items-center p-3 rounded transition-colors group hover:bg-white/5 text-gray-400 hover:text-white mt-4 border-t border-white/5 pt-6`}
          >
            <Share2 size={24} className="min-w-[24px] text-[#FF6A00]" />
            {expanded && <span className="ml-4 font-bold uppercase text-xs tracking-widest text-[#FF6A00]">Invite Operators</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4 shrink-0">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center p-3 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} className="min-w-[20px]" /> : <Moon size={20} className="min-w-[20px]" />}
            {expanded && <span className="ml-4 font-bold uppercase text-[10px] tracking-widest">{theme === 'dark' ? 'Day Mode' : 'Black Mode'}</span>}
          </button>
          
          <div className="flex items-center gap-4 px-2">
            <div className="w-8 h-8 rounded-sm bg-white/5 flex items-center justify-center text-gray-400 border border-white/10">
              <User size={16} />
            </div>
            {expanded && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] font-bold uppercase truncate">{currentUser?.email?.split('@')[0]}</span>
                <span className="text-[8px] font-mono text-gray-600 truncate uppercase">Operator_Active</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors`}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {expanded && <span className="ml-4 font-bold uppercase text-[10px] tracking-widest">Terminate</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F0F0F] border-t border-white/10 z-50 flex items-center justify-around px-2">
        {sidebarItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded transition-colors ${
              activeTab === item.id ? 'text-[#FF6A00]' : 'text-gray-500'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] mt-1 font-mono uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
        <button onClick={toggleTheme} className="flex flex-col items-center justify-center p-2 text-gray-500">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-[10px] mt-1 font-mono uppercase tracking-tighter">Theme</span>
        </button>
      </nav>

      <main className={`flex-1 transition-all duration-300 md:ml-20 p-4 md:p-8 pb-24 md:pb-8`}>
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Cluster: {workspaceName}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">{activeTab.replace('-', ' ')}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#FF6A00]/5 border border-[#FF6A00]/20 rounded-full">
               <Wifi size={12} className="text-[#FF6A00]" />
               <span className="text-[9px] font-mono font-bold text-[#FF6A00] uppercase tracking-widest">Secure_Channel_Active</span>
            </div>
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#FF6A00]" size={16} />
              <input 
                type="text" 
                placeholder="QUERY OPERATIONAL DATA..." 
                className="bg-white/5 border border-white/10 rounded-sm py-2 pl-9 pr-4 w-full md:w-64 focus:outline-none focus:border-[#FF6A00] font-mono text-[10px] uppercase"
              />
            </div>
          </div>
        </header>

        {children}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-md neon-border bg-[#0F0F0F] p-10 shadow-2xl relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white">
              <X size={24} />
            </button>
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-[#FF6A00]/10 border border-[#FF6A00]/30 flex items-center justify-center rounded-sm mx-auto">
                <Terminal className="text-[#FF6A00]" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Nexus Personnel Sync</h3>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Authorize new operators to this cluster</p>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-white/5 border border-white/10 text-center relative group">
                  <div className="text-[9px] font-mono text-gray-600 uppercase mb-3">Operational Invite Code</div>
                  <div className="text-4xl font-black font-mono tracking-[0.3em] text-[#FF6A00] select-all uppercase">
                    {inviteCode || '------'}
                  </div>
                </div>
                <button 
                  onClick={copyCode}
                  className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all rounded-sm"
                >
                  <Copy size={14} />
                  {copied ? 'Code Cached to Buffer' : 'Copy Nexus Code'}
                </button>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <p className="text-[9px] font-mono text-gray-700 uppercase leading-relaxed">
                  Operators entering this code during synchronization will gain full access to cluster telemetry and mission control.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
