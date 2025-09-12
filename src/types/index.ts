// ActiveLearn Hub Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: Badge[];
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'engage' | 'investigate' | 'act' | 'milestone';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  phase: 'engage' | 'investigate' | 'act';
  progress: number;
  
  // Engage Phase
  bigIdea?: string;
  essentialQuestion?: string;
  challenges: string[];
  engageChecklist: ChecklistItem[];
  
  // Investigate Phase
  guidingQuestions: GuidingQuestion[];
  guidingActivities: Activity[];
  guidingResources: Resource[];
  researchSynthesis?: string;
  
  // Act Phase
  solutionDevelopment?: string;
  implementationPlan: ImplementationStep[];
  evaluationCriteria: EvaluationMetric[];
  prototypes: Prototype[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface GuidingQuestion {
  id: string;
  question: string;
  answer?: string;
  importance: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'interview' | 'survey' | 'observation' | 'research' | 'experiment' | 'other';
  status: 'planned' | 'in-progress' | 'completed';
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'article' | 'video' | 'book' | 'website' | 'document' | 'other';
  credibility: 'high' | 'medium' | 'low';
  notes?: string;
  tags: string[];
  createdAt: Date;
}

export interface ImplementationStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  responsible?: string;
  dependencies: string[];
  status: 'not-started' | 'in-progress' | 'completed';
  createdAt: Date;
}

export interface EvaluationMetric {
  id: string;
  name: string;
  description: string;
  type: 'quantitative' | 'qualitative';
  target?: string;
  method: string;
  createdAt: Date;
}

export interface Prototype {
  id: string;
  title: string;
  description: string;
  fidelity: 'low' | 'medium' | 'high';
  testResults?: string;
  nextSteps?: string;
  files: string[];
  createdAt: Date;
}

export interface Nudge {
  id: string;
  category: string;
  phase: 'engage' | 'investigate' | 'act';
  title: string;
  content: string;
  tips: string[];
}