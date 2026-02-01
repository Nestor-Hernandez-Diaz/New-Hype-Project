/**
 * 👥 USERS CONTEXT - GESTIÓN DE ESTADO DE USUARIOS
 * 
 * Context refactorizado con useReducer para gestión de usuarios.
 * Conectado a Mock API local (usuariosMockApi.ts)
 * 
 * @packageDocumentation
 */

import React, { createContext, useReducer, useEffect, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import type {
  Usuario,
  Rol,
  UsuariosPaginados,
  CrearUsuarioDTO,
  ActualizarUsuarioDTO,
  UsuarioFiltros
} from '@monorepo/shared-types';
import * as usuariosMockApi from '../services/usuariosMockApi';

// ============= TIPOS DE ESTADO Y ACCIONES =============

interface UsersState {
  usuarios: Usuario[];
  roles: Rol[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

type UsersAction =
  | { type: 'FETCH_USUARIOS_START' }
  | { type: 'FETCH_USUARIOS_SUCCESS'; payload: UsuariosPaginados }
  | { type: 'FETCH_USUARIOS_ERROR'; payload: string }
  | { type: 'FETCH_ROLES_SUCCESS'; payload: Rol[] }
  | { type: 'CREATE_USUARIO_SUCCESS'; payload: Usuario }
  | { type: 'UPDATE_USUARIO_SUCCESS'; payload: Usuario }
  | { type: 'DELETE_USUARIO_SUCCESS'; payload: string }
  | { type: 'CHANGE_ESTADO_SUCCESS'; payload: Usuario }
  | { type: 'CREATE_ROL_SUCCESS'; payload: Rol }
  | { type: 'UPDATE_ROL_SUCCESS'; payload: Rol };

// ============= REDUCER =============

const initialState: UsersState = {
  usuarios: [],
  roles: [],
  pagination: null,
  loading: false,
  error: null,
};

function usersReducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case 'FETCH_USUARIOS_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_USUARIOS_SUCCESS':
      return {
        ...state,
        loading: false,
        usuarios: action.payload.usuarios,
        pagination: action.payload.pagination,
      };

    case 'FETCH_USUARIOS_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_ROLES_SUCCESS':
      return { ...state, roles: action.payload };

    case 'CREATE_USUARIO_SUCCESS':
      return {
        ...state,
        usuarios: [...state.usuarios, action.payload],
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total + 1 }
          : null,
      };

    case 'UPDATE_USUARIO_SUCCESS':
      return {
        ...state,
        usuarios: state.usuarios.map(u =>
          u.id === action.payload.id ? action.payload : u
        ),
      };

    case 'CHANGE_ESTADO_SUCCESS':
      return {
        ...state,
        usuarios: state.usuarios.map(u =>
          u.id === action.payload.id ? action.payload : u
        ),
      };

    case 'DELETE_USUARIO_SUCCESS':
      return {
        ...state,
        usuarios: state.usuarios.filter(u => u.id !== action.payload),
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total - 1 }
          : null,
      };

    case 'CREATE_ROL_SUCCESS':
      return {
        ...state,
        roles: [...state.roles, action.payload],
      };

    case 'UPDATE_ROL_SUCCESS':
      return {
        ...state,
        roles: state.roles.map(r =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

    default:
      return state;
  }
}

// ============= CONTEXT TYPE =============

interface UsersContextType {
  // Estado
  users: Usuario[];
  roles: Rol[];
  pagination: UsersState['pagination'];
  loading: boolean;
  error: string | null;

  // Métodos de Usuarios
  loadUsers: (filtros?: UsuarioFiltros) => Promise<void>;
  addUser: (data: CrearUsuarioDTO) => Promise<void>;
  updateUser: (id: string, data: ActualizarUsuarioDTO) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  changeUserStatus: (id: string, activo: boolean) => Promise<void>;
  getUserById: (id: string) => Usuario | undefined;

  // Métodos de Roles
  loadRoles: () => Promise<void>;
  addRole: (data: any) => Promise<void>;
  updateRole: (id: string, data: any) => Promise<void>;
  getRoleById: (id: string) => Rol | undefined;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

// ============= PROVIDER =============

export const UsersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(usersReducer, initialState);
  const { showSuccess, showError } = useNotification();

  // ========== LOAD USUARIOS ==========
  const loadUsers = useCallback(async (filtros?: UsuarioFiltros) => {
    try {
      dispatch({ type: 'FETCH_USUARIOS_START' });

      const response = await usuariosMockApi.getUsuarios(filtros);
      dispatch({ type: 'FETCH_USUARIOS_SUCCESS', payload: response });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar usuarios';
      dispatch({ type: 'FETCH_USUARIOS_ERROR', payload: mensaje });
      showError(mensaje);
    }
  }, [showError]);

  // ========== LOAD ROLES ==========
  const loadRoles = useCallback(async () => {
    try {
      const roles = await usuariosMockApi.getRoles();
      dispatch({ type: 'FETCH_ROLES_SUCCESS', payload: roles });
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  }, []);

  // ========== CREATE USUARIO ==========
  const addUser = useCallback(async (data: CrearUsuarioDTO) => {
    try {
      const nuevoUsuario = await usuariosMockApi.crearUsuario(data);
      dispatch({ type: 'CREATE_USUARIO_SUCCESS', payload: nuevoUsuario });
      showSuccess('Usuario creado exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear usuario';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== UPDATE USUARIO ==========
  const updateUser = useCallback(async (id: string, data: ActualizarUsuarioDTO) => {
    try {
      const usuarioActualizado = await usuariosMockApi.actualizarUsuario(id, data);
      if (!usuarioActualizado) {
        throw new Error('Usuario no encontrado');
      }
      dispatch({ type: 'UPDATE_USUARIO_SUCCESS', payload: usuarioActualizado });
      showSuccess('Usuario actualizado exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar usuario';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== DELETE USUARIO ==========
  const deleteUser = useCallback(async (id: string) => {
    try {
      await usuariosMockApi.eliminarUsuario(id);
      dispatch({ type: 'DELETE_USUARIO_SUCCESS', payload: id });
      showSuccess('Usuario eliminado exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar usuario';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== CHANGE ESTADO USUARIO ==========
  const changeUserStatus = useCallback(async (id: string, activo: boolean) => {
    try {
      const usuarioActualizado = await usuariosMockApi.cambiarEstadoUsuario(id, activo);
      if (!usuarioActualizado) {
        throw new Error('Usuario no encontrado');
      }
      dispatch({ type: 'CHANGE_ESTADO_SUCCESS', payload: usuarioActualizado });
      showSuccess(`Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cambiar estado';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== GET BY ID ==========
  const getUserById = useCallback((id: string) => {
    return state.usuarios.find(u => u.id === id);
  }, [state.usuarios]);

  const getRoleById = useCallback((id: string) => {
    return state.roles.find(r => r.id === id);
  }, [state.roles]);

  // ========== CREATE ROL ==========
  const addRole = useCallback(async (data: any) => {
    try {
      const nuevoRol = await usuariosMockApi.crearRol(data);
      dispatch({ type: 'CREATE_ROL_SUCCESS', payload: nuevoRol });
      showSuccess('Rol creado exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear rol';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== UPDATE ROL ==========
  const updateRole = useCallback(async (id: string, data: any) => {
    try {
      const rolActualizado = await usuariosMockApi.actualizarRol(id, data);
      if (!rolActualizado) {
        throw new Error('Rol no encontrado');
      }
      dispatch({ type: 'UPDATE_ROL_SUCCESS', payload: rolActualizado });
      showSuccess('Rol actualizado exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar rol';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== INICIALIZACIÓN ==========
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
    if (token) {
      loadUsers();
      loadRoles();
    }
  }, [loadUsers, loadRoles]);

  return (
    <UsersContext.Provider
      value={{
        users: state.usuarios,
        roles: state.roles,
        pagination: state.pagination,
        loading: state.loading,
        error: state.error,
        loadUsers,
        loadRoles,
        addUser,
        updateUser,
        deleteUser,
        changeUserStatus,
        getUserById,
        addRole,
        updateRole,
        getRoleById,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

// ============= HOOK =============

export const useUsers = (): UsersContextType => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers debe ser usado dentro de UsersProvider');
  }
  return context;
};
