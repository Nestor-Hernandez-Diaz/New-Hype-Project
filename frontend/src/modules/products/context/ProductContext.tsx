
import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useUI } from '../../../context/UIContext';
import { useNotification } from '../../../context/NotificationContext';
import type {
  Producto,
  ProductosPaginados,
  CrearProductoDTO,
  ActualizarProductoDTO,
  ProductoFiltros,
  Categoria,
  UnidadMedida,
} from '@monorepo/shared-types';
import * as productosMockApi from '../services/productosMockApi';

// ============= TIPOS DE ESTADO Y ACCIONES =============

interface ProductosState {
  productos: Producto[];
  categorias: Categoria[];
  unidadesMedida: UnidadMedida[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  loading: boolean;
  error: string | null;
}

type ProductosAction =
  | { type: 'FETCH_PRODUCTOS_START' }
  | { type: 'FETCH_PRODUCTOS_SUCCESS'; payload: ProductosPaginados }
  | { type: 'FETCH_PRODUCTOS_ERROR'; payload: string }
  | { type: 'FETCH_CATEGORIAS_SUCCESS'; payload: Categoria[] }
  | { type: 'FETCH_UNIDADES_SUCCESS'; payload: UnidadMedida[] }
  | { type: 'CREATE_PRODUCTO_SUCCESS'; payload: Producto }
  | { type: 'UPDATE_PRODUCTO_SUCCESS'; payload: Producto }
  | { type: 'DELETE_PRODUCTO_SUCCESS'; payload: string };

// ============= REDUCER =============

const initialState: ProductosState = {
  productos: [],
  categorias: [],
  unidadesMedida: [],
  pagination: null,
  loading: false,
  error: null,
};

function productosReducer(state: ProductosState, action: ProductosAction): ProductosState {
  switch (action.type) {
    case 'FETCH_PRODUCTOS_START':
      return { ...state, loading: true, error: null };

    case 'FETCH_PRODUCTOS_SUCCESS':
      return {
        ...state,
        loading: false,
        productos: action.payload.productos,
        pagination: action.payload.pagination,
      };

    case 'FETCH_PRODUCTOS_ERROR':
      return { ...state, loading: false, error: action.payload };

    case 'FETCH_CATEGORIAS_SUCCESS':
      return { ...state, categorias: action.payload };

    case 'FETCH_UNIDADES_SUCCESS':
      return { ...state, unidadesMedida: action.payload };

    case 'CREATE_PRODUCTO_SUCCESS':
      return {
        ...state,
        productos: [...state.productos, action.payload],
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total + 1 }
          : null,
      };

    case 'UPDATE_PRODUCTO_SUCCESS':
      return {
        ...state,
        productos: state.productos.map(p =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'DELETE_PRODUCTO_SUCCESS':
      return {
        ...state,
        productos: state.productos.filter(p => p.id !== action.payload),
        pagination: state.pagination
          ? { ...state.pagination, total: state.pagination.total - 1 }
          : null,
      };

    default:
      return state;
  }
}

// ============= CONTEXT TYPE =============

interface ProductContextType {
  // Estado
  products: Producto[];
  categorias: Categoria[];
  unidadesMedida: UnidadMedida[];
  pagination: ProductosState['pagination'];
  loading: boolean;
  error: string | null;

  // Métodos
  loadProducts: (filtros?: ProductoFiltros) => Promise<void>;
  addProduct: (data: CrearProductoDTO) => Promise<void>;
  updateProduct: (id: string, data: ActualizarProductoDTO) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Producto | undefined;
  loadCategorias: () => Promise<void>;
  loadUnidadesMedida: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ============= PROVIDER =============

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productosReducer, initialState);
  const { setIsLoading } = useUI();
  const { showSuccess, showError } = useNotification();

  // ========== LOAD PRODUCTOS ==========
  const loadProducts = useCallback(async (filtros?: ProductoFiltros) => {
    try {
      dispatch({ type: 'FETCH_PRODUCTOS_START' });
      setIsLoading(true);

      const response = await productosMockApi.getProductos(filtros);
      dispatch({ type: 'FETCH_PRODUCTOS_SUCCESS', payload: response });
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al cargar productos';
      dispatch({ type: 'FETCH_PRODUCTOS_ERROR', payload: mensaje });
      showError(mensaje);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showError]);

  // ========== CREATE PRODUCTO ==========
  const addProduct = useCallback(async (data: CrearProductoDTO) => {
    try {
      setIsLoading(true);
      const nuevoProducto = await productosMockApi.crearProducto(data);
      dispatch({ type: 'CREATE_PRODUCTO_SUCCESS', payload: nuevoProducto });
      showSuccess(`Producto ${data.nombreProducto} creado exitosamente`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al crear producto';
      showError(mensaje);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showSuccess, showError]);

  // ========== UPDATE PRODUCTO ==========
  const updateProduct = useCallback(async (id: string, data: ActualizarProductoDTO) => {
    try {
      setIsLoading(true);
      const productoActualizado = await productosMockApi.actualizarProducto(id, data);
      dispatch({ type: 'UPDATE_PRODUCTO_SUCCESS', payload: productoActualizado });
      showSuccess('Producto actualizado exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al actualizar producto';
      showError(mensaje);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showSuccess, showError]);

  // ========== DELETE PRODUCTO ==========
  const deleteProduct = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      await productosMockApi.eliminarProducto(id);
      dispatch({ type: 'DELETE_PRODUCTO_SUCCESS', payload: id });
      showSuccess('Producto eliminado exitosamente');
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error al eliminar producto';
      showError(mensaje);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showSuccess, showError]);

  // ========== GET BY ID ==========
  const getProductById = useCallback((id: string) => {
    return state.productos.find(p => p.id === id);
  }, [state.productos]);

  // ========== LOAD CATEGORIAS ==========
  const loadCategorias = useCallback(async () => {
    try {
      const categorias = await productosMockApi.getCategorias();
      dispatch({ type: 'FETCH_CATEGORIAS_SUCCESS', payload: categorias });
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }, []);

  // ========== LOAD UNIDADES ==========
  const loadUnidadesMedida = useCallback(async () => {
    try {
      const unidades = await productosMockApi.getUnidadesMedida();
      dispatch({ type: 'FETCH_UNIDADES_SUCCESS', payload: unidades });
    } catch (error) {
      console.error('Error cargando unidades:', error);
    }
  }, []);

  // ========== INICIALIZACIÓN ==========
  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
    if (token) {
      loadProducts();
      loadCategorias();
      loadUnidadesMedida();
    }
  }, [loadProducts, loadCategorias, loadUnidadesMedida]);

  return (
    <ProductContext.Provider
      value={{
        products: state.productos,
        categorias: state.categorias,
        unidadesMedida: state.unidadesMedida,
        pagination: state.pagination,
        loading: state.loading,
        error: state.error,
        loadProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        loadCategorias,
        loadUnidadesMedida,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

// ============= HOOK =============

export const useProducts = (): ProductContextType => {
  const context = React.useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
