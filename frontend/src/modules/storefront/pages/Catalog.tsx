/**
 * 📦 PÁGINA DE CATÁLOGO
 * 
 * Muestra productos con filtros dinámicos, chips y ordenamiento.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStorefront } from '../context/StorefrontContext';
import ProductGrid from '../components/product/ProductGrid';
import type { FiltrosProductos } from '@monorepo/shared-types';
import { SlidersHorizontal } from 'lucide-react';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, cargarProductos } = useStorefront();
  const [titulo, setTitulo] = useState('TODOS LOS PRODUCTOS');
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [ordenActivo, setOrdenActivo] = useState<string>('');
  
  useEffect(() => {
    const filtros: FiltrosProductos = {};
    
    // Leer parámetros de URL
    const genero = searchParams.get('genero');
    const filtro = searchParams.get('filtro');
    const seccion = searchParams.get('seccion');
    const liquidacion = searchParams.get('liquidacion');
    const busqueda = searchParams.get('busqueda');
    const categoria = searchParams.get('categoria');
    const orden = searchParams.get('orden');
    
    // Aplicar filtros
    if (genero) {
      filtros.generoId = parseInt(genero);
      setTitulo(genero === '1' ? 'MUJER' : 'HOMBRE');
    }
    
    if (filtro === 'nuevo') {
      filtros.soloNuevos = true;
      setTitulo('NEW IN ⚡');
      setFiltroActivo('nuevo');
    } else if (filtro === 'mujer-ropa') {
      filtros.generoId = 1;
      filtros.tipoSeccion = 'ropa';
      setTitulo('MUJER — ROPA');
      setFiltroActivo('mujer-ropa');
    } else if (filtro === 'hombre-ropa') {
      filtros.generoId = 2;
      filtros.tipoSeccion = 'ropa';
      setTitulo('HOMBRE — ROPA');
      setFiltroActivo('hombre-ropa');
    }
    
    if (seccion === 'accesorios') {
      filtros.tipoSeccion = 'accesorios';
      setTitulo('ACCESORIOS');
      setFiltroActivo('accesorios');
    } else if (seccion === 'calzado') {
      filtros.tipoSeccion = 'calzado';
      setTitulo('CALZADO');
      setFiltroActivo('calzado');
    }
    
    if (liquidacion === 'true') {
      filtros.soloLiquidacion = true;
      setTitulo('LIQUIDACIÓN 🔥');
      setFiltroActivo('liquidacion');
    }
    
    if (busqueda) {
      filtros.busqueda = busqueda;
      setTitulo(`RESULTADOS: "${busqueda.toUpperCase()}"`);
    }
    
    if (categoria) {
      // TODO: Convertir slug a categoriaId usando CATALOGOS_CATEGORIAS
      // filtros.categoriaId = ...
      setTitulo(categoria.toUpperCase().replace(/-/g, ' '));
      setFiltroActivo(`cat:${categoria}`);
    }
    
    if (orden) {
      filtros.ordenarPor = orden as any;
      setOrdenActivo(orden);
    }
    
    cargarProductos(filtros);
  }, [searchParams, cargarProductos]);
  
  // Generar filtros contextuales basados en la página actual
  const generarFiltrosContextuales = () => {
    const genero = searchParams.get('genero');
    const seccion = searchParams.get('seccion');
    const filtro = searchParams.get('filtro');
    const liquidacion = searchParams.get('liquidacion');
    
    // Filtros para MUJER
    if (genero === '1') {
      return [
        { label: 'Todos', key: 'todos', url: '/storefront/catalogo?genero=1' },
        { label: 'Vestidos', key: 'cat:vestidos', url: '/storefront/catalogo?categoria=vestidos' },
        { label: 'Tops & Blusas', key: 'cat:tops-blusas', url: '/storefront/catalogo?categoria=tops-blusas' },
        { label: 'Jeans', key: 'cat:jeans', url: '/storefront/catalogo?categoria=jeans' },
        { label: 'Casacas', key: 'cat:casacas-blazers', url: '/storefront/catalogo?categoria=casacas-blazers' },
        { label: 'Faldas', key: 'cat:faldas', url: '/storefront/catalogo?categoria=faldas' }
      ];
    }
    
    // Filtros para HOMBRE
    if (genero === '2') {
      return [
        { label: 'Todos', key: 'todos', url: '/storefront/catalogo?genero=2' },
        { label: 'Hoodies', key: 'cat:hoodies-buzos', url: '/storefront/catalogo?categoria=hoodies-buzos' },
        { label: 'Camisas', key: 'cat:camisas-polos', url: '/storefront/catalogo?categoria=camisas-polos' },
        { label: 'Jeans', key: 'cat:jeans', url: '/storefront/catalogo?categoria=jeans' },
        { label: 'Joggers', key: 'cat:joggers-shorts', url: '/storefront/catalogo?categoria=joggers-shorts' },
        { label: 'Casacas', key: 'cat:casacas-blazers', url: '/storefront/catalogo?categoria=casacas-blazers' }
      ];
    }
    
    // Filtros para ACCESORIOS
    if (seccion === 'accesorios') {
      return [
        { label: 'Todos', key: 'todos', url: '/storefront/catalogo?seccion=accesorios' },
        { label: 'Lentes', key: 'cat:lentes-sol', url: '/storefront/catalogo?categoria=lentes-sol' },
        { label: 'Bolsos', key: 'cat:bolsos-carteras', url: '/storefront/catalogo?categoria=bolsos-carteras' },
        { label: 'Gorras', key: 'cat:gorras-sombreros', url: '/storefront/catalogo?categoria=gorras-sombreros' },
        { label: 'Joyería', key: 'cat:joyeria', url: '/storefront/catalogo?categoria=joyeria' },
        { label: 'Relojes', key: 'cat:relojes', url: '/storefront/catalogo?categoria=relojes' }
      ];
    }
    
    // Filtros para CALZADO
    if (seccion === 'calzado') {
      return [
        { label: 'Todos', key: 'todos', url: '/storefront/catalogo?seccion=calzado' },
        { label: 'Zapatillas', key: 'cat:zapatillas', url: '/storefront/catalogo?categoria=zapatillas' },
        { label: 'Botas', key: 'cat:botas', url: '/storefront/catalogo?categoria=botas' },
        { label: 'Sandalias', key: 'cat:sandalias', url: '/storefront/catalogo?categoria=sandalias' }
      ];
    }
    
    // Filtros para NEW IN
    if (filtro === 'nuevo') {
      return [
        { label: 'Todos', key: 'todos', url: '/storefront/catalogo?filtro=nuevo' },
        { label: 'Mujer', key: 'gen:1', url: '/storefront/catalogo?filtro=nuevo&genero=1' },
        { label: 'Hombre', key: 'gen:2', url: '/storefront/catalogo?filtro=nuevo&genero=2' }
      ];
    }
    
    // Filtros para LIQUIDACIÓN
    if (liquidacion === 'true') {
      return [
        { label: 'Todos', key: 'todos', url: '/storefront/catalogo?liquidacion=true' },
        { label: 'Mujer', key: 'gen:1', url: '/storefront/catalogo?liquidacion=true&genero=1' },
        { label: 'Hombre', key: 'gen:2', url: '/storefront/catalogo?liquidacion=true&genero=2' }
      ];
    }
    
    return [];
  };
  
  const filtros = generarFiltrosContextuales();
  
  const handleOrdenar = (orden: string) => {
    const params = new URLSearchParams(searchParams);
    if (orden) {
      params.set('orden', orden);
    } else {
      params.delete('orden');
    }
    navigate(`/storefront/catalogo?${params.toString()}`);
  };
  
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-[1440px] mx-auto px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-bebas text-5xl lg:text-6xl tracking-wider mb-2">{titulo}</h1>
          <p className="text-gray-600 text-sm">
            {state.productos.length} producto{state.productos.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Barra de filtros y ordenamiento */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Filtros con chips */}
          {filtros.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filtros.map(f => (
                <button
                  key={f.key}
                  onClick={() => navigate(f.url)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filtroActivo === f.key || (f.key === 'todos' && !filtroActivo)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          
          {/* Ordenamiento */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-gray-500" />
            <select
              value={ordenActivo}
              onChange={(e) => handleOrdenar(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Ordenar por</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="nombre-asc">Nombre: A-Z</option>
              <option value="nombre-desc">Nombre: Z-A</option>
              <option value="mas-nuevo">Más Nuevos</option>
            </select>
          </div>
        </div>
        
        {/* Grid de productos */}
        <ProductGrid productos={state.productos} loading={state.productosLoading} />
      </div>
    </div>
  );
}
