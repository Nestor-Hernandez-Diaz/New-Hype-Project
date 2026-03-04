/**
 * 📦 PURCHASES CONTEXT - GESTIÓN CENTRALIZADA DE COMPRAS
 * 
 * Context refactorizado con useReducer para gestión de órdenes y recepciones.
 * Conectado al backend real via comprasRealApi (ordenesComprasApi y recepcionesApi)
 * 
 * @packageDocumentation
 */

import React, { createContext, useReducer, useEffect, useCallback, useContext } from 'react';
import type { ReactNode } from 'react';
import { useNotification } from '../../../context/NotificationContext';

import type {
  OrdenCompra,
  Recepcion,
  OrdenesPaginadas,
  RecepcionesPaginadas,
  CrearOrdenCompraDTO,
  ActualizarOrdenCompraDTO,
  FiltrosOrdenCompra,
  CambiarEstadoOrdenDTO,
  CrearRecepcionDTO,
  ActualizarRecepcionDTO,
  FiltrosRecepcion,
  CambiarEstadoRecepcionDTO,
} from '@monorepo/shared-types';

import { ordenesComprasApi, recepcionesApi } from '../services/comprasRealApi';

// ============= TIPOS DE ESTADO Y ACCIONES =============

interface PurchasesState {
  // Órdenes de Compra
  ordenes: OrdenCompra[];
  ordenesPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  
  // Recepciones
  recepciones: Recepcion[];
  recepcionesPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  
  // Estado general
  loading: boolean;
  error: string | null;
}

type PurchasesAction =
  // Órdenes
  | { type: 'FETCH_ORDENES_START' }
  | { type: 'FETCH_ORDENES_SUCCESS'; payload: OrdenesPaginadas }
  | { type: 'FETCH_ORDENES_ERROR'; payload: string }
  | { type: 'CREATE_ORDEN_SUCCESS'; payload: OrdenCompra }
  | { type: 'UPDATE_ORDEN_SUCCESS'; payload: OrdenCompra }
  | { type: 'DELETE_ORDEN_SUCCESS'; payload: string }
  | { type: 'CHANGE_ORDEN_STATE_SUCCESS'; payload: OrdenCompra }
  
  // Recepciones
  | { type: 'FETCH_RECEPCIONES_START' }
  | { type: 'FETCH_RECEPCIONES_SUCCESS'; payload: RecepcionesPaginadas }
  | { type: 'FETCH_RECEPCIONES_ERROR'; payload: string }
  | { type: 'CREATE_RECEPCION_SUCCESS'; payload: Recepcion }
  | { type: 'UPDATE_RECEPCION_SUCCESS'; payload: Recepcion }
  | { type: 'DELETE_RECEPCION_SUCCESS'; payload: string }
  | { type: 'CHANGE_RECEPCION_STATE_SUCCESS'; payload: Recepcion };

// ============= REDUCER =============

const initialState: PurchasesState = {
  ordenes: [],
  ordenesPagination: null,
  recepciones: [],
  recepcionesPagination: null,
  loading: false,
  error: null,
};

