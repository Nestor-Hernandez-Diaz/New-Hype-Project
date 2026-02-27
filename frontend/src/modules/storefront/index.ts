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
export { ToastProvider, useToast } from './context/ToastContext';

// Hooks
export { useScrollAnimation, useFadeInUp, useScrollAnimationList } from './hooks/useScrollAnimation';

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

// Components - Common
export { default as Toast } from './components/common/Toast';
export { default as ToastContainer } from './components/common/ToastContainer';
export { default as ProcessingOverlay } from './components/common/ProcessingOverlay';

// Components - Filters
export { default as FilterBar } from './components/filters/FilterBar';
export { default as FilterChip } from './components/filters/FilterChip';
export { default as SortDropdown } from './components/filters/SortDropdown';

// Services
export * from './services/storefrontApi';
