import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SuperadminUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  avatar?: string;
  rol: 'superadmin';
  token?: string;
}

interface AuthContextType {
  user: SuperadminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SuperadminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión guardada
    const savedUser = localStorage.getItem('superadmin_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('superadmin_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch('http://spring.informaticapp.com:5001/New-Hype-Project/api/v1/platform/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setIsLoading(false);
        return false;
      }

      // Guardar token en localStorage
      localStorage.setItem('authToken', data.data.accessToken);
      localStorage.setItem('authTokenType', data.data.tokenType || 'Bearer');

      const mockUser: SuperadminUser = {
        id: String(data.data.userInfo?.id || 'sa-001'),
        email: data.data.userInfo?.email || email,
        nombre: data.data.userInfo?.nombre || 'Super',
        apellido: data.data.userInfo?.apellido || 'Administrador',
        rol: 'superadmin',
        token: data.data.accessToken,
      };

      setUser(mockUser);
      localStorage.setItem('superadmin_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('superadmin_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
