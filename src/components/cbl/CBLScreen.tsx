import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EngagePane } from './EngagePane';
import { InvestigatePane } from './InvestigatePane';
import { ActPane } from './ActPane';
import { useProjects } from '@/contexts/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, Search, Rocket } from 'lucide-react';

export const CBLScreen: React.FC = () => {
  const { currentProject, updateProject, getProjectProgress } = useProjects();
  const { phase } = useParams<{ phase: string }>();
  const navigate = useNavigate();
  
  const currentPhase = phase || 'engage';

  if (!currentProject) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">📁</div>
            <CardTitle className="mb-2">Nenhum projeto selecionado</CardTitle>
            <CardDescription>
              Crie ou selecione um projeto para começar sua jornada CBL
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    updateProject(currentProject.id, { [field]: value });
  };

  const handlePhaseTransition = (newPhase: string) => {
    navigate(`/project/${currentProject.id}/${newPhase}`);
  };

  const progress = getProjectProgress(currentProject);
  
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'engage': return Lightbulb;
      case 'investigate': return Search;
      case 'act': return Rocket;
      default: return Lightbulb;
    }
  };

  const getPhaseTitle = (phase: string) => {
    switch (phase) {
      case 'engage': return 'Engage';
      case 'investigate': return 'Investigate';
      case 'act': return 'Act';
      default: return 'Engage';
    }
  };

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case 'engage': return 'Defina o problema central e perguntas orientadoras';
      case 'investigate': return 'Pesquise e colete dados para fundamentar sua solução';
      case 'act': return 'Desenvolva e implemente soluções inovadoras';
      default: return 'Defina o problema central e perguntas orientadoras';
    }
  };

  const PhaseIcon = getPhaseIcon(currentPhase);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header do Projeto */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PhaseIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {getPhaseTitle(currentPhase)} — {currentProject.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {getPhaseDescription(currentPhase)}
                  </CardDescription>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              Fase {currentPhase}
            </Badge>
          </div>
          
          {/* Barra de Progresso do Projeto */}
          <div className="space-y-2 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Conteúdo da Fase */}
      <Card>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
    </div>
  );
};