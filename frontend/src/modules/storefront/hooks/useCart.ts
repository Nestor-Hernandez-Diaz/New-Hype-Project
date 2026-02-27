/**
 * 🛒 HOOK: useCart
 * 
 * Hook customizado para gestionar el carrito de compras.
 * Extrae la lógica del carrito del StorefrontContext para mejor organización.
 * 
 * @module useCart
 */

import { useCallback, useMemo } from 'react';
import { useStorefront } from '../context/StorefrontContext';
import type { ItemCarrito, ResumenCarrito } from '@monorepo/shared-types';

export interface UseCartReturn {
  // Estado
  items: ItemCarrito[];
  resumen: ResumenCarrito;
  cantidadTotal: number;
  carritoVacio: boolean;
  carritoAbierto: boolean;
  
  // Acciones
  agregar: (
    productoId: number, 
    cantidad?: number, 
    tallaId?: number | null, 
    colorId?: number | null
  ) => void;
  incrementar: (indice: number) => void;
  decrementar: (indice: number) => void;
  actualizarCantidad: (indice: number, cantidad: number) => void;
  eliminar: (indice: number) => void;
  vaciar: () => void;
  
  // UI
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
  toggleCarrito: () => void;
  
  // Utilidades
  calcularSubtotal: () => number;
  calcularEnvio: (subtotal: number) => number;
  obtenerProducto: (indice: number) => ItemCarrito | undefined;
  contarItems: () => number;
  envioGratis: boolean;
  faltaParaEnvioGratis: number;
}

/**
 * Hook para gestionar el carrito de compras del storefront
 */
export function useCart(): UseCartReturn {
  const { state, dispatch, agregarAlCarrito, actualizarCantidadCarrito, eliminarDelCarrito, vaciarCarrito, obtenerResumenCarrito } = useStorefront();
  
  // ========================================================================
  // ESTADO DERIVADO
  // ========================================================================
  
  /**
   * Resumen completo del carrito
   */
  const resumen = useMemo(() => {
    return obtenerResumenCarrito();
  }, [obtenerResumenCarrito]);
  
  /**
   * Cantidad total de items (suma de cantidades)
   */
  const cantidadTotal = useMemo(() => {
    return state.carrito.reduce((sum, item) => sum + item.cantidad, 0);
  }, [state.carrito]);
  
  /**
   * Verificar si el carrito está vacío
   */
  const carritoVacio = useMemo(() => {
    return state.carrito.length === 0;
  }, [state.carrito]);
  
  /**
   * Verificar si aplica envío gratis (subtotal >= S/.150)
   */
  const envioGratis = useMemo(() => {
    return resumen.subtotal >= 150;
  }, [resumen.subtotal]);
  
  /**
   * Calcular cuánto falta para envío gratis
   */
  const faltaParaEnvioGratis = useMemo(() => {
    if (envioGratis) return 0;
    return Math.max(0, 150 - resumen.subtotal);
  }, [envioGratis, resumen.subtotal]);
  
  // ========================================================================
  // ACCIONES
  // ========================================================================
  
  /**
   * Agregar producto al carrito (wrapper del context)
   */
  const agregar = useCallback((
    productoId: number,
    cantidad: number = 1,
    tallaId: number | null = null,
    colorId: number | null = null
  ) => {
    agregarAlCarrito(productoId, cantidad, tallaId, colorId);
  }, [agregarAlCarrito]);
  
  /**
   * Incrementar cantidad de un item (+1)
   */
  const incrementar = useCallback((indice: number) => {
    actualizarCantidadCarrito(indice, 1);
  }, [actualizarCantidadCarrito]);
  
  /**
   * Decrementar cantidad de un item (-1)
   */
  const decrementar = useCallback((indice: number) => {
    actualizarCantidadCarrito(indice, -1);
  }, [actualizarCantidadCarrito]);
  
  /**
   * Actualizar cantidad directamente (setter)
   */
  const actualizarCantidad = useCallback((indice: number, cantidad: number) => {
    const item = state.carrito[indice];
    if (!item) return;
    
    const delta = cantidad - item.cantidad;
    actualizarCantidadCarrito(indice, delta);
  }, [state.carrito, actualizarCantidadCarrito]);
  
  /**
   * Eliminar item del carrito
   */
  const eliminar = useCallback((indice: number) => {
    eliminarDelCarrito(indice);
  }, [eliminarDelCarrito]);
  
  /**
   * Vaciar carrito completo
   */
  const vaciar = useCallback(() => {
    vaciarCarrito();
  }, [vaciarCarrito]);
  
  // ========================================================================
  // UI
  // ========================================================================
  
  /**
   * Abrir sidebar del carrito
   */
  const abrirCarrito = useCallback(() => {
    dispatch({ type: 'ABRIR_CARRITO' });
  }, [dispatch]);
  
  /**
   * Cerrar sidebar del carrito
   */
  const cerrarCarrito = useCallback(() => {
    dispatch({ type: 'CERRAR_CARRITO' });
  }, [dispatch]);
  
  /**
   * Toggle sidebar del carrito
   */
  const toggleCarrito = useCallback(() => {
    dispatch({ type: 'TOGGLE_CARRITO' });
  }, [dispatch]);
  
  // ========================================================================
  // UTILIDADES
  // ========================================================================
  
  /**
   * Calcular subtotal (suma de precioUnitario * cantidad)
   */
  const calcularSubtotal = useCallback((): number => {
    return state.carrito.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
  }, [state.carrito]);
  
  /**
   * Calcular costo de envío según subtotal
   */
  const calcularEnvio = useCallback((subtotal: number): number => {
    return subtotal >= 150 ? 0 : 15;
  }, []);
  
  /**
   * Obtener item del carrito por índice
   */
  const obtenerProducto = useCallback((indice: number): ItemCarrito | undefined => {
    return state.carrito[indice];
  }, [state.carrito]);
  
  /**
   * Contar cantidad de items únicos en el carrito
   */
  const contarItems = useCallback((): number => {
    return state.carrito.length;
  }, [state.carrito]);
  
  // ========================================================================
  // RETURN
  // ========================================================================
  
  return {
    // Estado
    items: state.carrito,
    resumen,
    cantidadTotal,
    carritoVacio,
    carritoAbierto: state.carritoAbierto,
    
    // Acciones
    agregar,
    incrementar,
    decrementar,
    actualizarCantidad,
    eliminar,
    vaciar,
    
    // UI
    abrirCarrito,
    cerrarCarrito,
    toggleCarrito,
    
    // Utilidades
    calcularSubtotal,
    calcularEnvio,
    obtenerProducto,
    contarItems,
    envioGratis,
    faltaParaEnvioGratis
  };
}
