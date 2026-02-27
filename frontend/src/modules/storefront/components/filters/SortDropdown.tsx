/**
 * 📊 SORT DROPDOWN
 * 
 * Dropdown para ordenar productos (precio, nombre, nuevo, etc.)
 */

import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export type SortOption = 
  | 'reciente'
  | 'precio-asc'
  | 'precio-desc'
  | 'nombre-asc'
  | 'nombre-desc'
  | 'mas-vendido';

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

const sortLabels: Record<SortOption, string> = {
  'reciente': 'Más reciente',
  'precio-asc': 'Precio: Menor a Mayor',
  'precio-desc': 'Precio: Mayor a Menor',
  'nombre-asc': 'Nombre: A-Z',
  'nombre-desc': 'Nombre: Z-A',
  'mas-vendido': 'Más vendido'
};

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleSelect = (option: SortOption) => {
    onChange(option);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg
          hover:border-negro transition-colors text-sm font-medium
        "
      >
        <span>Ordenar: {sortLabels[value]}</span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="
          absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg
          z-50 overflow-hidden animate-fade-in
        ">
          {(Object.keys(sortLabels) as SortOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`
                w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors
                ${value === option ? 'bg-gray-100 font-medium' : ''}
              `}
            >
              {sortLabels[option]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
