/**
 * 🎬 HOOK: useScrollAnimation
 * 
 * Hook personalizado que usa IntersectionObserver para animar elementos
 * cuando entran en el viewport (similar al JavaScript original).
 * 
 * @example
 * ```tsx
 * const AnimatedDiv = () => {
 *   const ref = useScrollAnimation<HTMLDivElement>();
 *   return <div ref={ref} className="opacity-0">Aparezco al scroll</div>;
 * };
 * ```
 */

import { useEffect, useRef } from 'react';

interface UseScrollAnimationOptions {
  /**
   * Porcentaje del elemento que debe ser visible para activar la animación
   * @default 0.1 (10%)
   */
  threshold?: number;
  
  /**
   * Margen alrededor del viewport para activar antes
   * @default '0px 0px -40px 0px'
   */
  rootMargin?: string;
  
  /**
   * Clase CSS a agregar cuando el elemento es visible
   * @default 'opacity-100 translate-y-0'
   */
  animationClass?: string;
  
  /**
   * Si true, la animación solo ocurre una vez
   * @default true
   */
  once?: boolean;
}

/**
 * Hook que anima un elemento cuando entra en el viewport
 */
export function useScrollAnimation<T extends HTMLElement>(
  options: UseScrollAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -40px 0px',
    animationClass = 'opacity-100 translate-y-0',
    once = true
  } = options;
  
  const elementRef = useRef<T>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // Configurar el observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Agregar clases de animación
            const classes = animationClass.split(' ');
            element.classList.add(...classes);
            
            // Si solo queremos animar una vez, desconectar el observer
            if (once) {
              observer.unobserve(element);
            }
          } else if (!once) {
            // Si queremos que la animación se repita, remover clases
            const classes = animationClass.split(' ');
            element.classList.remove(...classes);
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );
    
    // Observar el elemento
    observer.observe(element);
    
    // Cleanup
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, animationClass, once]);
  
  return elementRef;
}

/**
 * Hook simplificado para el patrón fade-in-up más común
 */
export function useFadeInUp<T extends HTMLElement>(
  options: Omit<UseScrollAnimationOptions, 'animationClass'> = {}
) {
  return useScrollAnimation<T>({
    ...options,
    animationClass: 'animate-fade-in-up opacity-100'
  });
}

/**
 * Hook para aplicar animaciones a múltiples elementos hijos
 * Útil para listas o grillas
 */
export function useScrollAnimationList(
  containerRef: React.RefObject<HTMLElement>,
  options: UseScrollAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -40px 0px',
    once = true
  } = options;
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Obtener todos los elementos con la clase 'animate-on-scroll'
    const elements = container.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove('opacity-100', 'translate-y-0');
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );
    
    // Observar todos los elementos
    elements.forEach(el => observer.observe(el));
    
    // Cleanup
    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [containerRef, threshold, rootMargin, once]);
}
