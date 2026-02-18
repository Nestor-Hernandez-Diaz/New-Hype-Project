import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider, useModal } from './context/ModalContext';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import NotificationContainer from './components/NotificationContainer';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import { InventoryProvider } from './modules/inventory/context/InventoryContext';
import { ConfiguracionProvider } from './modules/configuration/context/ConfiguracionContext';
import { SalesProvider } from './modules/sales/context/SalesContext';
import { QuotesProvider } from './modules/sales/context/QuotesContext';
import { ProductProvider } from './modules/products/context/ProductContext';
import { ClientProvider } from './modules/clients/context/ClientContext';
import { PurchasesProvider } from './modules/purchases/context/PurchasesContext';

// ============================================================================
// 🏢 PLATFORM MODULE (SUPERADMIN)
// ============================================================================
const PlatformLogin = lazy(() => import('./modules/platform/pages/PlatformLogin'));
const PlatformLayout = lazy(() => import('./modules/platform/pages/PlatformLayout'));
const PlatformDashboard = lazy(() => import('./modules/platform/pages/PlatformDashboard'));
const TenantsManagement = lazy(() => import('./modules/platform/pages/TenantsManagement'));
const PlansManagement = lazy(() => import('./modules/platform/pages/PlansManagement'));

// ============================================================================
// 🏪 TENANT ADMIN MODULE (Gestión de Tienda)
// ============================================================================
const TenantLogin = lazy(() => import('./modules/auth/pages/Login'));
const Dashboard = lazy(() => import('./modules/dashboard/pages/Dashboard'));
const TemplateUI = lazy(() => import('./modules/dashboard/pages/TemplateUI'));
const GestionCaja = lazy(() => import('./modules/sales/pages/GestionCaja') as Promise<{ default: React.ComponentType<any> }>);
const HistorialCaja = lazy(() => import('./modules/sales/pages/HistorialCaja'));
const ListaEntidades = lazy(() => import('./modules/clients/pages/ListaEntidades'));
const ListaProductos = lazy(() => import('./modules/products/pages/ListaProductos'));
const EditarEntidad = lazy(() => import('./modules/clients/pages/EditarEntidad') as Promise<{ default: React.ComponentType<any> }>);
const RegistroEntidad = lazy(() => import('./modules/clients/pages/RegistroEntidad') as Promise<{ default: React.ComponentType<any> }>);
const RealizarVenta = lazy(() => import('./modules/sales/pages/RealizarVenta'));
const ListaVentas = lazy(() => import('./modules/sales/pages/ListaVentas'));
const DetalleVenta = lazy(() => import('./modules/sales/pages/DetalleVenta'));
const Cotizaciones = lazy(() => import('./modules/sales/pages/Cotizaciones'));
const AsistenteVentas = lazy(() => import('./modules/sales/pages/AsistenteVentas'));
const ListaUsuarios = lazy(() => import('./modules/users/pages/ListaUsuarios'));
const CrearUsuario = lazy(() => import('./modules/users/pages/CrearUsuario'));
const EditarUsuario = lazy(() => import('./modules/users/pages/EditarUsuario'));
const PerfilUsuario = lazy(() => import('./modules/users/pages/PerfilUsuario'));
const ListaRoles = lazy(() => import('./modules/users/pages/ListaRoles'));
const AuditoriaLogs = lazy(() => import('./modules/audit/pages/AuditoriaLogs'));
const PurchaseOrdersPage = lazy(() => import('./modules/purchases/pages/PurchaseOrdersPage'));
const PurchaseReceiptsPage = lazy(() => import('./modules/purchases/pages/PurchaseReceiptsPage'));
const ListadoStock = lazy(() => import('./modules/inventory/pages/Inventario/ListadoStock'));
const Kardex = lazy(() => import('./modules/inventory/pages/Inventario/Kardex'));
const ListaAlmacenes = lazy(() => import('./modules/inventory/pages/Inventario/ListaAlmacenes'));
const ListaMotivosMovimiento = lazy(() => import('./modules/inventory/pages/Inventario/ListaMotivosMovimiento'));

