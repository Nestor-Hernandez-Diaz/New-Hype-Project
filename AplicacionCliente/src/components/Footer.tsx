import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="pie-pagina">
      <div className="pie-contenido">
        <div className="pie-columna">
          <span className="logo"><span className="logo-new">NEW</span><span className="logo-hype">HYPE</span></span>
          <p style={{ fontSize: '13px', color: 'var(--gris-400)', marginTop: '10px' }}>Tu tienda de moda urbana y streetwear.</p>
          <div className="pie-redes" style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
            <span>📷</span><span>📘</span><span>🐦</span><span>📌</span>
          </div>
        </div>
        <div className="pie-columna">
          <h4>TIENDA</h4>
          <Link to="/catalogo">Todos</Link>
          <Link to="/catalogo?filtro=liquidacion">Liquidación</Link>
        </div>
        <div className="pie-columna">
          <h4>AYUDA</h4>
          <Link to="/seguir-pedido">Seguir mi pedido</Link>
          <Link to="/faq">Preguntas frecuentes</Link>
          <Link to="/guia-tallas">Guía de tallas</Link>
          <Link to="/contacto">Contacto</Link>
        </div>
      </div>
      <div className="pie-inferior">
        <p>© 2026 New Hype. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
