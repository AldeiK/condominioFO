import { useState, useEffect, useRef } from 'react';
import './ChatDepartamento.css';
import echo from '../services/echo';
import { useAuth } from '../contexts/AuthContext';

export default function ChatDepartamento() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('Usuario ' + Math.floor(Math.random() * 1000));
  const [departmentId, setDepartmentId] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [departments] = useState([
    { id: 'Admin', name: '🏢 Administración' },
    { id: 'Mantenimiento', name: '🔧 Mantenimiento' },
    { id: 'Tesorería', name: '💰 Tesorería' },
    { id: 'Seguridad', name: '🔐 Seguridad' },
  ]);
  const messagesEndRef = useRef(null);
  const bcRef = useRef(null);
  const { authFetch } = useAuth();

  // Initialize BroadcastChannel
  useEffect(() => {
    if (bcRef.current) bcRef.current.close();
    bcRef.current = new BroadcastChannel('chat');
    bcRef.current.onmessage = (e) => {
      const msg = e.data;
      if (msg.department_id === departmentId) {
        setMessages((prev) => {
          const exists = prev.some(m => m.id === msg.id);
          return exists ? prev : [...prev, msg];
        });
      }
    };
    return () => bcRef.current?.close();
  }, [departmentId]);

  // Load messages from server
  const loadMessages = async (dept) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/messages/${dept}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadMessages(departmentId).finally(() => setLoading(false));
  }, [departmentId]);

  // WebSocket listener
  useEffect(() => {
    const channel = `chat.${departmentId}`;
    try {
      echo.channel(channel).listen('.mensaje-enviado', (e) => {
        const mensaje = e.mensaje || e.data;
        if (mensaje) {
          setMessages((prev) => {
            const exists = prev.some(m => m.id === mensaje.id);
            return exists ? prev : [...prev, mensaje];
          });
          bcRef.current?.postMessage(mensaje);
        }
      });
    } catch (err) {
      console.error('Error setting up listener:', err);
    }

    return () => {
      try {
        echo.leave(channel);
      } catch (err) {
        console.error('Error leaving channel:', err);
      }
    };
  }, [departmentId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

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

    try {
      await authFetch('http://127.0.0.1:8000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName,
          department_id: departmentId,
          message: optimistic.message,
        }),
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getDepartmentInfo = (id) => {
    return departments.find(d => d.id === id);
  };

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
              onChange={e => setUserName(e.target.value)}
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div className="input-group">
            <label>Departamento:</label>
            <select 
              className="department-select" 
              value={departmentId} 
              onChange={e => setDepartmentId(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading && <div className="loading">⏳ Cargando mensajes...</div>}
        {messages.length === 0 && !loading && <div className="no-messages">📭 No hay mensajes aún. ¡Sé el primero!</div>}
        <div className="messages">
          {messages.map((msg) => (
            <div key={msg.id || msg.created_at} className={`message ${msg.user_name === userName ? 'own' : ''}`}>
              <div className="message-header">
                <strong className="message-user">{msg.user_name}</strong>
                <span className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className="message-text">{msg.message}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input 
          className="message-input" 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          type="text"
        />
        <button className="send-button" type="submit">
          ➤ Enviar
        </button>
      </form>
    </div>
  );
}
