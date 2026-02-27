/**
 * 🎛️ FILTER BAR
 * 
 * Barra de filtros contextual para el catálogo.
 * Muestra filtros diferentes según la sección (mujer, hombre, accesorios, etc.)
 * 
 * Replica la funcionalidad de filtrarCatalogo() del HTML original.
 */

import FilterChip from './FilterChip';
import SortDropdown, { type SortOption } from './SortDropdown';
import type { FiltrosProductos } from '@monorepo/shared-types';

export type SeccionCatalogo = 
  | 'inicio'
  | 'mujer' 
  | 'hombre' 
  | 'accesorios' 
  | 'calzado' 
  | 'nuevo' 
  | 'liquidacion';

interface FilterBarProps {
  seccion: SeccionCatalogo;
  filtrosActivos: FiltrosProductos;
  ordenActual: SortOption;
  totalProductos: number;
  onFilterChange: (filtros: FiltrosProductos) => void;
  onSortChange: (ordenar: SortOption) => void;
}

export default function FilterBar({
  seccion,
  filtrosActivos,
  ordenActual,
  totalProductos,
  onFilterChange,
  onSortChange
}: FilterBarProps) {
  
  // Determinar qué filtros mostrar según la sección
  const getFiltrosDisponibles = () => {
    const base: Array<{ label: string; filtro: Partial<FiltrosProductos> }> = [
      { label: 'Todos', filtro: {} }
    ];
    
    switch (seccion) {
      case 'mujer':
        return [
          ...base,
          { label: 'Ropa', filtro: { categoriaId: [1,2,3,4,5] } },
          { label: 'Vestidos', filtro: { categoriaId: 1 } },
          { label: 'Tops & Blusas', filtro: { categoriaId: 2 } },
          { label: 'Jeans', filtro: { categoriaId: 3 } },
          { label: 'Casacas & Blazers', filtro: { categoriaId: 4 } },
          { label: 'Faldas', filtro: { categoriaId: 5 } },
        ];
      
      case 'hombre':
        return [
          ...base,
          { label: 'Ropa', filtro: { categoriaId: [6,7,8] } },
          { label: 'Hoodies & Buzos', filtro: { categoriaId: 6 } },
          { label: 'Camisas & Polos', filtro: { categoriaId: 7 } },
          { label: 'Joggers & Shorts', filtro: { categoriaId: 8 } },
        ];
      
      case 'accesorios':
        return [
          ...base,
          { label: 'Lentes de Sol', filtro: { categoriaId: 9 } },
          { label: 'Bolsos & Carteras', filtro: { categoriaId: 10 } },
          { label: 'Gorras', filtro: { categoriaId: 11 } },
          { label: 'Joyería', filtro: { categoriaId: 12 } },
          { label: 'Relojes', filtro: { categoriaId: 16 } },
        ];
      
      case 'calzado':
        return [
          ...base,
          { label: 'Zapatillas', filtro: { categoriaId: 13 } },
          { label: 'Botas', filtro: { categoriaId: 14 } },
          { label: 'Sandalias', filtro: { categoriaId: 15 } },
        ];
      
      case 'nuevo':
        return [
          ...base,
          { label: 'Mujer', filtro: { generoId: 1 } },
          { label: 'Hombre', filtro: { generoId: 2 } },
          { label: 'Unisex', filtro: { generoId: 3 } },
        ];
      
      case 'liquidacion':
        return [
          ...base,
          { label: 'Mujer', filtro: { generoId: 1 } },
          { label: 'Hombre', filtro: { generoId: 2 } },
          { label: 'Accesorios', filtro: { tipoSeccion: 'accesorios' } },
        ];
      
      default:
        return base;
    }
  };
  
  const filtrosDisponibles = getFiltrosDisponibles();
  
  // Determinar si un filtro está activo
  const isFiltroActivo = (filtro: Partial<FiltrosProductos>) => {
    // Si el filtro es vacío (Todos), verificar que no haya filtros activos
    if (Object.keys(filtro).length === 0) {
      return Object.keys(filtrosActivos).length === 0 ||
             (Object.keys(filtrosActivos).length === 1 && 
              ('generoId' in filtrosActivos || 'soloNuevos' in filtrosActivos || 'soloLiquidacion' in filtrosActivos));
    }
    
    // Comparar categoriaId
    if ('categoriaId' in filtro) {
      if (Array.isArray(filtro.categoriaId)) {
        return JSON.stringify(filtrosActivos.categoriaId) === JSON.stringify(filtro.categoriaId);
      }
      return filtrosActivos.categoriaId === filtro.categoriaId;
    }
    
    // Comparar generoId
    if ('generoId' in filtro) {
      return filtrosActivos.generoId === filtro.generoId;
    }
    
    // Comparar tipoSeccion
    if ('tipoSeccion' in filtro) {
      return filtrosActivos.tipoSeccion === filtro.tipoSeccion;
    }
    
    return false;
  };
  
  // Manejar cambio de filtro
  const handleFiltroClick = (nuevoFiltro: Partial<FiltrosProductos>) => {
    // Construir el objeto de filtros completo basado en la sección
    let filtrosBase: FiltrosProductos = {};
    
    // Mantener filtros base según la sección
    if (seccion === 'mujer') {
      filtrosBase.generoId = 1;
    } else if (seccion === 'hombre') {
      filtrosBase.generoId = 2;
    } else if (seccion === 'accesorios') {
      filtrosBase.tipoSeccion = 'accesorios';
    } else if (seccion === 'calzado') {
      filtrosBase.tipoSeccion = 'calzado';
    } else if (seccion === 'nuevo') {
      filtrosBase.soloNuevos = true;
    } else if (seccion === 'liquidacion') {
      filtrosBase.soloLiquidacion = true;
    }
    
    // Combinar con el nuevo filtro
    const filtrosFinales = { ...filtrosBase, ...nuevoFiltro };
    
    onFilterChange(filtrosFinales);
  };
  
  return (
    <div className="bg-white border-b border-gray-200 sticky top-[70px] z-40">
      <div className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {filtrosDisponibles.map((item, idx) => (
              <FilterChip
                key={idx}
                label={item.label}
                active={isFiltroActivo(item.filtro)}
                onClick={() => handleFiltroClick(item.filtro)}
              />
            ))}
          </div>
          
          {/* Contador + Sort */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium whitespace-nowrap">
              {totalProductos} producto{totalProductos !== 1 ? 's' : ''}
            </span>
            
            <SortDropdown value={ordenActual} onChange={onSortChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
