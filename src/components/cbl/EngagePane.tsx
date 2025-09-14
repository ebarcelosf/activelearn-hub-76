import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChecklistEditor } from '@/components/shared/ChecklistEditor';

interface EngagePaneProps {
  data: any;
  update: (field: string, value: any) => void;
}

export const EngagePane: React.FC<EngagePaneProps> = ({ data, update }) => {
  const [activeSection, setActiveSection] = useState('big-ideas');

  const setField = (field: string, value: string) => {
    update(field, value);
  };

  function addChecklist(text: string) {
    const newItem = { id: Date.now(), text, done: false };
    update('engageChecklistItems', [...(data.engageChecklistItems || []), newItem]);
  }

  function toggleChecklist(id: number) {
    const updatedChecklist = (data.engageChecklistItems || []).map((item: any) => 
      item.id === id ? { ...item, done: !item.done } : item
    );
    update('engageChecklistItems', updatedChecklist);
  }

  function removeChecklist(id: number) {
    const updatedChecklist = (data.engageChecklistItems || []).filter((item: any) => item.id !== id);
    update('engageChecklistItems', updatedChecklist);
  }

  function markComplete() {
    if (!canComplete) {
      alert('Engage requer Big Idea e Essential Question preenchidas.');
      return;
    }
    
    update('engageCompleted', true);
    update('phase', 'investigate');
    // Mark all checklist items as done
    const completedChecklist = (data.engageChecklistItems || []).map((item: any) => ({ ...item, done: true }));
    update('engageChecklistItems', completedChecklist);
  }

  // Verificar conclusão das seções
  const hasBigIdea = (data.bigIdea || '').trim().length > 0;
  const hasEssentialQuestion = (data.essentialQuestion || '').trim().length > 0;
  const hasChallenge = (data.challenge || '').trim().length > 0;
  const canComplete = hasBigIdea && hasEssentialQuestion;
  const sectionsCompleted = [hasBigIdea, hasEssentialQuestion, hasChallenge].filter(Boolean).length;

  const sections = [
    {
      id: 'big-ideas',
      title: 'Big Ideas',
      icon: '💡',
      description: 'Defina o problema central do projeto',
      completed: hasBigIdea
    },
    {
      id: 'essential-questions',
      title: 'Essential Questions',
      icon: '❓',
      description: 'Formule perguntas orientadoras claras',
      completed: hasEssentialQuestion
    },
    {
      id: 'challenges',
      title: 'Challenges',
      icon: '🎯',
      description: 'Liste desafios específicos a resolver',
      completed: hasChallenge
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Engage — Defina a Big Idea</h3>

      {/* Navegação das Seções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
              activeSection === section.id
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border bg-card hover:border-primary/50'
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
        {activeSection === 'big-ideas' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Big Ideas</div>
                <div className="text-muted-foreground text-sm mt-1">Escreva 1-2 frases que resumam o problema central</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                💡 Qual é a grande ideia do seu projeto?
              </label>
              <div className="text-xs text-muted-foreground mb-2">
                Descreva o problema ou oportunidade que seu projeto pretende abordar
              </div>
              <Textarea
                value={data.bigIdea || ''}
                onChange={(e) => setField('bigIdea', e.target.value)}
                placeholder="Ex: A falta de engajamento dos jovens em práticas sustentáveis está impactando negativamente o meio ambiente urbano. Como podemos criar soluções que motivem a participação ativa da juventude em iniciativas ecológicas?"
                rows={4}
                className="resize-none"
              />
              {(data.bigIdea || '').trim().length > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ Big Idea definida ({(data.bigIdea || '').trim().length} caracteres)
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'essential-questions' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Essential Questions</div>
                <div className="text-muted-foreground text-sm mt-1">Transforme a Big Idea em uma pergunta orientadora clara</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                ❓ Qual é a pergunta essencial que guiará seu projeto?
              </label>
              <div className="text-xs text-muted-foreground mb-2">
                Uma boa Essential Question é aberta, provocativa e conecta-se diretamente com sua Big Idea
              </div>
              <Input
                type="text"
                value={data.essentialQuestion || ''}
                onChange={(e) => setField('essentialQuestion', e.target.value)}
                placeholder="Ex: Como podemos usar a tecnologia para engajar jovens de 16-25 anos em práticas sustentáveis de forma divertida e colaborativa?"
              />
              {(data.essentialQuestion || '').trim().length > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ Essential Question formulada ({(data.essentialQuestion || '').trim().length} caracteres)
                </div>
              )}
              
              {/* Dicas para Essential Questions */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">💡 Dicas para uma boa Essential Question:</span>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Começa com "Como...", "Por que..." ou "O que aconteceria se..."</li>
                    <li>• É aberta (não tem uma resposta única)</li>
                    <li>• Conecta-se diretamente com sua Big Idea</li>
                    <li>• Inspira curiosidade e investigação</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'challenges' && (
          <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg text-foreground">Challenges</div>
                <div className="text-muted-foreground text-sm mt-1">Liste desafios específicos que seu projeto deverá solucionar</div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                🎯 Quais são os principais desafios a serem enfrentados?
              </label>
              <div className="text-xs text-muted-foreground mb-2">
                Identifique obstáculos específicos, limitações e barreiras que precisam ser superados
              </div>
              <Textarea
                value={data.challenge || ''}
                onChange={(e) => setField('challenge', e.target.value)}
                placeholder={`Liste os principais desafios:\n\n• Falta de conscientização sobre impacto ambiental\n• Desconexão entre teoria e prática sustentável\n• Ausência de ferramentas acessíveis para jovens\n• Falta de incentivos tangíveis para mudança de comportamento\n• Dificuldade em medir o impacto das ações individuais`}
                rows={6}
                className="resize-none"
              />
              {(data.challenge || '').trim().length > 0 && (
                <div className="mt-2 text-xs text-green-600">
                  ✅ Desafios identificados ({(data.challenge || '').trim().length} caracteres)
                </div>
              )}
            </div>
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
              items={data.engageChecklistItems || []} 
              onAdd={addChecklist} 
              onToggle={toggleChecklist} 
              onRemove={removeChecklist} 
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
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg cursor-pointer'
                : 'bg-muted text-muted-foreground cursor-not-allowed border border-border opacity-60'
            }`}
          >
            {canComplete ? '✅ Marcar Engage como concluído' : '⏳ Complete Big Idea e Essential Question'}
          </button>
          <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
            data.engageCompleted
              ? 'bg-green-500 text-white'
              : 'bg-yellow-500 text-white'
          }`}>
            {data.engageCompleted ? '✅ Concluído' : `⏳ ${sectionsCompleted}/3 seções`}
          </div>
        </div>
      </div>
    </div>
  );
};