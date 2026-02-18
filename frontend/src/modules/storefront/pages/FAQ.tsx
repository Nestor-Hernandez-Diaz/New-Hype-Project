/**
 * ❓ PÁGINA DE PREGUNTAS FRECUENTES (FAQ)
 * 
 * Preguntas y respuestas frecuentes organizadas por categorías
 */

import { useState } from 'react';
import { ChevronDown, Package, Truck, CreditCard, RefreshCw, ShoppingBag, User } from 'lucide-react';

interface FAQItem {
  pregunta: string;
  respuesta: string;
  categoria: 'pedidos' | 'envios' | 'pagos' | 'devoluciones' | 'productos' | 'cuenta';
}

const FAQS: FAQItem[] = [
  // PEDIDOS
  {
    categoria: 'pedidos',
    pregunta: '¿Cómo puedo realizar un pedido?',
    respuesta: 'Para realizar un pedido, selecciona los productos que deseas, elige talla y color, agrégalos al carrito y sigue el proceso de checkout ingresando tus datos y seleccionando el método de pago.'
  },
  {
    categoria: 'pedidos',
    pregunta: '¿Puedo modificar mi pedido después de realizarlo?',
    respuesta: 'Solo puedes modificar tu pedido si aún está en estado "Pendiente". Contáctanos inmediatamente al WhatsApp 999-888-777 para solicitar una modificación.'
  },
  {
    categoria: 'pedidos',
    pregunta: '¿Cómo puedo cancelar mi pedido?',
    respuesta: 'Puedes cancelar tu pedido desde la sección "Mis Pedidos" si el estado es "Pendiente". Si ya está en proceso, contacta con nosotros para verificar si es posible la cancelación.'
  },
  {
    categoria: 'pedidos',
    pregunta: '¿Puedo cambiar la dirección de envío después de hacer el pedido?',
    respuesta: 'Si el pedido aún no ha sido enviado, contáctanos inmediatamente al WhatsApp 999-888-777 para solicitar el cambio de dirección.'
  },
  
  // ENVÍOS
  {
    categoria: 'envios',
    pregunta: '¿Cuánto tiempo tarda en llegar mi pedido?',
    respuesta: 'Los pedidos dentro de Tarapoto llegan en 24-48 horas. Para el resto del país, el tiempo de entrega es de 3-5 días hábiles dependiendo de la ubicación.'
  },
  {
    categoria: 'envios',
    pregunta: '¿Cuánto cuesta el envío?',
    respuesta: 'El envío tiene un costo de S/. 9.90. Sin embargo, si tu compra supera los S/. 150, el envío es GRATIS.'
  },
  {
    categoria: 'envios',
    pregunta: '¿Realizan envíos a todo el Perú?',
    respuesta: 'Sí, realizamos envíos a todo el Perú a través de agencias de transporte confiables. Los tiempos de entrega varían según la ubicación.'
  },
  {
    categoria: 'envios',
    pregunta: '¿Puedo recoger mi pedido en tienda?',
    respuesta: 'Sí, puedes seleccionar la opción "Retiro en tienda" durante el checkout. Tu pedido estará disponible en nuestra tienda ubicada en Jr. Comercio 456, Tarapoto, en 24 horas.'
  },
  {
    categoria: 'envios',
    pregunta: '¿Cómo puedo rastrear mi pedido?',
    respuesta: 'Una vez que tu pedido sea enviado, recibirás un código de seguimiento por correo. También puedes rastrear tu pedido desde la sección "Seguir Pedido" en nuestra web.'
  },
  
  // PAGOS
  {
    categoria: 'pagos',
    pregunta: '¿Qué métodos de pago aceptan?',
    respuesta: 'Aceptamos tarjetas de crédito/débito (Visa, Mastercard), Yape, Plin, transferencias bancarias y pago contra entrega (solo en Tarapoto).'
  },
  {
    categoria: 'pagos',
    pregunta: '¿Es seguro pagar con tarjeta en su sitio?',
    respuesta: 'Sí, todas las transacciones están encriptadas con certificado SSL. Tus datos bancarios son procesados de forma segura y nunca almacenamos información de tarjetas.'
  },
  {
    categoria: 'pagos',
    pregunta: '¿Puedo pagar en cuotas?',
    respuesta: 'Sí, si pagas con tarjeta de crédito, puedes diferir tu compra en cuotas según las políticas de tu banco emisor.'
  },
  {
    categoria: 'pagos',
    pregunta: '¿Qué hago si mi pago fue rechazado?',
    respuesta: 'Verifica que los datos de tu tarjeta sean correctos y que tengas fondos disponibles. Si el problema persiste, contacta a tu banco o intenta con otro método de pago.'
  },
  
  // DEVOLUCIONES
  {
    categoria: 'devoluciones',
    pregunta: '¿Cuál es su política de devoluciones?',
    respuesta: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar sin usar, con etiquetas originales y en su empaque original.'
  },
  {
    categoria: 'devoluciones',
    pregunta: '¿Cómo puedo solicitar una devolución?',
    respuesta: 'Ve a "Mis Pedidos", selecciona el pedido y haz clic en "Solicitar Devolución". Completa el formulario indicando el motivo y te enviaremos las instrucciones.'
  },
  {
    categoria: 'devoluciones',
    pregunta: '¿Cuánto tiempo tarda el reembolso?',
    respuesta: 'Una vez que recibamos y validemos la devolución, el reembolso se procesará en 5-7 días hábiles. El tiempo de acreditación depende de tu banco.'
  },
  {
    categoria: 'devoluciones',
    pregunta: '¿Puedo cambiar un producto por otra talla o color?',
    respuesta: 'Sí, puedes solicitar un cambio desde "Mis Pedidos". Los cambios están sujetos a disponibilidad de stock.'
  },
  
  // PRODUCTOS
  {
    categoria: 'productos',
    pregunta: '¿Cómo sé qué talla elegir?',
    respuesta: 'Consulta nuestra Guía de Tallas donde encontrarás tablas detalladas para cada tipo de prenda. Si tienes dudas, contáctanos para asesorarte.'
  },
  {
    categoria: 'productos',
    pregunta: '¿Los colores son exactos a las fotos?',
    respuesta: 'Hacemos nuestro mejor esfuerzo para que las fotos sean fieles al producto real, pero pueden existir ligeras variaciones debido a la configuración de tu pantalla.'
  },
  {
    categoria: 'productos',
    pregunta: '¿Cuándo reciben nuevos productos?',
    respuesta: 'Actualizamos nuestro catálogo semanalmente con nuevos diseños y colores. Suscríbete a nuestro newsletter para recibir alertas de nuevos productos.'
  },
  {
    categoria: 'productos',
    pregunta: '¿Qué hago si el producto que quiero está agotado?',
    respuesta: 'Puedes registrarte para recibir una notificación cuando el producto vuelva a estar disponible. También puedes consultarnos por WhatsApp para conocer la fecha estimada de reposición.'
  },
  
  // CUENTA
  {
    categoria: 'cuenta',
    pregunta: '¿Necesito crear una cuenta para comprar?',
    respuesta: 'No es obligatorio, pero crear una cuenta te permite guardar tus direcciones, ver tu historial de compras y hacer seguimiento de tus pedidos más fácilmente.'
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Cómo cambio mi contraseña?',
    respuesta: 'Ve a "Mi Perfil" y selecciona "Cambiar Contraseña". Ingresa tu contraseña actual y la nueva contraseña dos veces para confirmar.'
  },
  {
    categoria: 'cuenta',
    pregunta: '¿Puedo eliminar mi cuenta?',
    respuesta: 'Sí, puedes solicitar la eliminación de tu cuenta contactándonos al correo soporte@newhype.com. Ten en cuenta que esta acción es irreversible.'
  }
];

