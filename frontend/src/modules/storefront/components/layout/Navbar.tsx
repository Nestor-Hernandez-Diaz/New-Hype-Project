/**
 * BARRA DE NAVEGACION PRINCIPAL
 *
 * Navbar sticky con logo, menu de categorias dinamico, busqueda, favoritos y carrito.
 * Generos y categorias se cargan desde la BD via API.
 */

import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, ChevronDown } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiObtenerCatalogos, apiObtenerCategorias , getBasePath } from '../../services/storefrontApi';
import type { Genero, CategoriaStorefront } from '@monorepo/shared-types';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { state, dispatch, obtenerResumenCarrito } = useStorefront();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [categorias, setCategorias] = useState<CategoriaStorefront[]>([]);

  const resumenCarrito = obtenerResumenCarrito();

  // Cargar generos y categorias desde la BD
  useEffect(() => {
    const cargarNavData = async () => {
      try {
        const [catalogos, cats] = await Promise.all([
          apiObtenerCatalogos(),
          apiObtenerCategorias()
        ]);
        setGeneros(catalogos.generos || []);
        setCategorias(cats || []);
      } catch (error) {
        console.error('[Navbar] Error cargando datos de navegacion:', error);
      }
    };
    cargarNavData();
  }, []);

  // Detectar scroll para aplicar sombra
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar dropdown cuando cambia la ruta
  useEffect(() => {
    setDropdownAbierto(null);
  }, [location.pathname]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    if (!dropdownAbierto) return;

    const handleClickOutside = () => {
      setDropdownAbierto(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownAbierto]);

  return (
    <>
      {/* Backdrop when dropdown is open */}
      {dropdownAbierto && (
        <div
          className="fixed inset-0 z-[850]"
          onClick={() => setDropdownAbierto(null)}
        />
      )}

      {/* Navbar Desktop */}
      <nav className={`sticky top-0 z-[900] bg-white/97 backdrop-blur-xl border-b border-gray-200 h-[70px] transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate(getBasePath())}
            className="flex items-baseline gap-1 font-bebas text-[32px] leading-none tracking-[2px] hover:opacity-80 transition-opacity"
          >
            <span className="text-black">NEW</span>
            <span className="text-black bg-[#c8ff00] px-2 py-0.5 ml-0.5">HYPE</span>
          </button>

          {/* Enlaces de Navegacion - Desktop */}
          <ul className="hidden md:flex items-center gap-1 list-none">
            <NavLink onClick={() => navigate(`${getBasePath()}/catalogo`)}>Catalogo</NavLink>

            {/* Generos dinamicos desde BD */}
            {generos.map((genero) => {
              const generoKey = genero.descripcion.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              const generoCategorias = categorias;

              return (
                <NavDropdown
                  key={genero.id}
                  label={genero.descripcion}
                  navigate={navigate}
                  navigateTo={`/storefront/catalogo?genero=${genero.id}`}
                  isOpen={dropdownAbierto === generoKey}
                  onToggle={() => setDropdownAbierto(dropdownAbierto === generoKey ? null : generoKey)}
                >
                  <DropdownLink onClick={() => { navigate(`${getBasePath()}/catalogo?genero=${genero.id}`); setDropdownAbierto(null); }}>
                    Toda la ropa
                  </DropdownLink>
                  <DropdownDivider />
                  {generoCategorias.map((cat) => (
                    <DropdownLink
                      key={cat.id}
                      onClick={() => {
                        navigate(`${getBasePath()}/catalogo?genero=${genero.id}&categoria=${cat.slug}`);
                        setDropdownAbierto(null);
                      }}
                    >
                      {cat.nombre}
                    </DropdownLink>
                  ))}
                </NavDropdown>
              );
            })}

            <NavLink
              onClick={() => navigate(`${getBasePath()}/catalogo?liquidacion=true`)}
              className="text-red-600 font-bold"
            >
              Sale
            </NavLink>
          </ul>

          {/* Acciones - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Busqueda */}
            <div className="relative">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_BUSCADOR' })}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Buscar"
              >
                <Search size={22} strokeWidth={2} />
              </button>

              {/* Barra de busqueda expandible */}
              <SearchBar
                isOpen={state.buscadorAbierto}
                onClose={() => dispatch({ type: 'TOGGLE_BUSCADOR' })}
              />
            </div>

            {/* Usuario */}
            <button
              onClick={() => navigate(`${getBasePath()}/cuenta/perfil`)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Mi cuenta"
            >
              <User size={22} strokeWidth={2} />
            </button>

            {/* Favoritos */}
            <button
              onClick={() => navigate(`${getBasePath()}/favoritos`)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Favoritos"
            >
              <Heart size={22} strokeWidth={2} />
              {state.favoritos.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {state.favoritos.length}
                </span>
              )}
            </button>

            {/* Carrito */}
            <button
              onClick={() => dispatch({ type: 'ABRIR_CARRITO' })}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              aria-label="Carrito"
            >
              <ShoppingBag size={22} strokeWidth={2} />
              {resumenCarrito.cantidadItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-[#c8ff00] text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {resumenCarrito.cantidadItems}
                </span>
              )}
            </button>
          </div>

          {/* Menu movil - Boton */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MENU_MOVIL' })}
            className="md:hidden p-2"
            aria-label="Menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Menu Movil Overlay */}
      <MobileMenu
        isOpen={state.menuMovilAbierto}
        onClose={() => dispatch({ type: 'TOGGLE_MENU_MOVIL' })}
        generos={generos}
      />
    </>
  );
}

// Componentes auxiliares
function NavLink({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`px-4 py-2 text-[15px] font-medium hover:bg-gray-100 rounded-md transition-colors ${className}`}
      >
        {children}
      </button>
    </li>
  );
}

function NavDropdown({
  label,
  navigate,
  navigateTo,
  isOpen,
  onToggle,
  children
}: {
  label: string;
  navigate: (path: string) => void;
  navigateTo: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <li
      className="relative"
      onMouseEnter={() => !isOpen && onToggle()}
      onMouseLeave={() => isOpen && onToggle()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(navigateTo);
        }}
        className="px-4 py-2 text-[15px] font-medium hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-[1000] animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      )}
    </li>
  );
}

function DropdownLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
    >
      {children}
    </button>
  );
}

function DropdownDivider() {
  return <div className="my-1 border-t border-gray-200" />;
}
