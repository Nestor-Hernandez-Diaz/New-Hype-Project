/**
 * 🔍 BARRA DE BÚSQUEDA
 * 
 * Componente de búsqueda expandible para el Navbar.
 * Se muestra como un panel flotante con input expandido.
 */

import { Search, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  /**
   * Si la barra de búsqueda está visible
   */
  isOpen: boolean;
  
  /**
   * Callback para cerrar la barra
   */
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const navigate = useNavigate();
  const [busquedaTexto, setBusquedaTexto] = useState('');
  
  const handleBuscar = () => {
    if (!busquedaTexto.trim()) return;
    navigate(`/storefront/catalogo?busqueda=${encodeURIComponent(busquedaTexto)}`);
    setBusquedaTexto('');
    onClose();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscar();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
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
        aria-label="Buscar"
      >
        <Search size={16} strokeWidth={2.5} />
      </button>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-md text-gray-500"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
