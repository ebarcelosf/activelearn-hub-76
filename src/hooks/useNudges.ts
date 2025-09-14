// hooks/useNudges.ts
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
    console.log('Opening nudge modal for:', phase, category);
    const nudges = getRandomNudges(phase, category, count);
    console.log('Retrieved nudges:', nudges);
    
    if (nudges.length > 0) {
      setCurrentNudges(nudges);
      setCurrentCategory(category);
      setCurrentPhase(phase);
      setIsModalOpen(true);
      
      // Trigger badge de nudge obtido
      checkTrigger('nudge_obtained');
    } else {
      console.warn('No nudges found for:', phase, category);
      alert(`Nenhum nudge encontrado para ${category} na fase ${phase}`);
    }
  }, [checkTrigger]);

  const refreshNudges = useCallback(() => {
    console.log('Refreshing nudges for:', currentPhase, currentCategory);
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