// Módulo de Configuration
const ConfiguracionMiPerfil = lazy(() => import('./modules/configuration/pages/MiPerfil'));
const ConfiguracionEmpresa = lazy(() => import('./modules/configuration/pages/Empresa'));
const ConfiguracionComprobantes = lazy(() => import('./modules/configuration/pages/Comprobantes'));
const ConfiguracionMetodosPago = lazy(() => import('./modules/configuration/pages/MetodosPago'));
const ConfiguracionProductos = lazy(() => import('./modules/configuration/pages/ConfiguracionProductos'));

// Módulo de Reports
const ReportesVentas = lazy(() => import('./modules/reports/pages/ReporteVentas'));
const ReportesCompras = lazy(() => import('./modules/reports/pages/ReporteCompras') as Promise<{ default: React.ComponentType<any> }>);
const ReportesInventario = lazy(() => import('./modules/reports/pages/ReporteInventario') as Promise<{ default: React.ComponentType<any> }>);
const ReportesCaja = lazy(() => import('./modules/reports/pages/ReporteCaja') as Promise<{ default: React.ComponentType<any> }>);

// ============================================================================
// 🛍️ STOREFRONT MODULE (E-commerce Público - Cliente B2C)
// ============================================================================
const StorefrontLayout = lazy(() => import('./modules/storefront/pages/StorefrontLayout'));
const StorefrontHome = lazy(() => import('./modules/storefront/pages/Home'));
const StorefrontCatalog = lazy(() => import('./modules/storefront/pages/Catalog'));
const StorefrontProductDetail = lazy(() => import('./modules/storefront/pages/ProductDetail'));
const StorefrontLogin = lazy(() => import('./modules/storefront/pages/Login'));
const StorefrontRegister = lazy(() => import('./modules/storefront/pages/Register'));
const StorefrontProfile = lazy(() => import('./modules/storefront/pages/Profile'));
const StorefrontOrders = lazy(() => import('./modules/storefront/pages/Orders'));
const StorefrontCheckout = lazy(() => import('./modules/storefront/pages/Checkout'));
const StorefrontOrderConfirmation = lazy(() => import('./modules/storefront/pages/OrderConfirmation'));
const StorefrontFavorites = lazy(() => import('./modules/storefront/pages/Favorites'));
const StorefrontFAQ = lazy(() => import('./modules/storefront/pages/FAQ'));
const StorefrontSizeGuide = lazy(() => import('./modules/storefront/pages/SizeGuide'));
const StorefrontContact = lazy(() => import('./modules/storefront/pages/Contact'));
const StorefrontTrackOrder = lazy(() => import('./modules/storefront/pages/TrackOrder'));
const StorefrontReturns = lazy(() => import('./modules/storefront/pages/Returns'));

