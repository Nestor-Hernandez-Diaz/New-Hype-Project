import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obtenerProductos, obtenerCategorias } from '../services/api';
import { TarjetaProducto } from '../components/TarjetaProducto';
import type { Producto, Categoria } from '../types';

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    Promise.all([
      obtenerProductos(0, 50),
      obtenerCategorias()
    ]).then(([prodData, cats]) => {
      setProductos(prodData.content);
      setCategorias(cats);
      setCargando(false);
    }).catch(() => setCargando(false));
  }, []);

  // Aplicar filtros de URL
  const categoriaSlug = searchParams.get('categoria');
  const filtro = searchParams.get('filtro');
  const busqueda = searchParams.get('busqueda')?.toLowerCase();

  let productosFiltrados = [...productos];

  if (categoriaSlug) {
    productosFiltrados = productosFiltrados.filter(p => p.categoriaSlug === categoriaSlug);
  }
  if (filtro === 'liquidacion') {
    productosFiltrados = productosFiltrados.filter(p => p.enLiquidacion);
  }
  if (busqueda) {
    productosFiltrados = productosFiltrados.filter(p =>
      p.nombre.toLowerCase().includes(busqueda) ||
      p.descripcion.toLowerCase().includes(busqueda) ||
      p.categoriaNombre.toLowerCase().includes(busqueda)
    );
  }

  // Filtro local por chips
  if (filtroActivo !== 'todos') {
    productosFiltrados = productosFiltrados.filter(p => p.categoriaSlug === filtroActivo);
  }

  const titulo = categoriaSlug
    ? categorias.find(c => c.slug === categoriaSlug)?.nombre || 'Catálogo'
    : filtro === 'liquidacion'
    ? 'Liquidación 🔥'
    : busqueda
    ? `Resultados para "${busqueda}"`
    : 'Catálogo Completo';

  return (
    <section className="seccion" style={{ paddingTop: '140px', minHeight: '70vh' }}>
      <div className="seccion-cabecera aparecer visible">
        <div className="seccion-etiqueta">New Hype Store</div>
        <h2 className="seccion-titulo">{titulo}</h2>
      </div>

      {/* Chips de filtro */}
      <div className="filtros-contenedor" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
        <button
          className={`filtro-chip ${filtroActivo === 'todos' ? 'activo' : ''}`}
          onClick={() => setFiltroActivo('todos')}
        >Todos</button>
        {categorias.map(c => (
          <button
            key={c.id}
            className={`filtro-chip ${filtroActivo === c.slug ? 'activo' : ''}`}
            onClick={() => setFiltroActivo(c.slug)}
          >{c.nombre}</button>
        ))}
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gris-400)' }}>
          <div className="procesando-spinner" style={{ margin: '0 auto 15px' }}></div>
          <p>Cargando catálogo...</p>
        </div>
      ) : productosFiltrados.length > 0 ? (
        <>
          <p style={{ textAlign: 'center', color: 'var(--gris-400)', fontSize: '14px', marginBottom: '20px' }}>
            {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
          </p>
          <div className="productos-grilla">
            {productosFiltrados.map(p => <TarjetaProducto key={p.id} producto={p} />)}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gris-400)' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
          <p style={{ fontSize: '18px' }}>No se encontraron productos</p>
        </div>
      )}
    </section>
  );
}
