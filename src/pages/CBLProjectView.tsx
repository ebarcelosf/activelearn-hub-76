import React, { useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { CBLScreen } from '@/components/cbl/CBLScreen';
import { useProjects } from '@/contexts/ProjectContext';

export const CBLProjectView: React.FC = () => {
  const { projectId, phase } = useParams<{ projectId: string; phase: string }>();
  const navigate = useNavigate();
  const { projects, setCurrentProject, currentProject } = useProjects();

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      }
    }
  }, [projectId, projects, setCurrentProject]);

  // Verificar se o projeto existe
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    return <Navigate to="/" replace />;
  }

  // Verificar se a fase é válida
  const validPhases = ['engage', 'investigate', 'act'];
  if (!phase || !validPhases.includes(phase)) {
    return <Navigate to={`/project/${projectId}/engage`} replace />;
  }

  // Lógica de validação de progressão sequencial
  const canAccessPhase = (requestedPhase: string): boolean => {
    const answeredCount = (project as any).answers?.filter((a: any) => a && a.a && a.a.trim().length > 0).length || 0;
    const completedActivities = (project as any).activities?.filter((a: any) => a.status === 'completed').length || 0;
    const hasSynthesis = !!(((project as any).synthesis?.mainFindings) || (project as any).researchSynthesis);
    switch (requestedPhase) {
      case 'engage':
        return true;
      case 'investigate':
        return !!(((project as any).engageCompleted) || (project.bigIdea && project.essentialQuestion));
      case 'act':
        return !!(((project as any).investigateCompleted) || (answeredCount >= 3 && completedActivities >= 1 && hasSynthesis));
      default:
        return false;
    }
  };

  // Redirecionar se não puder acessar a fase
  if (!canAccessPhase(phase)) {
    if (phase === 'investigate' && !canAccessPhase('investigate')) {
      return <Navigate to={`/project/${projectId}/engage`} replace />;
    }
    if (phase === 'act' && !canAccessPhase('act')) {
      return <Navigate to={`/project/${projectId}/investigate`} replace />;
    }
  }

  return <CBLScreen />;
};