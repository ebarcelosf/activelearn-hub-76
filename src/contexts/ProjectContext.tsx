import * as React from 'react';
import { Project } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useBadgeContextOptional } from './BadgeContext';
import { useAuth } from './AuthContext';
import { getUserDataKey } from '@/utils/auth';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  createProject: (title: string, description: string) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => Project;
  setCurrentProject: (project: Project | null) => void;
  getProjectProgress: (project: Project) => number;
}

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = React.useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user ? getUserDataKey(user.id, 'projects') : 'activelearn_projects_temp';
  const [projects, setProjects] = useLocalStorage<Project[]>(storageKey, []);
  const [currentProject, setCurrentProject] = React.useState<Project | null>(null);
  const badge = useBadgeContextOptional();

  // Reset projects when user changes
  React.useEffect(() => {
    if (user) {
      const userProjects = localStorage.getItem(getUserDataKey(user.id, 'projects'));
      if (userProjects) {
        setProjects(JSON.parse(userProjects));
      } else {
        setProjects([]);
      }
    } else {
      setProjects([]);
      setCurrentProject(null); // Limpar projeto atual quando usuário deslogar
    }
  }, [user, setProjects]);

  const createProject = (title: string, description: string): Project => {
    const newProject: Project = {
      id: uuidv4(),
      title,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      phase: 'engage',
      progress: 0,
      engageCompleted: false,
      investigateCompleted: false,
      actCompleted: false,
      prototypes: []
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updatedProject = projects.find(p => p.id === projectId);
    if (updatedProject) {
      const newProject = { ...updatedProject, ...updates, updatedAt: new Date() };

      // Disparar gatilhos de fase imediatamente quando a fase mudar
      if (updatedProject.phase !== newProject.phase && newProject.phase) {
        const phaseTriggerMap: Record<'engage' | 'investigate' | 'act', string> = {
          engage: 'engage_started',
          investigate: 'investigate_started',
          act: 'act_started',
        };
        const trigger = phaseTriggerMap[newProject.phase as 'engage' | 'investigate' | 'act'];
        if (trigger) {
          badge?.checkTrigger(trigger);
        }
      }
      
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? newProject
            : project
        )
      );

      if (currentProject?.id === projectId) {
        setCurrentProject(newProject);
      }

      // Verificar badges com o estado mais recente do projeto
      badge?.checkProjectBadges(newProject);
    }
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    if (currentProject?.id === projectId) {
      setCurrentProject(null);
    }
  };

  const duplicateProject = (projectId: string): Project => {
    const projectToDuplicate = projects.find(p => p.id === projectId);
    if (!projectToDuplicate) {
      throw new Error('Project not found');
    }

    const duplicatedProject: Project = {
      ...projectToDuplicate,
      id: uuidv4(),
      title: `${projectToDuplicate.title} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setProjects(prev => [...prev, duplicatedProject]);
    return duplicatedProject;
  };

  const getProjectProgress = (project: Project): number => {
    const sections = [
      'bigIdea',
      'essentialQuestion', 
      'challenge',
      'answers',
      'activities',
      'resources',
      'synthesis',
      'solution',
      'implementation',
      'evaluation',
      'prototypes'
    ];
    
    let completedSections = 0;
    
    // Check bigIdea
    if (project.bigIdea && project.bigIdea.trim()) completedSections++;
    
    // Check essentialQuestion
    if (project.essentialQuestion && project.essentialQuestion.trim()) completedSections++;
    
    // Check challenge
    if (project.challenge && project.challenge.trim()) completedSections++;
    
    // Check answers
    if (project.answers && project.answers.filter(a => a.a && a.a.trim()).length > 0) completedSections++;
    
    // Check activities
    if (project.activities && project.activities.length > 0) completedSections++;
    
    // Check resources
    if (project.resources && project.resources.length > 0) completedSections++;
    
    // Check synthesis
    if (project.synthesis?.mainFindings && project.synthesis.mainFindings.trim()) completedSections++;
    
    // Check solution
    if (project.solution?.description && project.solution.description.trim()) completedSections++;
    
    // Check implementation
    if (project.implementation?.overview && project.implementation.overview.trim()) completedSections++;
    
    // Check evaluation
    if (project.evaluation?.objectives && project.evaluation.objectives.trim()) completedSections++;
    
    // Check prototypes
    if (project.prototypes && project.prototypes.length > 0) completedSections++;
    
    return Math.round((completedSections / sections.length) * 100);
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      createProject,
      updateProject,
      deleteProject,
      duplicateProject,
      setCurrentProject,
      getProjectProgress
    }}>
      {children}
    </ProjectContext.Provider>
  );
};