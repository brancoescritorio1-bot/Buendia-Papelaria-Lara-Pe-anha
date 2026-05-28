/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginGoogle: () => Promise<void>;
  signUpWithPhone: (fullName: string, phone: string, email?: string) => Promise<void>;
  logout: () => void;
  isClerkRealMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if Clerk publishable key exists
  const isClerkRealMode = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  useEffect(() => {
    // Load persisted user if any
    const savedUser = localStorage.getItem('buendia_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    } else {
      // Auto-populate guest user to demonstrate checkout experience immediately if desired,
      // or leave as guest. Let's leave as guest initially so they can interact with the Login button.
    }
    setLoading(false);
  }, []);

  const loginGoogle = async () => {
    setLoading(true);
    // Simulating immediate Clerk-style Google OAuth redirection & login
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Default logged in profile
    const profile: UserProfile = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      fullName: 'Ana Carolina Mendonça 🌼',
      phone: '(38) 98877-6655',
      email: 'carol.mendonca@gmail.com',
      role: 'customer'
    };
    
    setUser(profile);
    localStorage.setItem('buendia_user', JSON.stringify(profile));
    setLoading(false);
  };

  const signUpWithPhone = async (fullName: string, phone: string, email?: string) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simple role determination (if user sets "admin" secret suffix or via settings)
    const isSpecialAdmin = fullName.toLowerCase().includes('admin') || fullName.toLowerCase().includes('lara');
    const profile: UserProfile = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      fullName,
      phone,
      email,
      role: isSpecialAdmin ? 'admin' : 'customer'
    };

    setUser(profile);
    localStorage.setItem('buendia_user', JSON.stringify(profile));
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('buendia_user');
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.fullName === 'Lara Peçanha (Admin)', // Admin designation
    loginGoogle,
    signUpWithPhone,
    logout,
    isClerkRealMode
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
