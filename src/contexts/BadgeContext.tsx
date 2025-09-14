// contexts/BadgeContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useBadges } from '@/hooks/useBadges';
import { BadgeNotification } from '@/components/shared/BadgeNotification';

const BadgeContext = createContext<ReturnType<typeof useBadges> | undefined>(undefined);

export const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadgeContext must be used within a BadgeProvider');
  }
  return context;
};

interface BadgeProviderProps {
  children: ReactNode;
}

export const BadgeProvider: React.FC<BadgeProviderProps> = ({ children }) => {
  const badgeState = useBadges();

  return (
    <BadgeContext.Provider value={badgeState}>
      {children}
      {badgeState.recentBadge && (
        <BadgeNotification
          badge={badgeState.recentBadge}
          show={badgeState.showNotification}
          onDismiss={badgeState.dismissNotification}
        />
      )}
    </BadgeContext.Provider>
  );
};