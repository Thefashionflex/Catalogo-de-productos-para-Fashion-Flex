
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import CatalogPage from './components/CatalogPage';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import ProductManagementPage from './components/ProductManagementPage';
import OrderManagementPage from './components/OrderManagementPage'; // Nueva importación
import CheckoutPage from './components/CheckoutPage'; 
import OrderConfirmationPage from './components/OrderConfirmationPage'; 
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} /> 
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} /> 
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<ProductManagementPage />} />
              <Route path="/admin/orders" element={<OrderManagementPage />} /> {/* Nueva ruta para pedidos */}
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;