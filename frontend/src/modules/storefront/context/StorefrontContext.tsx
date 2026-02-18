/**
 * 🛍️ STOREFRONT CONTEXT
 * 
 * Contexto global para el storefront público.
 * Maneja: productos, carrito, favoritos, filtros.
 * Usa useReducer (nativo) como lo requiere el proyecto.
 * 
 * @module StorefrontContext
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode, Dispatch } from 'react';
import type {
  ProductoStorefront,
  ItemCarrito,
  ResumenCarrito,
  FiltrosProductos
} from '@monorepo/shared-types';
import {
  apiObtenerProductos
} from '../services/storefrontApi';

// ============================================================================
// TIPOS DEL ESTADO
// ============================================================================

interface StorefrontState {
  // Productos
  productos: ProductoStorefront[];
  productosLoading: boolean;
  productosError: string | null;
  
  // Filtros actuales
  filtrosActivos: FiltrosProductos;
  
  // Carrito
  carrito: ItemCarrito[];
  
  // Favoritos (solo IDs)
  favoritos: number[];
  
  // UI
  carritoAbierto: boolean;
  menuMovilAbierto: boolean;
  buscadorAbierto: boolean;
}

// ============================================================================
// ACCIONES
// ============================================================================

type StorefrontAction =
  | { type: 'SET_PRODUCTOS'; payload: ProductoStorefront[] }
  | { type: 'SET_PRODUCTOS_LOADING'; payload: boolean }
  | { type: 'SET_PRODUCTOS_ERROR'; payload: string }
  | { type: 'SET_FILTROS'; payload: FiltrosProductos }
  | { type: 'AGREGAR_AL_CARRITO'; payload: ItemCarrito }
  | { type: 'ACTUALIZAR_CANTIDAD_CARRITO'; payload: { indice: number; cantidad: number } }
  | { type: 'ELIMINAR_DEL_CARRITO'; payload: number }
  | { type: 'VACIAR_CARRITO' }
  | { type: 'TOGGLE_CARRITO' }
  | { type: 'ABRIR_CARRITO' }
  | { type: 'CERRAR_CARRITO' }
  | { type: 'TOGGLE_FAVORITO'; payload: number }
  | { type: 'TOGGLE_MENU_MOVIL' }
  | { type: 'TOGGLE_BUSCADOR' };

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: StorefrontState = {
  productos: [],
  productosLoading: false,
  productosError: null,
  filtrosActivos: {},
  carrito: JSON.parse(localStorage.getItem('nh_carrito') || '[]'),
  favoritos: JSON.parse(localStorage.getItem('nh_favoritos') || '[]'),
  carritoAbierto: false,
  menuMovilAbierto: false,
  buscadorAbierto: false
};

// ============================================================================
// REDUCER
// ============================================================================

function storefrontReducer(state: StorefrontState, action: StorefrontAction): StorefrontState {
  switch (action.type) {
    case 'SET_PRODUCTOS':
      return { ...state, productos: action.payload, productosLoading: false };
    
    case 'SET_PRODUCTOS_LOADING':
      return { ...state, productosLoading: action.payload };
    
    case 'SET_PRODUCTOS_ERROR':
      return { ...state, productosError: action.payload, productosLoading: false };
    
    case 'SET_FILTROS':
      return { ...state, filtrosActivos: action.payload };
    
    case 'AGREGAR_AL_CARRITO': {
      const nuevoItem = action.payload;
      const carritoActual = [...state.carrito];
      
      // Buscar si ya existe (mismo producto + talla + color)
      const indiceExistente = carritoActual.findIndex(
        item =>
          item.productoId === nuevoItem.productoId &&
          item.tallaId === nuevoItem.tallaId &&
          item.colorId === nuevoItem.colorId
      );
      
      if (indiceExistente > -1) {
        // Incrementar cantidad
        carritoActual[indiceExistente].cantidad += nuevoItem.cantidad;
      } else {
        // Agregar nuevo
        carritoActual.push(nuevoItem);
      }
      
      // Persistir
      localStorage.setItem('nh_carrito', JSON.stringify(carritoActual));
      
      return { ...state, carrito: carritoActual };
    }
    
    case 'ACTUALIZAR_CANTIDAD_CARRITO': {
      const { indice, cantidad } = action.payload;
      const carritoActual = [...state.carrito];
      
      if (carritoActual[indice]) {
        carritoActual[indice].cantidad = cantidad;
        
        // Si cantidad es 0 o negativa, eliminar
        if (cantidad <= 0) {
          carritoActual.splice(indice, 1);
        }
      }
      
      localStorage.setItem('nh_carrito', JSON.stringify(carritoActual));
      return { ...state, carrito: carritoActual };
    }
    
    case 'ELIMINAR_DEL_CARRITO': {
      const carritoActual = state.carrito.filter((_, idx) => idx !== action.payload);
      localStorage.setItem('nh_carrito', JSON.stringify(carritoActual));
      return { ...state, carrito: carritoActual };
    }
    
    case 'VACIAR_CARRITO':
      localStorage.removeItem('nh_carrito');
      return { ...state, carrito: [] };
    
    case 'TOGGLE_CARRITO':
      return { ...state, carritoAbierto: !state.carritoAbierto };
    
    case 'ABRIR_CARRITO':
      return { ...state, carritoAbierto: true };
    
    case 'CERRAR_CARRITO':
      return { ...state, carritoAbierto: false };
    
    case 'TOGGLE_FAVORITO': {
      const productoId = action.payload;
      const favoritosActuales = [...state.favoritos];
      const indice = favoritosActuales.indexOf(productoId);
      
      if (indice > -1) {
        // Quitar de favoritos
        favoritosActuales.splice(indice, 1);
      } else {
        // Agregar a favoritos
        favoritosActuales.push(productoId);
      }
      
      localStorage.setItem('nh_favoritos', JSON.stringify(favoritosActuales));
      return { ...state, favoritos: favoritosActuales };
    }
    
    case 'TOGGLE_MENU_MOVIL':
      return { ...state, menuMovilAbierto: !state.menuMovilAbierto };
    
    case 'TOGGLE_BUSCADOR':
      return { ...state, buscadorAbierto: !state.buscadorAbierto };
    
    default:
      return state;
  }
}

// ============================================================================
// CONTEXTO
// ============================================================================

interface StorefrontContextType {
  state: StorefrontState;
  dispatch: Dispatch<StorefrontAction>;
  
  // Métodos de conveniencia
  cargarProductos: (filtros?: FiltrosProductos) => Promise<void>;
  agregarAlCarrito: (productoId: number, cantidad?: number, tallaId?: number | null, colorId?: number | null) => void;
  actualizarCantidadCarrito: (indice: number, delta: number) => void;
  eliminarDelCarrito: (indice: number) => void;
  vaciarCarrito: () => void;
  toggleFavorito: (productoId: number) => void;
  esFavorito: (productoId: number) => boolean;
  obtenerResumenCarrito: () => ResumenCarrito;
}

const StorefrontContext = createContext<StorefrontContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface StorefrontProviderProps {
  children: ReactNode;
}

export function StorefrontProvider({ children }: StorefrontProviderProps) {
  const [state, dispatch] = useReducer(storefrontReducer, initialState);
  
  // Cargar productos con filtros
  const cargarProductos = async (filtros: FiltrosProductos = {}) => {
    dispatch({ type: 'SET_PRODUCTOS_LOADING', payload: true });
    dispatch({ type: 'SET_FILTROS', payload: filtros });
    
    try {
      const response = await apiObtenerProductos(filtros);
      dispatch({ type: 'SET_PRODUCTOS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_PRODUCTOS_ERROR', payload: 'Error al cargar productos' });
      console.error('Error cargarProductos:', error);
    }
  };
  
  // Agregar al carrito
  const agregarAlCarrito = (productoId: number, cantidad: number = 1, tallaId: number | null = null, colorId: number | null = null) => {
    // Buscar producto
    const producto = state.productos.find(p => p.id === productoId);
    if (!producto || !producto.stockTotal || producto.stockTotal === 0) {
      console.warn('Producto no disponible');
      return;
    }

    // Obtener talla y color (usar los primeros disponibles si no se especifican)
    const tallaIdFinal = tallaId || producto.tallasDisponibles?.[0] || null;
    const colorIdFinal = colorId || producto.coloresDisponibles?.[0] || null;

    // Crear item del carrito
    const item: ItemCarrito = {
      productoId: producto.id,
      sku: producto.sku,
      nombreProducto: producto.nombre,
      slug: producto.slug,
      marca: producto.marcaNombre || '',
      precioUnitario: producto.enLiquidacion && producto.precioLiquidacion 
        ? producto.precioLiquidacion 
        : producto.precioVenta,
      imagen: producto.imagenUrl || '',
      tallaId: tallaIdFinal,
      tallaCodigo: '', // Se puede resolver desde storefrontApi
      colorId: colorIdFinal,
      colorNombre: '',
      colorHex: '',
      cantidad
    };

    dispatch({ type: 'AGREGAR_AL_CARRITO', payload: item });
  };
  
  // Actualizar cantidad (delta puede ser +1 o -1)
  const actualizarCantidadCarrito = (indice: number, delta: number) => {
    const item = state.carrito[indice];
    if (!item) return;
    
    const nuevaCantidad = item.cantidad + delta;
    dispatch({ type: 'ACTUALIZAR_CANTIDAD_CARRITO', payload: { indice, cantidad: nuevaCantidad } });
  };
  
  // Eliminar del carrito
  const eliminarDelCarrito = (indice: number) => {
    dispatch({ type: 'ELIMINAR_DEL_CARRITO', payload: indice });
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    dispatch({ type: 'VACIAR_CARRITO' });
  };
  
  // Toggle favorito
  const toggleFavorito = (productoId: number) => {
    dispatch({ type: 'TOGGLE_FAVORITO', payload: productoId });
  };
  
  // Verificar si es favorito
  const esFavorito = (productoId: number): boolean => {
    return state.favoritos.includes(productoId);
  };
  
  // Obtener resumen del carrito
  const obtenerResumenCarrito = (): ResumenCarrito => {
    const subtotal = state.carrito.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
    const envio = subtotal >= 150 ? 0 : 15; // Envío gratis si subtotal >= S/.150
    const descuento = 0; // Por ahora sin descuentos adicionales
    const total = subtotal + envio - descuento;
    const cantidadItems = state.carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    return {
      items: state.carrito,
      subtotal,
      envio,
      descuento,
      total,
      cantidadItems
    };
  };
  
  // Cargar productos al montar (página inicial)
  useEffect(() => {
    cargarProductos();
  }, []);
  
  const value: StorefrontContextType = {
    state,
    dispatch,
    cargarProductos,
    agregarAlCarrito,
    actualizarCantidadCarrito,
    eliminarDelCarrito,
    vaciarCarrito,
    toggleFavorito,
    esFavorito,
    obtenerResumenCarrito
  };
  
  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) {
    throw new Error('useStorefront debe usarse dentro de un StorefrontProvider');
  }
  return context;
}
