import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { setEchoAuthToken } from '../services/echo';

const AuthContext = createContext(null);
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

function buildApiUrl(url) {
  if (!url) return API_URL;

  if (url.startsWith('http://127.0.0.1:8000')) {
    return url.replace('http://127.0.0.1:8000', API_URL);
  }

  if (url.startsWith('http://localhost:8000')) {
    return url.replace('http://localhost:8000', API_URL);
  }

  if (url.startsWith('/')) {
    return `${API_URL}${url}`;
  }

  if (!url.startsWith('http')) {
    return `${API_URL}/${url}`;
  }

  return url;
}

function getDeviceName() {
  let deviceId = localStorage.getItem('device_id');

  if (!deviceId) {
    deviceId = `device-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
    localStorage.setItem('device_id', deviceId);
  }

  const platform = navigator.platform || 'unknown-platform';
  const agent = navigator.userAgent || 'unknown-browser';

  return `${platform} | ${agent.slice(0, 40)} | ${deviceId}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setEchoAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  }, []);

  const authFetch = useCallback(
    async (url, options = {}) => {
      const currentToken = localStorage.getItem('token');
      const finalUrl = buildApiUrl(url);

      const headers = {
        Accept: 'application/json',
        ...(options.headers || {}),
      };

      const method = (options.method || 'GET').toUpperCase();
      const hasBody = options.body !== undefined && options.body !== null;

      if (currentToken) {
        headers.Authorization = `Bearer ${currentToken}`;
      }

      if (hasBody && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(finalUrl, {
        ...options,
        method,
        headers,
      });

      if (res.status === 401) {
        clearSession();
      }

      return res;
    },
    [clearSession]
  );

  const loadUser = useCallback(async () => {
    const currentToken = localStorage.getItem('token');

    if (!currentToken) {
      setLoading(false);
      return;
    }

    setEchoAuthToken(currentToken);

    try {
      const res = await fetch(buildApiUrl('/api/user'), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setToken(currentToken);
      } else {
        clearSession();
      }
    } catch (error) {
      console.error('loadUser error:', error);
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const res = await fetch(buildApiUrl('/api/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          device_name: getDeviceName(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        setEchoAuthToken(data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        message: data.message || 'Login failed',
        requiresVerification: !!data.requires_verification,
        email: data.email || email,
      };
    } catch (error) {
      console.error('login error:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      const res = await fetch(buildApiUrl('/api/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });

      const data = await res.json();

      if (res.ok) {
        return {
          success: true,
          user: data.user,
          requiresVerification: !!data.requires_verification,
        };
      }

      let message = data.message || 'Register failed';

      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0];
        }
      }

      return {
        success: false,
        message,
        errors: data.errors || null,
      };
    } catch (error) {
      console.error('register error:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  };

  const resendVerificationEmail = async (email) => {
    try {
      const res = await fetch(buildApiUrl('/api/email/verification-notification'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      return {
        success: res.ok,
        message: data.message || 'No se pudo reenviar el correo',
      };
    } catch (error) {
      console.error('resendVerificationEmail error:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  };

  const sendResetCode = async (email) => {
    try {
      const res = await fetch(buildApiUrl('/api/forgot-password/code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      return {
        success: res.ok,
        message: data.message || 'No se pudo enviar el código',
      };
    } catch (error) {
      console.error('sendResetCode error:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  };

  const resetPasswordWithCode = async (email, code, password, password_confirmation) => {
    try {
      const res = await fetch(buildApiUrl('/api/reset-password/code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          password,
          password_confirmation,
        }),
      });

      const data = await res.json();

      return {
        success: res.ok,
        message: data.message || 'No se pudo restablecer la contraseña',
      };
    } catch (error) {
      console.error('resetPasswordWithCode error:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  };

  const changePassword = async (current_password, password, password_confirmation) => {
    try {
      const res = await authFetch('/api/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password,
          password,
          password_confirmation,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        clearSession();
      }

      return {
        success: res.ok,
        message: data.message || 'No se pudo cambiar la contraseña',
      };
    } catch (error) {
      console.error('changePassword error:', error);
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  };

  const logoutAll = async () => {
    try {
      const res = await authFetch('/api/logout-all', {
        method: 'POST',
      });

      const data = await res.json();
      clearSession();

      return {
        success: res.ok,
        message: data.message || 'No se pudo cerrar sesión en todos los dispositivos',
      };
    } catch (error) {
      console.error('logoutAll error:', error);
      clearSession();
      return {
        success: false,
        message: 'No se pudo conectar con el servidor',
      };
    }
  };

  const logout = async () => {
    const currentToken = localStorage.getItem('token');

    try {
      if (currentToken) {
        await fetch(buildApiUrl('/api/logout'), {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${currentToken}`,
          },
        });
      }
    } catch (error) {
      console.error('logout error:', error);
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        logoutAll,
        register,
        authFetch,
        resendVerificationEmail,
        sendResetCode,
        resetPasswordWithCode,
        changePassword,
        API_URL,
        buildApiUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}