import './App.css';
import Dashboard from './components/Dashboard';
import NotificationButton from './components/NotificationButton';
import UserControls from './components/UserControls';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AccountSecurity from './pages/AccountSecurity';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import DepartmentManager from './components/DepartmentManager';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <HeaderWrapper />

          <main className="app-main">
            <ErrorBoundary>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/security"
                  element={
                    <ProtectedRoute>
                      <AccountSecurity />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/departments"
                  element={
                    <ProtectedRoute>
                      <RoleRoute allowedRoles={['admin']}>
                        <DepartmentManager />
                      </RoleRoute>
                    </ProtectedRoute>
                  }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

function HeaderWrapper() {
  const location = useLocation();

  const hide =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/verify-email' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  if (hide) return null;

  return (
    <header className="app-header">
      <h1>Chat Departamentos - Condominio</h1>
      <p>Comunicación en tiempo real entre departamentos</p>
      <div className="header-controls">
        <NotificationButton />
        <UserControls />
      </div>
    </header>
  );
}

export default App;