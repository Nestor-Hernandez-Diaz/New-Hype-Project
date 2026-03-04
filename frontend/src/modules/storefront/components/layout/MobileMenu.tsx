/**
 * 📱 MENÚ MÓVIL
 * 
 * Panel lateral deslizable con las opciones de navegación para dispositivos móviles.
 */

import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStorefront } from '../../context/StorefrontContext';

interface MobileMenuProps {
  /**
   * Si el menú está abierto o cerrado
   */
  isOpen: boolean;
  
  /**
   * Callback para cerrar el menú
   */
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;
  
  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-[950] md:hidden">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
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
              onClick={onClose}
              className="p-2"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Enlaces */}
          <div className="flex flex-col gap-4">
            <MobileLink onClick={() => handleNavigate('/storefront/catalogo?filtro=nuevo')}>
              New In ⚡
            </MobileLink>
            <MobileLink onClick={() => handleNavigate('/storefront/catalogo?genero=1')}>
              Mujer
            </MobileLink>
            <MobileLink onClick={() => handleNavigate('/storefront/catalogo?genero=2')}>
              Hombre
            </MobileLink>
            <MobileLink onClick={() => handleNavigate('/storefront/catalogo?seccion=accesorios')}>
              Accesorios
            </MobileLink>
            <MobileLink onClick={() => handleNavigate('/storefront/catalogo?seccion=calzado')}>
              Calzado
            </MobileLink>
            <MobileLink onClick={() => handleNavigate('/storefront/catalogo?liquidacion=true')}>
              Sale 🔥
            </MobileLink>
            <div className="border-t-2 border-gray-200 my-4" />
            <MobileLink onClick={() => handleNavigate('/storefront/cuenta/perfil')}>
              Mi Cuenta 👤
            </MobileLink>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar
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
