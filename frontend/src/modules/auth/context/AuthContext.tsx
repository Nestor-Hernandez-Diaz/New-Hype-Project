import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService, tokenUtils } from '../../../utils/api';
import type { BackendUserInfo } from '../../../utils/api';
import { fetchPermissionsForRole } from '../../../utils/permissionsResolver';

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
  tenantId?: string;
  tenantNombre?: string;
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

/**
 * Mapea la respuesta del backend (BackendUserInfo) al formato User del frontend.
 * El backend devuelve: {id, email, nombre, apellido, username, rol, tenantId, tenantNombre, scope}
 * El frontend necesita: {id, email, firstName, lastName, username, role:{id,name,permissions[]}}
 */
function mapBackendUserToFrontendUser(
  backendUser: BackendUserInfo,
  permissions: string[]
): User {
  return {
    id: String(backendUser.id),
    username: backendUser.username,
    email: backendUser.email,
    firstName: backendUser.nombre,
    lastName: backendUser.apellido,
    isActive: true, // Si puede hacer login, está activo
    role: {
      id: backendUser.rol,
      name: backendUser.rol,
      permissions,
    },
    tenantId: String(backendUser.tenantId),
    tenantNombre: backendUser.tenantNombre,
  };
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token válido al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Inicializando autenticación...');

      try {
        const token = tokenUtils.getAccessToken();
        console.log('[AuthContext] Token encontrado:', !!token);

        if (token && !tokenUtils.isTokenExpired(token)) {
          // Restaurar usuario de localStorage para carga rápida
          const savedUser = localStorage.getItem('alexatech_user');
          if (savedUser) {
            try {
              const userData = JSON.parse(savedUser);
              setUser(userData);
              console.log('[AuthContext] Usuario restaurado desde localStorage');
            } catch {
              console.warn('[AuthContext] Error parsing saved user');
            }
          }

          // Validar token con backend asincrónamente
          try {
            console.log('[AuthContext] Validando token con backend...');
            const response = await apiService.getCurrentUser();

            if (response.success && response.data) {
              const backendUser = response.data;
              const permissions = await fetchPermissionsForRole(backendUser.rol);
              const frontendUser = mapBackendUserToFrontendUser(backendUser, permissions);
              setUser(frontendUser);
              localStorage.setItem('alexatech_user', JSON.stringify(frontendUser));
              console.log('[AuthContext] Usuario validado con backend');
            } else {
              console.log('[AuthContext] Token inválido, limpiando...');
              tokenUtils.clearTokens();
              localStorage.removeItem('alexatech_user');
              setUser(null);
            }
          } catch {
            // Token podría estar expirado, intentar refresh
            console.log('[AuthContext] Error validando token, intentando refresh...');
            const refreshToken = tokenUtils.getRefreshToken();
            if (refreshToken) {
              try {
                const refreshResponse = await apiService.refreshToken();
                if (refreshResponse.success && refreshResponse.data) {
                  tokenUtils.setTokens(
                    refreshResponse.data.accessToken,
                    refreshResponse.data.refreshToken
                  );
                  // Re-validar usuario después del refresh
                  const meResponse = await apiService.getCurrentUser();
                  if (meResponse.success && meResponse.data) {
                    const backendUser = meResponse.data;
                    const permissions = await fetchPermissionsForRole(backendUser.rol);
                    const frontendUser = mapBackendUserToFrontendUser(backendUser, permissions);
                    setUser(frontendUser);
                    localStorage.setItem('alexatech_user', JSON.stringify(frontendUser));
                    console.log('[AuthContext] Token refreshed exitosamente');
                  }
                } else {
                  throw new Error('Refresh failed');
                }
              } catch {
                console.log('[AuthContext] Refresh falló, limpiando sesión');
                tokenUtils.clearTokens();
                localStorage.removeItem('alexatech_user');
                setUser(null);
              }
            } else {
              tokenUtils.clearTokens();
              localStorage.removeItem('alexatech_user');
              setUser(null);
            }
          }
        } else {
          console.log('[AuthContext] No hay token válido');
          tokenUtils.clearTokens();
          localStorage.removeItem('alexatech_user');
        }
      } catch (error) {
        console.error('[AuthContext] Error crítico en initializeAuth:', error);
      } finally {
        console.log('[AuthContext] Finalizando carga, setIsLoading(false)');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      console.log('[AuthContext] Intentando login con backend...');
      const response = await apiService.login({ email, password });

      if (response.success && response.data) {
        const { accessToken, refreshToken, user: backendUser } = response.data;

        // Guardar tokens
        tokenUtils.setTokens(accessToken, refreshToken);

        // Obtener permisos reales del rol
        const permissions = await fetchPermissionsForRole(backendUser.rol);

        // Mapear usuario backend → frontend
        const frontendUser = mapBackendUserToFrontendUser(backendUser, permissions);
        setUser(frontendUser);
        localStorage.setItem('alexatech_user', JSON.stringify(frontendUser));

        console.log('[AuthContext] Login exitoso:', frontendUser.email, '| Rol:', backendUser.rol);
        return true;
      }

      throw new Error(response.message || 'Usuario o contraseña incorrectos');
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Error al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
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
      console.warn('[AuthContext] Usuario con permisos legacy (user.permissions). Debería reiniciar sesión.');
    }
    else {
      console.error('[AuthContext] Usuario sin permisos:', user);
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