const CATEGORIAS = [
  { id: 'todos', label: 'Todos', icon: <Package size={20} /> },
  { id: 'pedidos', label: 'Pedidos', icon: <ShoppingBag size={20} /> },
  { id: 'envios', label: 'Envíos', icon: <Truck size={20} /> },
  { id: 'pagos', label: 'Pagos', icon: <CreditCard size={20} /> },
  { id: 'devoluciones', label: 'Devoluciones', icon: <RefreshCw size={20} /> },
  { id: 'productos', label: 'Productos', icon: <Package size={20} /> },
  { id: 'cuenta', label: 'Cuenta', icon: <User size={20} /> }
];

export default function FAQ() {
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null);

  const faqsFiltrados = categoriaActiva === 'todos' 
    ? FAQS 
    : FAQS.filter(faq => faq.categoria === categoriaActiva);

  const togglePregunta = (index: number) => {
    setPreguntaAbierta(preguntaAbierta === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bebas tracking-wider mb-4">PREGUNTAS FRECUENTES</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre nuestros productos, envíos, pagos y más.
          </p>
        </div>

        {/* Filtros por categoría */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIAS.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => setCategoriaActiva(categoria.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${
                  categoriaActiva === categoria.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {categoria.icon}
                <span>{categoria.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de preguntas */}
        <div className="space-y-3">
          {faqsFiltrados.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => togglePregunta(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.pregunta}</span>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-gray-500 transition-transform ${
                    preguntaAbierta === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {preguntaAbierta === index && (
                <div className="px-6 pb-4 text-gray-600 animate-fade-in">
                  {faq.respuesta}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contacto */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h2>
          <p className="mb-6 text-gray-300">
            Nuestro equipo de soporte está disponible para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/storefront/contacto"
              className="inline-block px-8 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Enviar Mensaje
            </a>
            <a
              href="https://wa.me/51999888777"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-gray-900 transition"
            >
              WhatsApp: 999-888-777
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
