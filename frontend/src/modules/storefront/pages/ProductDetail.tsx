import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStorefront } from '../context/StorefrontContext';
import type { ProductoStorefront } from '@monorepo/shared-types';
import { apiObtenerProductoPorSlug } from '../services/storefrontApi';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { agregarAlCarrito, toggleFavorito, esFavorito } = useStorefront();
  
  const [producto, setProducto] = useState<ProductoStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenActual, setImagenActual] = useState(0);
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bebas mb-4">PRODUCTO NO ENCONTRADO</h2>
          <button
            onClick={() => navigate('/storefront/catalogo')}
            className="bg-black text-white px-6 py-2 hover:bg-gray-800"
          >
            Ver Catálogo
          </button>
        </div>
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
          {/* Imagen Principal */}
          <div className="aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
            <img
              src={imagenes[imagenActual]}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {imagenes.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {imagenes.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setImagenActual(index)}
                  className={`aspect-square bg-gray-100 overflow-hidden border-2 ${
                    imagenActual === index ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${producto.nombre} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
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
            <div className="mb-6">
              {producto.stockTotal === 0 ? (
                <span className="text-red-600 font-medium">Agotado</span>
              ) : producto.stockTotal <= 3 ? (
                <span className="text-orange-600 font-medium">¡Últimas {producto.stockTotal} unidades!</span>
              ) : (
                <span className="text-green-600 font-medium">Disponible</span>
              )}
            </div>
          )}

          {/* Selector de Cantidad */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Cantidad</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="w-10 h-10 border border-gray-300 hover:border-black"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 h-10 border border-gray-300 text-center"
              />
              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-10 h-10 border border-gray-300 hover:border-black"
              >
                +
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3">
            <button
              onClick={handleAgregarAlCarrito}
              disabled={producto.stockTotal === 0}
              className="flex-1 bg-black text-white px-6 py-4 font-bebas text-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {producto.stockTotal === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
            </button>
            <button
              onClick={() => toggleFavorito(producto.id)}
              className={`w-14 h-14 border ${
                esFavorito(producto.id) ? 'bg-red-50 border-red-500' : 'border-gray-300'
              } hover:border-black`}
            >
              <svg
                className={`w-6 h-6 mx-auto ${esFavorito(producto.id) ? 'fill-red-500' : 'fill-none'}`}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Beneficios */}
          <div className="mt-8 space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Envío gratis en compras mayores a S/ 150</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Devolución fácil dentro de 30 días</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Pago 100% seguro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
