export interface AuthUser {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  avatar?: string;
  xp: number;
  level: number;
  badges: string[]; // badge IDs
  settings: AuthUserSettings;
  createdAt: Date;
  lastLogin: Date;
}

export interface AuthUserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  language: string;
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

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: { name?: string }) => Promise<boolean>;
  updatePassword: (data: UpdatePasswordData) => Promise<boolean>;
  updateSettings: (settings: Partial<AuthUserSettings>) => Promise<boolean>;
  deleteAccount: (password: string) => Promise<boolean>;
  clearError: () => void;
}