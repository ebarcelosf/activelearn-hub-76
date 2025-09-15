import React, { useState } from 'react';
import { SolutionManager } from '@/components/shared/SolutionManager';
import { ImplementationManager } from '@/components/shared/ImplementationManager';
import { EvaluationManager } from '@/components/shared/EvaluationManager';
import { PrototypeManager } from '@/components/shared/PrototypeManager';
import { ChecklistEditor } from '@/components/shared/ChecklistEditor';
import { useBadgeContext } from '@/contexts/BadgeContext';
import { useNudges } from '@/hooks/useNudges';
import { NudgeModal } from '@/components/shared/NudgeModal';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface ActPaneProps {
  data: any;
  update: (field: string, value: any) => void;
}

export const ActPane: React.FC<ActPaneProps> = ({ data, update }) => {
  const [activeSection, setActiveSection] = useState('solution-development');
  const { checkTrigger } = useBadgeContext();
  const { isModalOpen, currentCategory, currentPhase, openNudgeModal, closeModal } = useNudges();

  // Atualizar dados da solução
  function updateSolution(field: string, value: any) {
    const solution = { ...data.solution, [field]: value };
    update('solution', solution);
  }

  // Atualizar dados da implementação
  function updateImplementation(field: string, value: any) {
    const implementation = { ...data.implementation, [field]: value };
    update('implementation', implementation);
  }

  // Atualizar dados da avaliação
  function updateEvaluation(field: string, value: any) {
    const evaluation = { ...data.evaluation, [field]: value };
    update('evaluation', evaluation);
  }

  // Adicionar protótipo
  function addPrototype(prototype: any) {
    const prototypes = [...(data.prototypes || []), prototype];
    update('prototypes', prototypes);
    
    // Trigger badges de protótipos
    if (prototypes.length === 1) {
      checkTrigger('prototype_created');
    } else if (prototypes.length === 3) {
      checkTrigger('multiple_prototypes_created', { prototypesCount: prototypes.length });
    }
  }

  // Atualizar protótipo
  function updatePrototype(id: string, updatedData: any) {
    const prototypes = (data.prototypes || []).map((p: any) => 
      p.id === id ? { ...p, ...updatedData } : p
    );
    update('prototypes', prototypes);
  }

  // Remover protótipo
  function removePrototype(id: string) {
    const prototypes = (data.prototypes || []).filter((p: any) => p.id !== id);
    update('prototypes', prototypes);
  }

  function addChecklist(text: string) {
    const newItem = { id: Date.now(), text, done: false };
    update('actChecklistItems', [...(data.actChecklistItems || []), newItem]);
  }

  function toggleChecklist(id: number) {
    const checklist = (data.actChecklistItems || []).map((item: any) => 
      item.id === id ? { ...item, done: !item.done } : item
    );
    update('actChecklistItems', checklist);
  }

  function removeChecklistItem(id: number) {
    const checklist = (data.actChecklistItems || []).filter((item: any) => item.id !== id);
    update('actChecklistItems', checklist);
  }

  function markComplete() {
    // Verificar se todos os requisitos básicos foram atendidos
    const hasBasicSolution = !!(data.solution?.description || '').trim();
    const hasPrototypes = (data.prototypes || []).length >= 1;
    const hasImplementationPlan = !!(data.implementation?.overview || '').trim();
    const hasEvaluationCriteria = !!(data.evaluation?.objectives || '').trim();

    if (!hasBasicSolution) return alert('É necessário descrever a solução no "Solution Development".');
    if (!hasPrototypes) return alert('É necessário criar pelo menos 1 protótipo.');
    if (!hasImplementationPlan) return alert('É necessário definir um plano de implementação.');
    if (!hasEvaluationCriteria) return alert('É necessário estabelecer critérios de avaliação.');

    update('actCompleted', true);
    
    // Trigger badges de conclusão
    checkTrigger('act_completed');
    
    // Verificar se completou todo o ciclo CBL
    if (data.engageCompleted && data.investigateCompleted) {
      checkTrigger('cbl_cycle_completed');
    }
    
    // Mark all checklist items as done
    const completedChecklist = (data.actChecklistItems || []).map((item: any) => ({ ...item, done: true }));
    update('actChecklistItems', completedChecklist);
  }

  // Verificar conclusão das seções
  const hasSolution = !!(data.solution?.description || '').trim();
  const hasImplementation = !!(data.implementation?.overview || '').trim();
  const hasEvaluation = !!(data.evaluation?.objectives || '').trim();
  const hasPrototypes = (data.prototypes || []).length > 0;
  const sectionsCompleted = [hasSolution, hasImplementation, hasEvaluation, hasPrototypes].filter(Boolean).length;

  const sections = [
    {
      id: 'solution-development',
      title: 'Solution Development',
      icon: '🎯',
      description: 'Desenvolva soluções concretas e inovadoras',
      completed: !!(data.solution?.description || '').trim()
    },
    {
      id: 'implementation',
      title: 'Implementation',
      icon: '🚀',
      description: 'Crie protótipos testáveis e planos de implementação',
      completed: !!(data.implementation?.overview || '').trim()
    },
    {
      id: 'evaluation',
      title: 'Evaluation',
      icon: '📊',
      description: 'Estabeleça planos de avaliação e métricas de sucesso',
      completed: !!(data.evaluation?.objectives || '').trim()
    },
    {
      id: 'prototypes',
      title: 'Prototypes',
      icon: '🛠️',
      description: 'Crie e teste protótipos funcionais',
      completed: (data.prototypes || []).length > 0
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Act — Implementar e Testar</h3>

      {/* Navegação das Seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
              activeSection === section.id
                ? 'border-accent bg-accent/10 shadow-sm'
                : 'border-border bg-card hover:border-accent/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{section.icon}</span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                section.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-border'
              }`}>
                {section.completed && <span className="text-xs">✓</span>}
              </div>
            </div>
            <div className="font-semibold text-foreground mb-1">{section.title}</div>
            <div className="text-xs text-muted-foreground">{section.description}</div>
          </button>
        ))}
      </div>

      {/* Conteúdo das Seções */}
      <div className="space-y-6">
        {activeSection === 'solution-development' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Solution Development</div>
                <div className="text-muted-foreground text-sm mt-1">Desenvolva soluções concretas e inovadoras para seu desafio</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Act', 'Solution Development')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <SolutionManager
              solution={data.solution || {}}
              onUpdate={updateSolution}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'implementation' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Implementation Plan</div>
                <div className="text-muted-foreground text-sm mt-1">Defina como sua solução será construída e implementada</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Act', 'Implementation')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <ImplementationManager
              implementation={data.implementation || {}}
              onUpdate={updateImplementation}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'evaluation' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Evaluation Criteria</div>
                <div className="text-muted-foreground text-sm mt-1">Estabeleça como medir o sucesso da sua solução</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Act', 'Evaluation')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <EvaluationManager
              evaluation={data.evaluation || {}}
              onUpdate={updateEvaluation}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'prototypes' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Prototypes</div>
                <div className="text-muted-foreground text-sm mt-1">Crie e teste protótipos da sua solução</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Act', 'Prototypes')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <PrototypeManager
              prototypes={data.prototypes || []}
              onAdd={addPrototype}
              onUpdate={updatePrototype}
              onRemove={removePrototype}
              title=""
              description=""
            />
          </div>
        )}

        {/* Checklist Personalizada */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-lg text-foreground">Checklist Personalizada</div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Customize suas tarefas</div>
          </div>
          <div className="mt-4">
            <ChecklistEditor 
              items={data.actChecklistItems || []} 
              onAdd={addChecklist} 
              onToggle={toggleChecklist}
              onRemove={removeChecklistItem}
            />
          </div>
        </div>

        {/* Botão de Conclusão */}
        <div className="flex gap-3 items-center">
          <button 
            onClick={markComplete} 
            disabled={sectionsCompleted < 4}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              sectionsCompleted >= 4
                ? 'bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg' 
                : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
            }`}
          >
            {sectionsCompleted >= 4 ? '✅ Marcar Act como concluído' : '⏳ Complete todas as seções para finalizar'}
          </button>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            data.actCompleted 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-white'
          }`}>
            {data.actCompleted ? '✅ Concluído' : `⏳ ${sectionsCompleted}/4 seções`}
          </div>
        </div>
      </div>
      
      <NudgeModal
        isOpen={isModalOpen}
        onClose={closeModal}
        category={currentCategory}
        phase={currentPhase}
      />
    </div>
  );
};