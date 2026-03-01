# New Hype — Frontend React + Vite + TypeScript

## Instalación rápida

```bash
# 1. Descomprime el zip en tu escritorio
# 2. Abre la terminal en la carpeta
cd newhype-react

# 3. Instala dependencias
npm install

# 4. Arranca el servidor
npm run dev
```

## Requisitos
- Node.js 18+ (tienes v22 ✅)
- Backend corriendo en localhost:8080
- Carpeta 05 de Postman ejecutada (productos en BD)

## Abrir: http://localhost:5173

## Estructura
```
src/
  types/         → Interfaces TS
  services/      → api.ts (fetch al backend)
  context/       → Auth + Carrito
  components/    → Navbar, Footer, TarjetaProducto, CarritoLateral
  pages/         → Inicio, Catalogo, Detalle, Login, Registro, Perfil, Checkout
  styles.css     → Estilos completos
```

## Config backend: src/services/api.ts (líneas 1-2)
