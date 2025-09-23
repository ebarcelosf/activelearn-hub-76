import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { AuthUser, AuthSession, LoginCredentials, RegisterCredentials } from '@/types/auth';

const USERS_STORAGE_KEY = 'activelearn_users';
const SESSION_STORAGE_KEY = 'activelearn_session';
const SECRET_KEY = 'activelearn_secret_2024'; // In production, this should be environment variable

// Validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Hash and verification functions
export const hashPassword = (password: string): string => {
  return CryptoJS.PBKDF2(password, SECRET_KEY, {
    keySize: 256/32,
    iterations: 10000
  }).toString();
};

export const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const hash = hashPassword(password);
  return hash === hashedPassword;
};

// JWT-like token generation (simple local implementation)
export const generateToken = (userId: string): string => {
  const payload = {
    userId,
    iat: Date.now(),
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  return CryptoJS.AES.encrypt(JSON.stringify(payload), SECRET_KEY).toString();
};

export const verifyToken = (token: string): { isValid: boolean; userId?: string } => {
  try {
    const decrypted = CryptoJS.AES.decrypt(token, SECRET_KEY);
    const payload = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    
    if (payload.exp < Date.now()) {
      return { isValid: false };
    }
    
    return { isValid: true, userId: payload.userId };
  } catch {
    return { isValid: false };
  }
};

// Storage functions
export const getStoredUsers = (): AuthUser[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveUser = (user: AuthUser): void => {
  const users = getStoredUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getUserByEmail = (email: string): AuthUser | null => {
  const users = getStoredUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const getUserById = (id: string): AuthUser | null => {
  const users = getStoredUsers();
  return users.find(user => user.id === id) || null;
};

export const deleteUserById = (id: string): void => {
  const users = getStoredUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filteredUsers));
};

// Session management
export const saveSession = (session: AuthSession): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const getSession = (): AuthSession | null => {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
};

// Auth operations
export const loginUser = (credentials: LoginCredentials): { success: boolean; user?: AuthUser; error?: string } => {
  const { email, password } = credentials;
  
  if (!validateEmail(email)) {
    return { success: false, error: 'Email inválido' };
  }
  
  const user = getUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Usuário não encontrado' };
  }
  
  if (!verifyPassword(password, user.hashedPassword)) {
    return { success: false, error: 'Senha incorreta' };
  }
  
  // Update last login
  user.lastLogin = new Date();
  saveUser(user);
  
  // Create session
  const token = generateToken(user.id);
  const session: AuthSession = {
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
  };
  
  saveSession(session);
  
  return { success: true, user };
};

export const registerUser = (credentials: RegisterCredentials): { success: boolean; user?: AuthUser; error?: string } => {
  const { name, email, password, confirmPassword } = credentials;
  
  // Validation
  if (!name.trim()) {
    return { success: false, error: 'Nome é obrigatório' };
  }
  
  if (!validateEmail(email)) {
    return { success: false, error: 'Email inválido' };
  }
  
  if (getUserByEmail(email)) {
    return { success: false, error: 'Email já cadastrado' };
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return { success: false, error: passwordValidation.errors[0] };
  }
  
  if (password !== confirmPassword) {
    return { success: false, error: 'Senhas não coincidem' };
  }
  
  // Create user
  const user: AuthUser = {
    id: uuidv4(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    hashedPassword: hashPassword(password),
    xp: 0,
    level: 1,
    badges: [],
    settings: {
      theme: 'system',
      notifications: {
        email: true,
        push: true,
        inApp: true
      },
      language: 'pt-BR'
    },
    createdAt: new Date(),
    lastLogin: new Date()
  };
  
  saveUser(user);
  
  // Create session
  const token = generateToken(user.id);
  const session: AuthSession = {
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // 7 days
  };
  
  saveSession(session);
  
  return { success: true, user };
};

// User data isolation utilities
export const getUserDataKey = (userId: string, dataType: string): string => {
  return `activelearn_${userId}_${dataType}`;
};

export const clearUserData = (userId: string): void => {
  // Get all localStorage keys that belong to this user
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`activelearn_${userId}_`)) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all user data
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Remove user from users list
  deleteUserById(userId);
  
  // Clear session if it belongs to this user
  const currentSession = getSession();
  if (currentSession && currentSession.userId === userId) {
    clearSession();
  }
};