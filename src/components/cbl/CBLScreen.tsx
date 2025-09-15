import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EngagePane } from './EngagePane';
import { InvestigatePane } from './InvestigatePane';
import { ActPane } from './ActPane';
import { useProjects } from '@/contexts/ProjectContext';

export const CBLScreen: React.FC = () => {
  const { currentProject, updateProject } = useProjects();
  const { phase } = useParams<{ phase: string }>();
  const navigate = useNavigate();
  
  const currentPhase = phase || 'engage';

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-4">📁</div>
          <div className="text-lg font-medium">Nenhum projeto selecionado</div>
          <div className="text-sm mt-2">Crie ou selecione um projeto para começar</div>
        </div>
      </div>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    updateProject(currentProject.id, { [field]: value });
  };

  const handlePhaseTransition = (newPhase: string) => {
    navigate(`/project/${currentProject.id}/${newPhase}`);
  };

  return (
    <div className="p-6">
      <div className="bg-card rounded-xl shadow-sm border">
        <main className="p-6">
          <div className="border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Fase {currentPhase} — {currentProject.title}
              </h2>
              <div className="text-sm text-muted-foreground mt-1">
                Use os nudges para orientação em cada etapa.
              </div>
            </div>

            <div className="mt-6">
              {currentPhase === 'engage' && (
                <EngagePane 
                  data={currentProject} 
                  update={handleUpdate}
                  onPhaseTransition={handlePhaseTransition}
                />
              )}
              {currentPhase === 'investigate' && (
                <InvestigatePane 
                  data={currentProject} 
                  update={handleUpdate}
                />
              )}
              {currentPhase === 'act' && (
                <ActPane 
                  data={currentProject} 
                  update={handleUpdate}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};