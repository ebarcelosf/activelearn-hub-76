import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  phase: 'engage' | 'investigate' | 'act';
  engage_completed: boolean;
  investigate_completed: boolean;
  act_completed: boolean;
  big_idea?: string;
  essential_question?: string;
  challenge?: string;
  synthesis?: any;
  solution?: any;
  implementation?: any;
  evaluation?: any;
  created_at: string;
  updated_at: string;
  lastModified: string; // For compatibility
  
  // Legacy compatibility fields
  bigIdea?: string;
  essentialQuestion?: string;
  answers?: any[];
  activities?: any[];
  prototypes?: any[];
  progress?: number;
  createdAt: string;
  updatedAt: string;
}

export const useProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform for compatibility
      return data.map(project => ({
        ...project,
        phase: project.phase as 'engage' | 'investigate' | 'act',
        lastModified: project.updated_at,
        bigIdea: project.big_idea,
        essentialQuestion: project.essential_question,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        answers: [],
        activities: [],
        prototypes: [],
        progress: 0
      }));
    },
    enabled: !!user,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title,
          description,
          phase: 'engage',
        })
        .select()
        .single();

      if (error) throw error;
      return { 
        ...data, 
        phase: data.phase as 'engage' | 'investigate' | 'act',
        lastModified: data.updated_at,
        bigIdea: data.big_idea,
        essentialQuestion: data.essential_question,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        answers: [],
        activities: [],
        prototypes: [],
        progress: 0
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar projeto');
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, updates }: { projectId: string; updates: Partial<Project> }) => {
      // Map legacy field names to database field names
      const dbUpdates: any = { ...updates };
      
      // Map legacy fields to database fields
      if ('bigIdea' in updates) {
        dbUpdates.big_idea = updates.bigIdea as any;
        delete dbUpdates.bigIdea;
      }
      if ('essentialQuestion' in updates) {
        dbUpdates.essential_question = updates.essentialQuestion as any;
        delete dbUpdates.essentialQuestion;
      }
      if ('engageCompleted' in updates) {
        (dbUpdates as any).engage_completed = (updates as any).engageCompleted;
        delete (dbUpdates as any).engageCompleted;
      }
      if ('investigateCompleted' in updates) {
        (dbUpdates as any).investigate_completed = (updates as any).investigateCompleted;
        delete (dbUpdates as any).investigateCompleted;
      }
      if ('actCompleted' in updates) {
        (dbUpdates as any).act_completed = (updates as any).actCompleted;
        delete (dbUpdates as any).actCompleted;
      }
      
      // Remove legacy compatibility fields that don't exist in database
      delete dbUpdates.lastModified;
      delete dbUpdates.createdAt;
      delete dbUpdates.updatedAt;
      delete dbUpdates.answers;
      delete dbUpdates.activities;
      delete dbUpdates.resources;
      delete dbUpdates.prototypes;
      delete dbUpdates.progress;
      delete dbUpdates.engageChecklistItems;
      delete dbUpdates.investigateChecklistItems;
      delete dbUpdates.actChecklistItems;

      const { error } = await supabase
        .from('projects')
        .update(dbUpdates)
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: () => {
      toast.error('Erro ao atualizar projeto');
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir projeto');
    },
  });

  // Helper functions
  const createProject = (title: string, description: string) => {
    return createProjectMutation.mutateAsync({ title, description });
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    updateProjectMutation.mutate({ projectId, updates });
  };

  const deleteProject = (projectId: string) => {
    deleteProjectMutation.mutate(projectId);
  };

  const duplicateProject = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const result = await createProjectMutation.mutateAsync({
      title: `${project.title} (Cópia)`,
      description: project.description,
    });
    return result;
  };

  const getProjectProgress = (project: Project): number => {
    let totalFields = 0;
    let completedFields = 0;

    // Check engage phase
    if (project.big_idea) completedFields++;
    if (project.essential_question) completedFields++;
    totalFields += 2;

    // Check investigate phase
    if (project.synthesis) completedFields++;
    totalFields += 1;

    // Check act phase
    if (project.solution) completedFields++;
    if (project.implementation) completedFields++;
    if (project.evaluation) completedFields++;
    totalFields += 3;

    return Math.round((completedFields / totalFields) * 100);
  };

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    getProjectProgress,
  };
};