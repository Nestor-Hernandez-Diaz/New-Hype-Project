/**
 * PAGINA DE CATALOGO
 *
 * Muestra productos con filtros dinamicos desde BD, chips y ordenamiento.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStorefront } from '../context/StorefrontContext';
import ProductGrid from '../components/product/ProductGrid';
import FilterChip from '../components/filters/FilterChip';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { apiObtenerCategorias, apiObtenerCatalogos , getBasePath } from '../services/storefrontApi';
import type { FiltrosProductos, CategoriaStorefront, Genero } from '@monorepo/shared-types';
import { SlidersHorizontal } from 'lucide-react';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, cargarProductos } = useStorefront();
  const [titulo, setTitulo] = useState('TODOS LOS PRODUCTOS');
  const [filtroActivo, setFiltroActivo] = useState<string>('todos');
  const [ordenActivo, setOrdenActivo] = useState<string>('');
  const [categorias, setCategorias] = useState<CategoriaStorefront[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);

  // Ref para animacion de scroll
  const gridRef = useScrollAnimation<HTMLDivElement>();

  // Cargar categorias y generos desde BD
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [cats, catalogos] = await Promise.all([
          apiObtenerCategorias(),
          apiObtenerCatalogos()
        ]);
        setCategorias(cats || []);
        setGeneros(catalogos.generos || []);
      } catch (error) {
        console.error('[Catalog] Error cargando catalogos:', error);
      }
    };
    cargarCatalogos();
  }, []);

  useEffect(() => {
    const filtros: FiltrosProductos = {};

    // Leer parametros de URL
    const genero = searchParams.get('genero');
    const liquidacion = searchParams.get('liquidacion');
    const busqueda = searchParams.get('busqueda');
    const categoria = searchParams.get('categoria');
    const orden = searchParams.get('orden');

    // Aplicar filtros
    if (genero) {
      filtros.generoId = parseInt(genero);
      // Buscar nombre del genero en la lista cargada
      const generoObj = generos.find(g => g.id === parseInt(genero));
      setTitulo(generoObj ? generoObj.descripcion.toUpperCase() : `GENERO ${genero}`);
    }

    if (liquidacion === 'true') {
      filtros.soloLiquidacion = true;
      setTitulo('LIQUIDACION');
      setFiltroActivo('liquidacion');
    }

    if (busqueda) {
      filtros.busqueda = busqueda;
      setTitulo(`RESULTADOS: "${busqueda.toUpperCase()}"`);
    }

    if (categoria) {
      // Buscar categoriaId real usando las categorias cargadas desde BD
      const catObj = categorias.find(c => c.slug === categoria);
      if (catObj) {
        filtros.categoriaId = catObj.id;
      }
      setTitulo(categoria.toUpperCase().replace(/-/g, ' '));
      setFiltroActivo(`cat:${categoria}`);
    }

    if (orden) {
      filtros.ordenarPor = orden as any;
      setOrdenActivo(orden);
    }

    if (!genero && !liquidacion && !busqueda && !categoria) {
      setTitulo('TODOS LOS PRODUCTOS');
      setFiltroActivo('todos');
    }

    cargarProductos(filtros);
  }, [searchParams, cargarProductos, categorias, generos]);

  // Generar filtros contextuales basados en la pagina actual y datos reales de BD
  const generarFiltrosContextuales = () => {
    const genero = searchParams.get('genero');
    const liquidacion = searchParams.get('liquidacion');

    // Si estamos filtrando por un genero, mostrar categorias como chips
    if (genero) {
      const generoId = parseInt(genero);
      const generoObj = generos.find(g => g.id === generoId);
      const generoNombre = generoObj ? generoObj.descripcion.toLowerCase() : '';
      
      // Filtrar categorías según el género
      const categoriasFiltradas = categorias.filter(cat => {
        const nombreCat = cat.nombre.toLowerCase();
        
        if (generoNombre.includes('hombre') || generoNombre.includes('masculino')) {
          // Categorías de hombre: deben contener "hombre" o no contener "mujer"
          return nombreCat.includes('hombre') || 
                 (!nombreCat.includes('mujer') && !nombreCat.includes('femenino'));
        } else if (generoNombre.includes('mujer') || generoNombre.includes('femenino')) {
          // Categorías de mujer: deben contener "mujer" o palabras femeninas
          return nombreCat.includes('mujer') || 
                 nombreCat.includes('femenino') ||
                 nombreCat.includes('blusa') ||
                 nombreCat.includes('falda') ||
                 nombreCat.includes('vestido');
        } else {
          // Para otros géneros (unisex, etc), mostrar todas
          return true;
        }
      });
      
      return [
        { label: 'Todos', key: 'todos', url: `${getBasePath()}/catalogo?genero=${generoId}` },
        ...categoriasFiltradas.map(cat => ({
          label: cat.nombre,
          key: `cat:${cat.slug}`,
          url: `${getBasePath()}/catalogo?genero=${generoId}&categoria=${cat.slug}`
        }))
      ];
    }

    // Filtros para LIQUIDACION - chips de generos dinamicos
    if (liquidacion === 'true') {
      return [
        { label: 'Todos', key: 'todos', url: `${getBasePath()}/catalogo?liquidacion=true` },
        ...generos.map(g => ({
          label: g.descripcion,
          key: `gen:${g.id}`,
          url: `${getBasePath()}/catalogo?liquidacion=true&genero=${g.id}`
        }))
      ];
    }

    // Sin filtro especifico: mostrar generos como chips
    if (!searchParams.get('busqueda') && !searchParams.get('categoria')) {
      return [
        { label: 'Todos', key: 'todos', url: `${getBasePath()}/catalogo` },
        ...generos.map(g => ({
          label: g.descripcion,
          key: `gen:${g.id}`,
          url: `${getBasePath()}/catalogo?genero=${g.id}`
        }))
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
    navigate(`${getBasePath()}/catalogo?${params.toString()}`);
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
                <FilterChip
                  key={f.key}
                  label={f.label}
                  active={filtroActivo === f.key || (f.key === 'todos' && filtroActivo === 'todos')}
                  onClick={() => navigate(f.url)}
                />
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
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nombre_asc">Nombre: A-Z</option>
              <option value="nombre_desc">Nombre: Z-A</option>
              <option value="nuevo">Mas Nuevos</option>
            </select>
          </div>
        </div>

        {/* Grid de productos */}
        <div ref={gridRef} className="opacity-0 translate-y-4 transition-all duration-700">
          <ProductGrid productos={state.productos} loading={state.productosLoading} />
        </div>
      </div>
    </div>
  );
}
