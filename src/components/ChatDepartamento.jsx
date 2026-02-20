import { useState, useEffect, useRef } from 'react';
import './ChatDepartamento.css';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: 'local',
  wsHost: '127.0.0.1',
  wsPort: 8080,
  wssPort: 8080,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  reconnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
});

export default function ChatDepartamento() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userName, setUserName] = useState('Usuario ' + Math.floor(Math.random() * 1000));
  const [departmentId, setDepartmentId] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Historial (viejo -> nuevo)
  const loadMessages = async (dept) => {
    const res = await fetch(`http://127.0.0.1:8000/api/messages/${dept}`);
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    setLoading(true);
    loadMessages(departmentId).finally(() => setLoading(false));
  }, [departmentId]);

  // WebSocket por departamento
  useEffect(() => {
    const channel = `chat.${departmentId}`;

    echo.channel(channel).listen('.mensaje-enviado', (e) => {
      setMessages((prev) => [...prev, e.mensaje]);
    });

    return () => {
      echo.leave(channel);
    };
  }, [departmentId]);

  // Scroll abajo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje (optimistic UI)
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const optimistic = {
      user_name: userName,
      department_id: departmentId,
      message: newMessage,
      created_at: new Date().toISOString(),
    };

    // 👇 Se ve al instante en la MISMA pestaña
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');

    await fetch('http://127.0.0.1:8000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_name: userName,
        department_id: departmentId,
        message: optimistic.message,
      }),
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-controls">
          <input className="user-input" value={userName} onChange={e => setUserName(e.target.value)} />
          <select className="department-select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
            <option value="Admin">Admin</option>
            <option value="Mantenimiento">Mantenimiento</option>
            <option value="Tesorería">Tesorería</option>
            <option value="Seguridad">Seguridad</option>
          </select>
        </div>
      </div>

      <div className="messages">
        {loading && <p className="loading">Cargando mensajes...</p>}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.user_name === userName ? 'own' : ''}`}>
            <strong className="message-user">{msg.user_name}</strong>
            <p className="message-text">{msg.message}</p>
            <small className="message-time">{new Date(msg.created_at).toLocaleTimeString('es-ES')}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input className="message-input" value={newMessage} onChange={e => setNewMessage(e.target.value)} />
        <button className="send-button">Enviar</button>
      </form>
    </div>
  );
}