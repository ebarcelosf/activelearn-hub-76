// hooks/useBadges.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Badge } from '@/types';
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

export function useBadges() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Carregar badges salvos no localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('cbl_badges');
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
  }, []);

  // Salvar badges no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem('cbl_badges', JSON.stringify(earnedBadges));
  }, [earnedBadges]);

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

  // Função para verificar triggers específicos
  const checkTrigger = useCallback((trigger: string, data: BadgeTriggerData = {}) => {
    const badgesToCheck: { [key: string]: () => boolean } = {
      'big_idea_created': () => canEarnBadge('primeiro_passo'),
      'essential_question_created': () => canEarnBadge('questionador'),
      'challenge_defined': () => canEarnBadge('desafiador'),
      'engage_completed': () => canEarnBadge('visionario'),
      'investigate_started': () => canEarnBadge('investigador_iniciante'),
      'first_question_answered': () => canEarnBadge('investigador_iniciante'),
      'questions_answered_3': () => canEarnBadge('pesquisador') && (data.questionsAnswered || 0) >= 3,
      'questions_answered_5': () => canEarnBadge('analista') && (data.questionsAnswered || 0) >= 5,
      'resources_added': () => canEarnBadge('coletor'),
      'multiple_resources_collected': () => canEarnBadge('bibliotecario') && (data.resourcesCount || 0) >= 3,
      'activity_created': () => canEarnBadge('planejador'),
      'prototype_created': () => canEarnBadge('criador'),
      'multiple_prototypes_created': () => canEarnBadge('inovador') && (data.prototypesCount || 0) >= 3,
      'act_completed': () => canEarnBadge('implementador'),
      'nudge_obtained': () => canEarnBadge('inspirado'),
      'cbl_cycle_completed': () => canEarnBadge('mestre_cbl')
    };

    Object.entries(badgesToCheck).forEach(([triggerName, shouldGrant]) => {
      if (trigger === triggerName && shouldGrant()) {
        const badgeId = {
          'big_idea_created': 'primeiro_passo',
          'essential_question_created': 'questionador',
          'challenge_defined': 'desafiador',
          'engage_completed': 'visionario',
          'investigate_started': 'investigador_iniciante',
          'first_question_answered': 'investigador_iniciante',
          'questions_answered_3': 'pesquisador',
          'questions_answered_5': 'analista',
          'resources_added': 'coletor',
          'multiple_resources_collected': 'bibliotecario',
          'activity_created': 'planejador',
          'prototype_created': 'criador',
          'multiple_prototypes_created': 'inovador',
          'act_completed': 'implementador',
          'nudge_obtained': 'inspirado',
          'cbl_cycle_completed': 'mestre_cbl'
        }[triggerName];

        if (badgeId) {
          grantBadge(badgeId);
        }
      }
    });
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