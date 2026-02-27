import './App.css'
import Dashboard from './components/Dashboard'
import NotificationButton from './components/NotificationButton'
import UserControls from './components/UserControls'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <p>Cargando...</p>;
    return user ? children : <Navigate to="/login" />;
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          {/* hide header while on login/register to avoid possible runtime errors */}
          <HeaderWrapper />
          <main className="app-main">
            <ErrorBoundary>
              <Routes>
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* catch-all: redirect to login for unknown paths */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}


// small helper component defined in same file so we can access hooks
function HeaderWrapper() {
  const location = useLocation();
  const hide = location.pathname === '/login' || location.pathname === '/register';
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

export default App
