import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NUDGE_CATEGORIES } from '@/utils/nudges';

interface PhaseSidebarProps {
  phase: string;
  setPhase: (phase: string) => void;
  project: any;
}

export const PhaseSidebar: React.FC<PhaseSidebarProps> = ({ phase, setPhase, project }) => {
  const phases = [
    { id: 'engage', label: 'Engage', color: 'hsl(var(--primary))' },
    { id: 'investigate', label: 'Investigate', color: 'hsl(var(--secondary))' },
    { id: 'act', label: 'Act', color: 'hsl(var(--accent))' }
  ];

  return (
    <aside className="w-72 p-6 rounded-xl bg-card border shadow-sm">
      <h4 className="font-semibold text-foreground text-lg mb-6">Fases CBL</h4>
      <div className="flex flex-col gap-4">
        {phases.map(p => (
          <button 
            key={p.id} 
            onClick={() => setPhase(p.id)} 
            className={`text-left px-4 py-4 rounded-xl flex items-center justify-between transition-all duration-200 ${
              phase === p.id 
                ? 'ring-2 ring-primary bg-muted shadow-md' 
                : 'hover:bg-muted hover:shadow-sm border'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg shadow-sm" style={{ backgroundColor: p.color }} />
              <div className="text-foreground font-medium">{p.label}</div>
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
};

interface NudgeModalProps {
  visible: boolean;
  phase: string;
  project: any;
  onClose: () => void;
  grantBadge?: (badge: any) => void;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({ visible, phase, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);

  const availableCategories = Object.keys(NUDGE_CATEGORIES[phase as keyof typeof NUDGE_CATEGORIES] || {});
  const currentNudges = selectedCategory ? (NUDGE_CATEGORIES[phase as keyof typeof NUDGE_CATEGORIES]?.[selectedCategory] || []) : [];

  useEffect(() => {
    if (visible) {
      setSelectedCategory(null);
      setCurrentNudgeIndex(0);
    }
  }, [visible, phase]);

  if (!visible) return null;

  const currentNudge = currentNudges[currentNudgeIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.98, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="bg-card p-6 rounded-xl w-full max-w-2xl shadow-lg border"
        >
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg bg-primary">
              {phase[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground">Nudges — {phase}</h4>
              <p className="text-muted-foreground mt-1">Selecione uma categoria para ver sugestões específicas</p>

              {!selectedCategory ? (
                <div className="mt-6 space-y-3">
                  <p className="text-sm font-medium text-foreground mb-4">Escolha o tipo de nudge:</p>
                  {availableCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className="w-full p-4 text-left rounded-lg bg-muted border hover:border-primary hover:shadow-md transition-all duration-200"
                    >
                      <div className="font-medium text-foreground">{category}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-sm text-primary hover:underline"
                    >
                      ← Voltar para categorias
                    </button>
                    <div className="text-sm text-muted-foreground">
                      {selectedCategory} • {currentNudgeIndex + 1} de {currentNudges.length}
                    </div>
                  </div>

                  {currentNudge && (
                    <div className="p-4 rounded-lg bg-muted border">
                      <div className="font-medium text-foreground mb-2">{currentNudge.title}</div>
                      <div className="text-muted-foreground">{currentNudge.detail}</div>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setCurrentNudgeIndex(i => Math.max(0, i - 1))} 
                        disabled={currentNudgeIndex === 0} 
                        variant="outline"
                      >
                        ← Anterior
                      </Button>
                      <Button 
                        onClick={() => setCurrentNudgeIndex(i => Math.min(currentNudges.length - 1, i + 1))} 
                        disabled={currentNudgeIndex === currentNudges.length - 1}
                      >
                        Próximo →
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={onClose}>
                  ✕ Fechar
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};