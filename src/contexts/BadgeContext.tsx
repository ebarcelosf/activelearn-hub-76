import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useBadges } from '@/hooks/useBadges';
import { BADGE_LIST } from '@/utils/badgeConstants';

interface BadgeContextType {
  earnedBadges: any[];
  recentBadge: string | null;
  showNotification: boolean;
  totalXP: number;
  level: number;
  xpForNextLevel: number;
  progressPercentage: number;
  grantBadge: (badgeId: string) => void;
  canEarnBadge: (badgeId: string) => boolean;
  getBadgesByCategory: () => any;
  checkTrigger: (trigger: string, data?: any) => void;
  dismissNotification: () => void;
  availableBadges: any[];
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadgeContext must be used within a BadgeProvider');
  }
  return context;
};

export const useBadgeContextOptional = () => {
  return useContext(BadgeContext);
};

interface BadgeProviderProps {
  children: ReactNode;
}

export const BadgeProvider: React.FC<BadgeProviderProps> = ({ children }) => {
  const [recentBadge, setRecentBadge] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  
  const { earnedBadges: rawEarnedBadges, grantBadge: grantBadgeHook, canEarnBadge, getBadgesByCategory, totalXP, level, xpForNextLevel } = useBadges();

  // Transform earned badges for compatibility  
  const earnedBadges = rawEarnedBadges.map(badge => ({
    id: badge.badge_id,
    ...BADGE_LIST.find(b => b.id === badge.badge_id)
  }));
  
  const availableBadges = BADGE_LIST;

  const grantBadge = (badgeId: string) => {
    if (canEarnBadge(badgeId)) {
      grantBadgeHook(badgeId);
      setRecentBadge(badgeId);
      setShowNotification(true);
    }
  };

  const checkTrigger = (trigger: string, data?: any) => {
    console.log('Badge trigger:', trigger, data);
    
    // Check which badges should be granted based on the trigger
    const badgesToCheck = BADGE_LIST.filter(badge => badge.trigger === trigger);
    
    badgesToCheck.forEach(badge => {
      if (canEarnBadge(badge.id)) {
        grantBadge(badge.id);
      }
    });
  };

  const dismissNotification = () => {
    setShowNotification(false);
    setRecentBadge(null);
  };

  const progressPercentage = Math.round(((totalXP % 1000) / 1000) * 100); // Progress to next level

  const value: BadgeContextType = {
    earnedBadges,
    recentBadge,
    showNotification,
    totalXP,
    level,
    xpForNextLevel,
    progressPercentage,
    grantBadge,
    canEarnBadge,
    getBadgesByCategory,
    checkTrigger,
    dismissNotification,
    availableBadges,
  };

  return (
    <BadgeContext.Provider value={value}>
      {children}
    </BadgeContext.Provider>
  );
};