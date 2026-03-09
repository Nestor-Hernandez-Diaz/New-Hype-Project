import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

interface SuperadminUser {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  avatar?: string;
  rol: 'superadmin';
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
      // Simular llamada API (800ms delay)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // MOCK: Validar credenciales hardcoded
      if (email === 'superadmin@newhype.com' && password === 'super2026') {
        const mockUser: SuperadminUser = {
          id: 'sa-001',
          email: 'superadmin@newhype.com',
          nombre: 'Super',
          apellido: 'Administrador',
          rol: 'superadmin',
        };
        
        setUser(mockUser);
        localStorage.setItem('superadmin_user', JSON.stringify(mockUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
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
