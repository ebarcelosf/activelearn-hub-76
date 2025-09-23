import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useBadges } from '@/hooks/useBadges';
import { Badge, Project } from '@/types';
import { useAuth } from './AuthContext';
import { getUserDataKey } from '@/utils/auth';

const BadgeContext = createContext<ReturnType<typeof useBadges> | undefined>(undefined);

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
  const storageKey = user ? getUserDataKey(user.id, 'badges') : 'earned_badges_temp';
  const [earnedBadges, setEarnedBadges] = useLocalStorage<Badge[]>(storageKey, []);
  const badgeState = useBadges();

  // Reset badges when user changes
  React.useEffect(() => {
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

  return (
    <BadgeContext.Provider value={badgeState}>
      {children}
    </BadgeContext.Provider>
  );
};