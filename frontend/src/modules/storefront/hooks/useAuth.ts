/**
 * Hook: useAuth — Real Backend Authentication
 *
 * Manages storefront customer authentication via JWT tokens.
 * Uses the Spring Boot backend at spring.informaticapp.com:5001.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  storefrontFetch,
  getSfToken,
  setSfToken,
  clearSfToken,
  type BackendApiResponse,
} from '../services/storefrontFetch';

export interface UsuarioStorefront {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
  fechaRegistro: string;
}

export interface UseAuthReturn {
  // State
  usuario: UsuarioStorefront | null;
  estaAutenticado: boolean;
  token: string | null;
  cargando: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (datos: RegisterData) => Promise<boolean>;
  logout: () => void;
  actualizarPerfil: (datos: Partial<UsuarioStorefront>) => Promise<boolean>;
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<boolean>;

  // Utilities
  obtenerToken: () => string | null;
  obtenerUsuario: () => UsuarioStorefront | null;
  verificarSesion: () => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
}

// Auth response from backend
interface AuthApiResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    tenantId: number;
    scope: string;
  };
}

// localStorage keys
const STORAGE_KEYS = {
  TOKEN: 'nh_token_storefront',
  USUARIO: 'nh_usuario_storefront',
} as const;

/**
 * Hook for storefront (customer) authentication
 */
export function useAuth(): UseAuthReturn {
  const [usuario, setUsuario] = useState<UsuarioStorefront | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  useEffect(() => {
    const tokenGuardado = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const usuarioGuardado = localStorage.getItem(STORAGE_KEYS.USUARIO);

    if (tokenGuardado && usuarioGuardado) {
      try {
        const usuarioParsed = JSON.parse(usuarioGuardado) as UsuarioStorefront;
        setToken(tokenGuardado);
        setUsuario(usuarioParsed);
        // Sync with storefrontFetch helper
        setSfToken(tokenGuardado);
      } catch (error) {
        console.error('[useAuth] Error loading session:', error);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USUARIO);
        clearSfToken();
      }
    }

    setCargando(false);
  }, []);

  // Helper to persist user session
  const persistSession = useCallback((accessToken: string, user: UsuarioStorefront) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(user));
    setSfToken(accessToken);
    setToken(accessToken);
    setUsuario(user);
  }, []);

  // ========================================================================
  // ACTIONS
  // ========================================================================

  /**
   * Login via POST /storefront/auth/login
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setCargando(true);

    try {
      const res = await storefrontFetch<BackendApiResponse<AuthApiResponse>>(
        '/storefront/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            tenantId: '1',
            email,
            password,
          }),
        }
      );

      const authData = res.data;
      const user: UsuarioStorefront = {
        id: authData.user.id,
        email: authData.user.email,
        nombre: authData.user.nombre,
        apellido: authData.user.apellido,
        fechaRegistro: new Date().toISOString(),
      };

      persistSession(authData.accessToken, user);
      console.log('[useAuth] Login successful for:', email);
      return true;
    } catch (error: any) {
      console.error('[useAuth] Login error:', error.message);
      return false;
    } finally {
      setCargando(false);
    }
  }, [persistSession]);

  /**
   * Register via POST /storefront/auth/register
   */
  const register = useCallback(async (datos: RegisterData): Promise<boolean> => {
    setCargando(true);

    try {
      const res = await storefrontFetch<BackendApiResponse<AuthApiResponse>>(
        '/storefront/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            tenantId: '1',
            email: datos.email,
            password: datos.password,
            nombre: datos.nombre,
            apellido: datos.apellido,
            telefono: datos.telefono,
          }),
        }
      );

      const authData = res.data;
      const user: UsuarioStorefront = {
        id: authData.user.id,
        email: authData.user.email,
        nombre: authData.user.nombre,
        apellido: authData.user.apellido,
        telefono: datos.telefono,
        fechaRegistro: new Date().toISOString(),
      };

      persistSession(authData.accessToken, user);
      console.log('[useAuth] Registration successful for:', datos.email);
      return true;
    } catch (error: any) {
      console.error('[useAuth] Registration error:', error.message);
      return false;
    } finally {
      setCargando(false);
    }
  }, [persistSession]);

  /**
   * Logout — clear all session data
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USUARIO);
    clearSfToken();
    setToken(null);
    setUsuario(null);
    console.log('[useAuth] Logged out');
  }, []);

  /**
   * Update profile via PUT /storefront/perfil
   */
  const actualizarPerfil = useCallback(async (datos: Partial<UsuarioStorefront>): Promise<boolean> => {
    if (!usuario) return false;

    setCargando(true);

    try {
      const res = await storefrontFetch<BackendApiResponse<any>>(
        '/storefront/perfil',
        {
          method: 'PUT',
          body: JSON.stringify({
            nombre: datos.nombre ?? usuario.nombre,
            apellido: datos.apellido ?? usuario.apellido,
            telefono: datos.telefono ?? usuario.telefono,
          }),
        }
      );

      const updatedUser = {
        ...usuario,
        ...datos,
        ...(res.data || {}),
      };

      localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(updatedUser));
      setUsuario(updatedUser);
      return true;
    } catch (error: any) {
      console.error('[useAuth] Profile update error:', error.message);
      return false;
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  /**
   * Change password
   */
  const cambiarPassword = useCallback(async (passwordActual: string, passwordNueva: string): Promise<boolean> => {
    if (!usuario) return false;

    setCargando(true);

    try {
      await storefrontFetch<BackendApiResponse<any>>(
        '/storefront/perfil/password',
        {
          method: 'PUT',
          body: JSON.stringify({
            passwordActual,
            passwordNueva,
          }),
        }
      );

      return true;
    } catch (error: any) {
      console.error('[useAuth] Password change error:', error.message);
      return false;
    } finally {
      setCargando(false);
    }
  }, [usuario]);

  // ========================================================================
  // UTILITIES
  // ========================================================================

  const obtenerToken = useCallback((): string | null => {
    return token;
  }, [token]);

  const obtenerUsuario = useCallback((): UsuarioStorefront | null => {
    return usuario;
  }, [usuario]);

  const verificarSesion = useCallback((): boolean => {
    return Boolean(token && usuario);
  }, [token, usuario]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    usuario,
    estaAutenticado: Boolean(token && usuario),
    token,
    cargando,
    login,
    register,
    logout,
    actualizarPerfil,
    cambiarPassword,
    obtenerToken,
    obtenerUsuario,
    verificarSesion,
  };
}
