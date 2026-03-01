import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { obtenerCategorias } from '../services/api';
import type { Categoria } from '../types';

export default function Navbar() {
  const { usuario, estaAutenticado } = useAuth();
  const { cantidad, toggleCarrito } = useCarrito();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [menuMovil, setMenuMovil] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    obtenerCategorias().then(setCategorias).catch(() => {});
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const buscar = () => {
    if (!busqueda.trim()) return;
    setBuscadorAbierto(false);
    navigate(`/catalogo?busqueda=${encodeURIComponent(busqueda.trim())}`);
    setBusqueda('');
  };

  return (
    <>
      <div className="barra-superior" id="barra-superior">
        <span>🔥 ENVÍO GRATIS en compras mayores a S/.150 | Hasta 50% OFF en liquidación</span>
      </div>
      <nav className={`navegacion ${scrolled ? 'con-scroll' : ''}`} id="navegacion">
        <div className="nav-contenedor">
          <button className="menu-movil-btn" onClick={() => setMenuMovil(!menuMovil)}>
            <span></span><span></span><span></span>
          </button>
          <Link to="/" className="logo">
            <span className="logo-new">NEW</span>
            <span className="logo-hype">HYPE</span>
          </Link>
          <div className="nav-links">
            <Link to="/catalogo" className="nav-link">Todos</Link>
            {categorias.map(c => (
              <Link key={c.id} to={`/catalogo?categoria=${c.slug}`} className="nav-link">{c.nombre}</Link>
            ))}
            <Link to="/catalogo?filtro=liquidacion" className="nav-link nav-link-sale">SALE</Link>
          </div>
          <div className="nav-acciones">
            <div className="buscador-contenedor">
              <button className="nav-accion-btn" onClick={() => setBuscadorAbierto(!buscadorAbierto)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              {buscadorAbierto && (
                <div className="barra-busqueda abierta">
                  <input type="text" placeholder="Buscar productos..." value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && buscar()}
                    autoFocus />
                  <button onClick={buscar} className="buscar-btn">🔍</button>
                </div>
              )}
            </div>
            <Link to="/favoritos" className="nav-accion-btn" title="Favoritos">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </Link>
            <button className="nav-accion-btn carrito-btn" onClick={toggleCarrito}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {cantidad > 0 && <span className="carrito-contador" style={{display:'flex'}}>{cantidad}</span>}
            </button>
            <button className="nav-accion-btn" onClick={() => navigate(estaAutenticado ? '/perfil' : '/login')} title="Mi Cuenta">
              {estaAutenticado ? (
                <span className="usuario-inicial">{usuario?.nombre?.charAt(0).toUpperCase()}</span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
      {menuMovil && (
        <div className="menu-movil abierto">
          <div className="menu-movil-links">
            <Link to="/catalogo" onClick={() => setMenuMovil(false)}>Todos</Link>
            {categorias.map(c => (
              <Link key={c.id} to={`/catalogo?categoria=${c.slug}`} onClick={() => setMenuMovil(false)}>{c.nombre}</Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
