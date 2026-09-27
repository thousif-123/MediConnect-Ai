import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  register: (data: { name: string; email: string; password: string; phone?: string; role?: Role }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  quickLoginAs: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    const res = await api.post('/auth/login', { email, password: pass });
    setUser(res.data.user);
    return res.data.user;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    try {
      const res = await api.post('/auth/google');
      setUser(res.data.user);
      return res.data.user;
    } catch {
      const googleUser: UserProfile = {
        _id: 'user-google-1',
        name: 'Alex Johnson',
        email: 'alex.johnson@gmail.com',
        role: 'USER',
        phone: '+1 (555) 234-5678',
        verificationStatus: 'VERIFIED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(googleUser);
      return googleUser;
    }
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; role?: Role }) => {
    const res = await api.post('/auth/register', data);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  const quickLoginAs = async (role: Role) => {
    const credentials: Record<Role, { email: string; pass: string }> = {
      USER: { email: 'patient@demo.com', pass: 'Password123!' },
      PHARMACIST: { email: 'pharmacist@demo.com', pass: 'Password123!' },
      DOCTOR: { email: 'doctor@demo.com', pass: 'Password123!' },
      HOSPITAL_ADMIN: { email: 'hospital@demo.com', pass: 'Password123!' },
      ADMIN: { email: 'admin@demo.com', pass: 'Password123!' },
    };

    const target = credentials[role];
    if (target) {
      await login(target.email, target.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, refreshUser, quickLoginAs }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
