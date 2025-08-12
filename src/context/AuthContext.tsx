'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoginRequest, RegisterRequest, User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider= ({
  children,
}:{ children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokens = apiClient.getTokens();
    if (tokens.accessToken) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        apiClient.setAccessToken(accessToken);
        setUser(user);
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        
        // Store token in localStorage and apiClient
        localStorage.setItem('accessToken', accessToken);
        apiClient.setAccessToken(accessToken);
        setUser(user);
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
    } finally {
      apiClient.clearAccessToken();
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};