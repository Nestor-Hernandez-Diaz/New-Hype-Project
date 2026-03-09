import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStorefront } from '../context/StorefrontContext';
import { useToast } from '../context/ToastContext';
import type { ProductoStorefront, ItemCarrito } from '@monorepo/shared-types';
import { apiObtenerProductoPorSlug, obtenerTalla, obtenerColor , getBasePath } from '../services/storefrontApi';
import ProductGallery from '../components/product/ProductGallery';
import ProductVariants from '../components/product/ProductVariants';
import RelatedProducts from '../components/product/RelatedProducts';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Heart, Check, AlertTriangle } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { dispatch, toggleFavorito, esFavorito } = useStorefront();
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

  // Derivar la variante activa según talla + color seleccionados
  const varianteActiva = useMemo(() => {
    if (!producto?.variantes || !tallaSeleccionada || !colorSeleccionado) return null;
    return producto.variantes.find(
      v => v.tallaId === tallaSeleccionada && v.colorId === colorSeleccionado
    ) || null;
  }, [producto, tallaSeleccionada, colorSeleccionado]);

  // Valores dinámicos según la variante seleccionada
  const displaySku = varianteActiva?.sku ?? producto?.sku ?? '';
  const displayStock = varianteActiva?.stock ?? producto?.stockTotal ?? 0;
  const displayTallaNombre = varianteActiva?.tallaNombre
    ?? obtenerTalla(tallaSeleccionada ?? 0)?.codigo
    ?? producto?.tallaNombre;
  const displayColorNombre = varianteActiva?.colorNombre
    ?? obtenerColor(colorSeleccionado ?? 0)?.nombre
    ?? producto?.colorNombre;
  const varianteId = varianteActiva?.id ?? producto?.id ?? 0;

  // Combinación talla+color existe en variantes?
  const tieneVariantes = !!(producto?.variantes && producto.variantes.length > 0);
  const combinacionNoDisponible = tieneVariantes
    && tallaSeleccionada !== null
    && colorSeleccionado !== null
    && varianteActiva === null;

  // Reset cantidad cuando cambia la variante
  useEffect(() => {
    setCantidad(1);
  }, [tallaSeleccionada, colorSeleccionado]);

  const handleAgregarAlCarrito = () => {
    if (!producto || combinacionNoDisponible) return;

    const precioUnitario = producto.enLiquidacion && producto.precioLiquidacion
      ? producto.precioLiquidacion
      : varianteActiva?.precioVenta ?? producto.precioVenta;

    const item: ItemCarrito = {
      productoId: varianteId,
      sku: displaySku,
      nombreProducto: producto.nombre,
      slug: producto.slug,
      marca: producto.marcaNombre || '',
      precioUnitario,
      imagen: producto.imagenUrl || '',
      tallaId: tallaSeleccionada,
      tallaCodigo: displayTallaNombre || '',
      colorId: colorSeleccionado,
      colorNombre: displayColorNombre || '',
      colorHex: varianteActiva?.colorHex || obtenerColor(colorSeleccionado ?? 0)?.codigoHex || '',
      cantidad
    };

    dispatch({ type: 'AGREGAR_AL_CARRITO', payload: item });
    showToast(`${producto.nombre} agregado al carrito`, 'success');
  };

  const handleToggleFavorito = () => {
    if (!producto) return;
    toggleFavorito(producto.id);
    if (esFavorito(producto.id)) {
      showToast('Eliminado de favoritos', 'info');
    } else {
      showToast('Agregado a favoritos', 'success');
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
            onClick: () => navigate(`${getBasePath()}/catalogo`)
          }}
        />
      </div>
    );
  }

  const precioFinal = producto.enLiquidacion && producto.precioLiquidacion
    ? producto.precioLiquidacion
    : producto.precioVenta;

  const imagenes = producto.imagenes && producto.imagenes.length > 0
    ? producto.imagenes.map(img => typeof img === 'string' ? img : img.url)
    : producto.imagenUrl
    ? [producto.imagenUrl]
    : ['/placeholder.jpg'];

  const botonDeshabilitado = displayStock === 0 || combinacionNoDisponible;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <button onClick={() => navigate(getBasePath())} className="hover:text-black">
          Inicio
        </button>
        <span className="mx-2">/</span>
        <button onClick={() => navigate(`${getBasePath()}/catalogo`)} className="hover:text-black">
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

          {/* Marca y SKU (dinámico) */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            {producto.marcaNombre && <span>Marca: {producto.marcaNombre}</span>}
            <span>SKU: {displaySku}</span>
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

          {/* Descripcion */}
          {producto.descripcion && (
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">{producto.descripcion}</p>
            </div>
          )}

          {/* Detalles del Producto (dinámico por variante) */}
          <details className="border border-gray-200 rounded-lg mb-6 group" open>
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-sm select-none">
              Detalles del producto
              <span className="transition-transform group-open:rotate-180 text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </span>
            </summary>
            <div className="px-5 pb-4 space-y-3 text-sm border-t border-gray-100 pt-4">
              {producto.categoriaNombre && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoria</span>
                  <span className="font-medium">{producto.categoriaNombre}</span>
                </div>
              )}
              {producto.marcaNombre && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Marca</span>
                  <span className="font-medium">{producto.marcaNombre}</span>
                </div>
              )}
              {producto.materialNombre && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Material</span>
                  <span className="font-medium">{producto.materialNombre}</span>
                </div>
              )}
              {producto.generoNombre && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Genero</span>
                  <span className="font-medium">{producto.generoNombre}</span>
                </div>
              )}
              {displayTallaNombre && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Talla</span>
                  <span className="font-medium">{displayTallaNombre}</span>
                </div>
              )}
              {displayColorNombre && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Color</span>
                  <span className="font-medium">{displayColorNombre}</span>
                </div>
              )}
              {displaySku && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SKU</span>
                  <span className="font-medium font-mono text-xs">{displaySku}</span>
                </div>
              )}
            </div>
          </details>

          {/* Stock Status (dinámico por variante) */}
          <div className="mb-6 flex items-center gap-2">
            {combinacionNoDisponible ? (
              <>
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-amber-600 font-medium text-sm">Esta combinacion no esta disponible</span>
              </>
            ) : displayStock === 0 ? (
              <>
                <span className="w-2 h-2 bg-red-600 rounded-full" />
                <span className="text-red-600 font-medium">Agotado</span>
              </>
            ) : displayStock <= 3 ? (
              <>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-orange-600 font-medium">{'\u00A1'}Ultimas {displayStock} unidades!</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                <span className="text-green-600 font-medium">Disponible</span>
              </>
            )}
          </div>

          {/* Selector de Variantes (stock dinámico) */}
          <ProductVariants
            tallas={producto.tallasDisponibles}
            colores={producto.coloresDisponibles}
            tallaSeleccionada={tallaSeleccionada}
            colorSeleccionado={colorSeleccionado}
            cantidad={cantidad}
            onTallaChange={setTallaSeleccionada}
            onColorChange={setColorSeleccionado}
            onCantidadChange={setCantidad}
            stockMax={combinacionNoDisponible ? 0 : displayStock}
          />

          {/* Botones de Acción */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAgregarAlCarrito}
              disabled={botonDeshabilitado}
              className="
                flex-1 bg-black text-white px-6 py-4 rounded-lg
                font-semibold text-lg hover:bg-gray-800 transition-all
                disabled:bg-gray-300 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {botonDeshabilitado ? (
                combinacionNoDisponible ? 'NO DISPONIBLE' : 'AGOTADO'
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
              <span>Envio gratis en compras mayores a S/ 150</span>
            </div>
            <div className="flex items-center gap-3">
              <Check size={18} className="text-green-600 flex-shrink-0" />
              <span>Devolucion facil dentro de 30 dias</span>
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
