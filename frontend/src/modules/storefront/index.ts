/**
 * 🛍️ MÓDULO STOREFRONT
 * 
 * Frontend público de la tienda (e-commerce).
 * Conversión del HTML/CSS/JS original a React + TypeScript.
 * 
 * @author Arquitecto Senior - NEW HYPE Project
 */

// Context
export { StorefrontProvider, useStorefront } from './context/StorefrontContext';

// Pages
export { default as StorefrontLayout } from './pages/StorefrontLayout';
export { default as Home } from './pages/Home';
export { default as Catalog } from './pages/Catalog';
export { default as ProductDetail } from './pages/ProductDetail';
export { default as Login } from './pages/Login';
export { default as Register } from './pages/Register';
export { default as Profile } from './pages/Profile';
export { default as Orders } from './pages/Orders';
export { default as Checkout } from './pages/Checkout';
export { default as OrderConfirmation } from './pages/OrderConfirmation';
export { default as Favorites } from './pages/Favorites';
export { default as FAQ } from './pages/FAQ';
export { default as SizeGuide } from './pages/SizeGuide';
export { default as Contact } from './pages/Contact';
export { default as TrackOrder } from './pages/TrackOrder';
export { default as Returns } from './pages/Returns';

// Components - Layout
export { default as PromoBar } from './components/layout/PromoBar';
export { default as Navbar } from './components/layout/Navbar';
export { default as CartSidebar } from './components/layout/CartSidebar';
export { default as Footer } from './components/layout/Footer';

// Components - Product
export { default as ProductCard } from './components/product/ProductCard';
export { default as ProductGrid } from './components/product/ProductGrid';

// Services
export * from './services/storefrontApi';
