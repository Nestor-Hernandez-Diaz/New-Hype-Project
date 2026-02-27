/**
 * 🔍 HOOK: useProductFilters
 * 
 * Hook customizado para gestionar filtros y búsqueda de productos.
 * Extrae la lógica de filtros del StorefrontContext para mejor organización.
 * 
 * @module useProductFilters
 */

import { useCallback, useMemo } from 'react';
import { useStorefront } from '../context/StorefrontContext';
import type { FiltrosProductos, ProductoStorefront } from '@monorepo/shared-types';

export interface UseProductFiltersReturn {
  // Estado
  productos: ProductoStorefront[];
  productosFiltrados: ProductoStorefront[];
  filtrosActivos: FiltrosProductos;
  loading: boolean;
  error: string | null;
  
  // Acciones
  aplicarFiltros: (filtros: FiltrosProductos) => Promise<void>;
  limpiarFiltros: () => Promise<void>;
  buscar: (termino: string) => Promise<void>;
  
  // Utilidades
  obtenerCategorias: () => string[];
  obtenerMarcas: () => string[];
  obtenerRangoPrecio: () => { min: number; max: number };
}

/**
 * Hook para gestionar filtros de productos del storefront
 */
export function useProductFilters(): UseProductFiltersReturn {
  const { state, cargarProductos } = useStorefront();
  
  // ========================================================================
  // PRODUCTOS FILTRADOS (Cliente-side)
  // ========================================================================
  
  /**
   * Filtrar productos en el cliente (para filtros adicionales no manejados por el backend)
   */
  const productosFiltrados = useMemo(() => {
    let resultado = [...state.productos];
    
    // Si hay búsqueda, filtrar por término
    if (state.filtrosActivos.busqueda) {
      const termino = state.filtrosActivos.busqueda.toLowerCase().trim();
      resultado = resultado.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.marcaNombre?.toLowerCase().includes(termino) ||
        p.descripcion?.toLowerCase().includes(termino) ||
        p.sku.toLowerCase().includes(termino)
      );
    }
    
    // Filtrar por stock (solo mostrar con stock)
    if (state.filtrosActivos.soloConStock) {
      resultado = resultado.filter(p => p.stockTotal && p.stockTotal > 0);
    }
    
    // Filtrar por liquidación
    if (state.filtrosActivos.enLiquidacion) {
      resultado = resultado.filter(p => p.enLiquidacion);
    }
    
    return resultado;
  }, [state.productos, state.filtrosActivos]);
  
  // ========================================================================
  // ACCIONES
  // ========================================================================
  
  /**
   * Aplicar nuevos filtros (recarga productos desde backend si es necesario)
   */
  const aplicarFiltros = useCallback(async (filtros: FiltrosProductos) => {
    await cargarProductos(filtros);
  }, [cargarProductos]);
  
  /**
   * Limpiar todos los filtros
   */
  const limpiarFiltros = useCallback(async () => {
    await cargarProductos({});
  }, [cargarProductos]);
  
  /**
   * Buscar productos por término
   */
  const buscar = useCallback(async (termino: string) => {
    const filtrosConBusqueda: FiltrosProductos = {
      ...state.filtrosActivos,
      busqueda: termino.trim()
    };
    await cargarProductos(filtrosConBusqueda);
  }, [state.filtrosActivos, cargarProductos]);
  
  // ========================================================================
  // UTILIDADES
  // ========================================================================
  
  /**
   * Obtener lista única de categorías disponibles
   */
  const obtenerCategorias = useCallback((): string[] => {
    const categorias = state.productos
      .map(p => p.categoriaNombre)
      .filter((cat): cat is string => Boolean(cat));
    
    return [...new Set(categorias)].sort();
  }, [state.productos]);
  
  /**
   * Obtener lista única de marcas disponibles
   */
  const obtenerMarcas = useCallback((): string[] => {
    const marcas = state.productos
      .map(p => p.marcaNombre)
      .filter((marca): marca is string => Boolean(marca));
    
    return [...new Set(marcas)].sort();
  }, [state.productos]);
  
  /**
   * Calcular rango de precios de los productos actuales
   */
  const obtenerRangoPrecio = useCallback((): { min: number; max: number } => {
    if (state.productos.length === 0) {
      return { min: 0, max: 1000 };
    }
    
    const precios = state.productos.map(p => 
      p.enLiquidacion && p.precioLiquidacion 
        ? p.precioLiquidacion 
        : p.precioVenta
    );
    
    return {
      min: Math.floor(Math.min(...precios)),
      max: Math.ceil(Math.max(...precios))
    };
  }, [state.productos]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Estado
    productos: state.productos,
    productosFiltrados,
    filtrosActivos: state.filtrosActivos,
    loading: state.productosLoading,
    error: state.productosError,
    
    // Acciones
    aplicarFiltros,
    limpiarFiltros,
    buscar,
    
    // Utilidades
    obtenerCategorias,
    obtenerMarcas,
    obtenerRangoPrecio
  };
}
