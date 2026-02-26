import './App.css'
import Dashboard from './components/Dashboard'
import NotificationButton from './components/NotificationButton'
import UserControls from './components/UserControls'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

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
          <header className="app-header">
            <h1>Chat Departamentos - Condominio</h1>
            <p>Comunicación en tiempo real entre departamentos</p>
            <div className="header-controls">
              <NotificationButton />
              <UserControls />
            </div>
          </header>
          <main className="app-main">
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
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App
