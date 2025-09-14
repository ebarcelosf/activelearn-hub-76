import React, { useState } from 'react';
import { AddQuestionForm } from '@/components/shared/FormComponents';
import { ActivityManager } from '@/components/shared/ActivityManager';
import { ResourceManager } from '@/components/shared/ResourceManager';
import { SynthesisManager } from '@/components/shared/SynthesisManager';
import { ChecklistEditor } from '@/components/shared/ChecklistEditor';
import { useBadgeContext } from '@/contexts/BadgeContext';
import { useNudges } from '@/hooks/useNudges';
import { NudgeModal } from '@/components/shared/NudgeModal';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface InvestigatePaneProps {
  data: any;
  update: (field: string, value: any) => void;
}

export const InvestigatePane: React.FC<InvestigatePaneProps> = ({ data, update }) => {
  const [activeSection, setActiveSection] = useState('guiding-questions');
  const { checkTrigger } = useBadgeContext();
  const { isModalOpen, currentNudges, currentCategory, currentPhase, openNudgeModal, refreshNudges, closeModal } = useNudges();

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
      return alert(`Investigate requer pelo menos 3 perguntas respondidas (${answeredCount}/3) e 1 atividade concluída (${completedActivities}/${activities.length}).`);
    }
    checkTrigger('investigate_completed');
    update('phase', 'act');
    // Mark all checklist items as done
    const completedChecklist = (data.checklist || []).map((item: any) => ({ ...item, done: true }));
    update('checklist', completedChecklist);
  }

  // Verificar conclusão das seções
  const activities = data.activities || [];
  const resources = data.resources || [];
  const synthesis = data.synthesis || {};
  const answeredCount = (data.answers || []).filter((a: any) => a && a.a && a.a.trim().length > 0).length;
  const completedActivities = activities.filter((act: any) => act.status === 'completed').length;
  const canComplete = answeredCount >= 3 && completedActivities >= 1;

  // Status das seções
  const hasAnswers = answeredCount >= 3;
  const hasActivities = completedActivities >= 1;
  const hasResources = resources.length >= 1;
  const hasSynthesis = !!(synthesis.mainFindings || '').trim();
  const sectionsCompleted = [hasAnswers, hasActivities, hasResources, hasSynthesis].filter(Boolean).length;

  const sections = [
    {
      id: 'guiding-questions',
      title: 'Guiding Questions',
      icon: '❓',
      description: 'Perguntas-guia para orientar sua pesquisa',
      completed: hasAnswers,
      count: `${answeredCount}/${(data.guidingQuestions || []).length}`
    },
    {
      id: 'guiding-activities',
      title: 'Guiding Activities',
      icon: '🎯',
      description: 'Atividades práticas para coletar dados',
      completed: hasActivities,
      count: `${completedActivities}/${activities.length}`
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
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Investigate — Pesquise e responda perguntas-guia</h3>

      {/* Navegação das Seções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
              activeSection === section.id
                ? 'border-secondary bg-secondary/10 shadow-sm'
                : 'border-border bg-card hover:border-secondary/50'
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
            <div className="text-xs text-muted-foreground mb-1">{section.description}</div>
            {section.count && (
              <div className="text-xs text-accent font-medium">{section.count}</div>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo das Seções */}
      <div className="space-y-6">
        {activeSection === 'guiding-questions' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Guiding Questions</div>
                <div className="text-muted-foreground text-sm mt-1">Perguntas-guia para orientar sua pesquisa</div>
              </div>
            </div>
            
            <div className="mt-4">
              {(data.guidingQuestions || []).length === 0 && (
                <div className="text-center p-6 text-muted-foreground bg-muted rounded-lg border">
                  <div className="text-2xl mb-2">🔍</div>
                  <div>Nenhuma pergunta adicionada ainda.</div>
                  <div className="text-sm mt-1">Use o campo abaixo para adicionar sua primeira pergunta-guia.</div>
                </div>
              )}

              <div className="space-y-3">
                {(data.guidingQuestions || []).map((q: string, i: number) => (
                  <div key={i} className="bg-muted p-4 rounded-lg border shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-sm text-muted-foreground font-medium flex-1">{q}</div>
                      <button
                        onClick={() => removeGuidingQuestion(i)}
                        className="ml-2 px-2 py-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground rounded transition-all duration-200"
                        title="Remover pergunta"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      value={(data.answers && data.answers[i] && data.answers[i].a) || ''}
                      onChange={(e) => setAnswer(i, e.target.value)}
                      placeholder="Digite sua resposta aqui..."
                      rows={3}
                      className="w-full p-3 rounded-lg bg-background border text-foreground focus:ring-2 focus:ring-secondary focus:border-transparent transition-all duration-200"
                    />
                    {data.answers && data.answers[i] && data.answers[i].a && data.answers[i].a.trim().length > 0 && (
                      <div className="mt-2 text-xs text-green-600">
                        ✅ Respondida ({data.answers[i].a.trim().length} caracteres)
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <AddQuestionForm onAdd={addGuidingQuestion} />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'guiding-activities' && (
          <ActivityManager
            activities={activities}
            onAdd={addActivity}
            onUpdate={updateActivity}
            onRemove={removeActivity}
            onToggleStatus={toggleActivityStatus}
            title="Guiding Activities"
            description="Atividades práticas para coletar dados e informações"
          />
        )}

        {activeSection === 'guiding-resources' && (
          <ResourceManager
            resources={resources}
            onAdd={addResource}
            onUpdate={updateResource}
            onRemove={removeResource}
            title="Guiding Resources"
            description="Colete artigos, vídeos e entrevistas relevantes"
          />
        )}

        {activeSection === 'research-synthesis' && (
          <SynthesisManager
            synthesis={synthesis}
            onUpdate={updateSynthesis}
            questions={data.guidingQuestions || []}
            answers={data.answers || []}
            resources={resources}
            activities={activities}
            title="Research Synthesis"
            description="Resuma os principais insights e padrões descobertos"
          />
        )}

        {/* Checklist Personalizada */}
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-lg text-foreground">Checklist Personalizada</div>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">Customize suas tarefas</div>
          </div>
          <div className="mt-4">
            <ChecklistEditor
              items={data.investigateChecklistItems || []}
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
            disabled={!canComplete}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              canComplete
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg'
                : 'bg-muted text-muted-foreground cursor-not-allowed border border-border'
            }`}
          >
            {canComplete ? '✅ Marcar Investigate como concluído' : '⏳ Complete 3 perguntas e 1 atividade'}
          </button>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            data.investigateCompleted
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}>
            {data.investigateCompleted ? '✅ Concluído' : `⏳ ${sectionsCompleted}/4 seções • ${answeredCount}/3 respostas • ${completedActivities}/${activities.length} atividades`}
          </div>
        </div>
      </div>
    </div>
  );
};