import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Evaluation {
  objectives?: string;
  metrics?: string;
  methods?: string;
  timeline?: string;
  stakeholders?: string;
}

interface EvaluationManagerProps {
  evaluation: Evaluation;
  onUpdate: (field: string, value: string) => void;
  title: string;
  description: string;
}

export const EvaluationManager: React.FC<EvaluationManagerProps> = ({
  evaluation,
  onUpdate,
  title,
  description
}) => {
  return (
    <div className="bg-muted/30 p-6 rounded-xl border border-border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              🎯 Objetivos da Avaliação
              <Badge variant="outline" className="text-xs">
                Obrigatório
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={evaluation.objectives || ''}
              onChange={(e) => onUpdate('objectives', e.target.value)}
              placeholder="O que você quer avaliar? Como definirá se sua solução é bem-sucedida? Quais são os objetivos principais que a solução deve alcançar?"
              rows={4}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Conecte os objetivos com o problema original identificado na fase Engage
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Métricas e Indicadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={evaluation.metrics || ''}
              onChange={(e) => onUpdate('metrics', e.target.value)}
              placeholder={`Defina métricas específicas e mensuráveis:\n\nQuantitativas:\n• Número de usuários ativos\n• Taxa de engajamento\n• Redução percentual do problema\n\nQualitativas:\n• Satisfação dos usuários\n• Facilidade de uso\n• Impacto percebido`}
              rows={6}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Combine métricas quantitativas (números) e qualitativas (percepções)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔍 Métodos de Coleta</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={evaluation.methods || ''}
              onChange={(e) => onUpdate('methods', e.target.value)}
              placeholder="Como você coletará os dados para avaliação? Pesquisas, entrevistas, observação, analytics, testes A/B, grupos focais, etc."
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Use múltiplos métodos para obter uma visão completa do impacto
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📅 Cronograma de Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={evaluation.timeline || ''}
              onChange={(e) => onUpdate('timeline', e.target.value)}
              placeholder="Quando e com que frequência a avaliação será realizada? Avaliação inicial, marcos intermediários, avaliação final, monitoramento contínuo?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Planeje avaliações regulares para ajustar a solução durante o desenvolvimento
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">👥 Stakeholders e Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={evaluation.stakeholders || ''}
              onChange={(e) => onUpdate('stakeholders', e.target.value)}
              placeholder="Quem fornecerá feedback sobre a solução? Usuários finais, especialistas, comunidade, gestores? Como o feedback será incorporado?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Inclua a perspectiva de todos os grupos afetados pela solução
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <div className="mt-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso da Avaliação:</span>
          <span className="font-medium">
            {Object.values(evaluation).filter(value => value && value.trim().length > 0).length}/5 seções preenchidas
          </span>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(evaluation).filter(value => value && value.trim().length > 0).length / 5) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};