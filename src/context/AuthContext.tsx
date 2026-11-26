import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Role } from '@shared/constants';
import type { LoginInput, RegisterInput } from '@shared/schemas';
import type { User } from '@shared/types';
import { getCurrentUser, loginUser, logoutUser, quickSwitchRole, registerUser, subscribeStore } from '@/lib/staticStore';

interface AuthState {
  user: User | null;
  ready: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  quickSignIn: (role: Role) => User;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [ready] = useState(true);

  useEffect(() => subscribeStore(() => setUser(getCurrentUser())), []);

  const login = useCallback(async (input: LoginInput) => {
    const u = loginUser(input);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const u = registerUser(input);
    setUser(u);
    return u;
  }, []);

  const quickSignIn = useCallback((role: Role) => {
    const u = quickSwitchRole(role);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    logoutUser();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, ready, login, register, quickSignIn, logout }),
    [user, ready, login, register, quickSignIn, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
