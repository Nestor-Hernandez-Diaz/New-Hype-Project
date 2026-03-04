/**
 * 🔗 PRODUCTOS RELACIONADOS
 * 
 * Carrusel de productos relacionados o recomendados.
 * 
 * @example
 * <RelatedProducts productoActualId={producto.id} categoriaId={producto.categoriaId} />
 */

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ProductoStorefront } from '@monorepo/shared-types';
import { apiObtenerProductos } from '../../services/storefrontApi';
import ProductCard from '../ProductCard';

interface RelatedProductsProps {
  /**
   * ID del producto actual (para excluirlo)
   */
  productoActualId: number;
  
  /**
   * ID de categoría para filtrar productos similares
   */
  categoriaId?: number;
  
  /**
   * Título de la sección
   * @default "También te puede gustar"
   */
  titulo?: string;
}

export default function RelatedProducts({ 
  productoActualId, 
  categoriaId,
  titulo = "También te puede gustar"
}: RelatedProductsProps) {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<ProductoStorefront[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useState<HTMLDivElement | null>(null)[0];
  
  useEffect(() => {
    const cargarProductosRelacionados = async () => {
      setLoading(true);
      try {
        const data = await apiObtenerProductos();
        
        // Filtrar productos relacionados
        let relacionados = data.filter(p => p.id !== productoActualId);
        
        // Si hay categoría, priorizar productos de la misma categoría
        if (categoriaId) {
          relacionados = relacionados
            .sort((a, b) => {
              const aMatch = a.categoriaId === categoriaId ? 1 : 0;
              const bMatch = b.categoriaId === categoriaId ? 1 : 0;
              return bMatch - aMatch;
            });
        }
        
        // Limitar a 8 productos
        setProductos(relacionados.slice(0, 8));
      } catch (error) {
        console.error('Error al cargar productos relacionados:', error);
      } finally {
        setLoading(false);
      }
    };
    
    cargarProductosRelacionados();
  }, [productoActualId, categoriaId]);
  
  const handleScroll = (direction: 'left' | 'right') => {
    if (!containerRef) return;
    
    const scrollAmount = 300;
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    containerRef.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };
  
  if (loading) {
    return (
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-6">{titulo}</h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[280px]">
              <div className="aspect-[3/4] bg-gray-200 rounded-2xl animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (productos.length === 0) {
    return null;
  }
  
  return (
    <div className="py-12 border-t border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{titulo}</h2>
        
        {productos.length > 4 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="
                p-2 border border-gray-300 rounded-full
                hover:bg-gray-100 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
              "
              disabled={scrollPosition === 0}
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="
                p-2 border border-gray-300 rounded-full
                hover:bg-gray-100 transition-colors
              "
              aria-label="Siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      
      {/* Grid de productos */}
      <div 
        className="
          flex gap-4 overflow-x-auto scrollbar-hide pb-4
          md:grid md:grid-cols-4 md:overflow-visible
        "
      >
        {productos.map((producto) => (
          <div key={producto.id} className="flex-shrink-0 w-[280px] md:w-auto">
            <ProductCard producto={producto} />
          </div>
        ))}
      </div>
      
      {/* Botón para ver más */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate('/storefront/catalogo')}
          className="
            px-8 py-3 border-2 border-black rounded-full
            font-medium hover:bg-black hover:text-white
            transition-all
          "
        >
          Ver todo el catálogo
        </button>
      </div>
    </div>
  );
}
