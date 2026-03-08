import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../../../utils/api';
import { useNotification } from '../../../context/NotificationContext';

// Tipos
export type QuoteStatus = 'Pendiente' | 'Aceptada' | 'Convertida' | 'Rechazada' | 'Vencida' | 'Cancelada';

// Map backend uppercase status to frontend PascalCase
const statusFromBackend: Record<string, QuoteStatus> = {
  PENDIENTE: 'Pendiente',
  ACEPTADA: 'Aceptada',
  CONVERTIDA: 'Convertida',
  RECHAZADA: 'Rechazada',
  VENCIDA: 'Vencida',
  CANCELADA: 'Cancelada',
};
const statusToBackend: Record<QuoteStatus, string> = {
  Pendiente: 'PENDIENTE',
  Aceptada: 'ACEPTADA',
  Convertida: 'CONVERTIDA',
  Rechazada: 'RECHAZADA',
  Vencida: 'VENCIDA',
  Cancelada: 'CANCELADA',
};

export interface QuoteItem {
  id: string;
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  codigoCotizacion: string;
  clienteId: string | null;
  almacenId: string;
  usuarioId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  diasValidez: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: QuoteStatus;
  observaciones: string | null;
  motivoRechazo: string | null;
  intentosConversion: number;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
  cliente?: {
    id: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    numeroDocumento: string;
  } | null;
  usuario?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  salesConverted?: {
    id: string;
    codigoVenta: string;
    total: number;
    createdAt: string;
  }[];
}

