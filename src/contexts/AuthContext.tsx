import * as React from 'react';
import { User } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  isLoading: boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const defaultUser: User = {
  id: '1',
  name: 'João Silva',
  email: 'joao@example.com',
  xp: 750,
  level: 3,
  badges: [],
  settings: {
    theme: 'dark',
    notifications: true,
    language: 'pt-BR'
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>('activelearn_user', null);
  const [isLoading, setIsLoading] = React.useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, validate with backend
    if (email && password) {
      setUser(defaultUser);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      ...defaultUser,
      id: Date.now().toString(),
      name,
      email,
      xp: 0,
      level: 1
    };
    
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      // Atualizar XP e level no badge context se houver mudanças
      setUser(updatedUser);
    }
  };

  const deleteAccount = () => {
    setUser(null);
    // Clear all local storage data related to the user
    localStorage.removeItem('activelearn_user');
    localStorage.removeItem('activelearn_projects');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      deleteAccount,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};