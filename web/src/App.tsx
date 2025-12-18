import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';
import Login from './pages/Login';
import Orders from './pages/Orders';
import './styles/index.css'; // Assuming we'll rename or use index.css

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Dashboard route - now explicitly /dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Orders route */}
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />

      <Route path="/add-medicine" element={
        <ProtectedRoute>
          <AddMedicine />
        </ProtectedRoute>
      } />

      <Route path="/edit-medicine/:id" element={
        <ProtectedRoute>
          <EditMedicine />
        </ProtectedRoute>
      } />

      {/* Redirect root path to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      {/* Catch-all route for unknown paths */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
