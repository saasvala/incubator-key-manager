import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Role, RoleName } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/types';
import { getAppState, setAppState, getUserByUsername, getRoles, getLicense, seedRoles, logAudit } from '@/lib/db';

type AppPhase = 'loading' | 'license' | 'setup' | 'login' | 'app';

interface AuthContextType {
  phase: AppPhase;
  currentUser: User | null;
  currentRole: Role | null;
  permissions: string[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setPhase: (phase: AppPhase) => void;
  refreshPhase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<AppPhase>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);

  const refreshPhase = useCallback(async () => {
    try {
      const license = await getLicense();
      if (!license || !license.activated) {
        setPhase('license');
        return;
      }

      await seedRoles();
      const state = await getAppState();

      if (!state.superAdminCreated) {
        setPhase('setup');
        return;
      }

      if (state.sessionUser) {
        const user = await getUserByUsername(state.sessionUser);
        if (user && user.status === 'active') {
          const roles = await getRoles();
          const role = roles.find(r => r.id === user.roleId);
          setCurrentUser(user);
          setCurrentRole(role || null);
          setPermissions(role ? ROLE_PERMISSIONS[role.name as RoleName] || [] : []);
          setPhase('app');
          return;
        }
      }

      setPhase('login');
    } catch (e) {
      console.error('Auth init error:', e);
      setPhase('license');
    }
  }, []);

  useEffect(() => {
    refreshPhase();
  }, [refreshPhase]);

  const login = async (username: string, password: string): Promise<boolean> => {
    const user = await getUserByUsername(username);
    if (!user || user.password !== password || user.status !== 'active') return false;

    const roles = await getRoles();
    const role = roles.find(r => r.id === user.roleId);
    
    setCurrentUser(user);
    setCurrentRole(role || null);
    setPermissions(role ? ROLE_PERMISSIONS[role.name as RoleName] || [] : []);
    await setAppState({ sessionUser: user.username });
    await logAudit(user.id, 'LOGIN', `User ${user.username} logged in`);
    setPhase('app');
    return true;
  };

  const logout = async () => {
    if (currentUser) {
      await logAudit(currentUser.id, 'LOGOUT', `User ${currentUser.username} logged out`);
    }
    setCurrentUser(null);
    setCurrentRole(null);
    setPermissions([]);
    await setAppState({ sessionUser: null });
    setPhase('login');
  };

  return (
    <AuthContext.Provider value={{ phase, currentUser, currentRole, permissions, login, logout, setPhase, refreshPhase }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
