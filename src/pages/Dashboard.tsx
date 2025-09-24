import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Trophy, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProjectCard } from '@/components/common/ProjectCard';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBadgeContextOptional } from '@/contexts/BadgeContext';

export const Dashboard: React.FC = () => {
  const { projects, createProject } = useProjects();
  const { user } = useAuth();
  const badgeContext = useBadgeContextOptional();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.title.trim()) {
      createProject(newProject.title, newProject.description);
      setNewProject({ title: '', description: '' });
      setIsCreateDialogOpen(false);
    }
  };

  // Calculate real-time project metrics
  const activeProjects = projects.filter(p => p.progress < 100);
  const lastModifiedProject = projects.length > 0 
    ? projects.reduce((latest, current) => 
        current.lastModified > latest.lastModified ? current : latest
      )
    : null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-2">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-xl text-muted-foreground">
          Pronto para continuar sua jornada de aprendizagem?
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="interactive-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Modificação</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastModifiedProject ? (
              <>
                <div className="text-2xl font-bold mb-1">{lastModifiedProject.title}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(lastModifiedProject.lastModified).toLocaleDateString('pt-BR')}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Nenhum projeto</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="interactive-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeProjects.length > 0 ? 'Em andamento' : 'Nenhum projeto ativo'}
            </p>
          </CardContent>
        </Card>

        <Card className="interactive-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Experiência (XP)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badgeContext?.totalXP ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Nível {badgeContext?.level ?? 1}
            </p>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};