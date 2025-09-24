// hooks/useBadges.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Badge, Project } from '@/types';
import { BadgeDefinition, BADGE_LIST, getBadgeById } from '@/utils/badgeConstants';

interface BadgeProgress {
  completed: boolean;
  percentage: number;
  remaining?: number;
}

export interface BadgeTriggerData {
  questionsAnswered?: number;
  resourcesCount?: number;
  prototypesCount?: number;
  activitiesCount?: number;
  shouldGrant?: boolean;
}

export function useBadges(storageKey: string = 'cbl_badges') {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Carregar badges salvos no localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const badges = JSON.parse(savedData);
        if (Array.isArray(badges)) {
          setEarnedBadges(badges);
        }
      } catch (error) {
        console.warn('Erro ao carregar badges do localStorage:', error);
      }
    }
  }, [storageKey]);

  // Salvar badges no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(earnedBadges));
  }, [earnedBadges, storageKey]);

  // IDs dos badges conquistados
  const earnedBadgeIds = useMemo(() => earnedBadges.map(badge => badge.id), [earnedBadges]);

  // Estatísticas
  const totalXP = useMemo(() => earnedBadges.reduce((sum, badge) => sum + (badge.xp || 0), 0), [earnedBadges]);
  const level = useMemo(() => Math.floor(totalXP / 200) + 1, [totalXP]);
  const xpForNextLevel = useMemo(() => (level * 200) - totalXP, [level, totalXP]);

  // Função principal para conceder badge
  const grantBadge = useCallback((badgeId: string) => {
    if (earnedBadgeIds.includes(badgeId)) {
      return; // Já possui
    }

    const badgeDefinition = getBadgeById(badgeId);
    if (!badgeDefinition) {
      console.warn('Badge não encontrado:', badgeId);
      return;
    }

    const newBadge: Badge = {
      id: badgeDefinition.id,
      name: badgeDefinition.title,
      description: badgeDefinition.desc,
      icon: badgeDefinition.icon,
      earnedAt: new Date(),
      category: badgeDefinition.category as any,
      xp: badgeDefinition.xp
    };

    setEarnedBadges(prev => [...prev, newBadge]);
    setRecentBadge(newBadge);
    setShowNotification(true);
    
    // Auto-hide notification após 4 segundos
    setTimeout(() => setShowNotification(false), 4000);

    console.log(`Badge conquistado: ${newBadge.name} (+${newBadge.xp} XP)`);
  }, [earnedBadgeIds]);

  // Função para verificar se pode conquistar badge
  const canEarnBadge = useCallback((badgeId: string): boolean => {
    return !earnedBadgeIds.includes(badgeId);
  }, [earnedBadgeIds]);

  // Função para obter progresso para um badge específico
  const getBadgeProgress = useCallback((badgeId: string, currentValue: number, targetValue: number): BadgeProgress => {
    if (!canEarnBadge(badgeId)) return { completed: true, percentage: 100 };
    
    const percentage = Math.min((currentValue / targetValue) * 100, 100);
    return {
      completed: percentage >= 100,
      percentage: Math.round(percentage),
      remaining: Math.max(targetValue - currentValue, 0)
    };
  }, [canEarnBadge]);

  // Função para verificar badges baseado no projeto atual
  const checkProjectBadges = useCallback((project: Project) => {
    if (!project) return;

    // Big Idea badge
    if (project.bigIdea && project.bigIdea.trim() && canEarnBadge('primeiro_passo')) {
      grantBadge('primeiro_passo');
    }

    // Essential Question badge
    if (project.essentialQuestion && project.essentialQuestion.trim() && canEarnBadge('questionador')) {
      grantBadge('questionador');
    }

    // Challenge badge
    if (((project.challenge && project.challenge.trim()) || (project.challenges && project.challenges.length > 0)) && canEarnBadge('desafiador')) {
      grantBadge('desafiador');
    }

    // Engage completed badge
    if (project.bigIdea && project.essentialQuestion && 
        ((project.challenge && project.challenge.trim()) || (project.challenges && project.challenges.length > 0)) &&
        canEarnBadge('visionario')) {
      grantBadge('visionario');
    }

    // Investigate badges
    const questionsCount = (project as any).investigate?.guidingQuestions
      ? (project as any).investigate.guidingQuestions.length
      : Array.isArray((project as any).guidingQuestions)
        ? (project as any).guidingQuestions.length
        : Array.isArray((project as any).questions)
          ? (project as any).questions.length
          : 0;
    
    if (questionsCount > 0 && canEarnBadge('investigador_iniciante')) {
      grantBadge('investigador_iniciante');
    }
    
    if (questionsCount >= 3 && canEarnBadge('pesquisador')) {
      grantBadge('pesquisador');
    }
    
    if (questionsCount >= 5 && canEarnBadge('analista')) {
      grantBadge('analista');
    }

    // Resources badges
    const resourcesCount = (project as any).investigate?.resources
      ? (project as any).investigate.resources.length
      : Array.isArray((project as any).guidingResources)
        ? (project as any).guidingResources.length
        : Array.isArray((project as any).resources)
          ? (project as any).resources.length
          : 0;
    
    if (resourcesCount > 0 && canEarnBadge('coletor')) {
      grantBadge('coletor');
    }
    
    if (resourcesCount >= 3 && canEarnBadge('bibliotecario')) {
      grantBadge('bibliotecario');
    }

    // Activities badge
    const activitiesCount = (project as any).investigate?.activities
      ? (project as any).investigate.activities.length
      : Array.isArray((project as any).guidingActivities)
        ? (project as any).guidingActivities.length
        : Array.isArray((project as any).activities)
          ? (project as any).activities.length
          : 0;
    
    if (activitiesCount > 0 && canEarnBadge('planejador')) {
      grantBadge('planejador');
    }

    // Prototypes badges
    const prototypesCount = project.prototypes ? project.prototypes.length : 0;
    
    if (prototypesCount > 0 && canEarnBadge('criador')) {
      grantBadge('criador');
    }
    
    if (prototypesCount >= 3 && canEarnBadge('inovador')) {
      grantBadge('inovador');
    }

    // Act completed badge (considerando estruturas novas e antigas)
    const hasSolution = !!(((project as any).solutionDevelopment && (project as any).solutionDevelopment.trim()) || (project as any).solution?.description);
    const hasImplementation = !!((((project as any).implementationPlan && (project as any).implementationPlan.length > 0)) || (project as any).implementation?.overview);
    if (hasSolution && hasImplementation && prototypesCount > 0 && canEarnBadge('implementador')) {
      grantBadge('implementador');
    }

    // Master CBL badge
    const allPhasesCompleted = !!((project as any).engageCompleted && (project as any).investigateCompleted && (project as any).actCompleted);
    if (allPhasesCompleted && canEarnBadge('mestre_cbl')) {
      grantBadge('mestre_cbl');
    } else if (project.bigIdea && project.essentialQuestion && 
        ((project.challenge && project.challenge.trim()) || (project.challenges && project.challenges.length > 0)) &&
        questionsCount >= 3 && resourcesCount >= 1 && activitiesCount >= 1 &&
        project.solutionDevelopment && project.implementationPlan && 
        project.implementationPlan.length > 0 && canEarnBadge('mestre_cbl')) {
      grantBadge('mestre_cbl');
    }
  }, [canEarnBadge, grantBadge]);

  // Função para verificar triggers específicos
  const checkTrigger = useCallback((trigger: string, data: BadgeTriggerData = {}) => {
    switch (trigger) {
      case 'nudge_obtained':
        if (canEarnBadge('inspirado')) grantBadge('inspirado');
        break;
      case 'investigate_started':
        // Ao iniciar a fase Investigate, conceder badge introdutório
        if (canEarnBadge('investigador_iniciante')) grantBadge('investigador_iniciante');
        break;
      case 'engage_completed':
        // Conceder badge "Visionário" quando Engage completo (também coberto por checkProjectBadges)
        if (canEarnBadge('visionario')) grantBadge('visionario');
        break;
      case 'investigate_completed':
        // Progrediu bem na investigação; conceder "pesquisador" se tiver 3+ respostas
        if (data.questionsAnswered && data.questionsAnswered >= 3 && canEarnBadge('pesquisador')) {
          grantBadge('pesquisador');
        }
        break;
      case 'resources_added':
        if ((data.resourcesCount ?? 0) >= 1 && canEarnBadge('coletor')) {
          grantBadge('coletor');
        }
        break;
      case 'multiple_resources_collected':
        if ((data.resourcesCount ?? 0) >= 3 && canEarnBadge('bibliotecario')) {
          grantBadge('bibliotecario');
        }
        break;
      case 'act_completed':
        if (canEarnBadge('implementador')) grantBadge('implementador');
        break;
      case 'cbl_cycle_completed':
        if (canEarnBadge('mestre_cbl')) grantBadge('mestre_cbl');
        break;
      default:
        break;
    }
  }, [canEarnBadge, grantBadge]);

  // Função para fechar notificação
  const dismissNotification = useCallback(() => {
    setShowNotification(false);
    setTimeout(() => setRecentBadge(null), 300);
  }, []);

  // Função para obter badges por categoria
  const getBadgesByCategory = useCallback(() => {
    const categorized: { [key: string]: { earned: Badge[], unearned: BadgeDefinition[] } } = {
      'CBL': { earned: [], unearned: [] },
      'Especiais': { earned: [], unearned: [] }
    };
    
    BADGE_LIST.forEach(badgeDefinition => {
      const category = badgeDefinition.id === 'inspirado' || badgeDefinition.id === 'mestre_cbl' ? 'Especiais' : 'CBL';
      
      const isEarned = earnedBadgeIds.includes(badgeDefinition.id);
      if (isEarned) {
        const earnedBadge = earnedBadges.find(b => b.id === badgeDefinition.id);
        if (earnedBadge) {
          categorized[category].earned.push(earnedBadge);
        }
      } else {
        categorized[category].unearned.push(badgeDefinition);
      }
    });
    
    return categorized;
  }, [earnedBadgeIds, earnedBadges]);

  // Função para obter próximos badges sugeridos
  const getNextBadgesSuggestions = useCallback(() => {
    const suggestions: { badge: BadgeDefinition, tip: string }[] = [];
    
    const suggestionMap: { [key: string]: string } = {
      'primeiro_passo': 'Escreva sua Big Idea para começar!',
      'questionador': 'Crie sua Essential Question',
      'desafiador': 'Defina seu Challenge',
      'investigador_iniciante': 'Responda sua primeira pergunta-guia',
      'pesquisador': 'Responda 3 perguntas-guia',
      'coletor': 'Adicione recursos de pesquisa',
      'planejador': 'Crie sua primeira atividade',
      'criador': 'Crie seu primeiro protótipo'
    };

    Object.entries(suggestionMap).forEach(([badgeId, tip]) => {
      if (!earnedBadgeIds.includes(badgeId)) {
        const badge = getBadgeById(badgeId);
        if (badge) {
          suggestions.push({ badge, tip });
        }
      }
    });
    
    return suggestions.slice(0, 3);
  }, [earnedBadgeIds]);

  return {
    // Estado
    earnedBadges,
    recentBadge,
    showNotification,
    
    // Estatísticas
    totalXP,
    level,
    xpForNextLevel,
    earnedCount: earnedBadges.length,
    totalCount: BADGE_LIST.length,
    progressPercentage: Math.round((earnedBadges.length / BADGE_LIST.length) * 100),
    
    // Funções principais
    grantBadge,
    checkTrigger,
    checkProjectBadges,
    canEarnBadge,
    getBadgeProgress,
    dismissNotification,
    
    // Funções auxiliares
    getBadgesByCategory,
    getNextBadgesSuggestions,
    
    // Lista de badges disponíveis
    availableBadges: BADGE_LIST
  };
}