/**
 * ============================================
 * INVENTORY CONTEXT - Refactorizado
 * Usa useReducer + Mock API
 * ============================================
 */

import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
  StockItem,
  MovimientoKardex,
  PaginationData,
  StockFilters,
  KardexFilters,
  AjusteInventarioRequest,
  StockStats,
  AlertasStock,
} from '@monorepo/shared-types';
import { inventoryMockApi } from '../services/inventoryMockApi';
import { useAuth } from '../../auth/context/AuthContext';

// ========== TIPOS DEL ESTADO ==========

interface InventoryState {
  // Datos
  stockItems: StockItem[];
  movimientos: MovimientoKardex[];
  alertas: AlertasStock;
  
  // UI
  loading: boolean;
  error: string | null;
  
  // Paginación
  pagination: {
    stock: PaginationData | null;
    kardex: PaginationData | null;
  };
}

// ========== ACCIONES ==========

type InventoryAction =
  | { type: 'FETCH_STOCK_START' }
  | { type: 'FETCH_STOCK_SUCCESS'; payload: { data: StockItem[]; pagination: PaginationData } }
  | { type: 'FETCH_STOCK_ERROR'; payload: string }
  | { type: 'FETCH_KARDEX_START' }
  | { type: 'FETCH_KARDEX_SUCCESS'; payload: { data: MovimientoKardex[]; pagination: PaginationData } }
  | { type: 'FETCH_KARDEX_ERROR'; payload: string }
  | { type: 'FETCH_ALERTAS_SUCCESS'; payload: AlertasStock }
  | { type: 'CLEAR_ERROR' };

// ========== REDUCER ==========

const initialState: InventoryState = {
  stockItems: [],
  movimientos: [],
  alertas: { stockBajo: [], stockCritico: [] },
  loading: false,
  error: null,
  pagination: {
    stock: null,
    kardex: null,
  },
};

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'FETCH_STOCK_START':
      return { ...state, loading: true, error: null };
      
    case 'FETCH_STOCK_SUCCESS':
      return {
        ...state,
        loading: false,
        stockItems: action.payload.data,
        pagination: { ...state.pagination, stock: action.payload.pagination },
      };
      
    case 'FETCH_STOCK_ERROR':
      return { ...state, loading: false, error: action.payload };
      
    case 'FETCH_KARDEX_START':
      return { ...state, loading: true, error: null };
      
    case 'FETCH_KARDEX_SUCCESS':
      return {
        ...state,
        loading: false,
        movimientos: action.payload.data,
        pagination: { ...state.pagination, kardex: action.payload.pagination },
      };
      
    case 'FETCH_KARDEX_ERROR':
      return { ...state, loading: false, error: action.payload };
      
    case 'FETCH_ALERTAS_SUCCESS':
      return { ...state, alertas: action.payload };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    default:
      return state;
  }
}

// ========== CONTEXT TYPE ==========

// ========== CONTEXT TYPE ==========

export interface InventoryContextType {
  // Estado
  stockItems: StockItem[];
  movimientos: MovimientoKardex[];
  alertas: AlertasStock;
  loading: boolean;
  error: string | null;
  pagination: {
    stock: PaginationData | null;
    kardex: PaginationData | null;
  };
  canUpdateInventory: boolean;

  // Acciones
  fetchStock: (filters?: StockFilters) => Promise<void>;
  fetchKardex: (filters: KardexFilters) => Promise<void>;
  crearAjuste: (data: AjusteInventarioRequest) => Promise<void>;
  fetchAlertas: () => Promise<void>;
  clearError: () => void;
  getStockStats: () => StockStats;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// ========== PROVIDER ==========

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const { hasPermission } = useAuth();
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Permiso calculado
  const canUpdateInventory = useMemo(
    () => hasPermission('inventory.update'),
    [hasPermission]
  );

  // ========== ACCIONES ==========

