/**
 * ============================================
 * SALES CONTEXT - Refactorizado con useReducer
 * Patrón Frontend-First con Mock API
 * ============================================
 */

import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  Venta,
  CrearVentaRequest,
  CajaRegistradora,
  SesionCaja,
  MovimientoCaja,
  ResumenCaja,
  NotaCredito,
  CrearNotaCreditoRequest,
  Cotizacion,
  VentasFilters,
  SesionesCajaFilters,
  TipoMovimientoCaja
} from '@monorepo/shared-types';

// Import Mock API
import * as ventasApi from '../services/ventasApi';

// ============================================
// STATE & ACTIONS
// ============================================

interface SalesState {
  // Cajas Registradoras
  cashRegisters: CajaRegistradora[];
  
  // Sesiones de Caja
  cashSessions: SesionCaja[];
  activeCashSession: SesionCaja | null;
  
  // Movimientos de Caja
  cashMovements: MovimientoCaja[];
  cashSummary: ResumenCaja | null;
  
  // Ventas
  sales: Venta[];
  
  // Cotizaciones
  quotes: Cotizacion[];
  
  // Loading & Error
  loading: boolean;
  error: string | null;
}

type SalesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CASH_REGISTERS'; payload: CajaRegistradora[] }
  | { type: 'SET_CASH_SESSIONS'; payload: SesionCaja[] }
  | { type: 'SET_ACTIVE_CASH_SESSION'; payload: SesionCaja | null }
  | { type: 'ADD_CASH_SESSION'; payload: SesionCaja }
  | { type: 'UPDATE_CASH_SESSION'; payload: SesionCaja }
  | { type: 'SET_CASH_MOVEMENTS'; payload: MovimientoCaja[] }
  | { type: 'SET_CASH_SUMMARY'; payload: ResumenCaja }
  | { type: 'ADD_CASH_MOVEMENT'; payload: MovimientoCaja }
  | { type: 'REMOVE_CASH_MOVEMENT'; payload: string }
  | { type: 'SET_SALES'; payload: Venta[] }
  | { type: 'ADD_SALE'; payload: Venta }
  | { type: 'UPDATE_SALE'; payload: Venta }
  | { type: 'SET_QUOTES'; payload: Cotizacion[] }
  | { type: 'ADD_QUOTE'; payload: Cotizacion };

// ============================================
// REDUCER
// ============================================

const initialState: SalesState = {
  cashRegisters: [],
  cashSessions: [],
  activeCashSession: null,
  cashMovements: [],
  cashSummary: null,
  sales: [],
  quotes: [],
  loading: false,
  error: null
};

function salesReducer(state: SalesState, action: SalesAction): SalesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      
    case 'SET_CASH_REGISTERS':
      return { ...state, cashRegisters: action.payload };
      
    case 'SET_CASH_SESSIONS':
      return { 
        ...state, 
        cashSessions: action.payload,
        activeCashSession: action.payload.find(s => s.estado === 'Abierta') || null
      };
      
    case 'SET_ACTIVE_CASH_SESSION':
      return { ...state, activeCashSession: action.payload };
      
    case 'ADD_CASH_SESSION':
      return {
        ...state,
        cashSessions: [...state.cashSessions, action.payload],
        activeCashSession: action.payload
      };
      
    case 'UPDATE_CASH_SESSION':
      return {
        ...state,
        cashSessions: state.cashSessions.map(s =>
          s.id === action.payload.id ? action.payload : s
        ),
        activeCashSession: action.payload.estado === 'Cerrada' ? null : state.activeCashSession
      };
      
    case 'SET_CASH_MOVEMENTS':
      return { ...state, cashMovements: action.payload };
      
    case 'SET_CASH_SUMMARY':
      return { ...state, cashSummary: action.payload };
      
    case 'ADD_CASH_MOVEMENT':
      return {
        ...state,
        cashMovements: [...state.cashMovements, action.payload]
      };
      
    case 'REMOVE_CASH_MOVEMENT':
      return {
        ...state,
        cashMovements: state.cashMovements.filter(m => m.id !== action.payload)
      };
      
    case 'SET_SALES':
      return { ...state, sales: action.payload };
      
    case 'ADD_SALE':
      return {
        ...state,
        sales: [...state.sales, action.payload]
      };
      
    case 'UPDATE_SALE':
      return {
        ...state,
        sales: state.sales.map(s => s.id === action.payload.id ? action.payload : s)
      };
      
    case 'SET_QUOTES':
      return { ...state, quotes: action.payload };
      
    case 'ADD_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, action.payload]
      };
      
    default:
      return state;
  }
}

