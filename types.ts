
export enum ProjectStatus {
  PLANNING = 'Planning',
  ACTIVE = 'Active',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed'
}

export enum ProjectStage {
  DEV = 'Dev',
  TEST = 'Test',
  QA = 'QA',
  REVIEW = 'Review',
  CLIENT = 'Client'
}

export enum TeamMemberStatus {
  ACTIVE = 'Active',
  IDLE = 'Idle',
  BLOCKED = 'Blocked'
}

export enum TaskStatus {
  BACKLOG = 'Backlog',
  IN_PROGRESS = 'In Progress',
  TESTING = 'Testing',
  QA = 'QA',
  REVIEW = 'Review',
  COMPLETED = 'Completed'
}

export enum ErrorSeverity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export type Role = 'Frontend' | 'Backend' | 'Tester' | 'QA' | 'Project Manager' | 'Designer' | 'DevOps';

export type CommentTag = 'Error' | 'Bug' | 'Incomplete' | 'UI/UX' | 'Improvement' | 'Note';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[]; // Array of UIDs
  inviteCode: string;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  activeWorkspaceId: string | null;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorRole: Role;
  content: string;
  tag: CommentTag;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  roles: Role[];
  status: TeamMemberStatus;
  currentTask?: string;
  availability: string;
  timezone: string;
  strength: number; // 0-100
  specialties: string[];
  bio?: string;
  joinDate: string;
  archived?: boolean;
}

export interface TeamAssignment {
  memberId: string;
  roles: Role[];
  responsibility?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string; 
  clientId?: string;
  status: ProjectStatus;
  stage: ProjectStage;
  progress: number;
  lead: string;
  dealOwner: string;
  description: string;
  objectives: string[];
  teamAssignments: TeamAssignment[];
  brief?: string;
  timeline?: string;
  resources?: string;
  features?: any[]; 
}

export interface Client {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Past';
  joinDate: string;
  description?: string;
  totalBudget?: string;
}

export interface ErrorLog {
  id: string;
  projectId: string;
  title: string;
  description: string;
  authorId: string;
  assignedToId?: string;
  severity: ErrorSeverity;
  status: 'active' | 'resolved';
  timestamp: string;
  resolvedBy?: string;
  commitLink?: string;
}

export interface ActivityLog {
  id: string;
  author: string;
  source: string;
  content: string;
  timestamp: string;
}

export interface TaskProof {
  stage: TaskStatus;
  link: string;
  timestamp: string;
  note?: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  assigneeId: string;
  testerIds: string[];
  qaIds: string[];
  status: TaskStatus;
  acceptanceCriteria: string[];
  timeInStage: string;
  featureOrigin?: string;
  proofs: TaskProof[];
  comments: TaskComment[];
  timeline: {
    start: string;
    end: string;
  };
  archived?: boolean;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  ownerId: string;
  urgency: 'Low' | 'Medium' | 'High';
  archived?: boolean;
}

export interface FeedbackLog {
  id: string;
  projectId: string;
  source: 'QA' | 'Tester' | 'PM' | 'Client';
  author: string;
  content: string;
  timestamp: string;
}
