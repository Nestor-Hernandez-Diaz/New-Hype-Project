# 🚀 GUÍA DE IMPLEMENTACIÓN RÁPIDA - NUEVOS COMPONENTES

**Fecha:** 26 de Febrero, 2026  
**Componentes Creados:** Toast System, FilterBar, useScrollAnimation  
**Tiempo estimado:** 30-45 minutos

---

## 📦 COMPONENTES NUEVOS CREADOS

### ✅ Completados en esta sesión:

1. **Toast Notification System**
   - `ToastContext.tsx` - Context provider
   - `Toast.tsx` - Componente individual
   - `ToastContainer.tsx` - Contenedor principal
   
2. **Filter System**
   - `FilterBar.tsx` - Barra completa de filtros
   - `FilterChip.tsx` - Chip individual
   - `SortDropdown.tsx` - Dropdown de ordenamiento

3. **Hooks**
   - `useScrollAnimation.ts` - Hook de animación al scroll
   
4. **Configuración**
   - Animaciones agregadas a `tailwind.config.js`
   - Exports actualizados en `index.ts`

---

## 🔧 PASO 1: Integrar Toast Provider

### 1.1 Actualizar StorefrontLayout.tsx

Busca el archivo:
```
frontend/src/modules/storefront/pages/StorefrontLayout.tsx
```

Envuelve el contenido con `ToastProvider`:

```tsx
import { ToastProvider } from '../context/ToastContext';
import ToastContainer from '../components/common/ToastContainer';

export default function StorefrontLayout() {
  return (
    <StorefrontProvider>
      <ToastProvider>
        <div className="min-h-screen flex flex-col">
          <PromoBar />
          <Navbar />
          
          {/* Contenido principal */}
          <main className="flex-1">
            <Outlet />
          </main>
          
          <Footer />
          <CartSidebar />
          
          {/* Toast Container - NUEVO */}
          <ToastContainer />
        </div>
      </ToastProvider>
    </StorefrontProvider>
  );
}
```

### 1.2 Usar Toast en cualquier componente

```tsx
import { useToast } from '../context/ToastContext';

function MiComponente() {
  const { showToast } = useToast();
  
  const handleAccion = () => {
    showToast('¡Producto agregado al carrito!', 'success');
    // showToast('Error al procesar', 'error');
    // showToast('Información importante', 'info');
    // showToast('Advertencia', 'warning');
  };
  
  return <button onClick={handleAccion}>Agregar</button>;
}
```

### 1.3 Reemplazar `alert()` por `showToast()`

**Buscar y reemplazar en todos los archivos:**

❌ **Antes:**
```tsx
alert('Producto agregado!');
```

✅ **Después:**
```tsx
showToast('Producto agregado!', 'success');
```

**Archivos a actualizar:**
- `Checkout.tsx` - Validaciones de formulario
- `Profile.tsx` - Guardado de datos
- `Contact.tsx` - Envío de formulario
- `CartSidebar.tsx` - Agregar/eliminar productos

---

## 🔧 PASO 2: Integrar FilterBar en Catalog

### 2.1 Actualizar Catalog.tsx

```tsx
import { useState } from 'react';
import FilterBar, { type SeccionCatalogo } from '../components/filters/FilterBar';
import type { SortOption } from '../components/filters/SortDropdown';
import { useSearchParams } from 'react-router-dom';

export default function Catalog() {
  const [searchParams] = useSearchParams();
  const [ordenActual, setOrdenActual] = useState<SortOption>('reciente');
  
  // Determinar la sección actual
  const genero = searchParams.get('genero');
  const filtro = searchParams.get('filtro');
  
  let seccion: SeccionCatalogo = 'inicio';
  if (genero === '1') seccion = 'mujer';
  else if (genero === '2') seccion = 'hombre';
  else if (filtro === 'nuevo') seccion = 'nuevo';
  else if (filtro === 'liquidacion') seccion = 'liquidacion';
  else if (filtro === 'accesorios') seccion = 'accesorios';
  else if (filtro === 'calzado') seccion = 'calzado';
  
  const { state, cargarProductos } = useStorefront();
  
  const handleFilterChange = (nuevosFiltros: FiltrosProductos) => {
    // Aplicar filtros
    cargarProductos(nuevosFiltros);
  };
  
  const handleSortChange = (orden: SortOption) => {
    setOrdenActual(orden);
    // Aplicar ordenamiento
    const filtrosConOrden = {
      ...state.filtrosActivos,
      ordenarPor: orden
    };
    cargarProductos(filtrosConOrden);
  };
  
  return (
    <div>
      {/* Header del catálogo */}
      <div className="bg-white border-b py-12">
        <div className="max-w-[1440px] mx-auto px-8 text-center">
          <h1 className="font-bebas text-6xl tracking-wider">
            {seccion === 'mujer' && 'MUJER'}
            {seccion === 'hombre' && 'HOMBRE'}
            {seccion === 'nuevo' && 'NEW IN'}
            {seccion === 'liquidacion' && 'SALE'}
            {seccion === 'accesorios' && 'ACCESORIOS'}
            {seccion === 'calzado' && 'CALZADO'}
          </h1>
        </div>
      </div>
      
      {/* FilterBar - NUEVO */}
      <FilterBar
        seccion={seccion}
        filtrosActivos={state.filtrosActivos}
        ordenActual={ordenActual}
        totalProductos={state.productos.length}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      
      {/* Grilla de productos */}
      <div className="max-w-[1440px] mx-auto px-8 py-12">
        <ProductGrid productos={state.productos} />
      </div>
    </div>
  );
}
```

