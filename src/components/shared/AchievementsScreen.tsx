// components/shared/AchievementsScreen.tsx
import React, { useState } from 'react';
import { Badge } from '@/types';
import { BadgeDefinition } from '@/utils/badgeConstants';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface StatsCardProps {
  icon: string;
  title: string;
  value: string | number;
  valueColor?: string;
  bgColor?: string;
  isActive?: boolean;
}

function StatsCard({ icon, title, value, valueColor = 'hsl(var(--primary))', isActive = false }: StatsCardProps) {
  return (
    <Card className={`p-6 transition-all duration-300 ${
      isActive ? 'ring-2 ring-primary scale-105' : 'hover:shadow-lg'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md bg-background border">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              <div className="text-3xl font-bold" style={{ color: valueColor }}>{value}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface SectionSelectorProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  earnedCount: number;
  availableCount: number;
}

function SectionSelector({ activeSection, setActiveSection, earnedCount, availableCount }: SectionSelectorProps) {
  const sections = [
    { id: 'earned', label: 'Conquistadas', count: earnedCount, color: 'text-green-600' },
    { id: 'available', label: 'Disponíveis', count: availableCount, color: 'text-blue-600' }
  ];

  return (
    <div className="flex rounded-2xl bg-secondary p-2 mb-6 shadow-sm border">
      {sections.map(section => (
        <Button
          key={section.id}
          variant={activeSection === section.id ? "default" : "ghost"}
          onClick={() => setActiveSection(section.id)}
          className="flex-1 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">
            {section.id === 'earned' ? '🏆' : '🎯'}
          </span>
          <div className="flex flex-col items-start">
            <div className="font-semibold">{section.label}</div>
            <div className={`text-xs ${
              activeSection === section.id ? 'text-primary-foreground/80' : section.color
            }`}>
              {section.count} {section.count === 1 ? 'badge' : 'badges'}
            </div>
          </div>
        </Button>
      ))}
    </div>
  );
}

interface BadgeItemProps {
  badge: Badge | BadgeDefinition;
  earned?: boolean;
}

function BadgeItem({ badge, earned = true }: BadgeItemProps) {
  const getBadgeColor = (badgeId: string) => {
    if (badgeId?.includes('visionario')) return 'bg-blue-500';
    if (badgeId?.includes('investigador') || badgeId?.includes('pesquisador')) return 'bg-green-500';
    if (badgeId?.includes('implementador') || badgeId?.includes('criador')) return 'bg-purple-500';
    if (badgeId?.includes('inspirado')) return 'bg-yellow-500';
    if (badgeId?.includes('primeiro_passo')) return 'bg-pink-500';
    if (badgeId?.includes('mestre_cbl')) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-blue-500';
  };

  const badgeTitle = 'name' in badge ? badge.name : badge.title;
  const badgeDesc = 'description' in badge ? badge.description : badge.desc;

  return (
    <Card className={`flex items-center gap-4 p-4 transition-all duration-200 ${
      earned 
        ? 'hover:shadow-md border-border' 
        : 'opacity-60 border-dashed'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ${
        earned ? getBadgeColor(badge.id) : 'bg-muted-foreground'
      }`}>
        {badge.icon || '🏅'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-semibold text-foreground text-base">{badgeTitle}</div>
          {!earned && (
            <BadgeComponent variant="secondary" className="text-xs">
              Não conquistado
            </BadgeComponent>
          )}
        </div>
        <div className="text-sm text-muted-foreground mb-2">{badgeDesc}</div>
        <div className={`text-xs font-medium ${earned ? 'text-green-600' : 'text-muted-foreground'}`}>
          +{badge.xp} XP
        </div>
      </div>
    </Card>
  );
}

interface EmptyStateProps {
  type: 'earned' | 'available';
}

function EmptyState({ type }: EmptyStateProps) {
  const emptyStates = {
    earned: {
      icon: '🎯',
      title: 'Nenhuma conquista ainda',
      description: 'Complete as fases do CBL para ganhar badges e XP!',
      tip: '💡 Próximo passo: Crie um projeto CBL e escreva sua Big Idea!'
    },
    available: {
      icon: '🎉',
      title: 'Parabéns!',
      description: 'Você conquistou todos os badges disponíveis!',
      tip: '🏆 Você é um verdadeiro mestre do CBL!'
    }
  };

  const state = emptyStates[type];

  return (
    <Card className="text-center p-12">
      <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-4xl mx-auto mb-4 border">
        {state.icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{state.title}</h3>
      <p className="text-muted-foreground mb-6">{state.description}</p>
      <div className="text-sm text-muted-foreground bg-secondary p-4 rounded-lg border max-w-md mx-auto">
        <p><strong className="text-foreground">{state.tip}</strong></p>
      </div>
    </Card>
  );
}

interface AchievementsScreenProps {
  earnedBadges: Badge[];
  availableBadges: BadgeDefinition[];
  totalXP: number;
  level: number;
  progressPercentage: number;
}

export default function AchievementsScreen({ 
  earnedBadges, 
  availableBadges, 
  totalXP, 
  level, 
  progressPercentage 
}: AchievementsScreenProps) {
  const [activeSection, setActiveSection] = useState('earned');

  const badgeCount = earnedBadges.length;
  const totalBadges = earnedBadges.length + availableBadges.length;
  const unlockedBadges = availableBadges.filter(badge => 
    !earnedBadges.some(earned => earned.id === badge.id)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">🏆 Conquistas</h2>
        <p className="text-muted-foreground">Acompanhe seu progresso e conquistas no ActiveLearn Hub</p>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          icon="⭐"
          title="Total de XP"
          value={totalXP}
          valueColor="hsl(var(--primary))"
        />
        <StatsCard
          icon="🏅"
          title="Badges"
          value={`${badgeCount}/${totalBadges}`}
          valueColor="hsl(var(--chart-2))"
        />
        <StatsCard
          icon="📊"
          title="Progresso"
          value={`${progressPercentage}%`}
          valueColor="hsl(var(--chart-3))"
        />
      </div>

      {/* Barra de progresso geral */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Progresso Geral</h3>
          <span className="text-sm text-muted-foreground">Nível {level}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {badgeCount} de {totalBadges} badges conquistados
        </p>
      </Card>

      {/* Seletor de seção */}
      <SectionSelector
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        earnedCount={badgeCount}
        availableCount={unlockedBadges.length}
      />

      {/* Lista de badges */}
      <div className="space-y-4">
        {activeSection === 'earned' ? (
          earnedBadges.length > 0 ? (
            earnedBadges.map(badge => (
              <BadgeItem key={badge.id} badge={badge} earned={true} />
            ))
          ) : (
            <EmptyState type="earned" />
          )
        ) : (
          unlockedBadges.length > 0 ? (
            unlockedBadges.map(badge => (
              <BadgeItem key={badge.id} badge={badge} earned={false} />
            ))
          ) : (
            <EmptyState type="available" />
          )
        )}
      </div>
    </div>
  );
}