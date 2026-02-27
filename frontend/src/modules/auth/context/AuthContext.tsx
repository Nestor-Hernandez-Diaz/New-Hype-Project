import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService, tokenUtils } from '../../../utils/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role?: {
    id: string;
    name: string;
    permissions: string[];
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token válido al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Inicializando autenticación...');
      
      // ===== MODO DEMO SIN BACKEND =====
      try {
        const savedUser = localStorage.getItem('alexatech_user');
        console.log('[AuthContext] Usuario guardado encontrado:', !!savedUser);
        
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            console.log('[AuthContext] Usuario cargado desde localStorage');
          } catch (error) {
            console.error('[AuthContext] Error parsing saved user:', error);
            localStorage.removeItem('alexatech_user');
          }
        } else {
          console.log('[AuthContext] No hay usuario guardado');
        }
      } catch (error) {
        console.error('[AuthContext] Error crítico en initializeAuth:', error);
      } finally {
        console.log('[AuthContext] Finalizando carga, setIsLoading(false)');
        setIsLoading(false);
      }

      // ===== MODO REAL CON BACKEND (comentado) =====
      // try {
      //   const token = tokenUtils.getAccessToken();
      //   console.log('[AuthContext] Token encontrado:', !!token);
      //   
      //   if (token && !tokenUtils.isTokenExpired(token)) {
      //     try {
      //       console.log('[AuthContext] Validando token con backend...');
      //       const response = await apiService.getCurrentUser();
      //       console.log('[AuthContext] Respuesta del backend:', response.success);
      //       
      //       if (response.success && response.data) {
      //         setUser(response.data as User);
      //         console.log('[AuthContext] Usuario autenticado');
      //       } else {
      //         console.log('[AuthContext] Token inválido, limpiando...');
      //         tokenUtils.clearTokens();
      //         localStorage.removeItem('alexatech_user');
      //       }
      //     } catch (error) {
      //       console.error('[AuthContext] Error validating token:', error);
      //       tokenUtils.clearTokens();
      //       localStorage.removeItem('alexatech_user');
      //     }
      //   } else {
      //     console.log('[AuthContext] No hay token válido');
      //     tokenUtils.clearTokens();
      //     localStorage.removeItem('alexatech_user');
      //   }
      // } catch (error) {
      //   console.error('[AuthContext] Error crítico en initializeAuth:', error);
      // } finally {
      //   console.log('[AuthContext] Finalizando carga, setIsLoading(false)');
      //   setIsLoading(false);
      // }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // ===== MODO DEMO SIN BACKEND =====
      console.log('[AuthContext] Login DEMO - email:', email);
      
      // Simular login exitoso con usuario mock
      const mockUser: User = {
        id: 'demo-user-1',
        username: email.split('@')[0],
        email: email,
        firstName: 'Usuario',
        lastName: 'Demo',
        isActive: true,
        role: {
          id: 'admin-role',
          name: 'Administrador',
          permissions: [
            // Dashboard
            'dashboard.read',
            
            // Productos
            'products.read', 'products.create', 'products.update', 'products.delete',
            
            // Ventas
            'sales.read', 'sales.create', 'sales.update', 'sales.delete',
            
            // Compras
            'purchases.read', 'purchases.create', 'purchases.update', 'purchases.delete',
            
            // Inventario
            'inventory.read', 'inventory.create', 'inventory.update', 'inventory.delete',
            
            // Almacenes
            'warehouses.read', 'warehouses.create', 'warehouses.update', 'warehouses.delete',
            
            // Clientes/Entidades
            'clients.read', 'clients.create', 'clients.update', 'clients.delete',
            'commercial_entities.read', 'commercial_entities.create', 'commercial_entities.update', 'commercial_entities.delete',
            
            // Usuarios
            'users.read', 'users.create', 'users.update', 'users.delete',
            
            // Caja
            'cash-sessions.read', 'cash-sessions.create', 'cash-sessions.update', 'cash-sessions.delete',
            
            // Reportes
            'reports.read', 'reports.export',
            
            // Configuración
            'settings.read', 'settings.update',
            'configuracion.read', 'configuracion.update',
            
            // Auditoría
            'audit.read',
            'auditoria.read',

            // Superadmin
            'superadmin.read',
          ],
        },
      };

      const mockAccessToken = 'demo-token-' + Date.now();
      const mockRefreshToken = 'demo-refresh-' + Date.now();

      tokenUtils.setTokens(mockAccessToken, mockRefreshToken);
      setUser(mockUser);
      localStorage.setItem('alexatech_user', JSON.stringify(mockUser));

      console.log('[AuthContext] Login DEMO exitoso');
      setIsLoading(false);
      return true;

      // ===== MODO REAL CON BACKEND (comentado) =====
      // const response = await apiService.login({ email, password });
      // 
      // if (response.success && response.data) {
      //   const { user: userData, accessToken, refreshToken } = response.data;
      //   
      //   tokenUtils.setTokens(accessToken, refreshToken);
      //   setUser(userData as User);
      //   localStorage.setItem('alexatech_user', JSON.stringify(userData));
      //   
      //   return true;
      // }
      // 
      // throw new Error(response.message || 'Usuario o contraseña incorrectos');
    } catch (error: any) {
      console.error('Login error:', error);
      setIsLoading(false);
      throw new Error(error.message || 'Error al conectar con el servidor. Inténtalo de nuevo.');
    }
  };

  const logout = async () => {
    try {
      // Notificar al backend del logout
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpiar estado local independientemente del resultado
      setUser(null);
      tokenUtils.clearTokens();
      localStorage.removeItem('alexatech_user');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('alexatech_user', JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Intentar obtener permisos desde role.permissions (RBAC nuevo)
    let perms: string[] = [];
    
    if (user.role?.permissions && Array.isArray(user.role.permissions)) {
      perms = user.role.permissions;
    } 
    // Fallback: permisos directos (legacy, solo para compatibilidad temporal)
    else if ((user as any).permissions && Array.isArray((user as any).permissions)) {
      perms = (user as any).permissions;
      console.warn('⚠️ [AuthContext] Usuario con permisos legacy (user.permissions). Debería reiniciar sesión para usar user.role.permissions');
    } 
    else {
      console.error('❌ [AuthContext] Usuario sin permisos:', user);
      return false;
    }

    if (perms.includes(permission)) return true;

    // Compatibilidad de alias entre clients.* y commercial_entities.*
    const legacyAliases: Record<string, string> = {
      'commercial_entities.read': 'clients.read',
      'commercial_entities.create': 'clients.create',
      'commercial_entities.update': 'clients.update',
    };

    const legacy = legacyAliases[permission];
    if (legacy && perms.includes(legacy)) return true;

    const reverse = Object.entries(legacyAliases).find(([, old]) => old === permission);
    if (reverse && perms.includes(reverse[0])) return true;

    return false;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;