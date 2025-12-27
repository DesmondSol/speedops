
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Calendar, 
  Building2, 
  AlertCircle, 
  BarChart3, 
  History,
  ChevronRight,
  Search,
  Plus,
  Menu,
  X,
  Bug,
  CloudLightning,
  Wifi,
  LogOut,
  User
} from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

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
}

export const Layout: React.FC<Props> = ({ children, activeTab, onTabChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (confirm('TERMINATE CURRENT SESSION?')) {
      await signOut(auth);
      window.location.reload(); // Refresh to reset state
    }
  };

  const currentUser = auth.currentUser;

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
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
        </nav>

        {/* User Profile / Logout at bottom of sidebar */}
        <div className="p-4 border-t border-white/5 space-y-4 shrink-0">
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
            className={`w-full flex items-center p-3 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors group`}
          >
            <LogOut size={20} className="min-w-[20px]" />
            {expanded && <span className="ml-4 font-bold uppercase text-[10px] tracking-widest">Terminate</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
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
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center p-2 text-gray-500"
        >
          <Menu size={20} />
          <span className="text-[10px] mt-1 font-mono uppercase tracking-tighter">More</span>
        </button>
      </nav>

      {/* Mobile More Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/95 z-[60] animate-in fade-in duration-300">
          <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <span className="text-2xl font-black text-[#FF6A00] tracking-tighter">SPEEDOPS</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 border border-white/10 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-start p-6 border ${activeTab === item.id ? 'border-[#FF6A00] bg-[#FF6A00]/5' : 'border-white/5 bg-white/5'} rounded-sm`}
                >
                  <item.icon size={24} className={activeTab === item.id ? 'text-[#FF6A00]' : 'text-gray-400'} />
                  <span className="mt-4 font-bold uppercase text-xs tracking-widest">{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="mt-auto border-t border-white/5 pt-8 pb-12 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-sm">
                  <User size={20} className="text-[#FF6A00]" />
                </div>
                <span className="text-xs font-mono font-bold uppercase">{currentUser?.email}</span>
              </div>
              <button onClick={handleLogout} className="p-4 bg-red-500/10 text-red-500 rounded-sm">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 md:ml-20 p-4 md:p-8 pb-24 md:pb-8`}>
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase">{activeTab.replace('-', ' ')}</h1>
              <p className="text-gray-500 font-mono text-[10px] md:text-sm uppercase tracking-widest">Operational Intelligence / Alpha_v2.0</p>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[#FF6A00]/5 border border-[#FF6A00]/20 rounded-full">
               <Wifi size={12} className="text-[#FF6A00] animate-pulse" />
               <span className="text-[9px] font-mono font-bold text-[#FF6A00] uppercase tracking-widest">Session_Synced</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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
    </div>
  );
};