---

## 🔧 PASO 3: Usar useScrollAnimation

### 3.1 En Componentes Individuales

```tsx
import { useFadeInUp } from '../hooks/useScrollAnimation';

function ProductCard({ producto }: ProductCardProps) {
  const ref = useFadeInUp<HTMLDivElement>();
  
  return (
    <div 
      ref={ref}
      className="opacity-0 translate-y-8 transition-all duration-600"
    >
      {/* Contenido de la tarjeta */}
    </div>
  );
}
```

### 3.2 En Listas/Grillas

```tsx
import { useRef } from 'react';
import { useScrollAnimationList } from '../hooks/useScrollAnimation';

function ProductGrid({ productos }: ProductGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animar todos los hijos con clase 'animate-on-scroll'
  useScrollAnimationList(containerRef);
  
  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {productos.map(producto => (
        <div 
          key={producto.id}
          className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-600"
        >
          <ProductCard producto={producto} />
        </div>
      ))}
    </div>
  );
}
```

### 3.3 En la Página Home

```tsx
import { useFadeInUp } from '../hooks/useScrollAnimation';

export default function Home() {
  const tituloRef = useFadeInUp<HTMLDivElement>();
  const categoriasRef = useFadeInUp<HTMLDivElement>();
  
  return (
    <div>
      {/* Hero */}
      <section>...</section>
      
      {/* Categorías */}
      <section className="py-16">
        <div 
          ref={tituloRef}
          className="text-center mb-12 opacity-0 translate-y-8"
        >
          <h2 className="font-bebas text-6xl">CATEGORÍAS</h2>
        </div>
        
        <div 
          ref={categoriasRef}
          className="grid grid-cols-4 gap-6 opacity-0 translate-y-8"
        >
          {/* Tarjetas de categorías */}
        </div>
      </section>
    </div>
  );
}
```

---

## 🔧 PASO 4: Actualizar ProductCard con Toast

