import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  xp: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile from profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: session.user.email!,
              avatar_url: profile.avatar_url,
              xp: profile.xp,
              level: profile.level,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            });
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setError(error.message);
        return false;
      }

      return true;
    } catch (err) {
      setError('Erro inesperado durante o login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      if (credentials.password !== credentials.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: credentials.name,
          }
        }
      });

      if (error) {
        setError(error.message);
        return false;
      }

      toast.success('Conta criada com sucesso! Verifique seu email.');
      return true;
    } catch (err) {
      setError('Erro inesperado durante o registro');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: { name?: string }): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        setError(error.message);
        return false;
      }

      setUser(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      setError('Erro ao atualizar perfil');
      return false;
    }
  };

  const updatePassword = async (data: UpdatePasswordData): Promise<boolean> => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        setError('As senhas não coincidem');
        return false;
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        setError(error.message);
        return false;
      }

      return true;
    } catch (err) {
      setError('Erro ao atualizar senha');
      return false;
    }
  };

  const deleteAccount = async (password: string): Promise<boolean> => {
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password,
      });

      if (signInError) {
        setError('Senha incorreta');
        return false;
      }

      // Delete user profile (cascades to related data)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user?.id);

      if (deleteError) {
        setError('Erro ao deletar conta');
        return false;
      }

      await logout();
      return true;
    } catch (err) {
      setError('Erro ao deletar conta');
      return false;
    }
  };

  const updateSettings = async (settings: any): Promise<boolean> => {
    // For now, just return true as settings are handled by theme provider
    return true;
  };

  const clearError = () => setError(null);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    deleteAccount,
    updateSettings,
    clearError
  };
};