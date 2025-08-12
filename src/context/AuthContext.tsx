'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { LoginRequest, RegisterRequest, User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider= ({
  children,
}:{ children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const tokens = apiClient.getTokens();
    if (tokens.accessToken) {
      // In a real app, you might want to validate the token with the server
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
        
        // Store token in localStorage and apiClient
        localStorage.setItem('accessToken', accessToken);
        apiClient.setAccessToken(accessToken);
        localStorage.setItem('user', JSON.stringify(user));
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
      console.log('AuthContext: Making API call to /auth/register with data:', data);
      const response = await apiClient.post('/auth/register', data);
      console.log('AuthContext: API response received:', response);
      
      if (response.data.success && response.data.data) {
        const { user, accessToken } = response.data.data;
        console.log('AuthContext: Extracted user and accessToken:', { user, accessToken });
        
        // Store token in localStorage and apiClient
        localStorage.setItem('accessToken', accessToken);
        apiClient.setAccessToken(accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        console.log('AuthContext: User registered successfully');
      } else {
        console.error('AuthContext: Invalid response structure:', response.data);
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      console.error('AuthContext: Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loading }}>
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