// ============================================
// CONTEXT TYPE
// ============================================

interface SalesContextType {
  // State
  cashRegisters: CajaRegistradora[];
  cashSessions: SesionCaja[];
  activeCashSession: SesionCaja | null;
  cashMovements: MovimientoCaja[];
  cashSummary: ResumenCaja | null;
  sales: Venta[];
  quotes: Cotizacion[];
  loading: boolean;
  error: string | null;
  
  // Cash Registers
  loadCashRegisters: () => Promise<void>;
  
  // Cash Sessions
  loadCashSessions: (filters?: SesionesCajaFilters) => Promise<void>;
  openCashSession: (cashRegisterId: string, montoApertura: number, observaciones?: string) => Promise<SesionCaja>;
  closeCashSession: (sessionId: string, montoCierre: number, observaciones?: string) => Promise<SesionCaja>;
  getClosedSessions: (filters?: SesionesCajaFilters) => Promise<SesionCaja[]>;
  getSessionById: (sessionId: string) => Promise<SesionCaja>;
  
  // Cash Movements
  createCashMovement: (tipo: TipoMovimientoCaja, data: { cashSessionId: string; monto: number; motivo: string; descripcion?: string }) => Promise<MovimientoCaja>;
  loadCashMovements: (sessionId: string) => Promise<void>;
  loadCashSummary: (sessionId: string) => Promise<void>;
  deleteCashMovement: (movementId: string) => Promise<void>;
  
  // Sales
  loadSales: (filters?: VentasFilters) => Promise<void>;
  createSale: (saleData: CrearVentaRequest) => Promise<Venta>;
  confirmPayment: (saleId: string, paymentData: { montoRecibido: number; montoCambio?: number; referenciaPago?: string }) => Promise<Venta>;
  completeSale: (saleId: string) => Promise<Venta>;
  cancelSale: (saleId: string, motivo: string) => Promise<Venta>;
  getSaleById: (saleId: string) => Promise<Venta>;
  
  // Credit Notes
  createCreditNote: (creditNoteData: CrearNotaCreditoRequest) => Promise<NotaCredito>;
  getCreditNotesBySale: (saleId: string) => Promise<NotaCredito[]>;
  
  // Quotes
  loadQuotes: () => Promise<void>;
  createQuote: (quoteData: CrearVentaRequest) => Promise<Cotizacion>;
  
  // Invoice (Mantener para compatibilidad, pero no implementado en Mocks)
  previewInvoice: (saleId: string) => void;
  downloadInvoice: (saleId: string) => void;
}

