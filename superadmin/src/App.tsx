import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStyles } from './styles/GlobalStyles';
import { AuthProvider, useAuth } from './modules/auth/context/AuthContext';
import Login from './modules/auth/pages/Login';
import Dashboard from './modules/dashboard/pages/Dashboard';
import GestionTenants from './modules/tenants/pages/GestionTenants';
import GestionPlanes from './modules/planes/pages/GestionPlanes';
import EstadoPagos from './modules/pagos/pages/EstadoPagos';
import GestionCupones from './modules/cupones/pages/GestionCupones';
import LogsAuditoria from './modules/auditoria/pages/LogsAuditoria';
import GestionTickets from './modules/tickets/pages/GestionTickets';

// Componente de ruta protegida
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Componente para redirigir si ya está autenticado
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Cargando...</div>;
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tenants" 
          element={
            <ProtectedRoute>
              <GestionTenants />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/planes" 
          element={
            <ProtectedRoute>
              <GestionPlanes />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/pagos" 
          element={
            <ProtectedRoute>
              <EstadoPagos />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/cupones" 
          element={
            <ProtectedRoute>
              <GestionCupones />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/auditoria" 
          element={
            <ProtectedRoute>
              <LogsAuditoria />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <GestionTickets />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
