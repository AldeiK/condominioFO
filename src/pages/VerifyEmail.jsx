import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../components/Auth.css';

export default function VerifyEmail() {
  const { resendVerificationEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) {
      setMessage('No se encontró el correo.');
      return;
    }

    setLoading(true);
    const result = await resendVerificationEmail(email);
    setLoading(false);
    setMessage(result.message);
  };

  return (
    <div className="auth-container">
      <h2>📧 Verifica tu correo</h2>

      <p className="small-text">
        Te enviamos un enlace de verificación a:
      </p>

      <p>
        <strong>{email || 'correo no disponible'}</strong>
      </p>

      <p className="small-text">
        Revisa tu bandeja de entrada y también spam.
      </p>

      {message && <p className="success-message">{message}</p>}

      <button type="button" onClick={handleResend} disabled={loading}>
        {loading ? '⏳ Reenviando...' : '📨 Reenviar correo'}
      </button>

      <p className="small-text" style={{ marginTop: '1rem' }}>
        <Link to="/login">Volver al login</Link>
      </p>
    </div>
  );
}