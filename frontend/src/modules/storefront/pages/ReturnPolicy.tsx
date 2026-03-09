/**
 * POLITICA DE DEVOLUCIONES
 *
 * Pagina publica con terminos y condiciones de devoluciones.
 * Consume datos de empresa desde endpoint publico /storefront/empresa.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Package, MapPin, Phone, Mail, AlertTriangle, CheckCircle2, Store } from 'lucide-react';
import { apiObtenerEmpresa, type EmpresaStorefrontData , getBasePath } from '../services/storefrontApi';

export default function ReturnPolicy() {
  const [empresa, setEmpresa] = useState<EmpresaStorefrontData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEmpresa = async () => {
      try {
        const data = await apiObtenerEmpresa();
        setEmpresa(data);
      } catch (error) {
        console.warn('[ReturnPolicy] No se pudo cargar datos de empresa:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarEmpresa();
  }, []);

  const nombreEmpresa = empresa?.nombreComercial || 'New Hype';
  const direccion = empresa?.direccion || '';
  const telefono = empresa?.telefono || '';
  const email = empresa?.email || '';
  const diasBoleta = empresa?.diasDevolucionBoleta ?? 7;
  const diasFactura = empresa?.diasDevolucionFactura ?? 30;
  const diasVale = empresa?.diasVigenciaVale ?? 90;
  const requiereEtiquetas = empresa?.requiereEtiquetasOriginales ?? true;
  const requiereSinUso = empresa?.requiereProductoSinUso ?? true;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <ShieldCheck size={48} className="mx-auto mb-4 text-gray-900" />
          <h1 className="text-5xl font-bebas tracking-wider mb-4">POLITICA DE DEVOLUCIONES</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            En {nombreEmpresa} queremos que estes satisfecho con tu compra.
            A continuacion te presentamos nuestros terminos y condiciones para cambios y devoluciones.
          </p>
        </div>

        {/* Resumen rapido */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Clock size={32} className="mx-auto mb-3 text-gray-700" />
            <div className="font-bold text-2xl mb-1">{diasBoleta} - {diasFactura} dias</div>
            <div className="text-sm text-gray-600">Plazo para devoluciones</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Store size={32} className="mx-auto mb-3 text-gray-700" />
            <div className="font-bold text-lg mb-1">Tienda Fisica</div>
            <div className="text-sm text-gray-600">Devoluciones presenciales</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <Package size={32} className="mx-auto mb-3 text-gray-700" />
            <div className="font-bold text-lg mb-1">Producto Original</div>
            <div className="text-sm text-gray-600">Con etiquetas y empaque</div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="space-y-8">
          {/* Seccion 1 */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Plazo para Devoluciones
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Los productos adquiridos en {nombreEmpresa} pueden ser devueltos dentro de los siguientes plazos contados desde la fecha de compra:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Compras con boleta:</strong> hasta {diasBoleta} dias calendario.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Compras con factura:</strong> hasta {diasFactura} dias calendario.</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                Pasados estos plazos, no se aceptaran devoluciones ni cambios.
              </p>
            </div>
          </section>

          {/* Seccion 2 */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Condiciones del Producto
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Para que una devolucion sea aceptada, el producto debe cumplir con las siguientes condiciones:</p>
              <ul className="space-y-2 ml-4">
                {requiereSinUso && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>El producto debe estar <strong>sin uso</strong>, en las mismas condiciones en que fue recibido.</span>
                  </li>
                )}
                {requiereEtiquetas && (
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Debe conservar todas las <strong>etiquetas originales</strong> intactas y adheridas.</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>El <strong>empaque original</strong> debe estar en buen estado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Se debe presentar el <strong>comprobante de pago</strong> (boleta o factura).</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Seccion 3 */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Proceso de Devolucion
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                Las devoluciones deben realizarse <strong>unicamente en nuestra tienda fisica</strong>.
                No se aceptan devoluciones por correo ni por paqueteria.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="font-bold text-gray-900">Pasos para realizar tu devolucion:</div>
                <ol className="space-y-3 ml-4 list-decimal">
                  <li>Acude a nuestra tienda fisica con el producto y tu comprobante de pago.</li>
                  <li>Un asesor de ventas revisara el estado del producto y verificara que cumpla las condiciones.</li>
                  <li>Si la devolucion es aceptada, se procedera con el cambio de producto o la emision de una nota de credito.</li>
                  <li>En caso de reembolso, este se realizara mediante el mismo metodo de pago original.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Seccion 4 */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Cambios de Producto
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Si deseas cambiar un producto por otro modelo, talla o color, aplican las mismas
                condiciones de devolucion. Adicionalmente:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>El cambio esta sujeto a la <strong>disponibilidad de stock</strong> en tienda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Si el producto de cambio tiene un precio mayor, deberas abonar la diferencia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Si el precio es menor, se emitira una <strong>nota de credito</strong> valida por {diasVale} dias.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Seccion 5 - Excepciones */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Productos No Elegibles
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Los siguientes productos <strong>no son elegibles</strong> para devolucion o cambio:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Productos en <strong>liquidacion o promocion</strong> (excepto por defecto de fabrica).</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Ropa interior, trajes de bano y accesorios de uso personal por razones de <strong>higiene</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Productos <strong>personalizados o hechos a medida</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>Productos con signos evidentes de <strong>uso, lavado o alteracion</strong>.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Seccion 6 - Productos defectuosos */}
          <section className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
              Productos Defectuosos
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Si el producto presenta un <strong>defecto de fabrica</strong>, tienes derecho a:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Cambio por un producto identico en perfecto estado.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Reembolso completo del importe pagado.</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                Para productos defectuosos, el plazo se extiende a {diasFactura} dias
                independientemente del tipo de comprobante.
              </p>
            </div>
          </section>

          {/* Datos de contacto de la tienda */}
          <section className="bg-gray-900 text-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Visitanos en Tienda</h2>
            <p className="text-gray-300 mb-6">
              Para realizar tu devolucion o cambio, acude a nuestra tienda fisica con tu producto
              y comprobante de pago:
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {direccion && (
                <div className="flex items-start gap-3">
                  <MapPin size={24} className="text-[#c8ff00] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-gray-400 mb-1">Direccion</div>
                    <div>{direccion}</div>
                  </div>
                </div>
              )}
              {telefono && (
                <div className="flex items-start gap-3">
                  <Phone size={24} className="text-[#c8ff00] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-gray-400 mb-1">Telefono</div>
                    <a href={`tel:${telefono}`} className="hover:text-[#c8ff00] transition">
                      {telefono}
                    </a>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-start gap-3">
                  <Mail size={24} className="text-[#c8ff00] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm text-gray-400 mb-1">Email</div>
                    <a href={`mailto:${email}`} className="hover:text-[#c8ff00] transition">
                      {email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Links de ayuda */}
          <div className="text-center space-y-4 pt-4">
            <p className="text-gray-600">
              ¿Tienes alguna duda sobre nuestra politica de devoluciones?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={`${getBasePath()}/contacto`}
                className="px-8 py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Contactanos
              </Link>
              <Link
                to={`${getBasePath()}/faq`}
                className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-bold hover:bg-gray-50 transition"
              >
                Preguntas Frecuentes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
