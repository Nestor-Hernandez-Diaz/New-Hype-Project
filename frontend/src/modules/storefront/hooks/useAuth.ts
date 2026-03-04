/**
 * 🔐 HOOK: useAuth
 * 
 * Hook customizado para gestionar autenticación del storefront.
 * Usa localStorage para persistir sesión de usuario frontal.
 * 
 * @module useAuth
 */

import { useState, useEffect, useCallback } from 'react';

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
  // Estado
  usuario: UsuarioStorefront | null;
  estaAutenticado: boolean;
  token: string | null;
  cargando: boolean;
  
  // Acciones
  login: (email: string, password: string) => Promise<boolean>;
  register: (datos: RegisterData) => Promise<boolean>;
  logout: () => void;
  actualizarPerfil: (datos: Partial<UsuarioStorefront>) => Promise<boolean>;
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<boolean>;
  
  // Utilidades
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

// Keys de localStorage
const STORAGE_KEYS = {
  TOKEN: 'nh_token_storefront',
  USUARIO: 'nh_usuario_storefront'
} as const;

/**
 * Hook para gestionar autenticación del storefront (cliente)
 */
export function useAuth(): UseAuthReturn {
  const [usuario, setUsuario] = useState<UsuarioStorefront | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  
  // ========================================================================
  // INICIALIZACIÓN
  // ========================================================================
  
  /**
   * Cargar sesión desde localStorage al montar
   */
  useEffect(() => {
    const tokenGuardado = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const usuarioGuardado = localStorage.getItem(STORAGE_KEYS.USUARIO);
    
    if (tokenGuardado && usuarioGuardado) {
      try {
        const usuarioParsed = JSON.parse(usuarioGuardado) as UsuarioStorefront;
        setToken(tokenGuardado);
        setUsuario(usuarioParsed);
      } catch (error) {
        console.error('Error al cargar sesión:', error);
        // Limpiar datos corruptos
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USUARIO);
      }
    }
    
    setCargando(false);
  }, []);
  
  // ========================================================================
  // ACCIONES
  // ========================================================================
  
  /**
   * Iniciar sesión (Mock - reemplazar con API real)
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setCargando(true);
    
    try {
      // ⚠️ MOCK - Reemplazar con fetch('/api/v1/storefront/auth/login')
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular respuesta del backend
      if (email === 'demo@newhype.com' && password === 'demo123') {
        const usuarioMock: UsuarioStorefront = {
          id: 1,
          email: email,
          nombre: 'Usuario',
          apellido: 'Demo',
          telefono: '987654321',
          direccion: 'Av. Principal 123',
          ciudad: 'Lima',
          codigoPostal: '15001',
          fechaRegistro: new Date().toISOString()
        };
        
        const tokenMock = 'mock_token_' + Date.now();
        
        // Persistir en localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, tokenMock);
        localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuarioMock));
        
        setToken(tokenMock);
        setUsuario(usuarioMock);
        setCargando(false);
        
        return true;
      } else {
        setCargando(false);
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      setCargando(false);
      return false;
    }
  }, []);
  
  /**
   * Registrar nuevo usuario (Mock - reemplazar con API real)
   */
  const register = useCallback(async (datos: RegisterData): Promise<boolean> => {
    setCargando(true);
    
    try {
      // ⚠️ MOCK - Reemplazar con fetch('/api/v1/storefront/auth/register')
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simular respuesta del backend
      const nuevoUsuario: UsuarioStorefront = {
        id: Math.floor(Math.random() * 10000),
        email: datos.email,
        nombre: datos.nombre,
        apellido: datos.apellido,
        telefono: datos.telefono,
        fechaRegistro: new Date().toISOString()
      };
      
      const tokenMock = 'mock_token_' + Date.now();
      
      // Persistir en localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, tokenMock);
      localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(nuevoUsuario));
      
      setToken(tokenMock);
      setUsuario(nuevoUsuario);
      setCargando(false);
      
      return true;
    } catch (error) {
      console.error('Error en register:', error);
      setCargando(false);
      return false;
    }
  }, []);
  
  /**
   * Cerrar sesión
   */
  const logout = useCallback(() => {
    // Limpiar localStorage
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USUARIO);
    
    // Limpiar estado
    setToken(null);
    setUsuario(null);
  }, []);
  
  /**
   * Actualizar perfil de usuario (Mock - reemplazar con API real)
   */
  const actualizarPerfil = useCallback(async (datos: Partial<UsuarioStorefront>): Promise<boolean> => {
    if (!usuario) return false;
    
    setCargando(true);
    
    try {
      // ⚠️ MOCK - Reemplazar con fetch('/api/v1/storefront/perfil', { method: 'PUT' })
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar usuario localmente
      const usuarioActualizado = { ...usuario, ...datos };
      
      localStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuarioActualizado));
      setUsuario(usuarioActualizado);
      setCargando(false);
      
      return true;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setCargando(false);
      return false;
    }
  }, [usuario]);
  
  /**
   * Cambiar contraseña (Mock - reemplazar con API real)
   */
  const cambiarPassword = useCallback(async (passwordActual: string, passwordNueva: string): Promise<boolean> => {
    if (!usuario) return false;
    
    setCargando(true);
    
    try {
      // ⚠️ MOCK - Reemplazar con fetch('/api/v1/storefront/cambiar-password', { method: 'POST' })
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simular verificación de password actual (siempre true en mock)
      if (passwordActual.length < 6 || passwordNueva.length < 6) {
        setCargando(false);
        return false;
      }
      
      setCargando(false);
      return true;
    } catch (error) {
      console.error('Error al cambiar password:', error);
      setCargando(false);
      return false;
    }
  }, [usuario]);
  
  // ========================================================================
  // UTILIDADES
  // ========================================================================
  
  /**
   * Obtener token de autenticación actual
   */
  const obtenerToken = useCallback((): string | null => {
    return token;
  }, [token]);
  
  /**
   * Obtener usuario actual
   */
  const obtenerUsuario = useCallback((): UsuarioStorefront | null => {
    return usuario;
  }, [usuario]);
  
  /**
   * Verificar si hay sesión activa válida
   */
  const verificarSesion = useCallback((): boolean => {
    return Boolean(token && usuario);
  }, [token, usuario]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Estado
    usuario,
    estaAutenticado: Boolean(token && usuario),
    token,
    cargando,
    
    // Acciones
    login,
    register,
    logout,
    actualizarPerfil,
    cambiarPassword,
    
    // Utilidades
    obtenerToken,
    obtenerUsuario,
    verificarSesion
  };
}
