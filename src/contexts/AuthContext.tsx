import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, UserRole } from '@/lib/constants';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
}

interface AuthContextType {
  user: User | null;
  session: { userId: string } | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, name: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_KEY = 'laf_users';
const SESSION_KEY = 'laf_session';

function getStoredUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]'); } catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = getSession();
    if (userId) {
      const users = getStoredUsers();
      const found = users.find(u => u.id === userId);
      if (found) {
        setUser({ id: found.id, email: found.email, name: found.name, role: found.role });
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { error: 'No account found with this email. Please sign up first.' };
    if (found.password !== password) return { error: 'Invalid email or password.' };
    localStorage.setItem(SESSION_KEY, found.id);
    setUser({ id: found.id, email: found.email, name: found.name, role: found.role });
    return { error: null };
  }, []);

  const signup = useCallback(async (email: string, name: string, password: string) => {
    if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
    const users = getStoredUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists.' };
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: 'student',
      password,
    };
    saveUsers([...users, newUser]);
    localStorage.setItem(SESSION_KEY, newUser.id);
    setUser({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session: user ? { userId: user.id } : null,
      isAuthenticated: !!user,
      loading,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
