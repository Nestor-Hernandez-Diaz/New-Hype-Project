/**
 * 🧭 BARRA DE NAVEGACIÓN PRINCIPAL
 * 
 * Navbar sticky con logo, menú de categorías, búsqueda, favoritos y carrito.
 * Incluye menú móvil y dropdowns.
 */

import { useState, useEffect } from 'react';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { state, dispatch, obtenerResumenCarrito } = useStorefront();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [busquedaTexto, setBusquedaTexto] = useState('');
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
  
  const handleBuscar = () => {
    if (!busquedaTexto.trim()) return;
    navigate(`/storefront/catalogo?busqueda=${encodeURIComponent(busquedaTexto)}`);
    setBusquedaTexto('');
    dispatch({ type: 'TOGGLE_BUSCADOR' });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };
  
  return (
    <>
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
              {state.buscadorAbierto && (
                <div className="absolute top-full right-0 mt-2 w-[320px] bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2 animate-fade-in">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={busquedaTexto}
                    onChange={(e) => setBusquedaTexto(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleBuscar}
                    className="p-2 hover:bg-gray-100 rounded-md"
                  >
                    <Search size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_BUSCADOR' })}
                    className="p-2 hover:bg-gray-100 rounded-md text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Usuario */}
            <button
              onClick={() => navigate('/storefront/cuenta')}
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
      {state.menuMovilAbierto && (
        <div className="fixed inset-0 z-[950] md:hidden">
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => dispatch({ type: 'TOGGLE_MENU_MOVIL' })}
          />
          
          {/* Panel lateral */}
          <div className="absolute top-0 left-0 bottom-0 w-[280px] bg-white shadow-2xl animate-slide-in-left">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="font-bebas text-2xl tracking-wider">
                  <span className="text-black">NEW</span>
                  <span className="text-black bg-[#c8ff00] px-2 py-0.5 ml-1">HYPE</span>
                </div>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_MENU_MOVIL' })}
                  className="p-2"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Enlaces */}
              <div className="flex flex-col gap-4">
                <MobileLink onClick={() => { navigate('/storefront/catalogo?filtro=nuevo'); dispatch({ type: 'TOGGLE_MENU_MOVIL' }); }}>
                  New In ⚡
                </MobileLink>
                <MobileLink onClick={() => { navigate('/storefront/catalogo?genero=1'); dispatch({ type: 'TOGGLE_MENU_MOVIL' }); }}>
                  Mujer
                </MobileLink>
                <MobileLink onClick={() => { navigate('/storefront/catalogo?genero=2'); dispatch({ type: 'TOGGLE_MENU_MOVIL' }); }}>
                  Hombre
                </MobileLink>
                <MobileLink onClick={() => { navigate('/storefront/catalogo?seccion=accesorios'); dispatch({ type: 'TOGGLE_MENU_MOVIL' }); }}>
                  Accesorios
                </MobileLink>
                <MobileLink onClick={() => { navigate('/storefront/catalogo?seccion=calzado'); dispatch({ type: 'TOGGLE_MENU_MOVIL' }); }}>
                  Calzado
                </MobileLink>
                <MobileLink onClick={() => { navigate('/storefront/catalogo?liquidacion=true'); dispatch({ type: 'TOGGLE_MENU_MOVIL' }); }}>
                  Sale 🔥
                </MobileLink>
                <div className="border-t-2 border-gray-200 my-4" />
                <MobileLink onClick={() => { navigate('/storefront/cuenta'); dispatch({ type: 'TOGGLE_MENU_MOVIL' }); }}>
                  Mi Cuenta 👤
                </MobileLink>
              </div>
            </div>
          </div>
        </div>
      )}
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
  isOpen, 
  onToggle, 
  children 
}: { 
  label: string; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) {
  return (
    <li className="relative">
      <button
        onClick={onToggle}
        onMouseEnter={onToggle}
        className="px-4 py-2 text-[15px] font-medium hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div
          onMouseLeave={onToggle}
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-[1000] animate-fade-in"
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

function MobileLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left text-base font-medium hover:text-[#c8ff00] transition-colors py-2"
    >
      {children}
    </button>
  );
}
