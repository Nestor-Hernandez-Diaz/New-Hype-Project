/**
 * ============================================
 * SALES CONTEXT - Refactorizado con useReducer
 * Conectado a API real (ventasRealApi.ts)
 * ============================================
 */

import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  Venta,
  CrearVentaRequest,
  ItemVenta,
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

// Import Real API (reemplaza mock)
import * as ventasApi from '../services/ventasRealApi';
import configuracionApi from '../../configuration/services/configuracionApi';
import { apiService } from '../../../utils/api';

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
  createCashRegister: (data: { codigo: string; nombre: string; ubicacion?: string }) => Promise<CajaRegistradora>;
  updateCashRegister: (id: string, data: { codigo: string; nombre: string; ubicacion?: string }) => Promise<CajaRegistradora>;
  toggleCashRegisterStatus: (id: string) => Promise<CajaRegistradora>;
  
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
  confirmPayment: (saleId: string, paymentData: { montoRecibido: number; montoCambio?: number; referenciaPago?: string; pagos?: Array<{ metodoPagoId: string | number; monto: number; referencia?: string }> }) => Promise<Venta>;
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
  previewQuote: (quoteId: string) => void;
  previewCreditNote: (creditNoteId: string, saleId: string) => void;
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

  const createCashRegister = useCallback(async (
    data: { codigo: string; nombre: string; ubicacion?: string }
  ): Promise<CajaRegistradora> => {
    try {
      const created = await ventasApi.crearCajaRegistradora(data);
      const all = await ventasApi.getCajasRegistradoras();
      dispatch({ type: 'SET_CASH_REGISTERS', payload: all });
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear caja registradora';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    }
  }, []);

  const updateCashRegister = useCallback(async (
    id: string,
    data: { codigo: string; nombre: string; ubicacion?: string }
  ): Promise<CajaRegistradora> => {
    try {
      const updated = await ventasApi.actualizarCajaRegistradora(id, data);
      const all = await ventasApi.getCajasRegistradoras();
      dispatch({ type: 'SET_CASH_REGISTERS', payload: all });
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar caja registradora';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
    }
  }, []);

  const toggleCashRegisterStatus = useCallback(async (id: string): Promise<CajaRegistradora> => {
    try {
      const toggled = await ventasApi.cambiarEstadoCajaRegistradora(id);
      const all = await ventasApi.getCajasRegistradoras();
      dispatch({ type: 'SET_CASH_REGISTERS', payload: all });
      return toggled;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cambiar estado de caja';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw err;
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
    paymentData: { montoRecibido: number; montoCambio?: number; referenciaPago?: string; pagos?: Array<{ metodoPagoId: string | number; monto: number; referencia?: string }> }
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
  
  // ==================== INVOICE ====================

  // Numero a letras (espanol)
  const numeroALetras = (n: number): string => {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales: Record<number,string> = { 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE', 15: 'QUINCE',
      16: 'DIECISEIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE' };
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    const convertirGrupo = (num: number): string => {
      if (num === 0) return '';
      if (num === 100) return 'CIEN';
      if (num < 10) return unidades[num];
      if (num >= 11 && num <= 19) return especiales[num];
      if (num < 100) {
        const d = Math.floor(num / 10);
        const u = num % 10;
        if (num >= 21 && num <= 29) return 'VEINTI' + unidades[u];
        return decenas[d] + (u ? ' Y ' + unidades[u] : '');
      }
      const c = Math.floor(num / 100);
      const resto = num % 100;
      return centenas[c] + (resto ? ' ' + convertirGrupo(resto) : '');
    };

    const entero = Math.floor(Math.abs(n));
    const decimales = Math.round((Math.abs(n) - entero) * 100);

    if (entero === 0) return `CERO CON ${String(decimales).padStart(2, '0')}/100 SOLES`;

    let resultado = '';
    if (entero >= 1000000) {
      const millones = Math.floor(entero / 1000000);
      resultado += (millones === 1 ? 'UN MILLON' : convertirGrupo(millones) + ' MILLONES');
      const resto = entero % 1000000;
      if (resto > 0) resultado += ' ' + convertirGrupo(resto >= 1000 ? 0 : resto);
      if (resto >= 1000) {
        const miles = Math.floor(resto / 1000);
        const r2 = resto % 1000;
        resultado += ' ' + (miles === 1 ? 'MIL' : convertirGrupo(miles) + ' MIL');
        if (r2 > 0) resultado += ' ' + convertirGrupo(r2);
      }
    } else if (entero >= 1000) {
      const miles = Math.floor(entero / 1000);
      const resto = entero % 1000;
      resultado = (miles === 1 ? 'MIL' : convertirGrupo(miles) + ' MIL');
      if (resto > 0) resultado += ' ' + convertirGrupo(resto);
    } else {
      resultado = convertirGrupo(entero);
    }

    return `${resultado} CON ${String(decimales).padStart(2, '0')}/100 SOLES`;
  };

  const previewInvoice = useCallback(async (saleId: string) => {
    try {
      const [sale, empresa] = await Promise.all([
        ventasApi.getVentaById(saleId),
        configuracionApi.getEmpresa().catch(() => null),
      ]);

      // Datos empresa
      const empRazonSocial = empresa?.razonSocial || 'EMPRESA';
      const empRuc = empresa?.ruc || '';
      const empDireccion = empresa?.direccion || '';
      const empTelefono = empresa?.telefono || '';
      const empEmail = empresa?.email || '';

      // Tipo comprobante
      const tc = String(sale.tipoComprobante);
      const tipoComp = tc === 'NOTA_VENTA' || tc === 'NotaVenta' ? 'NOTA DE VENTA'
        : tc === 'FACTURA' || tc === 'Factura' ? 'FACTURA ELECTRONICA'
        : tc === 'BOLETA' || tc === 'Boleta' ? 'BOLETA DE VENTA ELECTRONICA' : tc;

      const tipoCompCorto = tc === 'NOTA_VENTA' || tc === 'NotaVenta' ? 'NOTA DE VENTA'
        : tc === 'FACTURA' || tc === 'Factura' ? 'FACTURA'
        : tc === 'BOLETA' || tc === 'Boleta' ? 'BOLETA' : tc;

      // Serie y numero
      const serieNumero = sale.codigoVenta || '';

      // Datos cliente
      const clientName = sale.cliente
        ? (sale.cliente.razonSocial || sale.cliente.nombres || 'Cliente General')
        : 'Cliente General';
      const clientTipoDoc = sale.cliente?.tipoDocumento || '-';
      const clientNumDoc = sale.cliente?.numeroDocumento || '-';
      const clientDireccion = sale.cliente?.direccion || '-';

      // Fecha
      const fechaEmision = sale.fechaEmision
        ? new Date(sale.fechaEmision).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

      // Metodos pago (resumen)
      const metodoPagoResumen = (sale.payments || []).map((p: any) => p.metodoPago).filter(Boolean).join(', ') || 'Efectivo';

      // Items
      const itemsRows = sale.items.map((item: any, idx: number) =>
        `<tr>
          <td class="td-c">${idx + 1}</td>
          <td class="td-l">${item.codigoProducto || '-'}</td>
          <td class="td-l">${item.nombreProducto}</td>
          <td class="td-c">UND</td>
          <td class="td-r">${item.cantidad}</td>
          <td class="td-r">${Number(item.precioUnitario).toFixed(2)}</td>
          <td class="td-r">${Number(item.subtotal).toFixed(2)}</td>
        </tr>`
      ).join('');

      // Totales
      const subtotal = Number(sale.subtotal) || 0;
      const igv = Number(sale.igv) || 0;
      const total = Number(sale.total) || 0;
      const importeLetras = numeroALetras(total);

      // Pagos detallados
      const pagosRows = (sale.payments || []).length > 1
        ? (sale.payments || []).map((p: any) =>
            `<tr>
              <td class="td-l">${p.metodoPago}</td>
              <td class="td-l">${p.referencia || '-'}</td>
              <td class="td-r">S/ ${Number(p.monto).toFixed(2)}</td>
            </tr>`
          ).join('')
        : '';

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Comprobante ${serieNumero}</title>
<style>
  @media print {
    body { margin: 0; padding: 10mm; }
    .no-print { display: none !important; }
    @page { margin: 10mm; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; max-width: 210mm; margin: 0 auto; padding: 15px; }

  /* 1. ENCABEZADO + RECUADRO COMPROBANTE */
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
  .header-left { flex: 1; }
  .header-left h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
  .header-left p { font-size: 10px; line-height: 1.5; }
  .doc-box { border: 2px solid #000; padding: 10px 15px; text-align: center; min-width: 200px; }
  .doc-box .doc-type { font-size: 12px; font-weight: bold; margin-bottom: 6px; }
  .doc-box .doc-num { font-size: 14px; font-weight: bold; }
  .doc-box .doc-ruc { font-size: 11px; margin-bottom: 4px; }

  /* 3. DATOS CLIENTE */
  .client-section { border: 1px solid #000; padding: 8px 10px; margin-bottom: 10px; }
  .client-row { display: flex; margin-bottom: 3px; font-size: 10px; }
  .client-label { font-weight: bold; min-width: 130px; }
  .client-value { flex: 1; }

  /* 4. TABLA PRODUCTOS */
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th { background: #f0f0f0; border: 1px solid #000; padding: 5px 6px; font-size: 10px; font-weight: bold; text-align: center; }
  td { border: 1px solid #000; padding: 4px 6px; font-size: 10px; }
  .td-c { text-align: center; }
  .td-l { text-align: left; }
  .td-r { text-align: right; }

  /* 5. TOTALES */
  .totals-section { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .importe-letras { flex: 1; padding: 6px; border: 1px solid #000; font-size: 10px; margin-right: 10px; }
  .totals-table { min-width: 250px; }
  .totals-table td { border: 1px solid #000; padding: 4px 8px; font-size: 10px; }
  .totals-table .total-final { font-weight: bold; font-size: 12px; }

  /* 7. PAGOS */
  .pagos-section { margin-bottom: 10px; }
  .pagos-section h4 { font-size: 10px; font-weight: bold; margin-bottom: 4px; border-bottom: 1px solid #000; padding-bottom: 2px; }

  /* 8. FOOTER */
  .footer { text-align: center; border-top: 1px solid #000; padding-top: 8px; margin-top: 10px; font-size: 9px; }
  .footer p { margin-bottom: 2px; }

  /* Boton imprimir */
  .btn-print { display: block; margin: 20px auto; padding: 10px 30px; background: #333; color: white; border: none; cursor: pointer; font-size: 13px; }
</style>
</head><body>

<!-- 1. ENCABEZADO + 2. RECUADRO COMPROBANTE -->
<div class="header-row">
  <div class="header-left">
    <h1>${empRazonSocial}</h1>
    ${empRuc ? `<p><strong>RUC:</strong> ${empRuc}</p>` : ''}
    ${empDireccion ? `<p>${empDireccion}</p>` : ''}
    ${empTelefono ? `<p>Tel: ${empTelefono}</p>` : ''}
    ${empEmail ? `<p>${empEmail}</p>` : ''}
  </div>
  <div class="doc-box">
    ${empRuc ? `<div class="doc-ruc">RUC: ${empRuc}</div>` : ''}
    <div class="doc-type">${tipoComp}</div>
    <div class="doc-num">${serieNumero}</div>
  </div>
</div>

<!-- 3. DATOS DEL CLIENTE -->
<div class="client-section">
  <div class="client-row">
    <span class="client-label">Fecha de Emision:</span>
    <span class="client-value">${fechaEmision}</span>
  </div>
  <div class="client-row">
    <span class="client-label">${clientTipoDoc}:</span>
    <span class="client-value">${clientNumDoc}</span>
  </div>
  <div class="client-row">
    <span class="client-label">Razon Social / Nombres:</span>
    <span class="client-value">${clientName}</span>
  </div>
  <div class="client-row">
    <span class="client-label">Direccion:</span>
    <span class="client-value">${clientDireccion}</span>
  </div>
  <div class="client-row">
    <span class="client-label">Metodo(s) de Pago:</span>
    <span class="client-value">${metodoPagoResumen}</span>
  </div>
</div>

<!-- 4. TABLA DE PRODUCTOS -->
<table>
  <thead>
    <tr>
      <th style="width:30px">Item</th>
      <th style="width:80px">SKU</th>
      <th>Descripcion</th>
      <th style="width:40px">U.M.</th>
      <th style="width:50px">Cant.</th>
      <th style="width:70px">P. Unit.</th>
      <th style="width:70px">Total</th>
    </tr>
  </thead>
  <tbody>
    ${itemsRows}
  </tbody>
</table>

<!-- 5. TOTALES -->
<div class="totals-section">
  <div class="importe-letras">
    <strong>SON:</strong> ${importeLetras}
  </div>
  <table class="totals-table">
    <tr><td>Op. Gravada</td><td class="td-r">S/ ${igv > 0 ? subtotal.toFixed(2) : '0.00'}</td></tr>
    <tr><td>Op. Inafecta</td><td class="td-r">S/ ${igv === 0 ? subtotal.toFixed(2) : '0.00'}</td></tr>
    <tr><td>Op. Exonerada</td><td class="td-r">S/ 0.00</td></tr>
    ${igv > 0 ? `<tr><td>IGV 18%</td><td class="td-r">S/ ${igv.toFixed(2)}</td></tr>` : ''}
    <tr class="total-final"><td><strong>IMPORTE TOTAL</strong></td><td class="td-r"><strong>S/ ${total.toFixed(2)}</strong></td></tr>
  </table>
</div>

<!-- 6. OBSERVACIONES -->
${sale.observaciones ? `<div style="border:1px solid #000;padding:6px 10px;margin-bottom:10px;font-size:10px"><strong>Observaciones:</strong> ${sale.observaciones}</div>` : ''}

<!-- 7. DETALLE DE PAGOS -->
${pagosRows ? `
<div class="pagos-section">
  <h4>DETALLE DE PAGOS</h4>
  <table>
    <thead><tr><th>Metodo</th><th>Referencia</th><th style="width:80px">Monto</th></tr></thead>
    <tbody>${pagosRows}</tbody>
  </table>
</div>
` : ''}

${sale.montoRecibido ? `<div style="font-size:10px;margin-bottom:10px"><strong>Monto Recibido:</strong> S/ ${Number(sale.montoRecibido).toFixed(2)} | <strong>Cambio:</strong> S/ ${Number(sale.montoCambio || 0).toFixed(2)}</div>` : ''}

<!-- 8. FOOTER -->
<div class="footer">
  <p>Representacion impresa de ${tipoCompCorto} ELECTRONICA</p>
  <p>Autorizado mediante Resolucion de Superintendencia SUNAT</p>
</div>

<button class="btn-print no-print" onclick="window.print()">Imprimir</button>
</body></html>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (error: any) {
      alert('Error al generar comprobante: ' + (error.message || 'Error desconocido'));
    }
  }, []);

  const downloadInvoice = useCallback((saleId: string) => {
    // Reuse previewInvoice for download
    previewInvoice(saleId);
  }, [previewInvoice]);

  // ==================== PREVIEW QUOTE (COTIZACIÓN) ====================
  const previewQuote = useCallback(async (quoteId: string) => {
    try {
      const [quoteRes, empresa] = await Promise.all([
        apiService.get(`/cotizaciones/${quoteId}`),
        configuracionApi.getEmpresa().catch(() => null),
      ]);

      const quoteData = (quoteRes as any)?.data;
      if (!quoteData) throw new Error('Cotización no encontrada');

      // Datos empresa
      const empRazonSocial = empresa?.razonSocial || 'EMPRESA';
      const empRuc = empresa?.ruc || '';
      const empDireccion = empresa?.direccion || '';
      const empTelefono = empresa?.telefono || '';
      const empEmail = empresa?.email || '';

      // Código
      const codigoCotizacion = quoteData.codigoCotizacion || `COT-${quoteData.id}`;

      // Datos cliente
      const clientName = quoteData.clienteNombre || 'Cliente General';
      const clientTipoDoc = '-';
      const clientNumDoc = '-';
      const clientDireccion = '-';

      // Fechas
      const fechaEmision = quoteData.fechaEmision
        ? new Date(quoteData.fechaEmision).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';
      const fechaVencimiento = quoteData.fechaVencimiento
        ? new Date(quoteData.fechaVencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

      // Items
      const detalles = quoteData.detalles || [];
      const itemsRows = detalles.map((item: any, idx: number) =>
        `<tr>
          <td class="td-c">${idx + 1}</td>
          <td class="td-l">-</td>
          <td class="td-l">${item.nombreProducto || ''}</td>
          <td class="td-c">UND</td>
          <td class="td-r">${item.cantidad}</td>
          <td class="td-r">${Number(item.precioUnitario).toFixed(2)}</td>
          <td class="td-r">${Number(item.subtotal).toFixed(2)}</td>
        </tr>`
      ).join('');

      // Totales
      const subtotal = Number(quoteData.subtotal) || 0;
      const igv = Number(quoteData.igv) || 0;
      const total = Number(quoteData.total) || 0;
      const importeLetras = numeroALetras(total);

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Cotizacion ${codigoCotizacion}</title>
<style>
  @media print {
    body { margin: 0; padding: 10mm; }
    .no-print { display: none !important; }
    @page { margin: 10mm; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; max-width: 210mm; margin: 0 auto; padding: 15px; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
  .header-left { flex: 1; }
  .header-left h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
  .header-left p { font-size: 10px; line-height: 1.5; }
  .doc-box { border: 2px solid #000; padding: 10px 15px; text-align: center; min-width: 200px; }
  .doc-box .doc-type { font-size: 12px; font-weight: bold; margin-bottom: 6px; }
  .doc-box .doc-num { font-size: 14px; font-weight: bold; }
  .doc-box .doc-ruc { font-size: 11px; margin-bottom: 4px; }
  .client-section { border: 1px solid #000; padding: 8px 10px; margin-bottom: 10px; }
  .client-row { display: flex; margin-bottom: 3px; font-size: 10px; }
  .client-label { font-weight: bold; min-width: 130px; }
  .client-value { flex: 1; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th { background: #f0f0f0; border: 1px solid #000; padding: 5px 6px; font-size: 10px; font-weight: bold; text-align: center; }
  td { border: 1px solid #000; padding: 4px 6px; font-size: 10px; }
  .td-c { text-align: center; }
  .td-l { text-align: left; }
  .td-r { text-align: right; }
  .totals-section { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .importe-letras { flex: 1; padding: 6px; border: 1px solid #000; font-size: 10px; margin-right: 10px; }
  .totals-table { min-width: 250px; }
  .totals-table td { border: 1px solid #000; padding: 4px 8px; font-size: 10px; }
  .totals-table .total-final { font-weight: bold; font-size: 12px; }
  .footer { text-align: center; border-top: 1px solid #000; padding-top: 8px; margin-top: 10px; font-size: 9px; }
  .footer p { margin-bottom: 2px; }
  .validity-box { border: 1px solid #000; padding: 8px 12px; margin-bottom: 10px; font-size: 10px; }
  .btn-print { display: block; margin: 20px auto; padding: 10px 30px; background: #333; color: white; border: none; cursor: pointer; font-size: 13px; }
</style>
</head><body>

<div class="header-row">
  <div class="header-left">
    <h1>${empRazonSocial}</h1>
    ${empRuc ? `<p><strong>RUC:</strong> ${empRuc}</p>` : ''}
    ${empDireccion ? `<p>${empDireccion}</p>` : ''}
    ${empTelefono ? `<p>Tel: ${empTelefono}</p>` : ''}
    ${empEmail ? `<p>${empEmail}</p>` : ''}
  </div>
  <div class="doc-box">
    ${empRuc ? `<div class="doc-ruc">RUC: ${empRuc}</div>` : ''}
    <div class="doc-type">COTIZACION</div>
    <div class="doc-num">${codigoCotizacion}</div>
  </div>
</div>

<div class="client-section">
  <div class="client-row">
    <span class="client-label">Fecha de Emision:</span>
    <span class="client-value">${fechaEmision}</span>
  </div>
  ${fechaVencimiento ? `<div class="client-row">
    <span class="client-label">Valido Hasta:</span>
    <span class="client-value">${fechaVencimiento}</span>
  </div>` : ''}
  <div class="client-row">
    <span class="client-label">${clientTipoDoc}:</span>
    <span class="client-value">${clientNumDoc}</span>
  </div>
  <div class="client-row">
    <span class="client-label">Razon Social / Nombres:</span>
    <span class="client-value">${clientName}</span>
  </div>
  <div class="client-row">
    <span class="client-label">Direccion:</span>
    <span class="client-value">${clientDireccion}</span>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:30px">Item</th>
      <th style="width:80px">SKU</th>
      <th>Descripcion</th>
      <th style="width:40px">U.M.</th>
      <th style="width:50px">Cant.</th>
      <th style="width:70px">P. Unit.</th>
      <th style="width:70px">Total</th>
    </tr>
  </thead>
  <tbody>
    ${itemsRows}
  </tbody>
</table>

<div class="totals-section">
  <div class="importe-letras">
    <strong>SON:</strong> ${importeLetras}
  </div>
  <table class="totals-table">
    <tr><td>Op. Gravada</td><td class="td-r">S/ ${igv > 0 ? subtotal.toFixed(2) : '0.00'}</td></tr>
    <tr><td>Op. Inafecta</td><td class="td-r">S/ ${igv === 0 ? subtotal.toFixed(2) : '0.00'}</td></tr>
    <tr><td>Op. Exonerada</td><td class="td-r">S/ 0.00</td></tr>
    ${igv > 0 ? `<tr><td>IGV 18%</td><td class="td-r">S/ ${igv.toFixed(2)}</td></tr>` : ''}
    <tr class="total-final"><td><strong>IMPORTE TOTAL</strong></td><td class="td-r"><strong>S/ ${total.toFixed(2)}</strong></td></tr>
  </table>
</div>

${quoteData.observaciones ? `<div style="border:1px solid #000;padding:6px 10px;margin-bottom:10px;font-size:10px"><strong>Observaciones:</strong> ${quoteData.observaciones}</div>` : ''}

<div class="validity-box">
  <strong>CONDICIONES:</strong> Esta cotizacion tiene vigencia ${quoteData.diasValidez || 30} dias a partir de la fecha de emision.
  Los precios estan sujetos a disponibilidad de stock. No constituye comprobante de pago.
</div>

<div class="footer">
  <p>COTIZACION - Documento sin valor fiscal</p>
  <p>Precios expresados en Soles (PEN) - Sujetos a disponibilidad</p>
</div>

<button class="btn-print no-print" onclick="window.print()">Imprimir</button>
</body></html>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (error: any) {
      alert('Error al generar cotizacion: ' + (error.message || 'Error desconocido'));
    }
  }, []);

  // ==================== PREVIEW CREDIT NOTE (NOTA DE CRÉDITO) ====================
  const previewCreditNote = useCallback(async (creditNoteId: string, saleId: string) => {
    try {
      const [ncRes, saleData, empresa] = await Promise.all([
        apiService.get(`/notas-credito/${creditNoteId}`),
        ventasApi.getVentaById(saleId),
        configuracionApi.getEmpresa().catch(() => null),
      ]);

      const ncData = (ncRes as any)?.data;
      if (!ncData) throw new Error('Nota de crédito no encontrada');

      // Datos empresa
      const empRazonSocial = empresa?.razonSocial || 'EMPRESA';
      const empRuc = empresa?.ruc || '';
      const empDireccion = empresa?.direccion || '';
      const empTelefono = empresa?.telefono || '';
      const empEmail = empresa?.email || '';

      // Código NC
      const codigoNC = ncData.codigo || `NC-${ncData.id}`;
      const serieNC = ncData.serie || 'NC01';
      const numeroNC = ncData.numero || '';

      // Datos cliente (de la venta original)
      const clientName = saleData.cliente
        ? (saleData.cliente.razonSocial || saleData.cliente.nombres || 'Cliente General')
        : 'Cliente General';
      const clientTipoDoc = saleData.cliente?.tipoDocumento || '-';
      const clientNumDoc = saleData.cliente?.numeroDocumento || '-';
      const clientDireccion = saleData.cliente?.direccion || '-';

      // Fecha
      const fechaEmision = ncData.createdAt
        ? new Date(ncData.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

      // Motivo
      const motivoMap: Record<string, string> = {
        'DevolucionTotal': 'Devolucion Total de Productos',
        'DevolucionParcial': 'Devolucion Parcial de Productos',
        'DEVOLUCION': 'Devolucion de Productos',
      };
      const motivo = motivoMap[ncData.motivoSunat] || ncData.motivoSunat || ncData.tipo || '';

      // Método devolución
      const metodoMap: Record<string, string> = {
        'EFECTIVO': 'Efectivo', 'TRANSFERENCIA': 'Transferencia Bancaria', 'VALE': 'Vale de Consumo'
      };
      const metodoDevolucion = metodoMap[ncData.metodoDevolucion] || ncData.metodoDevolucion || 'Vale';

      // Items
      const detalles = ncData.detalles || [];
      const itemsRows = detalles.map((item: any, idx: number) =>
        `<tr>
          <td class="td-c">${idx + 1}</td>
          <td class="td-l">${item.nombreProducto || 'Producto'}</td>
          <td class="td-c">UND</td>
          <td class="td-r">${item.cantidad}</td>
          <td class="td-r">${Number(item.precioUnitario).toFixed(2)}</td>
          <td class="td-r">${Number(item.subtotal).toFixed(2)}</td>
        </tr>`
      ).join('');

      // Totales
      const subtotal = Number(ncData.subtotal) || 0;
      const igv = Number(ncData.igv) || 0;
      const total = Number(ncData.total) || 0;
      const importeLetras = numeroALetras(total);

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Nota de Credito ${codigoNC}</title>
<style>
  @media print {
    body { margin: 0; padding: 10mm; }
    .no-print { display: none !important; }
    @page { margin: 10mm; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #000; max-width: 210mm; margin: 0 auto; padding: 15px; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
  .header-left { flex: 1; }
  .header-left h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
  .header-left p { font-size: 10px; line-height: 1.5; }
  .doc-box { border: 2px solid #000; padding: 10px 15px; text-align: center; min-width: 200px; }
  .doc-box .doc-type { font-size: 12px; font-weight: bold; margin-bottom: 6px; }
  .doc-box .doc-num { font-size: 14px; font-weight: bold; }
  .doc-box .doc-ruc { font-size: 11px; margin-bottom: 4px; }
  .client-section { border: 1px solid #000; padding: 8px 10px; margin-bottom: 10px; }
  .client-row { display: flex; margin-bottom: 3px; font-size: 10px; }
  .client-label { font-weight: bold; min-width: 160px; }
  .client-value { flex: 1; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
  th { background: #f0f0f0; border: 1px solid #000; padding: 5px 6px; font-size: 10px; font-weight: bold; text-align: center; }
  td { border: 1px solid #000; padding: 4px 6px; font-size: 10px; }
  .td-c { text-align: center; }
  .td-l { text-align: left; }
  .td-r { text-align: right; }
  .totals-section { display: flex; justify-content: space-between; margin-bottom: 10px; }
  .importe-letras { flex: 1; padding: 6px; border: 1px solid #000; font-size: 10px; margin-right: 10px; }
  .totals-table { min-width: 250px; }
  .totals-table td { border: 1px solid #000; padding: 4px 8px; font-size: 10px; }
  .totals-table .total-final { font-weight: bold; font-size: 12px; }
  .ref-box { border: 1px solid #000; padding: 8px 12px; margin-bottom: 10px; font-size: 10px; }
  .footer { text-align: center; border-top: 1px solid #000; padding-top: 8px; margin-top: 10px; font-size: 9px; }
  .footer p { margin-bottom: 2px; }
  .btn-print { display: block; margin: 20px auto; padding: 10px 30px; background: #333; color: white; border: none; cursor: pointer; font-size: 13px; }
</style>
</head><body>

<div class="header-row">
  <div class="header-left">
    <h1>${empRazonSocial}</h1>
    ${empRuc ? `<p><strong>RUC:</strong> ${empRuc}</p>` : ''}
    ${empDireccion ? `<p>${empDireccion}</p>` : ''}
    ${empTelefono ? `<p>Tel: ${empTelefono}</p>` : ''}
    ${empEmail ? `<p>${empEmail}</p>` : ''}
  </div>
  <div class="doc-box">
    ${empRuc ? `<div class="doc-ruc">RUC: ${empRuc}</div>` : ''}
    <div class="doc-type">NOTA DE CREDITO</div>
    <div class="doc-num">${serieNC}-${numeroNC}</div>
    <div style="font-size:10px;margin-top:4px">${codigoNC}</div>
  </div>
</div>

<div class="ref-box">
  <strong>DOCUMENTO QUE MODIFICA:</strong> ${saleData.codigoVenta} | Total Original: S/ ${Number(saleData.total).toFixed(2)}<br>
  <strong>MOTIVO:</strong> ${motivo}<br>
  <strong>METODO DE DEVOLUCION:</strong> ${metodoDevolucion}
  ${ncData.descripcion ? `<br><strong>OBSERVACIONES:</strong> ${ncData.descripcion}` : ''}
</div>

<div class="client-section">
  <div class="client-row">
    <span class="client-label">Fecha de Emision NC:</span>
    <span class="client-value">${fechaEmision}</span>
  </div>
  <div class="client-row">
    <span class="client-label">${clientTipoDoc}:</span>
    <span class="client-value">${clientNumDoc}</span>
  </div>
  <div class="client-row">
    <span class="client-label">Razon Social / Nombres:</span>
    <span class="client-value">${clientName}</span>
  </div>
  <div class="client-row">
    <span class="client-label">Direccion:</span>
    <span class="client-value">${clientDireccion}</span>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th style="width:30px">Item</th>
      <th>Producto Devuelto</th>
      <th style="width:40px">U.M.</th>
      <th style="width:50px">Cant.</th>
      <th style="width:70px">P. Unit.</th>
      <th style="width:70px">Total</th>
    </tr>
  </thead>
  <tbody>
    ${itemsRows}
  </tbody>
</table>

<div class="totals-section">
  <div class="importe-letras">
    <strong>SON:</strong> ${importeLetras}
  </div>
  <table class="totals-table">
    <tr><td>Subtotal NC</td><td class="td-r">S/ ${subtotal.toFixed(2)}</td></tr>
    ${igv > 0 ? `<tr><td>IGV 18%</td><td class="td-r">S/ ${igv.toFixed(2)}</td></tr>` : ''}
    <tr class="total-final"><td><strong>TOTAL NOTA DE CREDITO</strong></td><td class="td-r"><strong>S/ ${total.toFixed(2)}</strong></td></tr>
  </table>
</div>

<div class="footer">
  <p>Representacion impresa de NOTA DE CREDITO ELECTRONICA</p>
  <p>Autorizado mediante Resolucion de Superintendencia SUNAT</p>
</div>

<button class="btn-print no-print" onclick="window.print()">Imprimir</button>
</body></html>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
      }
    } catch (error: any) {
      alert('Error al generar nota de credito: ' + (error.message || 'Error desconocido'));
    }
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
    createCashRegister,
    updateCashRegister,
    toggleCashRegisterStatus,
    
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
    downloadInvoice,
    previewQuote,
    previewCreditNote
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
