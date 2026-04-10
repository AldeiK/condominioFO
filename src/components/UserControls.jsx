import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserControls() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToSecurity = () => {
    navigate('/security');
  };

  const goToDepartments = () => {
    navigate('/departments');
  };

  if (!user) return null;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="user-controls">
      <span className="user-name">
        {user.name} {user?.role ? `(${user.role})` : ''}
      </span>

      <button className="security-button" onClick={goToSecurity}>
        🔐 Seguridad
      </button>

      {isAdmin && (
        <button className="security-button" onClick={goToDepartments}>
          🏢 Departamentos
        </button>
      )}

      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}