function purchasesReducer(state: PurchasesState, action: PurchasesAction): PurchasesState {
  switch (action.type) {
    // === ÓRDENES ===
    case 'FETCH_ORDENES_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_ORDENES_SUCCESS':
      return {
        ...state,
        loading: false,
        ordenes: action.payload.ordenes,
        ordenesPagination: {
          page: action.payload.pagina,
          limit: action.payload.limite,
          total: action.payload.total,
          pages: action.payload.paginas,
        },
      };
    
    case 'FETCH_ORDENES_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'CREATE_ORDEN_SUCCESS':
      return {
        ...state,
        ordenes: [action.payload, ...state.ordenes],
      };
    
    case 'UPDATE_ORDEN_SUCCESS':
      return {
        ...state,
        ordenes: state.ordenes.map(o => o.id === action.payload.id ? action.payload : o),
      };
    
    case 'DELETE_ORDEN_SUCCESS':
      return {
        ...state,
        ordenes: state.ordenes.filter(o => o.id !== action.payload),
      };
    
    case 'CHANGE_ORDEN_STATE_SUCCESS':
      return {
        ...state,
        ordenes: state.ordenes.map(o => o.id === action.payload.id ? action.payload : o),
      };
    
    // === RECEPCIONES ===
    case 'FETCH_RECEPCIONES_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_RECEPCIONES_SUCCESS':
      return {
        ...state,
        loading: false,
        recepciones: action.payload.recepciones,
        recepcionesPagination: {
          page: action.payload.pagina,
          limit: action.payload.limite,
          total: action.payload.total,
          pages: action.payload.paginas,
        },
      };
    
    case 'FETCH_RECEPCIONES_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'CREATE_RECEPCION_SUCCESS':
      return {
        ...state,
        recepciones: [action.payload, ...state.recepciones],
      };
    
    case 'UPDATE_RECEPCION_SUCCESS':
      return {
        ...state,
        recepciones: state.recepciones.map(r => r.id === action.payload.id ? action.payload : r),
      };
    
    case 'DELETE_RECEPCION_SUCCESS':
      return {
        ...state,
        recepciones: state.recepciones.filter(r => r.id !== action.payload),
      };
    
    case 'CHANGE_RECEPCION_STATE_SUCCESS':
      return {
        ...state,
        recepciones: state.recepciones.map(r => r.id === action.payload.id ? action.payload : r),
      };
    
    default:
      return state;
  }
}

// ============= CONTEXT =============

interface PurchasesContextType extends PurchasesState {
  // Órdenes
  loadOrdenes: (filtros?: FiltrosOrdenCompra) => Promise<void>;
  getOrdenById: (id: string) => OrdenCompra | undefined;
  crearOrden: (data: CrearOrdenCompraDTO) => Promise<void>;
  actualizarOrden: (id: string, data: ActualizarOrdenCompraDTO) => Promise<void>;
  eliminarOrden: (id: string) => Promise<void>;
  cambiarEstadoOrden: (id: string, data: CambiarEstadoOrdenDTO) => Promise<void>;
  
  // Recepciones
  loadRecepciones: (filtros?: FiltrosRecepcion) => Promise<void>;
  getRecepcionById: (id: string) => Recepcion | undefined;
  crearRecepcion: (data: CrearRecepcionDTO) => Promise<void>;
  actualizarRecepcion: (id: string, data: ActualizarRecepcionDTO) => Promise<void>;
  eliminarRecepcion: (id: string) => Promise<void>;
  cambiarEstadoRecepcion: (id: string, data: CambiarEstadoRecepcionDTO) => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined);

// ============= PROVIDER =============

interface PurchasesProviderProps {
  children: ReactNode;
}

