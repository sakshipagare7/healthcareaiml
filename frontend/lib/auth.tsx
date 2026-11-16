'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async (retries = 2) => {
    // If no access token exists in localStorage, don't stall with network calls
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const me = await api.getMe();
      setUser(me);
    } catch (err: any) {
      const errorMsg = String(err?.message || '');
      const isColdStartOrTimeout =
        errorMsg.includes('504') ||
        errorMsg.includes('502') ||
        errorMsg.includes('503') ||
        errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('NetworkError');

      // If server is cold-starting on free hosting, retry after a delay before giving up
      if (isColdStartOrTimeout && retries > 0) {
        console.warn(`Cloud server waking up. Retrying session verification in 2.5s (${retries} attempts left)...`);
        await new Promise((resolve) => setTimeout(resolve, 2500));
        return refreshUser(retries - 1);
      }

      // Only purge saved token if backend explicitly reported unauthorized / expired session
      const isExplicitUnauthorized =
        errorMsg.includes('401') ||
        errorMsg.includes('credentials') ||
        errorMsg.includes('expired') ||
        errorMsg.includes('Unauthorized');

      if (isExplicitUnauthorized && typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: any) => {
    const res = await api.login(data);
    if (res?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.access_token);
    }
    setUser(res.user);
    router.push('/dashboard');
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    if (res?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', res.access_token);
    }
    setUser(res.user);
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      setUser(null);
      // Hard redirect to clear browser state and reload login page
      window.location.href = '/login';
    }
  };

  const deleteAccount = async () => {
    try {
      await api.deleteAccount();
    } catch (e) {
      console.error('Delete account error:', e);
      throw e;
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, deleteAccount, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
