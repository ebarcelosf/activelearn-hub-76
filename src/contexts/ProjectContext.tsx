import * as React from 'react';
import { Project } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { useBadgeContext } from './BadgeContext';

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
  const { checkProjectBadges, checkTrigger } = useBadgeContext();

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
          checkTrigger(trigger);
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
      checkProjectBadges(newProject);
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
      'guidingQuestions',
      'guidingActivities',
      'guidingResources',
      'researchSynthesis',
      'solutionDevelopment',
      'implementationPlan',
      'evaluationCriteria',
      'prototypes'
    ];
    
    let completedSections = 0;
    
    // Check bigIdea
    if (project.bigIdea && project.bigIdea.trim()) completedSections++;
    
    // Check essentialQuestion
    if (project.essentialQuestion && project.essentialQuestion.trim()) completedSections++;
    
    // Check challenge
    if ((project.challenge && project.challenge.trim()) || (project.challenges && project.challenges.length > 0)) completedSections++;
    
    // Check guidingQuestions
    if (project.guidingQuestions && project.guidingQuestions.length > 0) completedSections++;
    
    // Check guidingActivities
    if (project.guidingActivities && project.guidingActivities.length > 0) completedSections++;
    
    // Check guidingResources
    if (project.guidingResources && project.guidingResources.length > 0) completedSections++;
    
    // Check researchSynthesis
    if (project.researchSynthesis && project.researchSynthesis.trim()) completedSections++;
    
    // Check solutionDevelopment
    if (project.solutionDevelopment && project.solutionDevelopment.trim()) completedSections++;
    
    // Check implementationPlan
    if (project.implementationPlan && project.implementationPlan.length > 0) completedSections++;
    
    // Check evaluationCriteria
    if (project.evaluationCriteria && project.evaluationCriteria.length > 0) completedSections++;
    
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