import React, { useEffect } from 'react';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';
import { toast } from 'sonner';
import { ALL_BADGES } from '@/utils/badgeConstants';

export const BadgeNotificationToast: React.FC = () => {
  const badgeContext = useBadgeContextOptional();

  // Check if notifications are enabled in settings
  const [notificationSettings, setNotificationSettings] = React.useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { showBadgeNotifications: true, showAllNotifications: true };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const settings = localStorage.getItem('notificationSettings');
      if (settings) {
        setNotificationSettings(JSON.parse(settings));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange(); // Initial load
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (badgeContext?.showNotification && badgeContext?.recentBadge && notificationSettings.showBadgeNotifications && notificationSettings.showAllNotifications) {
      const badge = ALL_BADGES[badgeContext.recentBadge];
      
      if (badge) {
        toast.success(`🏆 Badge conquistado: ${badge.title}!`, {
          description: `${badge.desc} (+${badge.xp} XP)`,
          duration: 5000,
        });
        
        badgeContext.dismissNotification();
      }
    } else if (badgeContext?.showNotification) {
      // Still dismiss the notification even if not showing
      badgeContext.dismissNotification();
    }
  }, [badgeContext?.showNotification, badgeContext?.recentBadge, badgeContext, notificationSettings.showBadgeNotifications, notificationSettings.showAllNotifications]);

  return null;
};