// ============================================
// CONTEXT & PROVIDER
// ============================================

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(salesReducer, initialState);
  
  // ==================== CASH REGISTERS ====================
  const loadCashRegisters = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await ventasApi.getCajasRegistradoras();
      dispatch({ type: 'SET_CASH_REGISTERS', payload: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar cajas registradoras';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Error loading cash registers:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  // ==================== CASH SESSIONS ====================
  const loadCashSessions = useCallback(async (filters?: SesionesCajaFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await ventasApi.getSesionesCaja(filters);
      dispatch({ type: 'SET_CASH_SESSIONS', payload: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar sesiones de caja';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Error loading cash sessions:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const openCashSession = useCallback(async (
    cashRegisterId: string,
    montoApertura: number,
    observaciones?: string
  ): Promise<SesionCaja> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newSession = await ventasApi.abrirSesionCaja(cashRegisterId, montoApertura, observaciones);
      dispatch({ type: 'ADD_CASH_SESSION', payload: newSession });
      
      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al abrir sesión de caja';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const closeCashSession = useCallback(async (
    sessionId: string,
    montoCierre: number,
    observaciones?: string
  ): Promise<SesionCaja> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const closedSession = await ventasApi.cerrarSesionCaja(sessionId, montoCierre, observaciones);
      dispatch({ type: 'UPDATE_CASH_SESSION', payload: closedSession });
      
      return closedSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión de caja';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const getClosedSessions = useCallback(async (filters?: SesionesCajaFilters): Promise<SesionCaja[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const sessions = await ventasApi.getSesionesCaja({ ...filters, estado: 'Cerrada' as any });
      return sessions;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar historial de sesiones';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const getSessionById = useCallback(async (sessionId: string): Promise<SesionCaja> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const session = await ventasApi.getSesionCajaById(sessionId);
      return session;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar detalle de sesión';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  // ==================== CASH MOVEMENTS ====================
  const createCashMovement = useCallback(async (
    tipo: TipoMovimientoCaja,
    data: { cashSessionId: string; monto: number; motivo: string; descripcion?: string }
  ): Promise<MovimientoCaja> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newMovement = await ventasApi.crearMovimientoCaja(tipo, data);
      dispatch({ type: 'ADD_CASH_MOVEMENT', payload: newMovement });
      
      // Recargar resumen después de crear movimiento
      if (data.cashSessionId) {
        const summary = await ventasApi.getResumenCaja(data.cashSessionId);
        dispatch({ type: 'SET_CASH_SUMMARY', payload: summary });
      }
      
      return newMovement;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al registrar ${tipo.toLowerCase()}`;
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const loadCashMovements = useCallback(async (sessionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const movements = await ventasApi.getMovimientosCaja(sessionId);
      dispatch({ type: 'SET_CASH_MOVEMENTS', payload: movements });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar movimientos de caja';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Error loading cash movements:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const loadCashSummary = useCallback(async (sessionId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const summary = await ventasApi.getResumenCaja(sessionId);
      dispatch({ type: 'SET_CASH_SUMMARY', payload: summary });
      
      // También actualizar movimientos si vienen en el resumen
      if (summary.movements) {
        dispatch({ type: 'SET_CASH_MOVEMENTS', payload: summary.movements });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar resumen de caja';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Error loading cash summary:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const deleteCashMovement = useCallback(async (movementId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      await ventasApi.eliminarMovimientoCaja(movementId);
      dispatch({ type: 'REMOVE_CASH_MOVEMENT', payload: movementId });
      
      // Recargar resumen si hay sesión activa
      if (state.activeCashSession?.id) {
        const summary = await ventasApi.getResumenCaja(state.activeCashSession.id);
        dispatch({ type: 'SET_CASH_SUMMARY', payload: summary });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar movimiento';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.activeCashSession]);
  
  // ==================== SALES ====================
  const loadSales = useCallback(async (filters?: VentasFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await ventasApi.getVentas(filters);
      dispatch({ type: 'SET_SALES', payload: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar ventas';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Error loading sales:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const createSale = useCallback(async (saleData: CrearVentaRequest): Promise<Venta> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newSale = await ventasApi.crearVenta(saleData);
      dispatch({ type: 'ADD_SALE', payload: newSale });
      
      return newSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear venta';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const confirmPayment = useCallback(async (
    saleId: string,
    paymentData: { montoRecibido: number; montoCambio?: number; referenciaPago?: string }
  ): Promise<Venta> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSale = await ventasApi.confirmarPagoVenta(saleId, paymentData);
      dispatch({ type: 'UPDATE_SALE', payload: updatedSale });
      
      return updatedSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al confirmar pago';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const completeSale = useCallback(async (saleId: string): Promise<Venta> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const updatedSale = await ventasApi.completarVenta(saleId);
      dispatch({ type: 'UPDATE_SALE', payload: updatedSale });
      
      return updatedSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al completar venta';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const cancelSale = useCallback(async (saleId: string, motivo: string): Promise<Venta> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const canceledSale = await ventasApi.cancelarVenta(saleId, motivo);
      dispatch({ type: 'UPDATE_SALE', payload: canceledSale });
      
      return canceledSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar venta';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const getSaleById = useCallback(async (saleId: string): Promise<Venta> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const sale = await ventasApi.getVentaById(saleId);
      return sale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener venta';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  // ==================== CREDIT NOTES ====================
  const createCreditNote = useCallback(async (creditNoteData: CrearNotaCreditoRequest): Promise<NotaCredito> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const creditNote = await ventasApi.crearNotaCredito(creditNoteData);
      
      // Recargar ventas para actualizar la lista
      await loadSales();
      
      return creditNote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear nota de crédito';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [loadSales]);
  
  const getCreditNotesBySale = useCallback(async (saleId: string): Promise<NotaCredito[]> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const creditNotes = await ventasApi.getNotasCreditoBySale(saleId);
      return creditNotes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener notas de crédito';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  // ==================== QUOTES (Cotizaciones) ====================
  const loadQuotes = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const data = await ventasApi.getCotizaciones();
      dispatch({ type: 'SET_QUOTES', payload: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar cotizaciones';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('Error loading quotes:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const createQuote = useCallback(async (quoteData: CrearVentaRequest): Promise<Cotizacion> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const newQuote = await ventasApi.crearCotizacion(quoteData);
      dispatch({ type: 'ADD_QUOTE', payload: newQuote });
      
      return newQuote;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear cotización';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  // ==================== INVOICE (No implementado en Mocks) ====================
  const previewInvoice = useCallback((saleId: string) => {
    console.warn('previewInvoice no implementado en Mock API. SaleID:', saleId);
    alert('Vista previa de factura no disponible en modo Mock');
  }, []);
  
  const downloadInvoice = useCallback((saleId: string) => {
    console.warn('downloadInvoice no implementado en Mock API. SaleID:', saleId);
    alert('Descarga de factura no disponible en modo Mock');
  }, []);
  
  // ==================== INITIAL LOAD ====================
  useEffect(() => {
    loadCashRegisters();
    loadCashSessions();
    loadSales();
    loadQuotes();
  }, [loadCashRegisters, loadCashSessions, loadSales, loadQuotes]);
  
  // ==================== CONTEXT VALUE ====================
  const value: SalesContextType = {
    // State
    cashRegisters: state.cashRegisters,
    cashSessions: state.cashSessions,
    activeCashSession: state.activeCashSession,
    cashMovements: state.cashMovements,
    cashSummary: state.cashSummary,
    sales: state.sales,
    quotes: state.quotes,
    loading: state.loading,
    error: state.error,
    
    // Cash Registers
    loadCashRegisters,
    
    // Cash Sessions
    loadCashSessions,
    openCashSession,
    closeCashSession,
    getClosedSessions,
    getSessionById,
    
    // Cash Movements
    createCashMovement,
    loadCashMovements,
    loadCashSummary,
    deleteCashMovement,
    
    // Sales
    loadSales,
    createSale,
    confirmPayment,
    completeSale,
    cancelSale,
    getSaleById,
    
    // Credit Notes
    createCreditNote,
    getCreditNotesBySale,
    
    // Quotes
    loadQuotes,
    createQuote,
    
    // Invoice
    previewInvoice,
    downloadInvoice
  };
  
  return (
    <SalesContext.Provider value={value}>
      {children}
    </SalesContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================

export const useSales = (): SalesContextType => {
  const context = React.useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};

// ============================================
// EXPORTS (Para compatibilidad con código existente)
// ============================================

export type {
  Venta as Sale,
  CrearVentaRequest as CreateSaleInput,
  ItemVenta as SaleItem,
  CajaRegistradora as CashRegister,
  SesionCaja as CashSession,
  MovimientoCaja as CashMovement,
  ResumenCaja as CashSummary,
  NotaCredito as CreditNote,
  CrearNotaCreditoRequest as CreateCreditNoteInput,
  Cotizacion
};
