/**
 * ❤️ PÁGINA DE FAVORITOS
 * 
 * Muestra los productos marcados como favoritos por el usuario
 */

import { useEffect, useState } from 'react';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useStorefront } from '../context/StorefrontContext';
import { apiObtenerProductoPorId } from '../services/storefrontApi';
import ProductCard from '../components/product/ProductCard';
import type { ProductoStorefront } from '@monorepo/shared-types';

export default function Favorites() {
  const { state, toggleFavorito, agregarAlCarrito } = useStorefront();
  const [productosCompletos, setProductosCompletos] = useState<ProductoStorefront[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarFavoritos = async () => {
      try {
        setLoading(true);
        
        // Obtener IDs de favoritos
        const favoritosIds = state.favoritos;
        
        if (favoritosIds.length === 0) {
          setProductosCompletos([]);
          setLoading(false);
          return;
        }

        // Cargar productos completos
        const productosPromises = favoritosIds.map(id => apiObtenerProductoPorId(id));
        const productos = await Promise.all(productosPromises);
        
        setProductosCompletos(productos.filter(p => p !== null) as ProductoStorefront[]);
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarFavoritos();
  }, [state.favoritos]);

  const handleEliminarFavorito = (productoId: number) => {
    toggleFavorito(productoId);
  };

  const handleAgregarAlCarrito = (producto: ProductoStorefront) => {
    const tallaId = producto.tallasDisponibles?.[0];
    const colorId = producto.coloresDisponibles?.[0];
    
    if (producto.stockTotal && producto.stockTotal > 0) {
      agregarAlCarrito(producto.id, 1, tallaId, colorId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando favoritos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Heart size={32} className="mr-3 text-red-500" fill="currentColor" />
            <h1 className="text-4xl font-bebas tracking-wider">MIS FAVORITOS</h1>
          </div>
          <p className="text-gray-600">
            {productosCompletos.length === 0 
              ? 'Aún no tienes productos favoritos' 
              : `${productosCompletos.length} producto${productosCompletos.length !== 1 ? 's' : ''} guardado${productosCompletos.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Contenido */}
        {productosCompletos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold mb-2">No hay favoritos aún</h2>
            <p className="text-gray-600 mb-6">Marca tus productos favoritos para verlos aquí</p>
            <a
              href="/storefront"
              className="inline-block px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
            >
              Ver Productos
            </a>
          </div>
        ) : (
          <>
            {/* Grid de productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {productosCompletos.map(producto => (
                <div key={producto.id} className="relative">
                  <ProductCard producto={producto} />
                  
                  {/* Botón de eliminar superpuesto */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarFavorito(producto.id);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition"
                    title="Eliminar de favoritos"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">¿Listo para comprar?</h3>
                  <p className="text-sm text-gray-600">
                    Agrega tus favoritos al carrito y finaliza tu compra
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Agregar todos al carrito
                      productosCompletos.forEach(producto => {
                        if (producto.stockTotal && producto.stockTotal > 0) {
                          handleAgregarAlCarrito(producto);
                        }
                      });
                    }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Agregar Todos al Carrito
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
