/**
 * 🎨 LAYOUT PRINCIPAL DEL STOREFRONT
 * 
 * Envuelve todas las páginas del storefront con navegación y footer.
 */

import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PromoBar from '../components/layout/PromoBar';
import Navbar from '../components/layout/Navbar';
import CartSidebar from '../components/layout/CartSidebar';
import Footer from '../components/layout/Footer';
import ToastContainer from '../components/common/ToastContainer';
import { StorefrontProvider } from '../context/StorefrontContext';
import { ToastProvider } from '../context/ToastContext';
import TenantResolver from '../components/TenantResolver';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function StorefrontLayout() {
  return (
    <TenantResolver>
      <StorefrontProvider>
        <ToastProvider>
          <ScrollToTop />
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
    </TenantResolver>
  );
}
