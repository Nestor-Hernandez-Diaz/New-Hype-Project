/**
 * 📄 PIE DE PÁGINA
 * 
 * Footer con links, redes sociales y newsletter.
 */

import { Instagram, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export default function Footer() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  
  const handleNewsletter = () => {
    if (!email.trim()) return;
    showToast('¡Gracias por suscribirte! 🎉', 'success');
    setEmail('');
  };
  
  return (
    <footer className="bg-black text-white">
      {/* Sección superior */}
      <div className="border-b border-gray-800">
        <div className="max-w-[1440px] mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Columna 1: Marca */}
            <div>
              <div className="font-bebas text-2xl tracking-wider mb-4">
                <span>NEW</span>
                <span className="bg-[#c8ff00] text-black px-2 py-0.5 ml-1">HYPE</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Tu destino de moda urbana. Estilo, actitud y las últimas tendencias en un solo lugar.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#c8ff00] hover:text-black transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#c8ff00] hover:text-black transition-colors duration-300"
                  aria-label="TikTok"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.16V11.7a4.84 4.84 0 01-3.57-1.42V6.69h3.57z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#c8ff00] hover:text-black transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>
            
            {/* Columna 2: Tienda */}
            <div>
              <h4 className="font-bold text-base mb-4">Tienda</h4>
              <div className="flex flex-col gap-3">
                <FooterLink onClick={() => navigate('/storefront/catalogo?genero=1')}>Mujer</FooterLink>
                <FooterLink onClick={() => navigate('/storefront/catalogo?genero=2')}>Hombre</FooterLink>
                <FooterLink onClick={() => navigate('/storefront/catalogo?seccion=accesorios')}>Accesorios</FooterLink>
                <FooterLink onClick={() => navigate('/storefront/catalogo?seccion=calzado')}>Calzado</FooterLink>
                <FooterLink onClick={() => navigate('/storefront/catalogo?liquidacion=true')}>Sale</FooterLink>
              </div>
            </div>
            
            {/* Columna 3: Ayuda */}
            <div>
              <h4 className="font-bold text-base mb-4">Ayuda</h4>
              <div className="flex flex-col gap-3">
                <FooterLink onClick={() => navigate('/storefront/seguir-pedido')}>Seguir mi pedido</FooterLink>
                <FooterLink onClick={() => showToast('Devoluciones — Próximamente', 'info')}>Devoluciones</FooterLink>
                <FooterLink onClick={() => navigate('/storefront/guia-tallas')}>Guía de tallas</FooterLink>
                <FooterLink onClick={() => navigate('/storefront/faq')}>Preguntas frecuentes</FooterLink>
                <FooterLink onClick={() => navigate('/storefront/contacto')}>Contacto</FooterLink>
              </div>
            </div>
            
            {/* Columna 4: Newsletter */}
            <div>
              <h4 className="font-bold text-base mb-4">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-4">
                Suscríbete y obtén 15% OFF en tu primera compra.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Tu email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewsletter()}
                  className="flex-1 px-4 py-2.5 bg-gray-800 text-white text-sm rounded-md outline-none focus:ring-2 focus:ring-[#c8ff00] transition-all"
                />
                <button
                  onClick={handleNewsletter}
                  className="px-4 py-2.5 bg-[#c8ff00] text-black font-bold rounded-md hover:bg-[#a8d600] transition-colors"
                  aria-label="Suscribirse"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sección inferior */}
      <div className="py-6">
        <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2025 New Hype. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <span>💳 Visa</span>
            <span>💳 Mastercard</span>
            <span>📱 Yape</span>
            <span>📱 Plin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Componente auxiliar
function FooterLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-400 hover:text-[#c8ff00] transition-colors text-left"
    >
      {children}
    </button>
  );
}
