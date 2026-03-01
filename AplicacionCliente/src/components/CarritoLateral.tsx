import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';

export default function CarritoLateral() {
  const { items, total, cantidad, abierto, cerrarCarrito, actualizarCantidad, eliminar } = useCarrito();
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const envio = total >= 150 ? 0 : 9.90;

  const irACheckout = () => {
    cerrarCarrito();
    if (!estaAutenticado) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      <div className={`carrito-fondo ${abierto ? 'abierto' : ''}`} onClick={cerrarCarrito}></div>
      <div className={`carrito-lateral ${abierto ? 'abierto' : ''}`}>
        <div className="carrito-cabecera">
          <h3>Tu Carrito <span className="carrito-etiqueta">({cantidad})</span></h3>
          <button className="carrito-cerrar" onClick={cerrarCarrito}>✕</button>
        </div>
        <div className="carrito-cuerpo" id="carritoCuerpo">
          {items.length === 0 ? (
            <div className="carrito-vacio">
              <div className="carrito-vacio-icono">🛍️</div>
              <p>Tu carrito está vacío</p>
              <button className="btn-contorno" onClick={() => { cerrarCarrito(); navigate('/'); }}
                style={{ fontSize: '12px', padding: '10px 25px' }}>Explorar productos</button>
            </div>
          ) : (
            items.map((item, i) => (
              <div key={i} className="carrito-item">
                <div className="carrito-item-img">
                  <img src={item.imagen} alt={item.nombreProducto} />
                </div>
                <div className="carrito-item-info">
                  <div>
                    <div className="carrito-item-nombre">{item.nombreProducto}</div>
                    <div className="carrito-item-meta">{item.sku}</div>
                  </div>
                  <div className="carrito-item-inferior">
                    <div className="carrito-item-cantidad">
                      <button className="carrito-cant-btn" onClick={() => actualizarCantidad(i, -1)}>−</button>
                      <span className="carrito-cant-valor">{item.cantidad}</span>
                      <button className="carrito-cant-btn" onClick={() => actualizarCantidad(i, 1)}>+</button>
                    </div>
                    <div className="carrito-item-precio">S/. {(item.precioUnitario * item.cantidad).toFixed(2)}</div>
                  </div>
                  <button className="carrito-item-eliminar" onClick={() => eliminar(i)}>Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="carrito-pie">
            <div id="carritoEnvioMsg" style={{ fontSize: '12px', textAlign: 'center', marginBottom: '8px', color: total >= 150 ? '#22c55e' : 'var(--gris-500)' }}>
              {total >= 150 ? '✓ ¡Tienes envío gratis!' : `Agrega S/.${(150 - total).toFixed(2)} más para envío gratis`}
            </div>
            <div className="carrito-subtotal-fila">
              <span>Subtotal</span>
              <span className="carrito-subtotal">S/. {total.toFixed(2)}</span>
            </div>
            {envio > 0 && (
              <div className="carrito-subtotal-fila" style={{ fontSize: '12px', color: 'var(--gris-400)' }}>
                <span>Envío</span><span>S/. {envio.toFixed(2)}</span>
              </div>
            )}
            <button className="btn-checkout" onClick={irACheckout}>
              Ir al Checkout — S/. {(total + envio).toFixed(2)}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
