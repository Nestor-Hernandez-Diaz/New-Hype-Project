import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../types';

interface AuthContextType {
  usuario: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  estaAutenticado: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('nh_token');
    const u = localStorage.getItem('nh_usuario');
    if (t && u) {
      setToken(t);
      try { setUsuario(JSON.parse(u)); } catch { /* ignore */ }
    }
  }, []);

  const login = (t: string, user: AuthUser) => {
    localStorage.setItem('nh_token', t);
    localStorage.setItem('nh_usuario', JSON.stringify(user));
    setToken(t);
    setUsuario(user);
  };

  const logout = () => {
    localStorage.removeItem('nh_token');
    localStorage.removeItem('nh_usuario');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, estaAutenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
