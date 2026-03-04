/**
 * 🎯 FILTER CHIP
 * 
 * Chip individual de filtro (reutilizable).
 * Usado en FilterBar para mostrar opciones de filtrado.
 */

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export default function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-300
        ${active
          ? 'bg-negro text-white shadow-md'
          : 'bg-white text-gray-700 border border-gray-300 hover:border-negro hover:bg-gray-50'
        }
      `}
    >
      {label}
    </button>
  );
}
