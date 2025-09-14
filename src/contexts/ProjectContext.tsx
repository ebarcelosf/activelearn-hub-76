import * as React from 'react';
import { Project } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

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
  const [projects, setProjects] = useLocalStorage<Project[]>('activelearn_projects', []);
  const [currentProject, setCurrentProject] = React.useState<Project | null>(null);

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
      challenges: [],
      engageChecklist: [],
      guidingQuestions: [],
      guidingActivities: [],
      guidingResources: [],
      implementationPlan: [],
      evaluationCriteria: [],
      prototypes: []
    };

    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
    );

    if (currentProject?.id === projectId) {
      setCurrentProject(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
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
    let completedPhases = 0;
    
    if (project.engageCompleted) completedPhases++;
    if (project.investigateCompleted) completedPhases++;
    if (project.actCompleted) completedPhases++;
    
    // 33% para cada fase (com a última sendo 34% para somar 100%)
    if (completedPhases === 0) return 0;
    if (completedPhases === 1) return 33;
    if (completedPhases === 2) return 66;
    return 100;
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