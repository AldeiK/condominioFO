import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/Auth.css';

export default function ForgotPassword() {
  const { sendResetCode } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const result = await sendResetCode(email);

    setLoading(false);

    if (result.success) {
      setMessage(result.message);
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      return;
    }

    setError(result.message);
  };

  return (
    <div className="auth-container">
      <h2>🔑 Recuperar contraseña</h2>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? '⏳ Enviando...' : '📨 Enviar código'}
        </button>
      </form>

      <p className="small-text">
        <Link to="/login">Volver al login</Link>
      </p>
    </div>
  );
}