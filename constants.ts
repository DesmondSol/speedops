
import { 
  ProjectStatus, 
  ProjectStage, 
  TeamMemberStatus, 
  TaskStatus, 
  TeamMember, 
  Project, 
  Task, 
  Milestone, 
  FeedbackLog,
  Client,
  ErrorLog,
  ErrorSeverity
} from './types';

export const COLORS = {
  NEON_ORANGE: '#FF6A00',
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  GRAY_DARK: '#0F0F0F',
  GRAY_LIGHT: '#1A1A1A'
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Stark Industries',
    industry: 'Defense & Aerospace',
    contactPerson: 'Pepper Potts',
    email: 'p.potts@starkindustries.com',
    status: 'Active',
    joinDate: '2022-01-10',
    description: 'High-stakes technology firm focused on arc reactor technology and global security.',
    totalBudget: '$450,000'
  },
  {
    id: 'c2',
    name: 'Cyberdyne Systems',
    industry: 'Artificial Intelligence',
    contactPerson: 'Miles Dyson',
    email: 'm.dyson@cyberdyne.net',
    status: 'Active',
    joinDate: '2023-04-15',
    description: 'Specializing in neuro-processing and neural network architectures.',
    totalBudget: '$280,000'
  },
  {
    id: 'c3',
    name: 'Wayne Enterprises',
    industry: 'Diversified Tech',
    contactPerson: 'Lucius Fox',
    email: 'fox@wayne.com',
    status: 'Past',
    joinDate: '2021-08-20',
    description: 'Conglomerate focused on R&D for advanced material science and hardware.',
    totalBudget: '$120,000'
  }
];

export const MOCK_TEAM: TeamMember[] = [
  { 
    id: '1', 
    name: 'Alex Rivera', 
    roles: ['Frontend', 'QA'], 
    status: TeamMemberStatus.ACTIVE, 
    currentTask: 'Auth Refactor', 
    availability: '95%', 
    timezone: 'EST',
    strength: 92,
    specialties: ['React', 'TypeScript', 'Tailwind', 'Unit Testing'],
    bio: 'Veteran frontend engineer specializing in design systems and performance optimization.',
    joinDate: '2023-01-15'
  },
  { 
    id: '2', 
    name: 'Sarah Chen', 
    roles: ['Backend', 'Project Manager'], 
    status: TeamMemberStatus.ACTIVE, 
    currentTask: 'API Optimization', 
    availability: '80%', 
    timezone: 'PST',
    strength: 88,
    specialties: ['Node.js', 'PostgreSQL', 'System Architecture', 'Agile'],
    bio: 'Lead architect and PM with a focus on scalable distributed systems.',
    joinDate: '2022-11-02'
  },
  { 
    id: '3', 
    name: 'James Wilson', 
    roles: ['Tester', 'Frontend'], 
    status: TeamMemberStatus.IDLE, 
    availability: '100%', 
    timezone: 'GMT',
    strength: 75,
    specialties: ['Selenium', 'Cypress', 'React', 'QA Automation'],
    bio: 'QA specialist moving into full-stack development. High attention to edge cases.',
    joinDate: '2023-06-20'
  },
  { 
    id: '4', 
    name: 'Maria Garcia', 
    roles: ['Project Manager', 'QA'], 
    status: TeamMemberStatus.BLOCKED, 
    currentTask: 'Client Review', 
    availability: '50%', 
    timezone: 'EST',
    strength: 85,
    specialties: ['Client Relations', 'Risk Management', 'User Research'],
    bio: 'Strategic project lead focusing on client delivery and cross-team communication.',
    joinDate: '2022-08-10'
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Quantum UI Redesign',
    client: 'Stark Industries',
    clientId: 'c1',
    status: ProjectStatus.ACTIVE,
    stage: ProjectStage.DEV,
    progress: 45,
    lead: 'Sarah Chen',
    dealOwner: 'Maria Garcia',
    description: 'Modernizing the legacy flight control interface.',
    objectives: ['Reduce latency', 'Improve accessibility'],
    teamAssignments: [
      { memberId: '1', roles: ['Frontend'], responsibility: 'Implementation of resizable grid components and OAuth flow.' },
      { memberId: '2', roles: ['Project Manager', 'Backend'], responsibility: 'Overseeing technical architecture and sprint planning.' },
      { memberId: '4', roles: ['QA'], responsibility: 'End-to-end testing of flight modules.' }
    ]
  },
  {
    id: 'p2',
    name: 'Nexus Core Engine',
    client: 'Cyberdyne Systems',
    clientId: 'c2',
    status: ProjectStatus.ACTIVE,
    stage: ProjectStage.QA,
    progress: 78,
    lead: 'Alex Rivera',
    dealOwner: 'Sarah Chen',
    description: 'Kernel-level distributed state synchronization.',
    objectives: ['Fault tolerance', 'Zero downtime updates'],
    teamAssignments: [
      { memberId: '1', roles: ['Frontend'], responsibility: 'Real-time dashboard visualization of state changes.' },
      { memberId: '3', roles: ['Tester'], responsibility: 'Stress testing synchronization under high latency.' }
    ]
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    name: 'Implement OAuth Flow',
    description: 'Connect internal SSO with the dashboard.',
    assigneeId: '1',
    testerIds: [],
    qaIds: [],
    status: TaskStatus.IN_PROGRESS,
    acceptanceCriteria: ['Supports JWT', 'Refresh tokens working'],
    timeInStage: '2d 4h',
    proofs: [],
    comments: [],
    timeline: {
      start: '2023-11-01T09:00:00Z',
      end: '2023-11-05T18:00:00Z'
    }
  },
  {
    id: 't2',
    projectId: 'p1',
    name: 'Dashboard Grid System',
    description: 'Create resizable layouts.',
    assigneeId: '1',
    testerIds: [],
    qaIds: [],
    status: TaskStatus.TESTING,
    acceptanceCriteria: ['Responsive', 'Snap-to-grid'],
    timeInStage: '1d 1h',
    proofs: [],
    comments: [],
    timeline: {
      start: '2023-11-06T09:00:00Z',
      end: '2023-11-10T18:00:00Z'
    }
  }
];