// Componente interno para manejar el modal
const AppContent = () => {
  const { isModalOpen, modalContent, modalTitle, modalSize, closeModal } = useModal();
  
  return (
    <>
      <GlobalStyles />
      <NotificationContainer />
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        size={modalSize}
      >
        {modalContent}
      </Modal>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NotificationProvider>
          <ModalProvider>
            <ClientProvider>
              <ProductProvider>
                <SalesProvider>
                  <QuotesProvider>
                    <InventoryProvider>
                      <ConfiguracionProvider>
                        <PurchasesProvider>
                          <Router>
                            <AppContent />
                            <Suspense fallback={<LoadingSpinner />}>
                              <Routes>
                                {/* Root - Redirige al storefront (vista cliente) */}
                                <Route path="/" element={<Navigate to="/storefront" replace />} />

                                {/* ============================================ */}
                                {/* 🏢 SUPERADMIN - PLATFORM ROUTES            */}
                                {/* ============================================ */}
                                <Route path="/platform">
                                  <Route path="login" element={<PlatformLogin />} />
                                  <Route element={<PlatformLayout />}>
                                    <Route path="dashboard" element={<PlatformDashboard />} />
                                    <Route path="tenants" element={<TenantsManagement />} />
                                    <Route path="plans" element={<PlansManagement />} />
                                  </Route>
                                </Route>

                                {/* ============================================ */}
                                {/* 🏪 TENANT ADMIN - MANAGEMENT ROUTES        */}
                                {/* ============================================ */}
                                <Route path="/login" element={<TenantLogin />} />
                                {/* 🎨 Template UI - Solo para desarrollo */}
                                <Route path="/template-ui" element={<TemplateUI />} />
                                
                                {/* ============================================ */}
                                {/* 🛍️ STOREFRONT - CLIENTE B2C ROUTES        */}
                                {/* ============================================ */}
                                <Route path="/storefront" element={<StorefrontLayout />}>
                                  <Route index element={<StorefrontHome />} />
                                  <Route path="catalogo" element={<StorefrontCatalog />} />
                                  <Route path="producto/:slug" element={<StorefrontProductDetail />} />
                                  <Route path="checkout" element={<StorefrontCheckout />} />
                                  <Route path="confirmacion/:pedidoId" element={<StorefrontOrderConfirmation />} />
                                  <Route path="favoritos" element={<StorefrontFavorites />} />
                                  <Route path="faq" element={<StorefrontFAQ />} />
                                  <Route path="guia-tallas" element={<StorefrontSizeGuide />} />
                                  <Route path="contacto" element={<StorefrontContact />} />
                                  <Route path="seguir-pedido" element={<StorefrontTrackOrder />} />
                                  <Route path="devolucion/:pedidoId" element={<StorefrontReturns />} />
                                  <Route path="cuenta/login" element={<StorefrontLogin />} />
                                  <Route path="cuenta/registro" element={<StorefrontRegister />} />
                                  <Route path="cuenta/perfil" element={<StorefrontProfile />} />
                                  <Route path="cuenta/pedidos" element={<StorefrontOrders />} />
                                </Route>

                                <Route 
                                  path="/dashboard" 
                                  element={
                                    <ProtectedRoute requiredPermission="dashboard.read">
                                      <Dashboard />
                                    </ProtectedRoute>
                                  } 
                                />
                  <Route 
                    path="/gestion-caja" 
                    element={
                      <ProtectedRoute requiredPermission="cash-sessions.create">
                        <GestionCaja />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/historial-caja" 
                    element={
                      <ProtectedRoute requiredPermission="cash-sessions.read">
                        <HistorialCaja />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/lista-entidades" 
                    element={
                      <ProtectedRoute requiredPermission="clients.read">
                        <ListaEntidades />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/lista-productos" element={
                    <ProtectedRoute requiredPermission="products.read">
                      <ListaProductos />
                    </ProtectedRoute>
                  } />
                  <Route path="/editar-entidad/:id" element={
                    <ProtectedRoute requiredPermission="clients.update">
                      <EditarEntidad />
                    </ProtectedRoute>
                  } />
                  <Route path="/registrar-entidad" element={
                    <ProtectedRoute requiredPermission="clients.create">
                      <RegistroEntidad />
                    </ProtectedRoute>
                  } />
                  <Route path="/ventas/realizar" element={
                      <ProtectedRoute requiredPermission="sales.create">
                        <RealizarVenta />
                      </ProtectedRoute>
                    } />
                    <Route path="/ventas/lista" element={
                      <ProtectedRoute requiredPermission="sales.read">
                        <ListaVentas />
                      </ProtectedRoute>
                    } />
                    <Route path="/ventas/detalle/:id" element={
                      <ProtectedRoute requiredPermission="sales.read">
                        <DetalleVenta />
                      </ProtectedRoute>
                    } />
                    <Route path="/ventas/cotizaciones" element={
                      <ProtectedRoute requiredPermission="sales.create">
                        <Cotizaciones />
                      </ProtectedRoute>
                    } />
                    <Route path="/ventas/asistente-ia" element={
                      <ProtectedRoute requiredPermission="sales.create">
                        <AsistenteVentas />
                      </ProtectedRoute>
                    } />
                    <Route path="/usuarios" element={
                        <ProtectedRoute requiredPermission="users.read">
                          <ListaUsuarios />
                        </ProtectedRoute>
                      } />
                      <Route path="/usuarios/crear" element={
                    <ProtectedRoute requiredPermission="users.create">
                      <CrearUsuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/usuarios/editar/:id" element={
                    <ProtectedRoute requiredPermission="users.update">
                      <EditarUsuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/roles" element={
                    <ProtectedRoute requiredPermission="users.read">
                      <ListaRoles />
                    </ProtectedRoute>
                  } />
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <PerfilUsuario />
                    </ProtectedRoute>
                  } />
                  <Route path="/auditoria" element={
                    <ProtectedRoute requiredPermission="audit.read">
                      <AuditoriaLogs />
                    </ProtectedRoute>
                  } />
                  {/* Aquí se pueden agregar más rutas según se vayan migrando las páginas */}
                  {/* Módulo de Compras - Redirección principal */}
                  <Route path="/compras" element={<Navigate to="/compras/ordenes" replace />} />

                  {/* Módulo de Compras - Órdenes */}
                  <Route path="/compras/ordenes" element={
                    <ProtectedRoute requiredPermission="purchases.read">
                      <PurchaseOrdersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/compras/ordenes/:id" element={
                    <ProtectedRoute requiredPermission="purchases.read">
                      <PurchaseOrdersPage />
                    </ProtectedRoute>
                  } />

                  {/* Módulo de Compras - Recepciones */}
                  <Route path="/compras/recepciones" element={
                    <ProtectedRoute requiredPermission="purchases.read">
                      <PurchaseReceiptsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/compras/recepciones/crear" element={
                    <ProtectedRoute requiredPermission="purchases.create">
                      <PurchaseReceiptsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/compras/recepciones/:id" element={
                    <ProtectedRoute requiredPermission="purchases.read">
                      <PurchaseReceiptsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/inventario/stock" element={
                    <ProtectedRoute requiredPermission="inventory.read">
                      <ListadoStock />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventario/kardex" element={
                    <ProtectedRoute requiredPermission="inventory.read">
                      <Kardex />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventario/almacenes" element={
                    <ProtectedRoute requiredPermission="warehouses.read">
                      <ListaAlmacenes />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventario/motivos" element={
                    <ProtectedRoute requiredPermission="inventory.read">
                      <ListaMotivosMovimiento />
                    </ProtectedRoute>
                  } />

                  {/* Módulo de Configuración */}
                  <Route path="/configuracion/mi-perfil" element={
                    <ProtectedRoute>
                      <ConfiguracionMiPerfil />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion/empresa" element={
                    <ProtectedRoute requiredPermission="settings.update">
                      <ConfiguracionEmpresa />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion/comprobantes" element={
                    <ProtectedRoute requiredPermission="settings.update">
                      <ConfiguracionComprobantes />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion/metodos-pago" element={
                    <ProtectedRoute requiredPermission="settings.update">
                      <ConfiguracionMetodosPago />
                    </ProtectedRoute>
                  } />
                  <Route path="/configuracion/productos" element={
                    <ProtectedRoute requiredPermission="settings.update">
                      <ConfiguracionProductos />
                    </ProtectedRoute>
                  } />

                  {/* Módulo de Reportes */}
                  <Route path="/reportes/ventas" element={
                    <ProtectedRoute requiredPermission="reports.read">
                      <ReportesVentas />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/compras" element={
                    <ProtectedRoute requiredPermission="reports.read">
                      <ReportesCompras />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/inventario" element={
                    <ProtectedRoute requiredPermission="reports.read">
                      <ReportesInventario />
                    </ProtectedRoute>
                  } />
                  <Route path="/reportes/caja" element={
                    <ProtectedRoute requiredPermission="reports.read">
                      <ReportesCaja />
                    </ProtectedRoute>
                  } />
                </Routes>
                            </Suspense>
                          </Router>
                        </PurchasesProvider>
                      </ConfiguracionProvider>
                    </InventoryProvider>
                  </QuotesProvider>
                </SalesProvider>
              </ProductProvider>
            </ClientProvider>
          </ModalProvider>
        </NotificationProvider>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
