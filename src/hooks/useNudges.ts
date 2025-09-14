// hooks/useNudges.ts - Versão simplificada
import { useState, useCallback } from 'react';
import { NudgeItem, getRandomNudges } from '@/utils/nudgeConstants';
import { useBadgeContext } from '@/contexts/BadgeContext';

type Phase = 'Engage' | 'Investigate' | 'Act';

export function useNudges() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNudges, setCurrentNudges] = useState<NudgeItem[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<Phase>('Engage');
  const { checkTrigger } = useBadgeContext();

  const openNudgeModal = useCallback((phase: Phase, category: string, count: number = 3) => {
    const nudges = getRandomNudges(phase, category, count);
    if (nudges.length > 0) {
      setCurrentNudges(nudges);
      setCurrentCategory(category);
      setCurrentPhase(phase);
      setIsModalOpen(true);
      
      // Trigger badge de nudge obtido
      checkTrigger('nudge_obtained');
      
      // Alert temporário até o modal estar funcionando
      alert(`Nudge para ${category} em ${phase}: ${nudges[0].title}\n\n${nudges[0].detail}`);
    }
  }, [checkTrigger]);

  const refreshNudges = useCallback(() => {
    const nudges = getRandomNudges(currentPhase, currentCategory, 3);
    setCurrentNudges(nudges);
  }, [currentPhase, currentCategory]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentNudges([]);
    setCurrentCategory('');
  }, []);

  return {
    isModalOpen,
    currentNudges,
    currentCategory,
    currentPhase,
    openNudgeModal,
    refreshNudges,
    closeModal
  };
}