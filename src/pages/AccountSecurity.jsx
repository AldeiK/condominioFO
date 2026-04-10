import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AccountSecurity() {
  const { changePassword, logoutAll, user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingChange, setLoadingChange] = useState(false);
  const [loadingLogoutAll, setLoadingLogoutAll] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setLoadingChange(true);

    const result = await changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    setLoadingChange(false);

    if (result.success) {
      setMessage(result.message || 'Contraseña actualizada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      return;
    }

    setError(result.message || 'No se pudo cambiar la contraseña.');
  };

  const handleLogoutAll = async () => {
    setMessage('');
    setError('');
    setLoadingLogoutAll(true);

    const result = await logoutAll();

    setLoadingLogoutAll(false);

    if (!result.success) {
      setError(result.message || 'No se pudo cerrar sesión en todos los dispositivos.');
    }
  };

  return (
    <div className="security-page">
      <div className="security-card">
        <div className="security-header">
          <h2>🔐 Seguridad de la cuenta</h2>
          <p>
            Administra tu contraseña y tus sesiones activas.
          </p>
        </div>

        <div className="security-user-box">
          <strong>Usuario:</strong> {user?.name || 'Usuario'}<br />
          <strong>Correo:</strong> {user?.email || 'Sin correo'}
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleChangePassword} className="security-form">
          <h3>Cambiar contraseña</h3>

          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loadingChange} className="primary-button">
            {loadingChange ? '⏳ Actualizando...' : '✅ Cambiar contraseña'}
          </button>
        </form>

        <div className="security-divider" />

        <div className="security-actions">
          <h3>Sesiones</h3>
          <p>
            Esto cerrará tu sesión actual y también la de todos tus demás dispositivos.
          </p>

          <button
            type="button"
            onClick={handleLogoutAll}
            disabled={loadingLogoutAll}
            className="danger-button"
          >
            {loadingLogoutAll ? '⏳ Cerrando sesiones...' : '🚪 Cerrar sesión en todos los dispositivos'}
          </button>
        </div>
      </div>
    </div>
  );
}