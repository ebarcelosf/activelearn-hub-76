import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SettingsState {
  showBadgeNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
}

const defaultSettings: SettingsState = {
  showBadgeNotifications: true,
  theme: 'system'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<SettingsState>('cbl_settings', defaultSettings);

  const updateSettings = (updates: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};