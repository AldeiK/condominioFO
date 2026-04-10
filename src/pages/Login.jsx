import { useState } from 'react';
import '../components/Auth.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const verified = searchParams.get('verified');
  const verifiedMessage = searchParams.get('message');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      setLoading(false);

      if (result.success) {
        navigate('/');
        return;
      }

      if (result.requiresVerification) {
        navigate(`/verify-email?email=${encodeURIComponent(result.email || email)}`);
        return;
      }

      setError(result.message);
    } catch (err) {
      setLoading(false);
      setError('Error inesperado al iniciar sesión');
    }
  };

  return (
    <div className="auth-container">
      <h2>🔑 Iniciar Sesión</h2>

      {verified === '1' && (
        <p className="success-message">✅ Correo verificado correctamente. Ya puedes iniciar sesión.</p>
      )}

      {verified === '0' && (
        <p className="error-message">❌ {verifiedMessage || 'No se pudo verificar el correo.'}</p>
      )}

      {error && <p className="error">❌ {error}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? '⏳ Verificando...' : '✅ Entrar'}
        </button>
      </form>

      <p className="small-text">
        ¿No tienes cuenta? <Link to="/register">Crea una aquí</Link>
      </p>

      <p className="small-text">
        <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
      </p>
    </div>
  );
}