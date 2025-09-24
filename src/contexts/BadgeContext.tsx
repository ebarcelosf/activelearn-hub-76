import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Badge, Project } from '@/types';
import { useAuth } from './AuthContext';
import { getUserDataKey } from '@/utils/auth';
import { useSettings } from './SettingsContext';
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

interface BadgeContextType {
  // Estado
  earnedBadges: Badge[];
  recentBadge: Badge | null;
  showNotification: boolean;
  
  // Estatísticas
  totalXP: number;
  level: number;
  xpForNextLevel: number;
  earnedCount: number;
  totalCount: number;
  progressPercentage: number;
  
  // Funções principais
  grantBadge: (badgeId: string) => void;
  checkTrigger: (trigger: string, data?: BadgeTriggerData) => void;
  checkProjectBadges: (project: Project) => void;
  canEarnBadge: (badgeId: string) => boolean;
  getBadgeProgress: (badgeId: string, currentValue: number, targetValue: number) => BadgeProgress;
  dismissNotification: () => void;
  
  // Funções auxiliares
  getBadgesByCategory: () => { [key: string]: { earned: Badge[], unearned: BadgeDefinition[] } };
  getNextBadgesSuggestions: () => { badge: BadgeDefinition, tip: string }[];
  
  // Lista de badges disponíveis
  availableBadges: BadgeDefinition[];
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadgeContext must be used within a BadgeProvider');
  }
  return context;
};

// Safe optional access (returns undefined instead of throwing)
export const useBadgeContextOptional = () => {
  return useContext(BadgeContext);
};

interface BadgeProviderProps {
  children: ReactNode;
}

export const BadgeProvider: React.FC<BadgeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const storageKey = user ? getUserDataKey(user.id, 'badges') : 'earned_badges_temp';
  const [earnedBadges, setEarnedBadges] = useLocalStorage<Badge[]>(storageKey, []);
  const [recentBadge, setRecentBadge] = useState<Badge | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Reset badges when user changes
  useEffect(() => {
    if (user) {
      const userBadges = localStorage.getItem(getUserDataKey(user.id, 'badges'));
      if (userBadges) {
        setEarnedBadges(JSON.parse(userBadges));
      } else {
        setEarnedBadges([]);
      }
    } else {
      setEarnedBadges([]);
    }
  }, [user, setEarnedBadges]);

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
    
    // Só exibir notificação se as configurações permitirem
    if (settings.showBadgeNotifications) {
      setShowNotification(true);
      // Auto-hide notification após 4 segundos
      setTimeout(() => setShowNotification(false), 4000);
    }

    console.log(`Badge conquistado: ${newBadge.name} (+${newBadge.xp} XP)`);
  }, [earnedBadgeIds, setEarnedBadges, settings.showBadgeNotifications]);

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

    // Engage completed badge
    if (project.bigIdea && project.essentialQuestion && project.challenge && project.challenge.trim() &&
        canEarnBadge('visionario')) {
      grantBadge('visionario');
    }

    // Investigate badges - answered questions
    const answeredCount = project.answers ? project.answers.filter(a => a && a.a && a.a.trim()).length : 0;
    
    if (answeredCount > 0 && canEarnBadge('investigador_iniciante')) {
      grantBadge('investigador_iniciante');
    }
    
    if (answeredCount >= 3 && canEarnBadge('pesquisador')) {
      grantBadge('pesquisador');
    }

    // Resources badges
    const resourcesCount = project.resources ? project.resources.length : 0;
    
    if (resourcesCount > 0 && canEarnBadge('coletor')) {
      grantBadge('coletor');
    }

    // Act completed badge
    const hasSolution = !!(project.solution?.description && project.solution.description.trim());
    const hasImplementation = !!(project.implementation?.overview && project.implementation.overview.trim());
    const prototypesCount = project.prototypes ? project.prototypes.length : 0;
    if (hasSolution && hasImplementation && prototypesCount > 0 && canEarnBadge('implementador')) {
      grantBadge('implementador');
    }
  }, [canEarnBadge, grantBadge]);

  // Função para verificar triggers específicos
  const checkTrigger = useCallback((trigger: string, data: BadgeTriggerData = {}) => {
    switch (trigger) {
      case 'big_idea_created':
        if (canEarnBadge('primeiro_passo')) grantBadge('primeiro_passo');
        break;
      case 'essential_question_created':
        if (canEarnBadge('questionador')) grantBadge('questionador');
        break;
      case 'challenge_defined':
        if (canEarnBadge('desafiador')) grantBadge('desafiador');
        break;
      case 'investigate_started':
        if (canEarnBadge('investigador')) grantBadge('investigador');
        break;
      case 'questions_answered_5':
        if (data.questionsAnswered && data.questionsAnswered >= 5 && canEarnBadge('analista')) {
          grantBadge('analista');
        }
        break;
      case 'multiple_resources_collected':
        if (data.resourcesCount && data.resourcesCount >= 3 && canEarnBadge('bibliotecario')) {
          grantBadge('bibliotecario');
        }
        break;
      case 'activity_created':
        if (canEarnBadge('planejador')) grantBadge('planejador');
        break;
      case 'prototype_created':
        if (canEarnBadge('criador')) grantBadge('criador');
        break;
      case 'multiple_prototypes_created':
        if (data.prototypesCount && data.prototypesCount >= 3 && canEarnBadge('inovador')) {
          grantBadge('inovador');
        }
        break;
      case 'cbl_cycle_completed':
        if (canEarnBadge('mestre_cbl')) grantBadge('mestre_cbl');
        break;
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
      case 'act_completed':
        if (canEarnBadge('implementador')) grantBadge('implementador');
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

  const contextValue: BadgeContextType = {
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

  return (
    <BadgeContext.Provider value={contextValue}>
      {children}
    </BadgeContext.Provider>
  );
};