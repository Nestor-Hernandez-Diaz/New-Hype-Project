/**
 * 🎯 BARRA PROMOCIONAL SUPERIOR
 * 
 * Barra con marquesina infinita y botón para cerrar.
 * Adaptado del diseño original HTML/CSS.
 */

import { useState } from 'react';
import { X } from 'lucide-react';

export default function PromoBar() {
  const [visible, setVisible] = useState(true);
  
  if (!visible) return null;
  
  const promociones = [
    'ENVÍO GRATIS en compras mayores a S/.150 🚀',
    'NUEVOS DROPS CADA SEMANA ⚡',
    'DESCUENTOS EXCLUSIVOS — SOLO ONLINE 🔥'
  ];
  
  return (
    <div className="relative bg-black text-[#c8ff00] h-[38px] flex items-center overflow-hidden z-[1000]">
      {/* Marquesina infinita */}
      <div className="flex gap-[60px] whitespace-nowrap animate-marquee text-xs font-semibold tracking-[1.5px] uppercase">
        {/* Duplicar para efecto infinito */}
        {[...promociones, ...promociones].map((promo, i) => (
          <span key={i} className="flex-shrink-0">{promo}</span>
        ))}
      </div>
      
      {/* Botón cerrar */}
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 text-gray-400 hover:text-white transition-colors duration-300 z-10"
        aria-label="Cerrar barra promocional"
      >
        <X size={18} />
      </button>
      
      {/* Animación CSS personalizada (agregar a index.css) */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