```tsx
import { useToast } from '../../context/ToastContext';

export default function ProductCard({ producto }: ProductCardProps) {
  const { dispatch } = useStorefront();
  const { showToast } = useToast(); // NUEVO
  
  const handleAgregarRapido = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (producto.stockTotal === 0) {
      showToast('Producto agotado', 'error'); // NUEVO
      return;
    }
    
    // ... lógica de agregar al carrito ...
    
    dispatch({ type: 'AGREGAR_AL_CARRITO', payload: itemCarrito });
    dispatch({ type: 'ABRIR_CARRITO' });
    
    showToast(`✓ ${producto.nombre} agregado al carrito`, 'success'); // NUEVO
  };
  
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

---

## 🧪 PASO 5: Verificación y Testing

### 5.1 Compilar TypeScript

```bash
cd frontend
npx tsc --noEmit
```

✅ **Esperado:** Sin errores de compilación

### 5.2 Ejecutar el Dev Server

```bash
npm run dev
```

### 5.3 Pruebas Manuales

#### Test 1: Toast System
1. Navega a `/storefront`
2. Agrega un producto al carrito
3. ✅ **Verificar:** Toast verde aparece en esquina inferior derecha
4. Espera 3 segundos
5. ✅ **Verificar:** Toast desaparece automáticamente

#### Test 2: FilterBar
1. Navega a `/storefront/catalogo?genero=1` (Mujer)
2. ✅ **Verificar:** FilterBar muestra filtros de mujer (Ropa, Vestidos, etc.)
3. Click en "Vestidos"
4. ✅ **Verificar:** Solo se muestran vestidos
5. Click en dropdown "Ordenar"
6. ✅ **Verificar:** Se puede ordenar por precio

#### Test 3: Scroll Animations
1. Navega a `/storefront`
2. Haz scroll hacia abajo
3. ✅ **Verificar:** Secciones aparecen con animación fade-in-up
4. Productos aparecen gradualmente

---

## 📝 CHECKLIST DE INTEGRACIÓN

```
□ ToastProvider agregado en StorefrontLayout
□ ToastContainer montado en el layout
□ Todos los alert() reemplazados por showToast()
□ FilterBar integrado en Catalog.tsx
□ FilterBar responde a cambios de filtro
□ SortDropdown ordena correctamente
□ useScrollAnimation usado en Home
□ useScrollAnimation usado en ProductGrid
□ Animaciones de Tailwind funcionando
□ TypeScript compila sin errores
□ No hay errores en consola del navegador
□ Todos los tests manuales pasan
```

---

## 🐛 TROUBLESHOOTING

### Error: "useToast must be used within ToastProvider"

**Solución:** Asegúrate de que el componente que usa `useToast` esté dentro de `ToastProvider` en el árbol de componentes.

```tsx
// ❌ MAL
<div>
  <ComponenteQueUsaToast />
  <ToastProvider>...</ToastProvider>
</div>

// ✅ BIEN
<ToastProvider>
  <ComponenteQueUsaToast />
</ToastProvider>
```

### FilterBar no muestra productos

**Solución:** Verifica que `cargarProductos()` en `StorefrontContext` esté implementado correctamente y llame a `apiObtenerProductos()`.

### Animaciones no funcionan

**Solución:** 
1. Verifica que `tailwind.config.js` tiene las animaciones
2. Asegúrate de tener clases iniciales: `opacity-0 translate-y-8`
3. Verifica que el elemento tiene `transition-all duration-600`

---

## 🎯 PRÓXIMAS MEJORAS (Opcional)

### A. Mejorar ProcessingOverlay
- Agregar mensajes específicos por método de pago
- Mejorar barra de progreso

### B. Crear ProductGallery
- Galería de imágenes con thumbnails
- Zoom on hover

### C. Dividir Checkout
- Extraer `ShippingForm`, `PaymentForm`, `StepIndicator`

### D. Mobile Improvements
- Extraer `MobileMenu` del Navbar
- Mejorar gestos táctiles

---

## 📚 RECURSOS

### Documentación de Componentes

- **Toast**: Ver `ToastContext.tsx` líneas 1-50
- **FilterBar**: Ver `FilterBar.tsx` líneas 1-30
- **useScrollAnimation**: Ver `useScrollAnimation.ts` líneas 1-40

### Archivos Modificados

```
✅ frontend/src/modules/storefront/
├── context/
│   └── ToastContext.tsx               [NUEVO]
├── components/
│   ├── common/
│   │   ├── Toast.tsx                  [NUEVO]
│   │   └── ToastContainer.tsx         [NUEVO]
│   └── filters/
│       ├── FilterBar.tsx              [NUEVO]
│       ├── FilterChip.tsx             [NUEVO]
│       └── SortDropdown.tsx           [NUEVO]
├── hooks/
│   └── useScrollAnimation.ts          [NUEVO]
└── index.ts                           [MODIFICADO]

✅ frontend/
└── tailwind.config.js                 [MODIFICADO]
```

---

## ✅ RESULTADO ESPERADO

Después de implementar esta guía, deberías tener:

1. ✅ Sistema de notificaciones toast funcionando en todo el storefront
2. ✅ Barra de filtros contextual en el catálogo
3. ✅ Animaciones suaves al hacer scroll
4. ✅ Mejor UX en general (más cercana al HTML original)

**Tiempo total:** ~45 minutos  
**Complejidad:** Media  
**Impacto en UX:** Alto 🚀

---

**Creado por:** AI Senior Frontend Developer  
**Fecha:** 26/02/2026  
**Estado:** ✅ LISTO PARA IMPLEMENTAR
