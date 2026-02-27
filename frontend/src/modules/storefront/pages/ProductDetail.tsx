import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStorefront } from '../context/StorefrontContext';
import { useToast } from '../context/ToastContext';
import type { ProductoStorefront } from '@monorepo/shared-types';
import { apiObtenerProductoPorSlug } from '../services/storefrontApi';
import ProductGallery from '../components/product/ProductGallery';
import ProductVariants from '../components/product/ProductVariants';
import RelatedProducts from '../components/product/RelatedProducts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Heart, Check } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { agregarAlCarrito, toggleFavorito, esFavorito } = useStorefront();
  const { showToast } = useToast();
  
  const [producto, setProducto] = useState<ProductoStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<number | null>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const cargarProducto = async () => {
      if (!slug) return;
      
      setLoading(true);
      try {
        const data = await apiObtenerProductoPorSlug(slug);
        setProducto(data);
        
        // Auto-seleccionar primera talla y color
        if (data.tallasDisponibles && data.tallasDisponibles.length > 0) {
          setTallaSeleccionada(data.tallasDisponibles[0]);
        }
        if (data.coloresDisponibles && data.coloresDisponibles.length > 0) {
          setColorSeleccionado(data.coloresDisponibles[0]);
        }
      } catch (error) {
        console.error('Error al cargar producto:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarProducto();
  }, [slug]);

  const handleAgregarAlCarrito = () => {
    if (!producto) return;

    agregarAlCarrito({
      productoId: producto.id,
      sku: producto.sku,
      nombreProducto: producto.nombre,
      slug: producto.slug,
      marca: producto.marcaNombre || 'Marca',
      precioUnitario: producto.enLiquidacion && producto.precioLiquidacion 
        ? producto.precioLiquidacion 
        : producto.precioVenta,
      imagen: producto.imagenUrl || '',
      tallaId: tallaSeleccionada,
      tallaCodigo: 'M', // TODO: Obtener del catálogo
      colorId: colorSeleccionado,
      colorNombre: 'Negro',  // TODO: Obtener del catálogo
      colorHex: '#000000',
      cantidad
    });
    
    showToast(`${producto.nombre} agregado al carrito`, 'success');
  };
  
  const handleToggleFavorito = () => {
    if (!producto) return;
    toggleFavorito(producto.id);
    if (esFavorito(producto.id)) {
      showToast('Eliminado de favoritos', 'info');
    } else {
      showToast('Agregado a favoritos ❤️', 'success');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando producto..." />
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon="🔍"
          title="Producto no encontrado"
          description="Lo sentimos, no pudimos encontrar este producto."
          action={{
            label: 'Ver catálogo',
            onClick: () => navigate('/storefront/catalogo')
          }}
        />
      </div>
    );
  }

  const precioFinal = producto.enLiquidacion && producto.precioLiquidacion
    ? producto.precioLiquidacion
    : producto.precioVenta;

  const imagenes = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes.map(img => img.url)
    : producto.imagenUrl
    ? [producto.imagenUrl]
    : ['/placeholder.jpg'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate('/storefront')} className="hover:text-black">
          Inicio
        </button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate('/storefront/catalogo')} className="hover:text-black">
          Catálogo
        </button>
        <span className="mx-2">/</span>
        <span className="text-black">{producto.nombre}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Galería de Imágenes */}
        <div>
          <ProductGallery images={imagenes} alt={producto.nombre} />
        </div>

        {/* Información del Producto */}
        <div>
          {/* Badges */}
          <div className="flex gap-2 mb-4">
            {producto.enLiquidacion && (
              <span className="bg-red-600 text-white text-xs px-3 py-1 font-bebas">
                -{producto.porcentajeLiquidacion}% OFF
              </span>
            )}
            {new Date(producto.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 && (
              <span className="bg-[#d4ff00] text-black text-xs px-3 py-1 font-bebas">
                NUEVO
              </span>
            )}
          </div>

          {/* Título */}
          <h1 className="font-bebas text-4xl mb-2">{producto.nombre}</h1>
          
          {/* Marca y SKU */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {producto.marcaNombre && <span>Marca: {producto.marcaNombre}</span>}
            <span>SKU: {producto.sku}</span>
          </div>

          {/* Precio */}
          <div className="mb-6">
            {producto.enLiquidacion && producto.precioLiquidacion ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bebas">S/ {precioFinal.toFixed(2)}</span>
                <span className="text-xl text-gray-400 line-through">
                  S/ {producto.precioVenta.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bebas">S/ {precioFinal.toFixed(2)}</span>
            )}
          </div>

          {/* Descripción */}
          <p className="text-gray-700 mb-6 leading-relaxed">{producto.descripcion}</p>

          {/* Detalles del Producto */}
          <div className="border-t border-b border-gray-200 py-4 mb-6 space-y-2 text-sm">
            {producto.materialNombre && (
              <div className="flex justify-between">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium">{producto.materialNombre}</span>
              </div>
            )}
            {producto.generoNombre && (
              <div className="flex justify-between">
                <span className="text-gray-600">Género:</span>
                <span className="font-medium">{producto.generoNombre}</span>
              </div>
            )}
            {producto.categoriaNombre && (
              <div className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium">{producto.categoriaNombre}</span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {producto.stockTotal !== undefined && (
            <div className="mb-6 flex items-center gap-2">
              {producto.stockTotal === 0 ? (
                <>
                  <span className="w-2 h-2 bg-red-600 rounded-full" />
                  <span className="text-red-600 font-medium">Agotado</span>
                </>
              ) : producto.stockTotal <= 3 ? (
                <>
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-orange-600 font-medium">¡Últimas {producto.stockTotal} unidades!</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                  <span className="text-green-600 font-medium">Disponible</span>
                </>
              )}
            </div>
          )}

          {/* Selector de Variantes */}
          <ProductVariants
            tallas={producto.tallasDisponibles}
            colores={producto.coloresDisponibles}
            tallaSeleccionada={tallaSeleccionada}
            colorSeleccionado={colorSeleccionado}
            cantidad={cantidad}
            onTallaChange={setTallaSeleccionada}
            onColorChange={setColorSeleccionado}
            onCantidadChange={setCantidad}
            stockMax={producto.stockTotal || 10}
          />

          {/* Botones de Acción */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAgregarAlCarrito}
              disabled={producto.stockTotal === 0}
              className="
                flex-1 bg-black text-white px-6 py-4 rounded-lg
                font-semibold text-lg hover:bg-gray-800 transition-all
                disabled:bg-gray-300 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {producto.stockTotal === 0 ? (
                'AGOTADO'
              ) : (
                <>
                  <Check size={20} />
                  AGREGAR AL CARRITO
                </>
              )}
            </button>
            <button
              onClick={handleToggleFavorito}
              className={`
                w-14 h-14 rounded-lg border-2 transition-all
                ${
                  esFavorito(producto.id) 
                    ? 'bg-red-50 border-red-500 text-red-500' 
                    : 'border-gray-300 hover:border-gray-500'
                }
              `}
              aria-label="Agregar a favoritos"
            >
              <Heart 
                size={24} 
                className={`mx-auto ${esFavorito(producto.id) ? 'fill-current' : ''}`}
              />
            </button>
          </div>

          {/* Beneficios */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <Check size={18} className="text-green-600 flex-shrink-0" />
              <span>Envío gratis en compras mayores a S/ 150</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={18} className="text-green-600 flex-shrink-0" />
              <span>Devolución fácil dentro de 30 días</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={18} className="text-green-600 flex-shrink-0" />
              <span>Pago 100% seguro</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Productos Relacionados */}
      <div className="mt-16">
        <RelatedProducts 
          productoActualId={producto.id} 
          categoriaId={producto.categoriaId}
        />
      </div>
    </div>
  );
}
