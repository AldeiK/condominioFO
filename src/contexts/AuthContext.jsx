import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // set default authorization header for fetch
  const authFetch = async (url, options = {}) => {
    options.headers = {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : undefined,
      'Content-Type': options.headers?.['Content-Type'] ?? 'application/json',
    };
    const res = await fetch(url, options);
    if (res.status === 401) {
      logout();
    }
    return res;
  };

  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/user');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return { success: true };
    }
    const err = await res.json();
    return { success: false, message: err.message || 'Login failed' };
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await fetch('http://127.0.0.1:8000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, user: data.user };
    }
    const err = await res.json();
    return { success: false, message: err.message || 'Register failed' };
  };

  const logout = async () => {
    if (token) {
      await authFetch('http://127.0.0.1:8000/api/logout', { method: 'POST' });
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, register, authFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
