import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import Login from './pages/Login';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import WishlistPage from './pages/WishlistPage';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminClientProducts from './pages/AdminClientProducts';
import AdminUsers from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública - Landing Page */}
          <Route path="/" element={<HomePage />} />
          
          <Route path="/login" element={<Login />} />
          
          {/* Rutas de clientes */}
          <Route path="/productos" element={
            <ProtectedRoute requiredRole="client_user">
              <ProductCatalog />
            </ProtectedRoute>
          } />
          
          <Route path="/productos/:id" element={
            <ProtectedRoute requiredRole="client_user">
              <ProductDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/wishlist" element={
            <ProtectedRoute requiredRole="client_user">
              <WishlistPage />
            </ProtectedRoute>
          } />
          
          <Route path="/checkout" element={
            <ProtectedRoute requiredRole="client_user">
              <Checkout />
            </ProtectedRoute>
          } />
          
          <Route path="/ordenes" element={
            <ProtectedRoute requiredRole="client_user">
              <OrderHistory />
            </ProtectedRoute>
          } />
          
          <Route path="/ordenes/:id" element={
            <ProtectedRoute requiredRole="client_user">
              <OrderDetail />
            </ProtectedRoute>
          } />
          
          {/* Rutas de admin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="master_admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/productos" element={
            <ProtectedRoute requiredRole="master_admin">
              <AdminProducts />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/asignacion" element={
            <ProtectedRoute requiredRole="master_admin">
              <AdminClientProducts />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/usuarios" element={
            <ProtectedRoute requiredRole="master_admin">
              <AdminUsers />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
