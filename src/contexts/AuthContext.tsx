import * as React from 'react';
import { AuthUser, AuthContextType, LoginCredentials, RegisterCredentials, UpdatePasswordData, AuthUserSettings } from '@/types/auth';
import { 
  loginUser, 
  registerUser, 
  getSession, 
  clearSession, 
  getUserById, 
  saveUser, 
  verifyPassword, 
  hashPassword,
  clearUserData,
  getUserDataKey
} from '@/utils/auth';
import { useTheme } from '@/components/ui/theme-provider';

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { setTheme } = useTheme();

  // Initialize auth state from session
  React.useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const session = getSession();
        if (session) {
          const sessionUser = getUserById(session.userId);
          if (sessionUser) {
            setUser(sessionUser);
            
            // Apply user's theme preference
            setTheme(sessionUser.settings.theme);
          } else {
            // Session exists but user not found, clear session
            clearSession();
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setTheme]);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = loginUser(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        setTheme(result.user.settings.theme);
        return true;
      } else {
        setError(result.error || 'Erro no login');
        return false;
      }
    } catch (err) {
      setError('Erro interno do sistema');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = registerUser(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
        setTheme(result.user.settings.theme);
        return true;
      } else {
        setError(result.error || 'Erro no cadastro');
        return false;
      }
    } catch (err) {
      setError('Erro interno do sistema');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    setUser(null);
    setError(null);
  };

  const updateProfile = async (updates: { name?: string }): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const updatedUser = { ...user, ...updates };
      saveUser(updatedUser);
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError('Erro ao atualizar perfil');
      return false;
    }
  };

  const updatePassword = async (data: UpdatePasswordData): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Verify current password
      if (!verifyPassword(data.currentPassword, user.hashedPassword)) {
        setError('Senha atual incorreta');
        return false;
      }
      
      // Validate new password
      if (data.newPassword !== data.confirmPassword) {
        setError('Senhas não coincidem');
        return false;
      }
      
      // Update password
      const updatedUser = {
        ...user,
        hashedPassword: hashPassword(data.newPassword)
      };
      
      saveUser(updatedUser);
      setUser(updatedUser);
      return true;
    } catch (err) {
      setError('Erro ao alterar senha');
      return false;
    }
  };

  const updateSettings = async (newSettings: Partial<AuthUserSettings>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const updatedUser = {
        ...user,
        settings: { ...user.settings, ...newSettings }
      };
      
      saveUser(updatedUser);
      setUser(updatedUser);
      
      // Apply theme immediately if changed
      if (newSettings.theme) {
        setTheme(newSettings.theme);
      }
      
      return true;
    } catch (err) {
      setError('Erro ao atualizar configurações');
      return false;
    }
  };

  const deleteAccount = async (password: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Verify password before deletion
      if (!verifyPassword(password, user.hashedPassword)) {
        setError('Senha incorreta');
        return false;
      }
      
      // Clear all user data
      clearUserData(user.id);
      
      // Clear auth state
      setUser(null);
      setError(null);
      
      return true;
    } catch (err) {
      setError('Erro ao excluir conta');
      return false;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    updateSettings,
    deleteAccount,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};