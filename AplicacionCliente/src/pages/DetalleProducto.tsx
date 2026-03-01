import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerProductoPorSlug } from '../services/api';
import { useCarrito } from '../context/CarritoContext';
import type { Producto } from '../types';

export default function DetalleProducto() {
  const { slug } = useParams<{ slug: string }>();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const { agregar } = useCarrito();

  useEffect(() => {
    if (!slug) return;
    setCargando(true);
    obtenerProductoPorSlug(slug).then(p => {
      setProducto(p);
      setCargando(false);
    });
  }, [slug]);

  const handleAgregar = () => {
    if (!producto || !producto.disponible) return;
    agregar(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  if (cargando) {
    return (
      <div style={{ textAlign: 'center', padding: '200px 20px', color: 'var(--gris-400)' }}>
        <div className="procesando-spinner" style={{ margin: '0 auto 15px' }}></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div style={{ textAlign: 'center', padding: '200px 20px' }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>😕</div>
        <h2>Producto no encontrado</h2>
        <Link to="/catalogo" className="btn-primario" style={{ marginTop: '20px', display: 'inline-block' }}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const precioFinal = producto.enLiquidacion
    ? producto.precioVenta * (1 - producto.porcentajeLiquidacion / 100)
    : producto.precioVenta;

  return (
    <section style={{ paddingTop: '140px', maxWidth: '1100px', margin: '0 auto', padding: '140px 20px 60px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--gris-400)', marginBottom: '25px' }}>
        <Link to="/" style={{ color: 'var(--gris-400)' }}>Inicio</Link> &gt;{' '}
        <Link to="/catalogo" style={{ color: 'var(--gris-400)' }}>Catálogo</Link> &gt;{' '}
        <Link to={`/catalogo?categoria=${producto.categoriaSlug}`} style={{ color: 'var(--gris-400)' }}>
          {producto.categoriaNombre}
        </Link> &gt;{' '}
        <span style={{ color: 'var(--texto-primario)' }}>{producto.nombre}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'start' }}>
        {/* Imagen */}
        <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', aspectRatio: '4/5', background: 'var(--gris-100)' }}>
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {producto.enLiquidacion && (
            <span className="insignia insignia-oferta" style={{ position: 'absolute', top: '15px', left: '15px' }}>
              -{producto.porcentajeLiquidacion}%
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: '13px', color: 'var(--gris-400)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            {producto.categoriaNombre}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '5px' }}>{producto.nombre}</h1>
          <div style={{ fontSize: '13px', color: 'var(--gris-400)', marginBottom: '20px' }}>SKU: {producto.sku}</div>

          {/* Precio */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700 }}>S/. {precioFinal.toFixed(2)}</span>
            {producto.enLiquidacion && (
              <>
                <span style={{ fontSize: '18px', textDecoration: 'line-through', color: 'var(--gris-400)' }}>
                  S/. {producto.precioVenta.toFixed(2)}
                </span>
                <span style={{ background: '#ef4444', color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 600 }}>
                  -{producto.porcentajeLiquidacion}%
                </span>
              </>
            )}
          </div>

          {/* Disponibilidad */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '25px' }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: producto.disponible ? '#22c55e' : '#ef4444'
            }}></span>
            <span style={{ fontSize: '14px', color: producto.disponible ? '#22c55e' : '#ef4444' }}>
              {producto.disponible ? 'En stock' : 'Agotado'}
            </span>
          </div>

          {/* Descripción */}
          <p style={{ fontSize: '14px', color: 'var(--gris-500)', lineHeight: 1.7, marginBottom: '30px' }}>
            {producto.descripcion}
          </p>

          {/* Cantidad */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
              Cantidad
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', border: '1px solid var(--gris-200)', borderRadius: '8px', width: 'fit-content' }}>
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                style={{ width: '42px', height: '42px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}>−</button>
              <span style={{ width: '50px', textAlign: 'center', fontWeight: 600 }}>{cantidad}</span>
              <button onClick={() => setCantidad(cantidad + 1)}
                style={{ width: '42px', height: '42px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}>+</button>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
            <button
              className="btn-primario"
              onClick={handleAgregar}
              disabled={!producto.disponible}
              style={{ flex: 1, padding: '15px', fontSize: '15px', opacity: producto.disponible ? 1 : 0.5 }}
            >
              {agregado ? '✓ Agregado al carrito' : producto.disponible ? 'Agregar al Carrito' : 'Agotado'}
            </button>
          </div>

          {/* Features */}
          <div style={{ borderTop: '1px solid var(--gris-200)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--gris-500)' }}>
              <span>🚚</span> Envío gratis en compras +S/.150
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--gris-500)' }}>
              <span>🔄</span> Devolución dentro de 30 días
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--gris-500)' }}>
              <span>🔒</span> Pago 100% seguro
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
