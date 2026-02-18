/**
 * 📦 GRILLA DE PRODUCTOS
 * 
 * Grid responsive que muestra productos usando ProductCard.
 */

import type { ProductoStorefront } from '@monorepo/shared-types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  productos: ProductoStorefront[];
  loading?: boolean;
}

export default function ProductGrid({ productos, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (productos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold mb-2">No se encontraron productos</h3>
        <p className="text-gray-500">Intenta ajustar los filtros o buscar algo diferente.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {productos.map(producto => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
      
      {/* Animación CSS */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
