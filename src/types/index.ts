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
  xp: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  phase: 'engage' | 'investigate' | 'act';
  progress: number;

  // Completion flags
  engageCompleted?: boolean;
  investigateCompleted?: boolean;
  actCompleted?: boolean;
  
  // Engage Phase
  bigIdea?: string;
  essentialQuestion?: string;
  challenge?: string; // UI single challenge text
  challenges: string[]; // legacy array
  engageChecklist: ChecklistItem[]; // legacy checklist
  engageChecklistItems?: ChecklistItem[]; // UI checklist específica do Engage
  
  // Investigate Phase
  guidingQuestions: GuidingQuestion[]; // legacy typed questions
  answers?: { q: string; a: string }[]; // UI answers
  activities?: Activity[]; // UI alias for guidingActivities
  resources?: Resource[]; // UI alias for guidingResources
  guidingActivities: Activity[]; // legacy
  guidingResources: Resource[]; // legacy
  researchSynthesis?: string; // legacy
  synthesis?: { mainFindings?: string }; // UI synthesis
  investigateChecklistItems?: ChecklistItem[]; // UI checklist específica do Investigate
  
  // Act Phase
  solutionDevelopment?: string; // legacy
  solution?: { description?: string }; // UI solution
  implementationPlan: ImplementationStep[]; // legacy
  implementation?: { overview?: string }; // UI implementation
  evaluationCriteria: EvaluationMetric[]; // legacy
  evaluation?: { objectives?: string }; // UI evaluation
  prototypes: Prototype[];
  actChecklistItems?: ChecklistItem[]; // UI checklist específica do Act
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