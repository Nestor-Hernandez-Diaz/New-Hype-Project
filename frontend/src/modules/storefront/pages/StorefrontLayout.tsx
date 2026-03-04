/**
 * 🎨 LAYOUT PRINCIPAL DEL STOREFRONT
 * 
 * Envuelve todas las páginas del storefront con navegación y footer.
 */

import { Outlet } from 'react-router-dom';
import PromoBar from '../components/layout/PromoBar';
import Navbar from '../components/layout/Navbar';
import CartSidebar from '../components/layout/CartSidebar';
import Footer from '../components/layout/Footer';
import ToastContainer from '../components/common/ToastContainer';
import { StorefrontProvider } from '../context/StorefrontContext';
import { ToastProvider } from '../context/ToastContext';

export default function StorefrontLayout() {
  return (
    <StorefrontProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen">
          <PromoBar />
          <Navbar />
          
          <main className="flex-1">
            <Outlet />
          </main>
          
          <Footer />
          <CartSidebar />
          <ToastContainer />
        </div>
      </ToastProvider>
    </StorefrontProvider>
  );
}
