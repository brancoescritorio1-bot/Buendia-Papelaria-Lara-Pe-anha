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
  loginCustomer: (name: string, phone: string) => Promise<void>;
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
      } else {
        const savedUser = localStorage.getItem('buendia_user');
        if (savedUser) {
           const parsed = JSON.parse(savedUser);
           if (parsed.role !== 'admin') setUser(parsed);
        }
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
        const savedUser = localStorage.getItem('buendia_user');
        if (savedUser) {
           const parsed = JSON.parse(savedUser);
           if (parsed.role === 'admin') {
              setUser(null);
              localStorage.removeItem('buendia_user');
           }
        }
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

  const loginCustomer = async (name: string, phone: string) => {
    const { id } = await import('./db').then(m => m.db.customerLogin(name, phone));
    const profile: UserProfile = {
      id: id || `usr-${Math.random().toString(36).substring(2, 9)}`,
      fullName: name,
      phone: phone,
      role: 'customer'
    };
    setUser(profile);
    localStorage.setItem('buendia_user', JSON.stringify(profile));
  };

  const logout = async () => {
    if (user?.role === 'admin' && supabase) {
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
    loginCustomer,
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