export interface QuoteFilters {
  estado?: QuoteStatus | 'Todas';
  clienteId?: string;
  usuarioId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

export interface CreateQuoteInput {
  clienteId?: string;
  almacenId: string;
  usuarioId: string;
  diasValidez?: number;
  observaciones?: string;
  items: {
    productId: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

export interface ConvertToSaleInput {
  quoteId: string;
  userId: string;
  formaPago: string;
  tipoComprobante: string;
  cashSessionId: string;
}

interface QuotesContextType {
  quotes: Quote[];
  loading: boolean;
  filters: QuoteFilters;
  stats: {
    totalQuotes: number;
    pendientes: number;
    aceptadas: number;
    convertidas: number;
    rechazadas: number;
    vencidas: number;
    canceladas: number;
  };
  fetchQuotes: () => Promise<void>;
  createQuote: (data: CreateQuoteInput) => Promise<Quote>;
  getQuoteById: (id: string) => Promise<Quote>;
  updateQuote: (id: string, data: Partial<Quote>) => Promise<Quote>;
  updateQuoteStatus: (id: string, estado: QuoteStatus, motivoRechazo?: string) => Promise<Quote>;
  deleteQuote: (id: string) => Promise<void>;
  approveQuote: (id: string) => Promise<Quote>;
  rejectQuote: (id: string, motivoRechazo?: string) => Promise<Quote>;
  convertToSale: (data: ConvertToSaleInput) => Promise<any>;
  setFilters: (filters: QuoteFilters) => void;
  applyFilters: (filters: QuoteFilters) => void;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

const emptyStats = {
  totalQuotes: 0,
  pendientes: 0,
  aceptadas: 0,
  convertidas: 0,
  rechazadas: 0,
  vencidas: 0,
  canceladas: 0,
};

function computeStats(data: Quote[]) {
  return {
    totalQuotes: data.length,
    pendientes: data.filter(q => q.estado === 'Pendiente').length,
    aceptadas: data.filter(q => q.estado === 'Aceptada').length,
    convertidas: data.filter(q => q.estado === 'Convertida').length,
    rechazadas: data.filter(q => q.estado === 'Rechazada').length,
    vencidas: data.filter(q => q.estado === 'Vencida').length,
    canceladas: data.filter(q => q.estado === 'Cancelada').length,
  };
}

function mapBackendQuote(raw: any): Quote {
  return {
    ...raw,
    id: String(raw.id),
    clienteId: raw.clienteId ? String(raw.clienteId) : null,
    clienteNombre: raw.clienteNombre || null,
    cliente: raw.clienteNombre ? {
      id: raw.clienteId ? String(raw.clienteId) : '',
      nombres: raw.clienteNombre,
      apellidos: '',
      razonSocial: raw.clienteNombre,
      numeroDocumento: '',
    } : null,
    almacenId: String(raw.almacenId),
    usuarioId: String(raw.usuarioId),
    estado: statusFromBackend[raw.estado] || raw.estado,
    items: (raw.detalles || raw.items || []).map((d: any) => ({
      id: String(d.id),
      productId: String(d.productoId),
      nombreProducto: d.nombreProducto,
      cantidad: d.cantidad,
      precioUnitario: d.precioUnitario,
      subtotal: d.subtotal,
    })),
  };
}

export const QuotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<QuoteFilters>({});
  const [stats, setStats] = useState(emptyStats);

  const { showNotification } = useNotification();

  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('size', '100');
      if (filters.estado && filters.estado !== 'Todas') {
        params.append('estado', statusToBackend[filters.estado] || filters.estado);
      }
      if (filters.clienteId) params.append('clienteId', filters.clienteId);
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);

      const endpoint = `/cotizaciones?${params.toString()}`;
      const res = await apiService.get(endpoint);

      if (res.success) {
        const rawData: any[] = Array.isArray(res.data) ? res.data : (res.data as any)?.content || [];
        const data: Quote[] = rawData.map(mapBackendQuote);
        setQuotes(data);
        setStats(computeStats(data));
      } else {
        setQuotes([]);
        setStats(emptyStats);
      }
    } catch (error: any) {
      console.error('Error al obtener cotizaciones:', error);
      setQuotes([]);
      setStats(emptyStats);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const createQuote = useCallback(async (data: CreateQuoteInput): Promise<Quote> => {
    try {
      setLoading(true);
      const body: Record<string, unknown> = {
        almacenId: Number(data.almacenId),
        observaciones: data.observaciones,
        diasValidez: data.diasValidez,
        items: data.items.map(item => ({
          productoId: Number(item.productId),
          nombreProducto: item.nombreProducto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
        })),
      };
      if (data.clienteId) body.clienteId = Number(data.clienteId);

      const res = await apiService.post('/cotizaciones', body);

      if (!res.success || !res.data) {
        throw new Error(res.message || 'Error al crear cotizacion');
      }

      showNotification('success', 'Exito', 'Cotizacion creada exitosamente');
      await fetchQuotes();
      return res.data as Quote;
    } catch (error: any) {
      showNotification('error', 'Error', error.message || 'Error al crear cotizacion');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  const getQuoteById = useCallback(async (id: string): Promise<Quote> => {
    try {
      const res = await apiService.get(`/cotizaciones/${id}`);
      if (res.success && res.data) return mapBackendQuote(res.data);
      throw new Error(res.message || 'Error al obtener cotizacion');
    } catch (error: any) {
      showNotification('error', 'Error', error.message || 'Error al obtener cotizacion');
      throw error;
    }
  }, [showNotification]);

  const updateQuote = useCallback(async (id: string, data: Partial<Quote>): Promise<Quote> => {
    try {
      setLoading(true);
      const res = await apiService.put(`/cotizaciones/${id}`, data);
      if (res.success && res.data) {
        showNotification('success', 'Exito', 'Cotizacion actualizada');
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...data } : q));
        return res.data as Quote;
      }
      throw new Error(res.message || 'Error al actualizar cotizacion');
    } catch (error: any) {
      showNotification('error', 'Error', error.message || 'Error al actualizar cotizacion');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const updateQuoteStatus = useCallback(async (id: string, estado: QuoteStatus, motivoRechazo?: string): Promise<Quote> => {
    try {
      setLoading(true);
      const backendEstado = statusToBackend[estado] || estado;
      const res = await apiService.patch(`/cotizaciones/${id}/status`, { estado: backendEstado, motivoRechazo });
      const updatedQuote = (res as any).quote || res.data;
      if (estado !== 'Convertida') {
        showNotification('success', 'Exito', `Cotizacion ${estado.toLowerCase()} exitosamente`);
      }
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, estado } : q));
      return updatedQuote as Quote;
    } catch (error: any) {
      if (estado !== 'Convertida') {
        showNotification('error', 'Error', error.message || 'Error al actualizar estado');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const deleteQuote = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const res = await apiService.delete(`/cotizaciones/${id}`);
      if (res.success) {
        showNotification('success', 'Exito', 'Cotizacion eliminada');
        setQuotes(prev => prev.filter(q => q.id !== id));
      } else {
        throw new Error(res.message || 'Error al eliminar cotizacion');
      }
    } catch (error: any) {
      showNotification('error', 'Error', error.message || 'No se puede eliminar la cotizacion');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const approveQuote = useCallback(async (id: string): Promise<Quote> => {
    try {
      setLoading(true);
      const res = await apiService.patch(`/cotizaciones/${id}/status`, { estado: 'ACEPTADA' });
      if (res.success) {
        showNotification('success', 'Exito', 'Cotizacion aprobada');
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, estado: 'Aceptada' as QuoteStatus } : q));
        return mapBackendQuote(res.data);
      }
      throw new Error(res.message || 'Error al aprobar cotizacion');
    } catch (error: any) {
      showNotification('error', 'Error', error.message || 'Error al aprobar cotizacion');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const rejectQuote = useCallback(async (id: string, motivoRechazo?: string): Promise<Quote> => {
    try {
      setLoading(true);
      const res = await apiService.patch(`/cotizaciones/${id}/status`, { estado: 'RECHAZADA', motivoRechazo });
      if (res.success) {
        showNotification('info', 'Info', 'Cotizacion rechazada');
        setQuotes(prev => prev.map(q => q.id === id ? { ...q, estado: 'Rechazada' as QuoteStatus, motivoRechazo: motivoRechazo || null } : q));
        return mapBackendQuote(res.data);
      }
      throw new Error(res.message || 'Error al rechazar cotizacion');
    } catch (error: any) {
      showNotification('error', 'Error', error.message || 'Error al rechazar cotizacion');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const convertToSale = useCallback(async (data: ConvertToSaleInput): Promise<any> => {
    try {
      setLoading(true);
      const body = {
        sesionCajaId: data.cashSessionId ? Number(data.cashSessionId) : undefined,
        tipoComprobante: data.tipoComprobante,
      };
      const res = await apiService.post(`/cotizaciones/${data.quoteId}/convert`, body);
      await fetchQuotes();
      showNotification('success', 'Exito', 'Cotizacion convertida a venta');
      return res;
    } catch (error: any) {
      showNotification('error', 'Error', error.message || 'Error al convertir cotizacion');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  const setFilters = useCallback((newFilters: QuoteFilters) => {
    setFiltersState(newFilters);
  }, []);

  const applyFilters = useCallback((newFilters: QuoteFilters) => {
    setFiltersState(newFilters);
  }, []);

  const value: QuotesContextType = {
    quotes,
    loading,
    filters,
    stats,
    fetchQuotes,
    createQuote,
    getQuoteById,
    updateQuote,
    updateQuoteStatus,
    deleteQuote,
    approveQuote,
    rejectQuote,
    convertToSale,
    setFilters,
    applyFilters,
  };

  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
};

export const useQuotes = (): QuotesContextType => {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes debe ser usado dentro de un QuotesProvider');
  }
  return context;
};
