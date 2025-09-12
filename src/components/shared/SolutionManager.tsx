import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Solution {
  title?: string;
  description?: string;
  features?: string;
  technology?: string;
  differentials?: string;
}

interface SolutionManagerProps {
  solution: Solution;
  onUpdate: (field: string, value: string) => void;
  title: string;
  description: string;
}

export const SolutionManager: React.FC<SolutionManagerProps> = ({
  solution,
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
              🎯 Título da Solução
              <Badge variant="outline" className="text-xs">
                Obrigatório
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={solution.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
              placeholder="Ex: EcoConnect - Plataforma de Engajamento Sustentável"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Escolha um nome que seja claro e atrativo
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              📝 Descrição Detalhada
              <Badge variant="outline" className="text-xs">
                Obrigatório
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={solution.description || ''}
              onChange={(e) => onUpdate('description', e.target.value)}
              placeholder="Descreva detalhadamente como sua solução funciona. Explique o conceito central, como resolve o problema identificado e qual será a experiência do usuário."
              rows={5}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Seja específico sobre como a solução aborda os desafios identificados na fase Engage
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">⚡ Funcionalidades Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={solution.features || ''}
              onChange={(e) => onUpdate('features', e.target.value)}
              placeholder={`Liste as principais funcionalidades da sua solução:\n\n• Funcionalidade 1: Descrição\n• Funcionalidade 2: Descrição\n• Funcionalidade 3: Descrição`}
              rows={4}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Foque nas funcionalidades essenciais que diferenciam sua solução
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">🛠️ Tecnologia Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={solution.technology || ''}
              onChange={(e) => onUpdate('technology', e.target.value)}
              placeholder="Que tecnologias, ferramentas ou recursos serão necessários para desenvolver e manter sua solução? Considere plataformas, linguagens de programação, infraestrutura, etc."
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Seja realista sobre a complexidade técnica e recursos disponíveis
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">🌟 Diferenciais Competitivos</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={solution.differentials || ''}
              onChange={(e) => onUpdate('differentials', e.target.value)}
              placeholder="O que torna sua solução única? Como ela se diferencia de outras abordagens existentes? Quais são seus pontos fortes distintivos?"
              rows={3}
              className="resize-none"
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Dica: Destaque inovações ou abordagens únicas baseadas na sua pesquisa
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso */}
      <div className="mt-6 p-4 bg-card rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso do Desenvolvimento:</span>
          <span className="font-medium">
            {Object.values(solution).filter(value => value && value.trim().length > 0).length}/5 seções preenchidas
          </span>
        </div>
        <div className="mt-2 w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.values(solution).filter(value => value && value.trim().length > 0).length / 5) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};