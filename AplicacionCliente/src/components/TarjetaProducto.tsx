/* =============================================
   TarjetaProducto — Card de producto para grilla
   ============================================= */
import { Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import type { Producto } from '../types';

export function TarjetaProducto({ producto }: { producto: Producto }) {
  const { agregar } = useCarrito();
  const precioFinal = producto.enLiquidacion 
    ? producto.precioVenta * (1 - producto.porcentajeLiquidacion / 100)
    : producto.precioVenta;

  return (
    <div className="producto-tarjeta">
      <Link to={`/producto/${producto.slug}`}>
        <div className="producto-imagen-contenedor">
          <img className="producto-img-principal" src={producto.imagenUrl} alt={producto.nombre} loading="lazy" />
          <div className="producto-insignia">
            {producto.enLiquidacion && (
              <span className="insignia insignia-oferta">-{producto.porcentajeLiquidacion}%</span>
            )}
          </div>
          <button className="agregar-rapido" onClick={e => { e.preventDefault(); agregar(producto); }}>
            {producto.disponible ? 'Agregar al carrito' : 'Agotado'}
          </button>
        </div>
      </Link>
      <div className="producto-info">
        <div className="producto-marca">{producto.categoriaNombre}</div>
        <div className="producto-nombre">{producto.nombre}</div>
        <div className="producto-precio">
          <span className="precio-actual">S/. {precioFinal.toFixed(2)}</span>
          {producto.enLiquidacion && (
            <>
              <span className="precio-original">S/. {producto.precioVenta.toFixed(2)}</span>
              <span className="precio-descuento">-{producto.porcentajeLiquidacion}%</span>
            </>
          )}
        </div>
        {!producto.disponible && <div className="producto-agotado">Agotado</div>}
      </div>
    </div>
  );
}

export default TarjetaProducto;
