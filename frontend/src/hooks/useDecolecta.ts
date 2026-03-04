import { useState, useCallback } from 'react';
import {
  buscarPorRUC,
  buscarPorDNI,
  type SunatRucData,
  type ReniecDniData,
} from '../services/decolectaApi';

interface UseDecolectaReturn {
  buscarRUC: (ruc: string) => Promise<SunatRucData | null>;
  buscarDNI: (dni: string) => Promise<ReniecDniData | null>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook para consultar RUC/DNI via Decolecta API.
 *
 * Uso:
 * ```tsx
 * const { buscarRUC, buscarDNI, loading, error } = useDecolecta();
 * const data = await buscarRUC('20100047218');
 * ```
 */
export function useDecolecta(): UseDecolectaReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarRUC = useCallback(async (ruc: string): Promise<SunatRucData | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await buscarPorRUC(ruc);
      return data;
    } catch (err: any) {
      const msg = err?.message || 'Error al consultar RUC';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarDNI = useCallback(async (dni: string): Promise<ReniecDniData | null> => {
    setLoading(true);
    setError(null);
    try {
      const data = await buscarPorDNI(dni);
      return data;
    } catch (err: any) {
      const msg = err?.message || 'Error al consultar DNI';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { buscarRUC, buscarDNI, loading, error, clearError };
}
