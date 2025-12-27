
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  addDoc,
  query,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from './firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { Tasks } from './components/Tasks';
import { Teams } from './components/Teams';
import { Schedules } from './components/Schedules';
import { Clients } from './components/Clients';
import { ErrorQueue } from './components/ErrorQueue';
import { Landing } from './components/Landing';
import { Walkthrough } from './components/Walkthrough';
import { Auth } from './components/Auth';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_TEAM, MOCK_MILESTONES, MOCK_CLIENTS, MOCK_ERRORS } from './constants';
import { Project, Task, TeamMember, Milestone, Client, ErrorLog, ActivityLog, TaskStatus } from './types';

/**
 * Sanitizes an object for Firestore by removing undefined values
 * and ensuring it's a plain JavaScript object to avoid circular structure errors.
 */
const sanitizeForFirestore = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  
  return Object.keys(obj).reduce((acc: any, key) => {
    const value = obj[key];
    if (value !== undefined) {
      acc[key] = sanitizeForFirestore(value);
    }
    return acc;
  }, {});
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthChecking(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      // Clear data if no user
      setProjects([]);
      setTasks([]);
      setMembers([]);
      setMilestones([]);
      setClients([]);
      setErrors([]);
      setActivity([]);
      setIsCloudSynced(false);
      return;
    }

    const userBase = `users/${currentUser.uid}`;

    // Real-time synchronization listeners nested under UID
    const unsubProjects = onSnapshot(collection(db, userBase, 'fana_projects'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data.length > 0 ? data : MOCK_PROJECTS);
      setIsCloudSynced(true);
    });

    const unsubTasks = onSnapshot(collection(db, userBase, 'fana_tasks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(data.length > 0 ? data : MOCK_TASKS);
    });

    const unsubMembers = onSnapshot(collection(db, userBase, 'fana_members'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      setMembers(data.length > 0 ? data : MOCK_TEAM);
    });

    const unsubMilestones = onSnapshot(collection(db, userBase, 'fana_milestones'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone));
      setMilestones(data.length > 0 ? data : MOCK_MILESTONES);
    });

    const unsubClients = onSnapshot(collection(db, userBase, 'fana_clients'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(data.length > 0 ? data : MOCK_CLIENTS);
    });

    const unsubErrors = onSnapshot(collection(db, userBase, 'fana_errors'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ErrorLog));
      setErrors(data.length > 0 ? data : MOCK_ERRORS);
    });

    const qActivity = query(collection(db, userBase, 'fana_activity'), orderBy('createdAt', 'desc'), limit(50));
    const unsubActivity = onSnapshot(qActivity, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
      setActivity(data);
    });

    return () => {
      unsubProjects();
      unsubTasks();
      unsubMembers();
      unsubMilestones();
      unsubClients();
      unsubErrors();
      unsubActivity();
    };
  }, [currentUser]);

  const addActivity = async (source: string, author: string, content: string) => {
    if (!currentUser) return;
    const payload = sanitizeForFirestore({
      source,
      author,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    });
    await addDoc(collection(db, 'users', currentUser.uid, 'fana_activity'), payload);
  };

  const handleAddProject = async (newProject: Project) => {
    if (!currentUser) return;
    const userPath = `users/${currentUser.uid}`;
    const { id, ...projectData } = newProject;
    await setDoc(doc(db, userPath, 'fana_projects', id), sanitizeForFirestore(projectData));
    addActivity('PROJECT', newProject.lead, `New mission initiated: ${newProject.name}`);
    
    if (newProject.features) {
      for (const feature of newProject.features) {
        for (const t of feature.tasks) {
          const taskId = `t-ai-${Date.now()}-${Math.random()}`;
          const taskData: Task = {
            id: taskId,
            projectId: id,
            name: t.name,
            description: t.description,
            assigneeId: t.assigneeId,
            testerIds: [],
            qaIds: [],
            status: TaskStatus.BACKLOG,
            acceptanceCriteria: t.acceptanceCriteria || [],
            timeInStage: '0h',
            featureOrigin: feature.featureName,
            proofs: [],
            comments: [],
            timeline: {
              start: new Date(Date.now() + (t.startDay - 1) * 86400000).toISOString(),
              end: new Date(Date.now() + t.endDay * 86400000).toISOString()
            },
            archived: false
          };
          const { id: _, ...rest } = taskData;
          await setDoc(doc(db, userPath, 'fana_tasks', taskId), sanitizeForFirestore(rest));
        }
      }
    }

    // @ts-ignore
    if (newProject.aiMilestones) {
      // @ts-ignore
      for (const m of newProject.aiMilestones) {
        const deadline = new Date(Date.now() + m.dayOffset * 86400000);
        const msId = `ms-ai-${Date.now()}-${Math.random()}`;
        const milestoneData: Milestone = {
          id: msId,
          projectId: id,
          title: m.title,
          description: m.description,
          deadline: deadline.toISOString().split('T')[0],
          ownerId: members.find(mem => mem.name === newProject.lead)?.id || members[0]?.id || '1',
          urgency: m.urgency || 'Medium',
          archived: false
        };
        const { id: _, ...rest } = milestoneData;
        await setDoc(doc(db, userPath, 'fana_milestones', msId), sanitizeForFirestore(rest));
      }
    }
  };

  const handleAddTask = async (newTask: Task) => {
    if (!currentUser) return;
    const { id, ...taskData } = newTask;
    await setDoc(doc(db, 'users', currentUser.uid, 'fana_tasks', id), sanitizeForFirestore(taskData));
    const member = members.find(m => m.id === newTask.assigneeId);
    addActivity('TASK', member?.name || 'SYSTEM', `Unit ${newTask.name} launched`);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    if (!currentUser) return;
    const { id, ...taskData } = updatedTask;
    await updateDoc(doc(db, 'users', currentUser.uid, 'fana_tasks', id), sanitizeForFirestore(taskData));
    const member = members.find(m => m.id === updatedTask.assigneeId);
    if (updatedTask.status === TaskStatus.COMPLETED) {
      addActivity('TASK', member?.name || 'SYSTEM', `Unit ${updatedTask.name} mission success`);
    } else {
      addActivity('TASK', member?.name || 'SYSTEM', `Unit ${updatedTask.name} migrated to ${updatedTask.status}`);
    }
  };

  const handleAddMember = async (newMember: TeamMember) => {
    if (!currentUser) return;
    const { id, ...memberData } = newMember;
    await setDoc(doc(db, 'users', currentUser.uid, 'fana_members', id), sanitizeForFirestore(memberData));
    addActivity('PERSONNEL', 'ADMIN', `Operator ${newMember.name} integrated`);
  };

  const handleAddMilestone = async (newMilestone: Milestone) => {
    if (!currentUser) return;
    const { id, ...msData } = newMilestone;
    await setDoc(doc(db, 'users', currentUser.uid, 'fana_milestones', id), sanitizeForFirestore(msData));
    addActivity('SCHEDULE', 'SYSTEM', `Critical marker placed: ${newMilestone.title}`);
  };

  const handleAddClient = async (newClient: Client) => {
    if (!currentUser) return;
    const { id, ...cliData } = newClient;
    await setDoc(doc(db, 'users', currentUser.uid, 'fana_clients', id), sanitizeForFirestore(cliData));
    addActivity('CLIENT', 'SYSTEM', `New corporate entity catalogued: ${newClient.name}`);
  };

  const handleAddError = async (newError: ErrorLog) => {
    if (!currentUser) return;
    const { id, ...errData } = newError;
    await setDoc(doc(db, 'users', currentUser.uid, 'fana_errors', id), sanitizeForFirestore(errData));
    const reporter = members.find(m => m.id === newError.authorId);
    addActivity('ERROR', reporter?.name || 'SYSTEM', `Threat marker signaled: ${newError.title}`);
  };

  const handleUpdateError = async (updatedError: ErrorLog) => {
    if (!currentUser) return;
    const { id, ...errData } = updatedError;
    await updateDoc(doc(db, 'users', currentUser.uid, 'fana_errors', id), sanitizeForFirestore(errData));
    if (updatedError.status === 'resolved') {
      const resolver = members.find(m => m.id === updatedError.resolvedBy);
      addActivity('ERROR', resolver?.name || 'SYSTEM', `Threat neutralized: ${updatedError.title}`);
    }
  };

  const enterApp = () => {
    setShowLanding(false);
  };

  const completeAuth = () => {
    const hasSeenWalkthrough = localStorage.getItem('speedops_walkthrough_seen');
    if (!hasSeenWalkthrough) {
      setShowWalkthrough(true);
    }
  };

  const completeWalkthrough = () => {
    setShowWalkthrough(false);
    localStorage.setItem('speedops_walkthrough_seen', 'true');
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#FF6A00] border-t-transparent animate-spin rounded-full" />
          <div className="text-[10px] font-mono text-[#FF6A00] uppercase tracking-[0.3em] animate-pulse">Syncing Session...</div>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <Landing onEnter={enterApp} />;
  }

  if (!currentUser) {
    return <Auth onSuccess={completeAuth} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects} 
            members={members} 
            tasks={tasks} 
            milestones={milestones}
            clients={clients}
            errors={errors}
            activity={activity}
          />
        );
      case 'projects':
        return <Projects projects={projects} clients={clients} onAddProject={handleAddProject} />;
      case 'tasks':
        return (
          <Tasks 
            projects={projects} 
            tasks={tasks} 
            onAddTask={handleAddTask} 
            onUpdateTask={handleUpdateTask} 
          />
        );
      case 'teams':
        return (
          <Teams 
            members={members} 
            projects={projects} 
            onAddMember={handleAddMember} 
          />
        );
      case 'schedules':
        return (
          <Schedules 
            projects={projects} 
            milestones={milestones} 
            onAddMilestone={handleAddMilestone} 
          />
        );
      case 'clients':
        return (
          <Clients 
            clients={clients} 
            projects={projects} 
            onAddClient={handleAddClient} 
          />
        );
      case 'errors':
        return (
          <ErrorQueue 
            errors={errors} 
            projects={projects} 
            tasks={tasks} 
            onAddError={handleAddError} 
            onUpdateError={handleUpdateError} 
          />
        );
      default:
        return <Dashboard 
          projects={projects} 
          members={members} 
          tasks={tasks} 
          milestones={milestones}
          clients={clients}
          errors={errors}
          activity={activity}
        />;
    }
  };

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="animate-in fade-in duration-700 h-full">
          {renderContent()}
        </div>
      </Layout>
      {showWalkthrough && <Walkthrough onComplete={completeWalkthrough} />}
    </>
  );
};

export default App;
