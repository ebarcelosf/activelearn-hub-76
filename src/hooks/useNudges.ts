// hooks/useNudges.ts
import { useState, useCallback } from 'react';
import { useBadgeContext } from '@/contexts/BadgeContext';

type Phase = 'Engage' | 'Investigate' | 'Act';

export function useNudges() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<Phase>('Engage');
  const { checkTrigger } = useBadgeContext();

  const openNudgeModal = useCallback((phase: Phase, category: string) => {
    console.log('Opening nudge modal for:', phase, category);
    setCurrentCategory(category);
    setCurrentPhase(phase);
    setIsModalOpen(true);
    
    // Trigger badge de nudge obtido
    checkTrigger('nudge_obtained');
  }, [checkTrigger]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentCategory('');
  }, []);

  return {
    isModalOpen,
    currentCategory,
    currentPhase,
    openNudgeModal,
    closeModal
  };
}