export const MOCK_MILESTONES: Milestone[] = [
  { id: 'm1', projectId: 'p1', title: 'Beta Release v0.9', description: 'Initial beta rollout for stakeholder feedback.', deadline: '2023-11-20', ownerId: '4', urgency: 'High' },
  { id: 'm2', projectId: 'p2', title: 'Performance Audit', description: 'Internal audit of core sync engine latency.', deadline: '2023-11-22', ownerId: '2', urgency: 'Medium' }
];

export const MOCK_ERRORS: ErrorLog[] = [
  {
    id: 'err-1',
    projectId: 'p1',
    title: 'OAuth Callback Loop',
    description: 'User is redirected back to login page after successful authentication on Safari mobile.',
    authorId: '3',
    assignedToId: '1',
    severity: ErrorSeverity.CRITICAL,
    status: 'active',
    timestamp: '2 hours ago'
  },
  {
    id: 'err-2',
    projectId: 'p2',
    title: 'Sync Latency Spikes',
    description: 'Dashboard shows 500ms delay when updating more than 50 state nodes simultaneously.',
    authorId: '4',
    assignedToId: '2',
    severity: ErrorSeverity.HIGH,
    status: 'active',
    timestamp: '5 hours ago'
  }
];

export const MOCK_LOGS: FeedbackLog[] = [
  { id: 'l1', projectId: 'p1', source: 'QA', author: 'Maria Garcia', content: 'CSS regression on mobile login buttons.', timestamp: '10 mins ago' },
  { id: 'l2', projectId: 'p2', source: 'Client', author: 'Tony Stark', content: 'Looks sharp, but needs more blue.', timestamp: '1 hr ago' }
];
