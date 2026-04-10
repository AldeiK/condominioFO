import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/Auth.css';

export default function ResetPassword() {
  const { resetPasswordWithCode } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    const result = await resetPasswordWithCode(email, code, password, password2);

    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    setError(result.message);
  };

  return (
    <div className="auth-container">
      <h2>🔒 Restablecer contraseña</h2>

      <p className="small-text">
        Correo: <strong>{email || 'no disponible'}</strong>
      </p>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Código de 6 dígitos"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
        />

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar nueva contraseña"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? '⏳ Restableciendo...' : '✅ Restablecer contraseña'}
        </button>
      </form>

      <p className="small-text">
        <Link to="/login">Volver al login</Link>
      </p>
    </div>
  );
}