/**
 * 🛍️ TARJETA DE PRODUCTO
 * 
 * Componente reutilizable para mostrar un producto en la grilla.
 * Incluye imagen con hover, insignias, precio, colores y acciones.
 */

import { Heart, ShoppingBag } from 'lucide-react';
import type { ProductoStorefront } from '@monorepo/shared-types';
import { useStorefront } from '../../context/StorefrontContext';
import { useNavigate } from 'react-router-dom';
import { calcularPrecioLiquidacion, esProductoNuevo, obtenerColor, obtenerImagenesProducto, obtenerTalla } from '../../services/storefrontApi';
import { useState } from 'react';

interface ProductCardProps {
  producto: ProductoStorefront;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { dispatch, esFavorito, toggleFavorito } = useStorefront();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const precioFinal = calcularPrecioLiquidacion(producto);
  const descuento = producto.enLiquidacion ? producto.porcentajeLiquidacion : 0;
  const esNuevo = esProductoNuevo(producto);
  const imagenes = obtenerImagenesProducto(producto.id);
  const imgHover = imagenes.length > 1 ? imagenes[1].url : null;
  const isFav = esFavorito(producto.id);
  
  const handleAgregarRapido = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Si no tiene stock, no hacer nada
    if (producto.stockTotal === 0) return;
    
    // Agregar al carrito con primera talla y color disponibles
    const tallaId = producto.tallasDisponibles[0] || null;
    const colorId = producto.coloresDisponibles[0] || null;
    
    // Obtener info de talla y color para el carrito
    const talla = producto.tallasDisponibles[0] 
      ? obtenerTalla(producto.tallasDisponibles[0])
      : null;
    const color = producto.coloresDisponibles[0]
      ? obtenerColor(producto.coloresDisponibles[0])
      : null;
    
    dispatch({
      type: 'AGREGAR_AL_CARRITO',
      payload: {
        productoId: producto.id,
        sku: producto.sku,
        nombreProducto: producto.nombre,
        slug: producto.slug,
        marca: producto.marca.nombre,
        precioUnitario: precioFinal,
        imagen: producto.imagenUrl,
        tallaId: tallaId,
        tallaCodigo: talla?.codigo || '',
        colorId: colorId,
        colorNombre: color?.nombre || '',
        colorHex: color?.codigoHex || '#000',
        cantidad: 1
      }
    });
    
    // Abrir carrito
    dispatch({ type: 'ABRIR_CARRITO' });
  };
  
  const handleToggleFavorito = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorito(producto.id);
  };
  
  return (
    <div
      onClick={() => navigate(`/storefront/producto/${producto.slug}`)}
      className="group cursor-pointer animate-fade-in-up"
    >
      {/* Contenedor de imagen */}
      <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-3">
        {/* Imagen principal */}
        <img
          src={imageError ? 'https://via.placeholder.com/600x800?text=NEW+HYPE' : producto.imagenUrl}
          alt={producto.nombre}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
          loading="lazy"
        />
        
        {/* Imagen hover (si existe) */}
        {imgHover && !imageError && (
          <img
            src={imgHover}
            alt={`${producto.nombre} alternativa`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            loading="lazy"
          />
        )}
        
        {/* Insignias (Nuevo / Oferta) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {esNuevo && (
            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">
              Nuevo
            </span>
          )}
          {producto.enLiquidacion && descuento > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{descuento}%
            </span>
          )}
        </div>
        
        {/* Botón favorito */}
        <button
          onClick={handleToggleFavorito}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
          aria-label={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            size={18}
            strokeWidth={2}
            className={isFav ? 'fill-red-500 stroke-red-500' : 'stroke-black'}
          />
        </button>
        
        {/* Botón agregar rápido */}
        <button
          onClick={handleAgregarRapido}
          disabled={producto.stockTotal === 0}
          className={`absolute bottom-0 left-0 right-0 py-3 font-bold text-sm text-center transition-all duration-300 transform translate-y-full group-hover:translate-y-0 ${
            producto.stockTotal > 0
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {producto.stockTotal > 0 ? (
            <>
              <ShoppingBag size={16} className="inline mr-2" />
              Agregar al carrito
            </>
          ) : (
            'Agotado'
          )}
        </button>
      </div>
      
      {/* Info del producto */}
      <div className="space-y-1">
        {/* Marca */}
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {producto.marca.nombre}
        </div>
        
        {/* Nombre */}
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-gray-600 transition-colors">
          {producto.nombre}
        </h3>
        
        {/* Colores disponibles */}
        <div className="flex gap-1.5 py-1">
          {producto.coloresDisponibles.slice(0, 4).map(colorId => {
            const color = obtenerColor(colorId);
            return color ? (
              <span
                key={colorId}
                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: color.codigoHex }}
                title={color.nombre}
              />
            ) : null;
          })}
        </div>
        
        {/* Precio */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">S/. {precioFinal.toFixed(2)}</span>
          {producto.enLiquidacion && (
            <>
              <span className="text-sm text-gray-400 line-through">
                S/. {producto.precioVenta.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-red-600">
                -{descuento}%
              </span>
            </>
          )}
        </div>
        
        {/* Indicador de stock bajo */}
        {producto.stockTotal > 0 && producto.stockTotal <= 3 && (
          <div className="text-xs text-orange-600 font-semibold">
            ¡Últimas unidades!
          </div>
        )}
        
        {/* Agotado */}
        {producto.stockTotal === 0 && (
          <div className="text-xs text-red-600 font-semibold">
            Agotado
          </div>
        )}
      </div>
    </div>
  );
}

