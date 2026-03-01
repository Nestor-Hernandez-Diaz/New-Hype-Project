import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { ItemCarrito, Producto } from '../types';

interface CarritoContextType {
  items: ItemCarrito[];
  total: number;
  cantidad: number;
  abierto: boolean;
  agregar: (producto: Producto, cantidad?: number) => void;
  eliminar: (index: number) => void;
  actualizarCantidad: (index: number, delta: number) => void;
  vaciar: () => void;
  toggleCarrito: () => void;
  cerrarCarrito: () => void;
}

const CarritoContext = createContext<CarritoContextType | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>(() => {
    try { return JSON.parse(localStorage.getItem('nh_carrito') || '[]'); } catch { return []; }
  });
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    localStorage.setItem('nh_carrito', JSON.stringify(items));
  }, [items]);

  const total = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const cantidad = items.reduce((s, i) => s + i.cantidad, 0);

  const agregar = (p: Producto, cant = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.productoId === p.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + cant };
        return next;
      }
      return [...prev, {
        productoId: p.id,
        sku: p.sku,
        nombreProducto: p.nombre,
        slug: p.slug,
        precioUnitario: p.enLiquidacion ? p.precioVenta * (1 - p.porcentajeLiquidacion / 100) : p.precioVenta,
        imagen: p.imagenUrl || '',
        cantidad: cant,
      }];
    });
    setAbierto(true);
  };

  const eliminar = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));
  
  const actualizarCantidad = (index: number, delta: number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], cantidad: next[index].cantidad + delta };
      if (next[index].cantidad <= 0) next.splice(index, 1);
      return next;
    });
  };

  const vaciar = () => setItems([]);
  const toggleCarrito = () => setAbierto(p => !p);
  const cerrarCarrito = () => setAbierto(false);

  return (
    <CarritoContext.Provider value={{ items, total, cantidad, abierto, agregar, eliminar, actualizarCantidad, vaciar, toggleCarrito, cerrarCarrito }}>
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
}
