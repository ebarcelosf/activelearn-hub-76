import { useEffect, useState } from 'react';

interface NotificationSettings {
  showAllNotifications: boolean;
  showBadgeNotifications: boolean;
}

export const useNotifications = () => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : { showAllNotifications: true, showBadgeNotifications: true };
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('notificationSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const canShowNotification = (type: 'badge' | 'general' = 'general'): boolean => {
    if (!settings.showAllNotifications) return false;
    if (type === 'badge') return settings.showBadgeNotifications;
    return true;
  };

  return {
    settings,
    canShowNotification
  };
};