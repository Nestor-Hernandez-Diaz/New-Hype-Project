/**
 * 🏠 PÁGINA DE INICIO (HOME)
 * 
 * Landing page del storefront con hero, categorías y productos destacados.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../context/StorefrontContext';
import ProductGrid from '../components/product/ProductGrid';
import { esProductoNuevo } from '../services/storefrontApi';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Truck, RefreshCw, Lock, MessageCircle } from 'lucide-react';

export default function Home() {
  const { state, cargarProductos } = useStorefront();
  const navigate = useNavigate();
  
  // Refs para animaciones de scroll
  const featuresRef = useScrollAnimation<HTMLElement>();
  const categoriasRef = useScrollAnimation<HTMLElement>();
  const trendingRef = useScrollAnimation<HTMLElement>();
  const bannerRef = useScrollAnimation<HTMLElement>();
  const liquidacionRef = useScrollAnimation<HTMLElement>();
  
  // Cargar productos al montar
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);
  
  // Filtrar productos nuevos y en liquidación
  const productosNuevos = state.productos.filter(p => esProductoNuevo(p)).slice(0, 8);
  const productosLiquidacion = state.productos.filter(p => p.enLiquidacion).slice(0, 4);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section (Split 50/50) */}
      <section className="relative h-[600px] lg:h-[700px] flex">
        {/* Lado Izquierdo - Mujer */}
        <div
          onClick={() => navigate('/storefront/catalogo?genero=1')}
          className="relative w-1/2 bg-cover bg-center cursor-pointer group overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1400&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-500" />
          <div className="absolute inset-0 flex items-center justify-center text-white z-10">
            <div className="text-center animate-fade-in-up">
              <div className="text-sm font-medium mb-2 tracking-wider">Colección 2025</div>
              <h1 className="font-bebas text-7xl lg:text-8xl tracking-wider mb-6">MUJER</h1>
              <button className="px-8 py-3 border-2 border-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300">
                <span>Explorar</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Lado Derecho - Hombre */}
        <div
          onClick={() => navigate('/storefront/catalogo?genero=2')}
          className="relative w-1/2 bg-cover bg-center cursor-pointer group overflow-hidden"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1488161628813-04466f0cc7d4?w=1200&h=1400&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all duration-500" />
          <div className="absolute inset-0 flex items-center justify-center text-white z-10">
            <div className="text-center animate-fade-in-up animation-delay-200">
              <div className="text-sm font-medium mb-2 tracking-wider">Street Style</div>
              <h1 className="font-bebas text-7xl lg:text-8xl tracking-wider mb-6">HOMBRE</h1>
              <button className="px-8 py-3 border-2 border-white font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all duration-300">
                <span>Explorar</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Divisor central */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 font-bebas text-white text-4xl lg:text-5xl tracking-wider text-center leading-tight pointer-events-none">
          NEW<br />HYPE
        </div>
      </section>
      
      {/* Barra de características */}
      <section ref={featuresRef} className="bg-gray-50 py-8 opacity-0 translate-y-4 transition-all duration-700">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureItem icon={<Truck size={32} />} title="Envío Gratis" desc="En compras +S/.150" />
            <FeatureItem icon={<RefreshCw size={32} />} title="Devolución Fácil" desc="30 días para cambios" />
            <FeatureItem icon={<Lock size={32} />} title="Pago Seguro" desc="Todas las tarjetas + Yape" />
            <FeatureItem icon={<MessageCircle size={32} />} title="Soporte 24/7" desc="WhatsApp y chat" />
          </div>
        </div>
      </section>
      
      {/* Categorías */}
      <section ref={categoriasRef} className="max-w-[1440px] mx-auto px-8 py-16 opacity-0 translate-y-4 transition-all duration-700">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Explora</div>
          <h2 className="font-bebas text-5xl lg:text-6xl tracking-wider">CATEGORÍAS</h2>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <CategoryCard
            imagen="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop"
            nombre="Mujer"
            cantidad="120+ productos"
            onClick={() => navigate('/storefront/catalogo?genero=1')}
          />
          <CategoryCard
            imagen="https://images.unsplash.com/photo-1488161628813-04466f0cc7d4?w=600&h=800&fit=crop"
            nombre="Hombre"
            cantidad="95+ productos"
            onClick={() => navigate('/storefront/catalogo?genero=2')}
          />
          <CategoryCard
            imagen="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&h=800&fit=crop"
            nombre="Accesorios"
            cantidad="60+ productos"
            onClick={() => navigate('/storefront/catalogo?seccion=accesorios')}
          />
          <CategoryCard
            imagen="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=800&fit=crop"
            nombre="Calzado"
            cantidad="75+ productos"
            onClick={() => navigate('/storefront/catalogo?seccion=calzado')}
          />
        </div>
      </section>
      
      {/* Productos Trending */}
      <section ref={trendingRef} className="max-w-[1440px] mx-auto px-8 py-16 opacity-0 translate-y-4 transition-all duration-700">
        <div className="text-center mb-12">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Lo más buscado</div>
          <h2 className="font-bebas text-5xl lg:text-6xl tracking-wider">
            TRENDING <span className="text-[#c8ff00]">NOW</span>
          </h2>
        </div>
        <ProductGrid productos={productosNuevos} loading={state.productosLoading} />
      </section>
      
      {/* Banner Promocional */}
      <section ref={bannerRef} className="relative h-[400px] bg-cover bg-center my-16 opacity-0 translate-y-4 transition-all duration-700"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=600&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center text-white z-10">
          <div className="text-center">
            <div className="text-sm font-medium mb-2 tracking-wider">Liquidación de Temporada</div>
            <div className="font-bebas text-6xl lg:text-7xl tracking-wider mb-4">HASTA 50% OFF</div>
            <p className="text-xl mb-8">En prendas seleccionadas de temporada</p>
            <button
              onClick={() => navigate('/storefront/catalogo?liquidacion=true')}
              className="px-8 py-3 bg-[#c8ff00] text-black font-bold uppercase tracking-wider hover:bg-[#a8d600] transition-colors"
            >
              Ver Liquidación
            </button>
          </div>
        </div>
      </section>
      
      {/* Productos en Liquidación */}
      {productosLiquidacion.length > 0 && (
        <section ref={liquidacionRef} className="max-w-[1440px] mx-auto px-8 py-16 opacity-0 translate-y-4 transition-all duration-700">
          <div className="text-center mb-12">
            <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">No te lo pierdas</div>
            <h2 className="font-bebas text-5xl lg:text-6xl tracking-wider">
              LIQUIDACIÓN 🔥
            </h2>
          </div>
          <ProductGrid productos={productosLiquidacion} />
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/storefront/catalogo?liquidacion=true')}
              className="px-8 py-3 border-2 border-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-all duration-300"
            >
              Ver Toda la Liquidación
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

// Componentes auxiliares
function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="mb-3 text-gray-700">{icon}</div>
      <div className="font-bold text-base mb-1">{title}</div>
      <div className="text-sm text-gray-500">{desc}</div>
    </div>
  );
}

function CategoryCard({ imagen, nombre, cantidad, onClick }: { imagen: string; nombre: string; cantidad: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="relative aspect-[3/4] bg-cover bg-center rounded-lg overflow-hidden cursor-pointer group"
      style={{ backgroundImage: `url('${imagen}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
        <h3 className="font-bold text-2xl mb-1">{nombre}</h3>
        <p className="text-sm text-gray-300">{cantidad}</p>
      </div>
      <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
          <path d="M7 17l9.2-9.2M17 17V7H7"/>
        </svg>
      </div>
    </div>
  );
}
