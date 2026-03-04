/**
 * ⏳ OVERLAY DE PROCESAMIENTO
 * 
 * Muestra animación de procesamiento con mensajes secuenciales y barra de progreso.
 * Usado en checkout para simular validación de pago.
 */

import { useEffect, useState } from 'react';

interface ProcessingOverlayProps {
  isVisible: boolean;
  metodoPago: string;
  onComplete: () => void;
}

const MENSAJES_POR_METODO: Record<string, string[]> = {
  Efectivo: [
    'Registrando pedido...',
    'Confirmando datos...',
    '¡Pedido registrado!'
  ],
  Tarjeta: [
    'Verificando tarjeta...',
    'Procesando pago...',
    'Autorizando transacción...',
    '¡Pago aprobado!'
  ],
  Yape: [
    'Verificando código Yape...',
    'Confirmando pago...',
    '¡Pago verificado!'
  ],
  Plin: [
    'Verificando código Plin...',
    'Confirmando pago...',
    '¡Pago verificado!'
  ],
  Transferencia: [
    'Registrando transferencia...',
    'Validando operación...',
    '¡Transferencia registrada!'
  ]
};

export default function ProcessingOverlay({ isVisible, metodoPago, onComplete }: ProcessingOverlayProps) {
  const [mensajeIndex, setMensajeIndex] = useState(0);
  const [progreso, setProgreso] = useState(0);
  
  const mensajes = MENSAJES_POR_METODO[metodoPago] || ['Procesando...', '¡Completado!'];
  
  useEffect(() => {
    if (!isVisible) {
      setMensajeIndex(0);
      setProgreso(0);
      return;
    }
    
    // Duración total: 3-4 segundos
    const duracionTotal = 3500;
    const intervaloMensaje = duracionTotal / mensajes.length;
    const progresoIncremento = 100 / (duracionTotal / 50); // Actualizar cada 50ms
    
    // Actualizar progreso suavemente
    const progresoInterval = setInterval(() => {
      setProgreso(prev => {
        const nuevo = prev + progresoIncremento;
        return nuevo >= 100 ? 100 : nuevo;
      });
    }, 50);
    
    // Cambiar mensajes secuencialmente
    const mensajeInterval = setInterval(() => {
      setMensajeIndex(prev => {
        const siguiente = prev + 1;
        if (siguiente >= mensajes.length) {
          clearInterval(mensajeInterval);
          clearInterval(progresoInterval);
          // Completar después de mostrar el último mensaje
          setTimeout(() => {
            onComplete();
          }, 500);
        }
        return siguiente;
      });
    }, intervaloMensaje);
    
    return () => {
      clearInterval(mensajeInterval);
      clearInterval(progresoInterval);
    };
  }, [isVisible, mensajes.length, onComplete]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center animate-fade-in">
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Contenido */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md animate-scale-in">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
        
        {/* Mensaje dinámico */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-gray-800 animate-fade-in">
            {mensajes[mensajeIndex]}
          </p>
        </div>
        
        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-black to-gray-700 transition-all duration-100 ease-linear"
            style={{ width: `${progreso}%` }}
          />
        </div>
        
        {/* Porcentaje opcional */}
        <div className="text-center mt-3 text-sm text-gray-500 font-medium">
          {Math.round(progreso)}%
        </div>
      </div>
    </div>
  );
}
