import { useState, useEffect, useRef, useTransition } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import './ChatDepartamento.css';
import echo from '../services/echo';
import { useAuth } from '../contexts/AuthContext';
import TransitionAlert from './TransitionAlert';

function MessageItem({ msg, own }) {
  const ref = useRef(null);

  return (
    <CSSTransition nodeRef={ref} timeout={300} classNames="msg">
      <div ref={ref} className={`message ${own ? 'own' : ''}`}>
        <div className="message-header">
          <strong className="message-user">{msg.user_name}</strong>
          <span className="message-time">
            {new Date(msg.created_at).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="message-text">{msg.message}</p>
      </div>
    </CSSTransition>
  );
}

export default function ChatDepartamento() {
  const { authFetch, user, loading: authLoading } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [departmentId, setDepartmentId] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const [departments] = useState([
    { id: 'Admin', name: '🏢 Administración' },
    { id: 'Mantenimiento', name: '🔧 Mantenimiento' },
    { id: 'Tesorería', name: '💰 Tesorería' },
    { id: 'Seguridad', name: '🔐 Seguridad' },
  ]);

  const messagesEndRef = useRef(null);
  const bcRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fallbackName = user?.name || user?.email || `Usuario ${Math.floor(Math.random() * 1000)}`;
    setUserName(fallbackName);
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;

    if (bcRef.current) {
      bcRef.current.close();
    }

    try {
      bcRef.current = new BroadcastChannel('chat');
      bcRef.current.onmessage = (e) => {
        const msg = e.data;

        if (msg.department_id === departmentId) {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === msg.id);
            return exists ? prev : [...prev, msg];
          });
        }
      };
    } catch {
      //
    }

    return () => bcRef.current?.close();
  }, [departmentId, user, authLoading]);

  const loadMessages = async (dept) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/messages/${dept}`);

      if (res.ok) {
        const data = await res.json();
        startTransition(() => setMessages(Array.isArray(data) ? data : []));
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);
    loadMessages(departmentId).finally(() => setLoading(false));
  }, [departmentId, user, authLoading]);

  useEffect(() => {
    if (authLoading || !user) return;

    const channelName = `chat.${departmentId}`;

    try {
      echo.channel(channelName).listen('.mensaje-enviado', (e) => {
        const mensaje = e.mensaje || e.data || e;

        if (!mensaje) return;

        setMessages((prev) => {
          const exists = prev.some((m) => m.id === mensaje.id);
          return exists ? prev : [...prev, mensaje];
        });

        bcRef.current?.postMessage(mensaje);
      });
    } catch (err) {
      console.error('Error setting up listener:', err);
    }

    return () => {
      try {
        echo.leave(channelName);
      } catch (err) {
        console.error('Error leaving channel:', err);
      }
    };
  }, [departmentId, user, authLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || authLoading || !user) return;

    const optimistic = {
      id: Date.now(),
      user_name: userName,
      department_id: departmentId,
      message: newMessage,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
    bcRef.current?.postMessage(optimistic);

    setActionLoading('send');

    try {
      const res = await authFetch('http://127.0.0.1:8000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName,
          department_id: departmentId,
          message: optimistic.message,
        }),
      });

      if (res.ok) {
        setAlert({ show: true, message: 'Mensaje enviado', type: 'success' });
      } else {
        setAlert({ show: true, message: 'No se pudo enviar', type: 'error' });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setAlert({ show: true, message: 'Error enviando mensaje', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading) {
    return <div className="chat-container">Cargando chat...</div>;
  }

  if (!user) {
    return <div className="chat-container">No hay sesión activa.</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-title">
          <h3>📱 Chat en Vivo</h3>
          <p>Comunicación entre departamentos</p>
        </div>

        <div className="header-controls">
          <div className="input-group">
            <label>Tu nombre:</label>
            <input
              className="user-input"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Ingresa tu nombre"
            />
          </div>

          <div className="input-group">
            <label>Departamento:</label>
            <select
              className="department-select"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading && <div className="loading">⏳ Cargando mensajes...</div>}

        {messages.length === 0 && !loading && (
          <div className="no-messages">📭 No hay mensajes aún. ¡Sé el primero!</div>
        )}

        <div className="messages">
          <TransitionGroup component={null}>
            {messages.map((msg) => (
              <MessageItem
                key={msg.id || msg.created_at}
                msg={msg}
                own={msg.user_name === userName}
              />
            ))}
          </TransitionGroup>

          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          className="message-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          type="text"
        />

        <button className="send-button" type="submit" disabled={actionLoading === 'send'}>
          {actionLoading === 'send' ? (
            <>
              <span className="spinner" aria-hidden="true"></span> Enviando...
            </>
          ) : (
            '➤ Enviar'
          )}
        </button>
      </form>

      <TransitionAlert
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, show: false })}
      />
    </div>
  );
}