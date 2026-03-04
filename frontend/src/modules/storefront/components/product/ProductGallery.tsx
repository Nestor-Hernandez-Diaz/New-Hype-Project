/**
 * 📸 GALERÍA DE PRODUCTO
 * 
 * Carrusel de imágenes del producto con thumbnails y zoom.
 * Para páginas de detalle de producto.
 * 
 * @example
 * <ProductGallery images={producto.imagenes} alt={producto.nombre} />
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ProductGalleryProps {
  /**
   * Array de URLs de imágenes
   */
  images: string[];
  
  /**
   * Texto alternativo para las imágenes
   */
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [imagenActual, setImagenActual] = useState(0);
  const [zoomActivo, setZoomActivo] = useState(false);
  
  // Si no hay imágenes, mostrar placeholder
  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 rounded-2xl flex items-center justify-center">
        <span className="text-gray-400 text-sm">Sin imagen</span>
      </div>
    );
  }
  
  // Si solo hay una imagen, mostrar simple
  if (images.length === 1) {
    return (
      <div className="relative">
        <img
          src={images[0]}
          alt={alt}
          className="w-full aspect-[3/4] object-cover rounded-2xl"
        />
      </div>
    );
  }
  
  const handleNext = () => {
    setImagenActual((prev) => (prev + 1) % images.length);
  };
  
  const handlePrev = () => {
    setImagenActual((prev) => (prev - 1 + images.length) % images.length);
  };
  
  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <div className="relative group">
        <img
          src={images[imagenActual]}
          alt={`${alt} - Imagen ${imagenActual + 1}`}
          className="w-full aspect-[3/4] object-cover rounded-2xl"
        />
        
        {/* Botones de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="
                absolute left-4 top-1/2 -translate-y-1/2
                w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full
                flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity
                hover:bg-white shadow-lg
              "
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={handleNext}
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full
                flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity
                hover:bg-white shadow-lg
              "
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
        
        {/* Indicador de zoom */}
        <button
          onClick={() => setZoomActivo(!zoomActivo)}
          className="
            absolute bottom-4 right-4
            w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full
            flex items-center justify-center
            opacity-0 group-hover:opacity-100 transition-opacity
            hover:bg-white shadow-lg
          "
          aria-label="Activar zoom"
        >
          <ZoomIn size={18} />
        </button>
        
        {/* Contador de imágenes */}
        <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
          {imagenActual + 1} / {images.length}
        </div>
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((imagen, index) => (
            <button
              key={index}
              onClick={() => setImagenActual(index)}
              className={`
                flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden
                border-2 transition-all
                ${imagenActual === index 
                  ? 'border-black shadow-md' 
                  : 'border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100'
                }
              `}
            >
              <img
                src={imagen}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      
      {/* Modal de Zoom */}
      {zoomActivo && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-8"
          onClick={() => setZoomActivo(false)}
        >
          <button
            onClick={() => setZoomActivo(false)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            aria-label="Cerrar zoom"
          >
            ✕
          </button>
          <img
            src={images[imagenActual]}
            alt={`${alt} - Zoom`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
