
import React, { useMemo } from 'react';
import { 
  Users, 
  Cpu, 
  Flag, 
  Activity, 
  Layers, 
  MessageSquare,
  Clock,
  ChevronRight,
  TrendingUp,
  Bug,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { TeamMemberStatus, Project, TeamMember, Task, Milestone, Client, ErrorLog, ActivityLog } from '../types';

interface DashboardProps {
  projects: Project[];
  members: TeamMember[];
  tasks: Task[];
  milestones: Milestone[];
  clients: Client[];
  errors: ErrorLog[];
  activity: ActivityLog[];
}

const StatusBadge = ({ status }: { status: TeamMemberStatus }) => {
  const colors = {
    [TeamMemberStatus.ACTIVE]: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]',
    [TeamMemberStatus.IDLE]: 'bg-[#FF6A00] shadow-[0_0_8px_rgba(255,106,0,0.5)]',
    [TeamMemberStatus.BLOCKED]: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
  };
  return <div className={`w-2 h-2 rounded-full ${colors[status]}`} />;
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  projects, 
  members, 
  tasks, 
  milestones, 
  clients, 
  errors,
  activity 
}) => {
  const activeProjects = useMemo(() => projects.filter(p => p.status !== 'Completed'), [projects]);
  const activeErrors = useMemo(() => errors.filter(e => e.status === 'active'), [errors]);
  const sortedActivity = useMemo(() => [...activity].reverse().slice(0, 10), [activity]);
  const nextMilestones = useMemo(() => 
    [...milestones]
      .filter(m => new Date(m.deadline) >= new Date())
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 5)
  , [milestones]);

  const stats = [
    { label: 'Active Deployments', value: activeProjects.length, icon: Cpu, color: 'text-[#FF6A00]' },
    { label: 'Threat Markers', value: activeErrors.length, icon: Bug, color: 'text-red-500' },
    { label: 'Corporate Partners', value: clients.length, icon: Building2, color: 'text-blue-400' },
    { label: 'Units Completed', value: tasks.filter(t => t.status === 'Completed').length, icon: CheckCircle2, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Meta Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="neon-border bg-[#0F0F0F] p-4 flex items-center justify-between group hover:bg-[#151515] transition-all">
            <div>
              <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</div>
            </div>
            <stat.icon size={24} className="text-gray-800 group-hover:text-[#FF6A00] transition-colors" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 2. Team Operational Panel */}
        <div className="col-span-12 lg:col-span-4 neon-border bg-[#0F0F0F] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <Users size={16} className="text-[#FF6A00]" /> Operational Unit
            </h3>
            <span className="text-[9px] font-mono text-gray-600">UNIT_SYNC_ACTIVE</span>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar max-h-[400px]">
            {members.map(member => (
              <div key={member.id} className="flex items-center justify-between group p-3 bg-white/2 hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-[#FF6A00]">
                <div className="flex items-center gap-3">
                  <StatusBadge status={member.status} />
                  <div>
                    <div className="text-xs font-bold uppercase">{member.name}</div>
                    <div className="text-[9px] font-mono text-gray-500 uppercase">{member.roles[0]}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-[10px] font-mono font-bold ${member.availability === '100%' ? 'text-green-500' : 'text-[#FF6A00]'}`}>
                    {member.availability}
                  </div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="py-10 text-center text-gray-600 text-[10px] uppercase font-mono">No_Unit_Data_Streamed</div>
            )}
          </div>
        </div>

        {/* 3. Central Deployments Map */}
        <div className="col-span-12 lg:col-span-5 neon-border bg-[#0F0F0F] p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <TrendingUp size={16} className="text-[#FF6A00]" /> Active Mission Progress
            </h3>
          </div>
          <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
            {activeProjects.map(project => (
              <div key={project.id} className="relative group">
                <div className="flex justify-between items-end mb-2">
                  <div className="max-w-[70%]">
                    <div className="text-[9px] text-[#FF6A00] font-mono uppercase tracking-widest truncate">{project.client}</div>
                    <div className="text-sm font-bold uppercase leading-none mt-1 truncate group-hover:text-white transition-colors">{project.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono">{project.progress}%</div>
                  </div>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF6A00] orange-glow transition-all duration-1000 ease-out" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            ))}
            {activeProjects.length === 0 && (
              <div className="py-20 text-center opacity-20 flex flex-col items-center">
                <Layers size={48} className="mb-4" />
                <span className="text-xs font-mono uppercase tracking-[0.5em]">No_Missions_In_Queue</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Critical Markers (Milestones) */}
        <div className="col-span-12 lg:col-span-3 neon-border bg-[#0F0F0F] p-5">
          <h3 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 mb-6">
            <Flag size={16} className="text-[#FF6A00]" /> Critical Markers
          </h3>
          <div className="space-y-4">
            {nextMilestones.map(m => (
              <div key={m.id} className="border-l-2 border-[#FF6A00]/30 pl-4 py-1 hover:border-[#FF6A00] transition-colors group">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-mono uppercase ${m.urgency === 'High' ? 'text-red-500' : 'text-gray-600'}`}>[{m.urgency}]</span>
                  <span className="text-[9px] font-mono text-gray-500">{m.deadline}</span>
                </div>
                <div className="text-xs font-bold uppercase line-clamp-1 group-hover:text-[#FF6A00] transition-colors">{m.title}</div>
                <div className="text-[8px] font-mono text-gray-700 uppercase mt-1 truncate">{projects.find(p => p.id === m.projectId)?.name}</div>
              </div>
            ))}
            {nextMilestones.length === 0 && (
              <div className="py-10 text-center text-gray-700 text-[10px] uppercase font-mono">Mission_Horizon_Clear</div>
            )}
          </div>
        </div>

        {/* 5. Live Activity Intelligence Feed */}
        <div className="col-span-12 lg:col-span-12 neon-border bg-[#0F0F0F] p-5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
              <MessageSquare size={16} className="text-[#FF6A00]" /> Intelligence Stream
            </h3>
            <div className="flex items-center gap-2 text-[9px] font-mono text-gray-600">
              <Clock size={12} /> REAL-TIME_INGESTION_V1.2
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedActivity.map(log => (
              <div key={log.id} className="relative group bg-white/2 border border-white/5 p-4 rounded-sm hover:border-[#FF6A00]/20 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter ${
                    log.source === 'ERROR' ? 'bg-red-500 text-white' : 
                    log.source === 'TASK' ? 'bg-blue-500 text-white' : 
                    'bg-[#FF6A00] text-black'
                  }`}>
                    {log.source}
                  </div>
                  <span className="text-[9px] font-mono text-gray-600">[{log.author}]</span>
                  <span className="text-[8px] font-mono text-gray-700 ml-auto">{log.timestamp}</span>
                </div>
                <p className="text-[11px] text-gray-400 italic leading-relaxed font-mono">
                  "{log.content}"
                </p>
                <div className="absolute -left-1 top-0 w-[1px] h-full bg-[#FF6A00]/10" />
              </div>
            ))}
            {sortedActivity.length === 0 && (
              <div className="col-span-full py-12 text-center opacity-10">
                <span className="text-xs font-mono uppercase tracking-[0.5em]">System_Silent</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
