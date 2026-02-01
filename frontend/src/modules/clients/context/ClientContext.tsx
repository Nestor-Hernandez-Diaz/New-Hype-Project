/**
 * 🏢 CLIENTS CONTEXT - GESTIÓN DE ENTIDADES COMERCIALES
 * 
 * Context refactorizado con useReducer para gestión de clientes y proveedores.
 * Conectado a Mock API local (entidadesMockApi.ts)
 * 
 * @packageDocumentation
 */

import React, { createContext, useReducer, useEffect, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import type {
  Entidad,
  EntidadesPaginadas,
  CrearEntidadDTO,
  ActualizarEntidadDTO,
  EntidadFiltros
} from '@monorepo/shared-types';
import * as entidadesMockApi from '../services/entidadesMockApi';

// ============= TIPOS DE ESTADO Y ACCIONES =============

interface ClientsState {
  entidades: Entidad[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

type ClientsAction =
  | { type: 'FETCH_ENTIDADES_START' }
  | { type: 'FETCH_ENTIDADES_SUCCESS'; payload: EntidadesPaginadas }
  | { type: 'FETCH_ENTIDADES_ERROR'; payload: string }
  | { type: 'CREATE_ENTIDAD_SUCCESS'; payload: Entidad }
  | { type: 'UPDATE_ENTIDAD_SUCCESS'; payload: Entidad }
  | { type: 'DELETE_ENTIDAD_SUCCESS'; payload: string }
  | { type: 'CHANGE_ESTADO_SUCCESS'; payload: Entidad };

// ============= REDUCER =============

const initialState: ClientsState = {
  entidades: [],
  pagination: null,
  loading: false,
  error: null,
};

function clientsReducer(state: ClientsState, action: ClientsAction): ClientsState {
  switch (action.type) {
    case 'FETCH_ENTIDADES_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_ENTIDADES_SUCCESS':
      return {
        ...state,
        loading: false,
        entidades: action.payload.entidades,
        pagination: action.payload.pagination,
      };

    case 'FETCH_ENTIDADES_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'CREATE_ENTIDAD_SUCCESS':
      return {
        ...state,
        entidades: [...state.entidades, action.payload],
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total + 1 }
          : null,
      };

    case 'UPDATE_ENTIDAD_SUCCESS':
      return {
        ...state,
        entidades: state.entidades.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'CHANGE_ESTADO_SUCCESS':
      return {
        ...state,
        entidades: state.entidades.map(e =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_ENTIDAD_SUCCESS':
      return {
        ...state,
        entidades: state.entidades.filter(e => e.id !== action.payload),
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total - 1 }
          : null,
      };

    default:
      return state;
  }
}

// ============= CONTEXT TYPE =============

interface ClientsContextType {
  // Estado
  clients: Entidad[];
  loading: boolean;
  pagination: ClientsState['pagination'];
  error: string | null;

  // Métodos
  loadClients: (filtros?: EntidadFiltros) => Promise<void>;
  addClient: (data: CrearEntidadDTO) => Promise<void>;
  updateClient: (id: string, data: ActualizarEntidadDTO) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  reactivateClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Entidad | undefined;
}

const ClientContext = createContext<ClientsContextType | undefined>(undefined);

// ============= PROVIDER =============

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(clientsReducer, initialState);
  const { showSuccess, showError } = useNotification();

  // ========== LOAD ENTIDADES ==========
  const loadClients = useCallback(async (filtros?: EntidadFiltros) => {
    try {
      dispatch({ type: 'FETCH_ENTIDADES_START' });

      const response = await entidadesMockApi.getEntidades(filtros);
      dispatch({ type: 'FETCH_ENTIDADES_SUCCESS', payload: response });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar entidades';
      dispatch({ type: 'FETCH_ENTIDADES_ERROR', payload: mensaje });
      showError(mensaje);
    }
  }, [showError]);

  // ========== CREATE ENTIDAD ==========
  const addClient = useCallback(async (data: CrearEntidadDTO) => {
    try {
      const nuevaEntidad = await entidadesMockApi.crearEntidad(data);
      dispatch({ type: 'CREATE_ENTIDAD_SUCCESS', payload: nuevaEntidad });
      showSuccess('Entidad registrada exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear entidad';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== UPDATE ENTIDAD ==========
  const updateClient = useCallback(async (id: string, data: ActualizarEntidadDTO) => {
    try {
      const entidadActualizada = await entidadesMockApi.actualizarEntidad(id, data);
      if (!entidadActualizada) {
        throw new Error('Entidad no encontrada');
      }
      dispatch({ type: 'UPDATE_ENTIDAD_SUCCESS', payload: entidadActualizada });
      showSuccess('Entidad actualizada exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar entidad';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== DELETE ENTIDAD ==========
  const deleteClient = useCallback(async (id: string) => {
    try {
      const success = await entidadesMockApi.eliminarEntidad(id);
      if (!success) {
        throw new Error('No se pudo eliminar la entidad');
      }
      dispatch({ type: 'DELETE_ENTIDAD_SUCCESS', payload: id });
      showSuccess('Entidad eliminada exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar entidad';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== REACTIVATE ENTIDAD ==========
  const reactivateClient = useCallback(async (id: string) => {
    try {
      const entidadActualizada = await entidadesMockApi.cambiarEstadoEntidad(id, true);
      if (!entidadActualizada) {
        throw new Error('Entidad no encontrada');
      }
      dispatch({ type: 'CHANGE_ESTADO_SUCCESS', payload: entidadActualizada });
      showSuccess('Entidad reactivada exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al reactivar entidad';
      showError(mensaje);
      throw error;
    }
  }, [showSuccess, showError]);

  // ========== GET BY ID ==========
  const getClientById = useCallback((id: string) => {
    return state.entidades.find(e => e.id === id);
  }, [state.entidades]);

  // ========== INICIALIZACIÓN ==========
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
    if (token) {
      loadClients();
    }
  }, [loadClients]);

  return (
    <ClientContext.Provider
      value={{
        clients: state.entidades,
        loading: state.loading,
        pagination: state.pagination,
        error: state.error,
        loadClients,
        addClient,
        updateClient,
        deleteClient,
        reactivateClient,
        getClientById,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};

// ============= HOOK =============

export const useClients = (): ClientsContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClients debe ser usado dentro de ClientProvider');
  }
  return context;
};

