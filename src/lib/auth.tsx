/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { UserProfile } from '../types';
import { supabase } from './db';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginEmailPassword: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Determine user session from Supabase
    if (!supabase) {
      // Offline fallback
      const savedUser = localStorage.getItem('buendia_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // If authenticated via supabase, treat as admin for this app
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: 'Administrador Supabase',
          phone: '',
          role: 'admin'
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: 'Administrador Supabase',
          phone: '',
          role: 'admin'
        });
        localStorage.setItem('buendia_user', JSON.stringify({ role: 'admin' }));
      } else {
        setUser(null);
        localStorage.removeItem('buendia_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginEmailPassword = async (email: string, pass: string) => {
    if (!supabase) return { success: false, error: 'Supabase não configurado.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    if (supabase) {
       await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('buendia_user');
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loginEmailPassword,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
