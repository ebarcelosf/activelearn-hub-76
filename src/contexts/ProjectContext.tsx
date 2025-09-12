import React, { createContext, useContext, useState } from 'react';
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

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useLocalStorage<Project[]>('activelearn_projects', []);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const createProject = (title: string, description: string): Project => {
    const newProject: Project = {
      id: uuidv4(),
      title,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      phase: 'engage',
      progress: 0,
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
    let totalTasks = 0;
    let completedTasks = 0;

    // Engage phase progress
    if (project.bigIdea) completedTasks++;
    totalTasks++;
    
    if (project.essentialQuestion) completedTasks++;
    totalTasks++;
    
    if (project.challenges.length > 0) completedTasks++;
    totalTasks++;

    completedTasks += project.engageChecklist.filter(item => item.completed).length;
    totalTasks += project.engageChecklist.length || 1;

    // Investigate phase progress
    completedTasks += project.guidingQuestions.filter(q => q.answer).length;
    totalTasks += project.guidingQuestions.length || 1;

    completedTasks += project.guidingActivities.filter(a => a.status === 'completed').length;
    totalTasks += project.guidingActivities.length || 1;

    if (project.guidingResources.length > 0) completedTasks++;
    totalTasks++;

    if (project.researchSynthesis) completedTasks++;
    totalTasks++;

    // Act phase progress
    if (project.solutionDevelopment) completedTasks++;
    totalTasks++;

    completedTasks += project.implementationPlan.filter(step => step.status === 'completed').length;
    totalTasks += project.implementationPlan.length || 1;

    if (project.evaluationCriteria.length > 0) completedTasks++;
    totalTasks++;

    if (project.prototypes.length > 0) completedTasks++;
    totalTasks++;

    return Math.round((completedTasks / totalTasks) * 100);
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