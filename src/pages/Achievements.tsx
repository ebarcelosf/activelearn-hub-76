// pages/Achievements.tsx
import React from 'react';
import { useBadgeContext } from '@/contexts/BadgeContext';
import AchievementsScreen from '@/components/shared/AchievementsScreen';

export const Achievements: React.FC = () => {
  const {
    earnedBadges,
    availableBadges,
    totalXP,
    level,
    progressPercentage
  } = useBadgeContext();

  const unlockedBadges = availableBadges.filter(badge => 
    !earnedBadges.some(earned => earned.id === badge.id)
  );

  return (
    <AchievementsScreen
      earnedBadges={earnedBadges}
      availableBadges={unlockedBadges}
      totalXP={totalXP}
      level={level}
      progressPercentage={progressPercentage}
    />
  );
};