export const PurchasesProvider: React.FC<PurchasesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(purchasesReducer, initialState);
  const { showSuccess, showError } = useNotification();

  // === ÓRDENES ===

  const loadOrdenes = useCallback(async (filtros?: FiltrosOrdenCompra) => {
    dispatch({ type: 'FETCH_ORDENES_START' });
    try {
      const resultado = await ordenesComprasApi.getOrdenes(filtros);
      dispatch({ type: 'FETCH_ORDENES_SUCCESS', payload: resultado });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar órdenes';
      dispatch({ type: 'FETCH_ORDENES_ERROR', payload: mensaje });
      showError(mensaje);
    }
  }, [showError]);

  const getOrdenById = useCallback((id: string): OrdenCompra | undefined => {
    return state.ordenes.find(o => o.id === id);
  }, [state.ordenes]);

  const crearOrden = useCallback(async (data: CrearOrdenCompraDTO) => {
    try {
      const nuevaOrden = await ordenesComprasApi.crearOrden(data);
      dispatch({ type: 'CREATE_ORDEN_SUCCESS', payload: nuevaOrden });
      showSuccess(`Orden ${nuevaOrden.codigo} creada`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear orden';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  const actualizarOrden = useCallback(async (id: string, data: ActualizarOrdenCompraDTO) => {
    try {
      const ordenActualizada = await ordenesComprasApi.actualizarOrden(id, data);
      if (ordenActualizada) {
        dispatch({ type: 'UPDATE_ORDEN_SUCCESS', payload: ordenActualizada });
        showSuccess('Orden actualizada');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar orden';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  const eliminarOrden = useCallback(async (id: string) => {
    try {
      const eliminada = await ordenesComprasApi.eliminarOrden(id);
      if (eliminada) {
        dispatch({ type: 'DELETE_ORDEN_SUCCESS', payload: id });
        showSuccess('Orden eliminada');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar orden';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  const cambiarEstadoOrden = useCallback(async (id: string, data: CambiarEstadoOrdenDTO) => {
    try {
      const ordenActualizada = await ordenesComprasApi.cambiarEstado(id, data);
      if (ordenActualizada) {
        dispatch({ type: 'CHANGE_ORDEN_STATE_SUCCESS', payload: ordenActualizada });
        showSuccess(`Estado cambiado a ${data.estado}`);
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cambiar estado';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  // === RECEPCIONES ===

  const loadRecepciones = useCallback(async (filtros?: FiltrosRecepcion) => {
    dispatch({ type: 'FETCH_RECEPCIONES_START' });
    try {
      const resultado = await recepcionesApi.getRecepciones(filtros);
      dispatch({ type: 'FETCH_RECEPCIONES_SUCCESS', payload: resultado });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar recepciones';
      dispatch({ type: 'FETCH_RECEPCIONES_ERROR', payload: mensaje });
      showError(mensaje);
    }
  }, [showError]);

  const getRecepcionById = useCallback((id: string): Recepcion | undefined => {
    return state.recepciones.find(r => r.id === id);
  }, [state.recepciones]);

  const crearRecepcion = useCallback(async (data: CrearRecepcionDTO) => {
    try {
      const nuevaRecepcion = await recepcionesApi.crearRecepcion(data);
      dispatch({ type: 'CREATE_RECEPCION_SUCCESS', payload: nuevaRecepcion });
      showSuccess(`Recepción ${nuevaRecepcion.codigo} creada`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear recepción';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  const actualizarRecepcion = useCallback(async (id: string, data: ActualizarRecepcionDTO) => {
    try {
      const recepcionActualizada = await recepcionesApi.actualizarRecepcion(id, data);
      if (recepcionActualizada) {
        dispatch({ type: 'UPDATE_RECEPCION_SUCCESS', payload: recepcionActualizada });
        showSuccess('Recepción actualizada');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar recepción';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  const eliminarRecepcion = useCallback(async (id: string) => {
    try {
      const eliminada = await recepcionesApi.eliminarRecepcion(id);
      if (eliminada) {
        dispatch({ type: 'DELETE_RECEPCION_SUCCESS', payload: id });
        showSuccess('Recepción eliminada');
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar recepción';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  const cambiarEstadoRecepcion = useCallback(async (id: string, data: CambiarEstadoRecepcionDTO) => {
    try {
      const recepcionActualizada = await recepcionesApi.cambiarEstado(id, data);
      if (recepcionActualizada) {
        dispatch({ type: 'CHANGE_RECEPCION_STATE_SUCCESS', payload: recepcionActualizada });
        showSuccess(`Estado cambiado a ${data.estado}`);
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cambiar estado';
      showError(mensaje);
    }
  }, [showSuccess, showError]);

  // Auto-inicializar
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadOrdenes();
      loadRecepciones();
    }
  }, [loadOrdenes, loadRecepciones]);

  const value: PurchasesContextType = {
    ...state,
    loadOrdenes,
    getOrdenById,
    crearOrden,
    actualizarOrden,
    eliminarOrden,
    cambiarEstadoOrden,
    loadRecepciones,
    getRecepcionById,
    crearRecepcion,
    actualizarRecepcion,
    eliminarRecepcion,
    cambiarEstadoRecepcion,
  };

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
};

// ============= HOOK =============

export const usePurchases = (): PurchasesContextType => {
  const context = useContext(PurchasesContext);
  if (!context) {
    throw new Error('usePurchases debe usarse dentro de PurchasesProvider');
  }
  return context;
};