  /**
   * Cargar stock
   */
  const fetchStock = useCallback(async (filters: StockFilters = {}) => {
    try {
      dispatch({ type: 'FETCH_STOCK_START' });
      
      console.log('🔍 [InventoryContext] Fetching stock with filters:', filters);
      
      const response = await inventoryMockApi.getStock(filters);
      
      console.log('✅ [InventoryContext] Stock response:', response);
      
      dispatch({
        type: 'FETCH_STOCK_SUCCESS',
        payload: {
          data: response.data,
          pagination: response.pagination,
        },
      });
    } catch (error: any) {
      const message = error?.message || 'Error al cargar el stock';
      console.error('❌ [InventoryContext] Error fetching stock:', error);
      
      dispatch({ type: 'FETCH_STOCK_ERROR', payload: message });
      
      if (window.showToast) {
        window.showToast(message, 'error');
      }
    }
  }, []);

  /**
   * Cargar kardex
   */
  const fetchKardex = useCallback(async (filters: KardexFilters) => {
    try {
      dispatch({ type: 'FETCH_KARDEX_START' });
      
      console.log('🔍 [InventoryContext] Fetching kardex with filters:', filters);
      
      const response = await inventoryMockApi.getKardex(filters);
      
      console.log('✅ [InventoryContext] Kardex response:', response);
      
      dispatch({
        type: 'FETCH_KARDEX_SUCCESS',
        payload: {
          data: response.data,
          pagination: response.pagination,
        },
      });
    } catch (error: any) {
      const message = error?.message || 'Error al cargar kardex';
      console.error('❌ [InventoryContext] Error fetching kardex:', error);
      
      dispatch({ type: 'FETCH_KARDEX_ERROR', payload: message });
      
      if (window.showToast) {
        window.showToast(message, 'error');
      }
    }
  }, []);

  /**
   * Crear ajuste de inventario
   */
  const crearAjuste = useCallback(
    async (data: AjusteInventarioRequest) => {
      try {
        console.log('📝 [InventoryContext] Creating adjustment:', data);
        
        const response = await inventoryMockApi.createAjuste(data);
        
        if (window.showToast) {
          window.showToast(response.message, 'success');
        }

        // Recargar datos
        await fetchStock();
        await fetchKardex({ warehouseId: data.warehouseId });
      } catch (error: any) {
        const message = error?.message || 'Error al crear ajuste';
        console.error('❌ [InventoryContext] Error creating adjustment:', error);
        
        if (window.showToast) {
          window.showToast(message, 'error');
        }
        throw error;
      }
    },
    [fetchStock, fetchKardex]
  );

  /**
   * Cargar alertas
   */
  const fetchAlertas = useCallback(async () => {
    try {
      const alertas = await inventoryMockApi.getAlertas();
      dispatch({ type: 'FETCH_ALERTAS_SUCCESS', payload: alertas });
    } catch (error) {
      // No afectar el estado global de error
      console.error('Error al cargar alertas:', error);
    }
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  /**
   * Calcular estadísticas de stock
   */
  const getStockStats = useCallback((): StockStats => {
    const items = Array.isArray(state.stockItems) ? state.stockItems : [];
    const totalProductos = items.length;
    const stockBajo = items.filter(item => item.estado === 'BAJO').length;
    const stockCritico = items.filter(item => item.estado === 'CRITICO').length;

    return {
      totalProductos,
      stockBajo,
      stockCritico,
    };
  }, [state.stockItems]);

  // ========== CONTEXT VALUE ==========

  const value: InventoryContextType = {
    // Estado
    stockItems: state.stockItems,
    movimientos: state.movimientos,
    alertas: state.alertas,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    canUpdateInventory,

    // Acciones
    fetchStock,
    fetchKardex,
    crearAjuste,
    fetchAlertas,
    clearError,
    getStockStats,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;

// ========== HOOK ==========

export const useInventory = (): InventoryContextType => {
  const context = React.useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

declare global {
  interface Window {
    showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  }
}