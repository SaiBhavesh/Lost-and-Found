import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as AppUser, UserRole } from '@/lib/constants';
import type { Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, name: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch the user's profile from the `profiles` table.
 * Returns null gracefully on any error (RLS, network, not-yet-created row).
 * Retries once after a short delay to handle the race condition where
 * the on_auth_user_created trigger hasn't finished inserting the row yet.
 */
async function fetchProfile(userId: string, retries = 1): Promise<AppUser | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, avatar')
      .eq('id', userId)
      .single();

    if (error || !data) {
      // If profile doesn't exist yet (trigger may still be running), retry once
      if (retries > 0) {
        await new Promise(r => setTimeout(r, 500));
        return fetchProfile(userId, retries - 1);
      }
      console.warn('Could not fetch profile:', error?.message);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role as UserRole,
      avatar: data.avatar ?? undefined,
    };
  } catch (err) {
    console.warn('fetchProfile threw:', err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes and restore session on mount
  useEffect(() => {
    let mounted = true;

    // Safety timeout: absolutely ensure we never get stuck on the loading screen
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 2000);

    const loadSessionAndProfile = async (s: Session | null) => {
      if (!mounted) return;
      setSession(s);
      
      // Stop blocking the UI immediately! We don't need the profile to show the app shell.
      setLoading(false);

      if (s?.user) {
        try {
          const profile = await fetchProfile(s.user.id);
          if (mounted) {
            setUser(profile);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      } else {
        if (mounted) setUser(null);
      }
    };

    // We can rely primarily on onAuthStateChange since it fires an INITIAL_SESSION event
    // immediately upon subscription in supabase-js v2.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, s) => {
        loadSessionAndProfile(s);
      },
    );

    // As a fallback, in case onAuthStateChange takes too long or misses the initial event,
    // we also call getSession and stop loading if there's no session.
    supabase.auth.getSession()
      .then(({ data: { session: s }, error }) => {
        if (error) console.error('getSession error:', error);
        if (mounted) {
          // Only fetch if we haven't already populated the user to avoid double fetches
          if (s && !user) {
             loadSessionAndProfile(s);
          } else {
             setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error('getSession error:', err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: friendlyError(error) };
    return { error: null };
  }, []);

  const signup = useCallback(async (email: string, name: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: friendlyError(error) };
    return { error: null };
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    } finally {
      setUser(null);
      setSession(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Map Supabase auth errors to user-friendly messages */
function friendlyError(err: AuthError): string {
  const msg = err.message.toLowerCase();
  if (msg.includes('invalid login')) return 'Invalid email or password.';
  if (msg.includes('email not confirmed')) return 'Please confirm your email address first.';
  if (msg.includes('already registered')) return 'An account with this email already exists.';
  if (msg.includes('password')) return 'Password must be at least 6 characters.';
  return err.message;
}
