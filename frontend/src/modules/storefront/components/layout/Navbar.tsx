/**
 * 🧭 BARRA DE NAVEGACIÓN PRINCIPAL
 * 
 * Navbar sticky con logo, menú de categorías, búsqueda, favoritos y carrito.
 * Incluye menú móvil y dropdowns.
 */

import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, ChevronDown } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import SearchBar from './SearchBar';

export default function Navbar() {
  const { state, dispatch, obtenerResumenCarrito } = useStorefront();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);
  
  const resumenCarrito = obtenerResumenCarrito();
  
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
            onClick={() => navigate('/storefront')}
            className="flex items-baseline gap-1 font-bebas text-[32px] leading-none tracking-[2px] hover:opacity-80 transition-opacity"
          >
            <span className="text-black">NEW</span>
            <span className="text-black bg-[#c8ff00] px-2 py-0.5 ml-0.5">HYPE</span>
          </button>
          
          {/* Enlaces de Navegación - Desktop */}
          <ul className="hidden md:flex items-center gap-1 list-none">
            <NavLink onClick={() => navigate('/storefront/catalogo?filtro=nuevo')}>New In</NavLink>
            
            {/* Mujer con dropdown */}
            <NavDropdown
              label="Mujer"
              navigate={navigate}
              navigateTo="/storefront/catalogo?genero=1"
              isOpen={dropdownAbierto === 'mujer'}
              onToggle={() => setDropdownAbierto(dropdownAbierto === 'mujer' ? null : 'mujer')}
            >
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?filtro=mujer-ropa'); setDropdownAbierto(null); }}>
                Toda la ropa
              </DropdownLink>
              <DropdownDivider />
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=vestidos'); setDropdownAbierto(null); }}>
                Vestidos
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=tops-blusas'); setDropdownAbierto(null); }}>
                Tops & Blusas
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=jeans'); setDropdownAbierto(null); }}>
                Jeans
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=casacas-blazers'); setDropdownAbierto(null); }}>
                Casacas & Blazers
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=faldas'); setDropdownAbierto(null); }}>
                Faldas
              </DropdownLink>
            </NavDropdown>
            
            {/* Hombre con dropdown */}
            <NavDropdown
              label="Hombre"
              navigate={navigate}
              navigateTo="/storefront/catalogo?genero=2"
              isOpen={dropdownAbierto === 'hombre'}
              onToggle={() => setDropdownAbierto(dropdownAbierto === 'hombre' ? null : 'hombre')}
            >
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?filtro=hombre-ropa'); setDropdownAbierto(null); }}>
                Toda la ropa
              </DropdownLink>
              <DropdownDivider />
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=hoodies-buzos'); setDropdownAbierto(null); }}>
                Hoodies & Buzos
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=camisas-polos'); setDropdownAbierto(null); }}>
                Camisas & Polos
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=jeans'); setDropdownAbierto(null); }}>
                Jeans
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=joggers-shorts'); setDropdownAbierto(null); }}>
                Joggers & Shorts
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=casacas-blazers'); setDropdownAbierto(null); }}>
                Casacas
              </DropdownLink>
            </NavDropdown>
            
            {/* Accesorios con dropdown */}
            <NavDropdown
              label="Accesorios"
              navigate={navigate}
              navigateTo="/storefront/catalogo?seccion=accesorios"
              isOpen={dropdownAbierto === 'accesorios'}
              onToggle={() => setDropdownAbierto(dropdownAbierto === 'accesorios' ? null : 'accesorios')}
            >
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?seccion=accesorios'); setDropdownAbierto(null); }}>
                Todos los accesorios
              </DropdownLink>
              <DropdownDivider />
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=lentes-sol'); setDropdownAbierto(null); }}>
                Lentes de Sol
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=bolsos-carteras'); setDropdownAbierto(null); }}>
                Bolsos & Carteras
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=gorras-sombreros'); setDropdownAbierto(null); }}>
                Gorras & Sombreros
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=joyeria'); setDropdownAbierto(null); }}>
                Joyería
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=relojes'); setDropdownAbierto(null); }}>
                Relojes
              </DropdownLink>
            </NavDropdown>
            
            {/* Calzado con dropdown */}
            <NavDropdown
              label="Calzado"
              navigate={navigate}
              navigateTo="/storefront/catalogo?seccion=calzado"
              isOpen={dropdownAbierto === 'calzado'}
              onToggle={() => setDropdownAbierto(dropdownAbierto === 'calzado' ? null : 'calzado')}
            >
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?seccion=calzado'); setDropdownAbierto(null); }}>
                Todo el calzado
              </DropdownLink>
              <DropdownDivider />
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=zapatillas'); setDropdownAbierto(null); }}>
                Zapatillas
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=botas'); setDropdownAbierto(null); }}>
                Botas
              </DropdownLink>
              <DropdownLink onClick={() => { navigate('/storefront/catalogo?categoria=sandalias'); setDropdownAbierto(null); }}>
                Sandalias
              </DropdownLink>
            </NavDropdown>
            
            <NavLink 
              onClick={() => navigate('/storefront/catalogo?liquidacion=true')}
              className="text-red-600 font-bold"
            >
              Sale
            </NavLink>
          </ul>
          
          {/* Acciones - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Búsqueda */}
            <div className="relative">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_BUSCADOR' })}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Buscar"
              >
                <Search size={22} strokeWidth={2} />
              </button>
              
              {/* Barra de búsqueda expandible */}
              <SearchBar
                isOpen={state.buscadorAbierto}
                onClose={() => dispatch({ type: 'TOGGLE_BUSCADOR' })}
              />
            </div>
            
            {/* Usuario */}
            <button
              onClick={() => navigate('/storefront/cuenta/perfil')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Mi cuenta"
            >
              <User size={22} strokeWidth={2} />
            </button>
            
            {/* Favoritos */}
            <button
              onClick={() => navigate('/storefront/favoritos')}
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
          
          {/* Menú móvil - Botón */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_MENU_MOVIL' })}
            className="md:hidden p-2"
            aria-label="Menú"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>
      
      {/* Menú Móvil Overlay */}
      <MobileMenu
        isOpen={state.menuMovilAbierto}
        onClose={() => dispatch({ type: 'TOGGLE_MENU_MOVIL' })}
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
          e.stopPropagation(); // Prevenir propagación
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
          onClick={(e) => e.stopPropagation()} // Prevenir que clicks internos cierren el backdrop
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
