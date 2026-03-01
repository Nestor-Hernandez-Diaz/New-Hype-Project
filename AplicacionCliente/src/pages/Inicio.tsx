import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerProductos } from '../services/api';
import { TarjetaProducto } from '../components/TarjetaProducto';
import type { Producto } from '../types';

export default function Inicio() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerProductos(0, 20).then(data => {
      setProductos(data.content);
      setCargando(false);
    }).catch(() => setCargando(false));
  }, []);

  const liquidacion = productos.filter(p => p.enLiquidacion);

  return (
    <>
      {/* HERO */}
      <section className="heroe">
        <div className="heroe-lado heroe-izquierda" onClick={() => navigate('/catalogo')}>
          <div className="heroe-fondo"></div>
          <div className="heroe-contenido aparecer visible">
            <div className="heroe-etiqueta">Colección 2025</div>
            <h1 className="heroe-titulo">TIENDA</h1>
            <span className="heroe-boton"><span>Explorar</span></span>
          </div>
        </div>
        <div className="heroe-lado heroe-derecha" onClick={() => navigate('/catalogo')}>
          <div className="heroe-fondo"></div>
          <div className="heroe-contenido aparecer visible">
            <div className="heroe-etiqueta">Street Style</div>
            <h1 className="heroe-titulo">CATÁLOGO</h1>
            <span className="heroe-boton"><span>Explorar</span></span>
          </div>
        </div>
        <div className="heroe-divisor">NEW<br />HYPE</div>
      </section>

      {/* FEATURES */}
      <section className="caracteristicas-barra">
        <div className="caracteristica-item aparecer visible">
          <div className="caracteristica-icono">🚚</div>
          <div className="caracteristica-titulo">Envío Gratis</div>
          <div className="caracteristica-desc">En compras +S/.150</div>
        </div>
        <div className="caracteristica-item aparecer visible">
          <div className="caracteristica-icono">🔄</div>
          <div className="caracteristica-titulo">Devolución Fácil</div>
          <div className="caracteristica-desc">30 días para cambios</div>
        </div>
        <div className="caracteristica-item aparecer visible">
          <div className="caracteristica-icono">🔒</div>
          <div className="caracteristica-titulo">Pago Seguro</div>
          <div className="caracteristica-desc">Todas las tarjetas + Yape</div>
        </div>
        <div className="caracteristica-item aparecer visible">
          <div className="caracteristica-icono">💬</div>
          <div className="caracteristica-titulo">Soporte 24/7</div>
          <div className="caracteristica-desc">WhatsApp y chat</div>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="seccion">
        <div className="seccion-cabecera aparecer visible">
          <div className="seccion-etiqueta">Nuestros productos</div>
          <h2 className="seccion-titulo">CATÁLOGO <span className="acento">⚡</span></h2>
        </div>
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gris-400)' }}>
            <div className="procesando-spinner" style={{ margin: '0 auto 15px' }}></div>
            <p>Cargando productos...</p>
          </div>
        ) : productos.length > 0 ? (
          <div className="productos-grilla">
            {productos.map(p => <TarjetaProducto key={p.id} producto={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gris-400)' }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>📦</div>
            <p style={{ fontSize: '18px' }}>No hay productos disponibles aún</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>El admin necesita cargar productos desde el panel</p>
          </div>
        )}
        {productos.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/catalogo" className="btn-contorno">Ver Todo el Catálogo</Link>
          </div>
        )}
      </section>

      {/* BANNER PROMO */}
      <section className="banner-promo aparecer visible">
        <div className="promo-fondo" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&h=600&fit=crop')" }}></div>
        <div className="promo-contenido">
          <div className="promo-etiqueta">Liquidación de Temporada</div>
          <div className="promo-titulo">HASTA 50% OFF</div>
          <div className="promo-subtitulo">En prendas seleccionadas de temporada</div>
          <Link to="/catalogo?filtro=liquidacion" className="btn-primario">Ver Liquidación</Link>
        </div>
      </section>

      {/* LIQUIDACIÓN */}
      {liquidacion.length > 0 && (
        <section className="seccion">
          <div className="seccion-cabecera aparecer visible">
            <div className="seccion-etiqueta">No te lo pierdas</div>
            <h2 className="seccion-titulo">LIQUIDACIÓN 🔥</h2>
          </div>
          <div className="productos-grilla">
            {liquidacion.map(p => <TarjetaProducto key={p.id} producto={p} />)}
          </div>
        </section>
      )}
    </>
  );
}
