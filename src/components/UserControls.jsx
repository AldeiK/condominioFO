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

  if (!user) return null;

  return (
    <div className="user-controls">
      <span className="user-name">{user.name}</span>

      <button className="security-button" onClick={goToSecurity}>
        🔐 Seguridad
      </button>

      <button className="logout-button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </div>
  );
}