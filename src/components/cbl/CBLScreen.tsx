import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhaseSidebar, NudgeModal } from './CBLHelpers';
import { EngagePane } from './EngagePane';
import { InvestigatePane } from './InvestigatePane';
import { ActPane } from './ActPane';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/contexts/ProjectContext';

export const CBLScreen: React.FC = () => {
  const { currentProject, updateProject } = useProjects();
  const { phase } = useParams<{ phase: string }>();
  const navigate = useNavigate();
  const [nudgeOpen, setNudgeOpen] = useState(false);
  
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

  const handlePhaseChange = (newPhase: string) => {
    navigate(`/project/${currentProject.id}/${newPhase}`);
  };

  return (
    <div className="flex gap-6 p-6">
      <PhaseSidebar 
        phase={currentPhase} 
        setPhase={handlePhaseChange} 
        project={currentProject} 
      />
      
      <div className="flex-1 bg-card rounded-xl shadow-sm border">
        <main className="p-6">
          <div className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Fase {currentPhase} — {currentProject.title}
                </h2>
                <div className="text-sm text-muted-foreground mt-1">
                  Use os nudges para orientação em cada etapa.
                </div>
              </div>
              <Button onClick={() => setNudgeOpen(true)}>
                Obter Nudge
              </Button>
            </div>

            <div className="mt-6">
              {currentPhase === 'engage' && (
                <EngagePane 
                  data={currentProject} 
                  update={handleUpdate}
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

      <NudgeModal 
        visible={nudgeOpen} 
        phase={currentPhase} 
        project={currentProject} 
        onClose={() => setNudgeOpen(false)}
      />
    </div>
  );
};