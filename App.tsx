
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
import { db } from './firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { Tasks } from './components/Tasks';
import { Teams } from './components/Teams';
import { Schedules } from './components/Schedules';
import { Clients } from './components/Clients';
import { ErrorQueue } from './components/ErrorQueue';
import { Landing } from './components/Landing';
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
  const [showLanding, setShowLanding] = useState(true);
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
    // Real-time synchronization listeners
    const unsubProjects = onSnapshot(collection(db, 'fana_projects'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data.length > 0 ? data : MOCK_PROJECTS);
      setIsCloudSynced(true);
    });

    const unsubTasks = onSnapshot(collection(db, 'fana_tasks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(data.length > 0 ? data : MOCK_TASKS);
    });

    const unsubMembers = onSnapshot(collection(db, 'fana_members'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
      setMembers(data.length > 0 ? data : MOCK_TEAM);
    });

    const unsubMilestones = onSnapshot(collection(db, 'fana_milestones'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone));
      setMilestones(data.length > 0 ? data : MOCK_MILESTONES);
    });

    const unsubClients = onSnapshot(collection(db, 'fana_clients'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(data.length > 0 ? data : MOCK_CLIENTS);
    });

    const unsubErrors = onSnapshot(collection(db, 'fana_errors'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ErrorLog));
      setErrors(data.length > 0 ? data : MOCK_ERRORS);
    });

    const qActivity = query(collection(db, 'fana_activity'), orderBy('createdAt', 'desc'), limit(50));
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
  }, []);

  const addActivity = async (source: string, author: string, content: string) => {
    const payload = sanitizeForFirestore({
      source,
      author,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    });
    await addDoc(collection(db, 'fana_activity'), payload);
  };

  const handleAddProject = async (newProject: Project) => {
    const { id, ...projectData } = newProject;
    await setDoc(doc(db, 'fana_projects', id), sanitizeForFirestore(projectData));
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
          await setDoc(doc(db, 'fana_tasks', taskId), sanitizeForFirestore(rest));
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
        await setDoc(doc(db, 'fana_milestones', msId), sanitizeForFirestore(rest));
      }
    }
  };

  const handleAddTask = async (newTask: Task) => {
    const { id, ...taskData } = newTask;
    await setDoc(doc(db, 'fana_tasks', id), sanitizeForFirestore(taskData));
    const member = members.find(m => m.id === newTask.assigneeId);
    addActivity('TASK', member?.name || 'SYSTEM', `Unit ${newTask.name} launched`);
  };

  const handleUpdateTask = async (updatedTask: Task) => {
    const { id, ...taskData } = updatedTask;
    await updateDoc(doc(db, 'fana_tasks', id), sanitizeForFirestore(taskData));
    const member = members.find(m => m.id === updatedTask.assigneeId);
    if (updatedTask.status === TaskStatus.COMPLETED) {
      addActivity('TASK', member?.name || 'SYSTEM', `Unit ${updatedTask.name} mission success`);
    } else {
      addActivity('TASK', member?.name || 'SYSTEM', `Unit ${updatedTask.name} migrated to ${updatedTask.status}`);
    }
  };

  const handleAddMember = async (newMember: TeamMember) => {
    const { id, ...memberData } = newMember;
    await setDoc(doc(db, 'fana_members', id), sanitizeForFirestore(memberData));
    addActivity('PERSONNEL', 'ADMIN', `Operator ${newMember.name} integrated`);
  };

  const handleAddMilestone = async (newMilestone: Milestone) => {
    const { id, ...msData } = newMilestone;
    await setDoc(doc(db, 'fana_milestones', id), sanitizeForFirestore(msData));
    addActivity('SCHEDULE', 'SYSTEM', `Critical marker placed: ${newMilestone.title}`);
  };

  const handleAddClient = async (newClient: Client) => {
    const { id, ...cliData } = newClient;
    await setDoc(doc(db, 'fana_clients', id), sanitizeForFirestore(cliData));
    addActivity('CLIENT', 'SYSTEM', `New corporate entity catalogued: ${newClient.name}`);
  };

  const handleAddError = async (newError: ErrorLog) => {
    const { id, ...errData } = newError;
    await setDoc(doc(db, 'fana_errors', id), sanitizeForFirestore(errData));
    const reporter = members.find(m => m.id === newError.authorId);
    addActivity('ERROR', reporter?.name || 'SYSTEM', `Threat marker signaled: ${newError.title}`);
  };

  const handleUpdateError = async (updatedError: ErrorLog) => {
    const { id, ...errData } = updatedError;
    await updateDoc(doc(db, 'fana_errors', id), sanitizeForFirestore(errData));
    if (updatedError.status === 'resolved') {
      const resolver = members.find(m => m.id === updatedError.resolvedBy);
      addActivity('ERROR', resolver?.name || 'SYSTEM', `Threat neutralized: ${updatedError.title}`);
    }
  };

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />;
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
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="animate-in fade-in duration-700 h-full">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
