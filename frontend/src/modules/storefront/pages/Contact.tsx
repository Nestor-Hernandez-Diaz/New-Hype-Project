/**
 * 📧 PÁGINA DE CONTACTO
 * 
 * Formulario de contacto para consultas y soporte
 */

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos
    if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    setEnviando(true);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Guardar en localStorage (simulación)
    const mensajes = JSON.parse(localStorage.getItem('nh_mensajes_contacto') || '[]');
    mensajes.push({
      ...formData,
      fecha: new Date().toISOString(),
      id: 'msg_' + Date.now()
    });
    localStorage.setItem('nh_mensajes_contacto', JSON.stringify(mensajes));

    setEnviando(false);
    setEnviado(true);

    // Limpiar formulario
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      asunto: '',
      mensaje: ''
    });

    // Ocultar mensaje de éxito después de 5 segundos
    setTimeout(() => setEnviado(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bebas tracking-wider mb-4">CONTÁCTANOS</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información de contacto */}
          <div className="space-y-6">
            {/* Tarjeta de contacto */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-xl mb-4">Información de Contacto</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-gray-700" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-500 mb-1">Teléfono / WhatsApp</div>
                    <a href="tel:+51999888777" className="text-gray-900 hover:text-blue-600">
                      +51 999 888 777
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-gray-700" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-500 mb-1">Email</div>
                    <a href="mailto:hola@newhype.com" className="text-gray-900 hover:text-blue-600">
                      hola@newhype.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-gray-700" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-500 mb-1">Dirección</div>
                    <p className="text-gray-900">
                      Jr. Comercio 456<br />
                      Tarapoto, San Martín<br />
                      Perú
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horario */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-xl mb-4">Horario de Atención</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Lunes - Viernes:</span>
                  <span className="font-medium">9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sábados:</span>
                  <span className="font-medium">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Domingos:</span>
                  <span className="font-medium">10:00 AM - 2:00 PM</span>
                </div>
              </div>
            </div>

            {/* WhatsApp directo */}
            <a
              href="https://wa.me/51999888777"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-green-600 text-white rounded-lg p-4 hover:bg-green-700 transition text-center"
            >
              <MessageCircle size={24} className="mx-auto mb-2" />
              <div className="font-bold">Chatea con nosotros</div>
              <div className="text-sm opacity-90">Respuesta inmediata por WhatsApp</div>
            </a>
          </div>

          {/* Formulario de contacto */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h3 className="font-bold text-2xl mb-6">Envía tu mensaje</h3>

              {enviado && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-green-900 mb-1">¡Mensaje enviado!</div>
                    <div className="text-sm text-green-700">
                      Gracias por contactarnos. Te responderemos a la brevedad.
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      placeholder="juan@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="999 888 777"
                  />
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <select
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="Consulta sobre productos">Consulta sobre productos</option>
                    <option value="Estado de pedido">Estado de pedido</option>
                    <option value="Problema con entrega">Problema con entrega</option>
                    <option value="Devolución o cambio">Devolución o cambio</option>
                    <option value="Problema con pago">Problema con pago</option>
                    <option value="Sugerencia">Sugerencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                    placeholder="Escribe tu consulta o comentario..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Enviar Mensaje
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  También puedes contactarnos directamente por WhatsApp para obtener una respuesta más rápida
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Mapa (opcional - placeholder) */}
        <div className="mt-12 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin size={48} className="mx-auto mb-2" />
              <p className="text-sm">Mapa de ubicación</p>
              <p className="text-xs">Jr. Comercio 456, Tarapoto</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
