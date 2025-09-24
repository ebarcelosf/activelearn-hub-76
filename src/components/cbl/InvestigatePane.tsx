import React, { useState } from 'react';
import { AddQuestionForm } from '@/components/shared/FormComponents';
import { ActivityManager } from '@/components/shared/ActivityManager';
import { ResourceManager } from '@/components/shared/ResourceManager';
import { SynthesisManager } from '@/components/shared/SynthesisManager';
import { ChecklistEditorCard } from '@/components/shared/ChecklistEditorCard';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { useNudges } from '@/hooks/useNudges';
import { NudgeModal } from '@/components/shared/NudgeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface InvestigatePaneProps {
  data: any;
  update: (field: string, value: any) => void;
  onPhaseTransition?: (phase: string) => void;
}

export const InvestigatePane: React.FC<InvestigatePaneProps> = ({ data, update, onPhaseTransition }) => {
  const [activeSection, setActiveSection] = useState('guiding-questions');
  const badge = useBadgeContextOptional();
  const checkTrigger = badge?.checkTrigger ?? (() => {});
  const { isModalOpen, currentCategory, currentPhase, openNudgeModal, closeModal } = useNudges();

  function setAnswer(idx: number, text: string) {
    const answers = [...(data.answers || [])];
    answers[idx] = { q: data.guidingQuestions[idx], a: text };
    update('answers', answers);

    // Verificar badges de perguntas respondidas
    const answeredCount = answers.filter(a => a && a.a && a.a.trim().length > 0).length;
    if (answeredCount === 1) {
      checkTrigger('first_question_answered');
    } else if (answeredCount === 3) {
      checkTrigger('questions_answered_3', { questionsAnswered: answeredCount });
    } else if (answeredCount === 5) {
      checkTrigger('questions_answered_5', { questionsAnswered: answeredCount });
    }
  }

  function addGuidingQuestion(text: string) {
    if (!text.trim()) return;
    const newQuestions = [...(data.guidingQuestions || []), text.trim()];
    update('guidingQuestions', newQuestions);
  }

  function removeGuidingQuestion(index: number) {
    const newQuestions = (data.guidingQuestions || []).filter((_: any, i: number) => i !== index);
    const newAnswers = (data.answers || []).filter((_: any, i: number) => i !== index);
    update('guidingQuestions', newQuestions);
    update('answers', newAnswers);
  }

  // Guiding Activities Functions
  function addActivity(newActivity: any) {
    const activities = [...(data.activities || []), newActivity];
    update('activities', activities);
    
    // Trigger badge de primeira atividade
    if (activities.length === 1) {
      checkTrigger('activity_created');
    }
  }

  function updateActivity(id: string, updatedData: any) {
    const activities = (data.activities || []).map((act: any) =>
      act.id === id ? { ...act, ...updatedData, updatedAt: new Date().toISOString() } : act
    );
    update('activities', activities);
  }

  function toggleActivityStatus(id: string) {
    const activities = (data.activities || []).map((act: any) => {
      if (act.id !== id) return act;
      const current: 'planned' | 'in-progress' | 'completed' = act.status || 'planned';
      const next: 'planned' | 'in-progress' | 'completed' =
        current === 'planned' ? 'in-progress' : current === 'in-progress' ? 'completed' : 'planned';
      return {
        ...act,
        status: next,
        completedAt: next === 'completed' ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
      };
    });
    update('activities', activities);
  }

  function removeActivity(id: string) {
    const activities = (data.activities || []).filter((act: any) => act.id !== id);
    update('activities', activities);
  }

  // Guiding Resources Functions
  function addResource(newResource: any) {
    const resources = [...(data.resources || []), newResource];
    update('resources', resources);
    // Badge triggers for resources
    checkTrigger('resources_added', { resourcesCount: resources.length });
    if (resources.length >= 3) {
      checkTrigger('multiple_resources_collected', { resourcesCount: resources.length });
    }
  }

  function updateResource(id: string, updatedData: any) {
    const resources = (data.resources || []).map((res: any) =>
      res.id === id ? { ...res, ...updatedData, updatedAt: new Date().toISOString() } : res
    );
    update('resources', resources);
  }

  function removeResource(id: string) {
    const resources = (data.resources || []).filter((res: any) => res.id !== id);
    update('resources', resources);
  }

  function updateSynthesis(field: string, value: any) {
    const synthesis = { ...data.synthesis, [field]: value };
    update('synthesis', synthesis);
  }

  function addChecklist(text: string) {
    const newItem = { id: Date.now(), text, done: false };
    update('investigateChecklistItems', [...(data.investigateChecklistItems || []), newItem]);
  }

  function toggleChecklist(id: number) {
    const checklist = (data.investigateChecklistItems || []).map((item: any) => 
      item.id === id ? { ...item, done: !item.done } : item
    );
    update('investigateChecklistItems', checklist);
  }

  function removeChecklistItem(id: number) {
    const checklist = (data.investigateChecklistItems || []).filter((item: any) => item.id !== id);
    update('investigateChecklistItems', checklist);
  }

  function markComplete() {
    if (!canComplete) {
      return alert('Para concluir, adicione: 1 pergunta, 1 atividade, 1 recurso e escreva a síntese.');
    }
    // Marcar fase como concluída
    update('investigateCompleted', true);
    checkTrigger('investigate_completed', { questionsAnswered: answeredCount });
    // Marcar todos os itens da checklist da fase como concluídos
    const completedChecklist = (data.investigateChecklistItems || []).map((item: any) => ({ ...item, done: true }));
    update('investigateChecklistItems', completedChecklist);
    // Navegar para a próxima fase
    if (onPhaseTransition) {
      onPhaseTransition('act');
    }
  }

  // Verificar conclusão das seções
  const activities = data.activities || [];
  const resources = data.resources || [];
  const synthesis = data.synthesis || {};
  const answeredCount = (data.answers || []).filter((a: any) => a && a.a && a.a.trim().length > 0).length;
  const questionsCount = (data.guidingQuestions || []).length;
  
  // Critérios de conclusão: 1 pergunta, 1 atividade, 1 recurso e síntese preenchida
  const hasQuestion = questionsCount >= 1;
  const hasActivities = activities.length >= 1;
  const hasResources = resources.length >= 1;
  const hasSynthesis = !!(synthesis.mainFindings || '').trim();
  const sectionsCompleted = [hasQuestion, hasActivities, hasResources, hasSynthesis].filter(Boolean).length;
  const canComplete = sectionsCompleted === 4;

  const sections = [
    {
      id: 'guiding-questions',
      title: 'Guiding Questions',
      icon: '❓',
      description: 'Perguntas-guia para orientar sua pesquisa',
      completed: hasQuestion,
      count: (questionsCount).toString()
    },
    {
      id: 'guiding-activities',
      title: 'Guiding Activities',
      icon: '🎯',
      description: 'Atividades práticas para coletar dados',
      completed: hasActivities,
      count: activities.length.toString()
    },
    {
      id: 'guiding-resources',
      title: 'Guiding Resources',
      icon: '📚',
      description: 'Colete artigos, vídeos e entrevistas',
      completed: hasResources,
      count: resources.length.toString()
    },
    {
      id: 'research-synthesis',
      title: 'Research Synthesis',
      icon: '🔍',
      description: 'Resumir os principais insights obtidos',
      completed: hasSynthesis
    }
  ];

  return (
    <div className="space-y-8">
      {/* Navegação das Seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map(section => (
          <Card 
            key={section.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              activeSection === section.id
                ? 'ring-2 ring-secondary border-secondary/50'
                : ''
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-2xl">{section.icon}</div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  section.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-border'
                }`}>
                  {section.completed && <span className="text-xs">✓</span>}
                </div>
              </div>
              <CardTitle className="text-sm mb-1">{section.title}</CardTitle>
              <CardDescription className="text-xs mb-1">{section.description}</CardDescription>
              {section.count && (
                <Badge variant="secondary" className="text-xs">
                  {section.count}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conteúdo das Seções */}
      <div className="space-y-6">
        {activeSection === 'guiding-questions' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    ❓ Guiding Questions
                  </CardTitle>
                  <CardDescription>
                    Perguntas-guia para orientar sua pesquisa
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openNudgeModal('Investigate', 'Guiding Questions')}
                  className="flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Obter Nudges
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(data.guidingQuestions || []).length === 0 && (
                <Card className="text-center py-8">
                  <CardContent>
                    <div className="text-6xl mb-4">🔍</div>
                    <CardTitle className="mb-2">Nenhuma pergunta adicionada ainda</CardTitle>
                    <CardDescription>
                      Use o campo abaixo para adicionar sua primeira pergunta-guia
                    </CardDescription>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {(data.guidingQuestions || []).map((q: string, i: number) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base flex-1">{q}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGuidingQuestion(i)}
                          className="text-destructive hover:text-destructive ml-2"
                        >
                          ✕
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <textarea
                        value={(data.answers && data.answers[i] && data.answers[i].a) || ''}
                        onChange={(e) => setAnswer(i, e.target.value)}
                        placeholder="Digite sua resposta aqui..."
                        rows={3}
                        className="w-full p-3 rounded-lg bg-background border text-foreground focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                      />
                      {data.answers && data.answers[i] && data.answers[i].a && data.answers[i].a.trim().length > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✅ Respondida ({data.answers[i].a.trim().length} caracteres)
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-6">
                <AddQuestionForm onAdd={addGuidingQuestion} />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'guiding-activities' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Guiding Activities</div>
                <div className="text-muted-foreground text-sm mt-1">Atividades práticas para coletar dados e informações</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Investigate', 'Guiding Activities')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <ActivityManager
              activities={activities}
              onAdd={addActivity}
              onUpdate={updateActivity}
              onRemove={removeActivity}
              onToggleStatus={toggleActivityStatus}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'guiding-resources' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Guiding Resources</div>
                <div className="text-muted-foreground text-sm mt-1">Colete artigos, vídeos e entrevistas relevantes</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Investigate', 'Guiding Resources')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <ResourceManager
              resources={resources}
              onAdd={addResource}
              onUpdate={updateResource}
              onRemove={removeResource}
              title=""
              description=""
            />
          </div>
        )}

        {activeSection === 'research-synthesis' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Research Synthesis</div>
                <div className="text-muted-foreground text-sm mt-1">Resuma os principais insights e padrões descobertos</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNudgeModal('Investigate', 'Research Synthesis')}
                className="flex items-center gap-1 text-xs"
              >
                <Lightbulb className="h-3 w-3" />
                Obter Nudges
              </Button>
            </div>
            <SynthesisManager
              synthesis={synthesis}
              onUpdate={updateSynthesis}
              questions={data.guidingQuestions || []}
              answers={data.answers || []}
              resources={resources}
              activities={activities}
              title=""
              description=""
            />
          </div>
        )}

        {/* Checklist Personalizada */}
        <ChecklistEditorCard
          items={data.investigateChecklistItems || []}
          onAdd={addChecklist}
          onToggle={toggleChecklist}
          onRemove={removeChecklistItem}
          title="Checklist da Fase Investigate"
          description="Adicione tarefas específicas para esta fase"
        />

        {/* Botão de Conclusão */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="space-y-2">
                <h3 className="font-semibold">Concluir Fase Investigate</h3>
                <p className="text-sm text-muted-foreground">
                  Para avançar: adicione 1 pergunta, 1 atividade, 1 recurso e escreva a síntese
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Badge variant={data.investigateCompleted ? "default" : "secondary"}>
                  {data.investigateCompleted ? '✅ Concluído' : `⏳ ${sectionsCompleted}/4 seções (Perg., Ativ., Rec., Síntese)`}
                </Badge>
                <Button
                  onClick={markComplete}
                  disabled={!canComplete}
                  size="lg"
                  className={!canComplete ? "opacity-60" : ""}
                >
                  {canComplete ? 'Concluir Fase e Avançar para Act' : '⏳ Requisitos pendentes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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