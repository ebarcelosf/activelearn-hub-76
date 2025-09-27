import React, { useEffect } from 'react';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { toast } from 'sonner';
import { ALL_BADGES } from '@/utils/badgeConstants';

export const BadgeNotificationToast: React.FC = () => {
  const badgeContext = useBadgeContextOptional();

  // Check if notifications are enabled in settings
  const [notificationSettings, setNotificationSettings] = React.useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { showBadgeNotifications: true };
  });

  useEffect(() => {
    const settings = localStorage.getItem('notificationSettings');
    if (settings) {
      setNotificationSettings(JSON.parse(settings));
    }
  }, []);

  useEffect(() => {
    if (badgeContext?.showNotification && badgeContext?.recentBadge && notificationSettings.showBadgeNotifications) {
      const badge = ALL_BADGES[badgeContext.recentBadge];
      
      if (badge) {
        toast.success(`🏆 Badge conquistado: ${badge.title}!`, {
          description: `${badge.desc} (+${badge.xp} XP)`,
          duration: 5000,
        });
        
        badgeContext.dismissNotification();
      }
    } else if (badgeContext?.showNotification && !notificationSettings.showBadgeNotifications) {
      // Still dismiss the notification even if not showing
      badgeContext.dismissNotification();
    }
  }, [badgeContext?.showNotification, badgeContext?.recentBadge, badgeContext, notificationSettings.showBadgeNotifications]);

  return null;
};