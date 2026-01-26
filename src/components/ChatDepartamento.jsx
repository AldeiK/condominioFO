import { useState, useEffect, useRef } from 'react';
import './ChatDepartamento.css';

export default function ChatDepartamento() {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userName, setUserName] = useState('Usuario ' + Math.floor(Math.random() * 1000));
    const [departmentId, setDepartmentId] = useState('Admin');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);

    // Función para cargar mensajes
    const loadMessages = async (dept) => {
        try {
            const response = await fetch(`http://localhost:8000/api/messages/${dept}`);
            const data = await response.json();
            setMessages(data.reverse());
        } catch (err) {
            console.error('Error cargando mensajes:', err);
        }
    };

    // Cargar mensajes al cambiar departamento y configurar polling
    useEffect(() => {
        setLoading(true);
        loadMessages(departmentId).then(() => setLoading(false));

        // Polling cada 500ms para actualizaciones en tiempo real
        intervalRef.current = setInterval(() => {
            loadMessages(departmentId);
        }, 500);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [departmentId]);

    // Auto-scroll al final
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch('http://localhost:8000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: userName,
                    department_id: departmentId,
                    message: newMessage,
                })
            });

            if (response.ok) {
                setNewMessage('');
            } else {
                console.error('Error al enviar mensaje');
            }
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="header-controls">
                    <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Tu nombre"
                        className="user-input"
                    />
                    <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="department-select">
                        <option value="Admin">Admin</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Tesorería">Tesorería</option>
                        <option value="Seguridad">Seguridad</option>
                    </select>
                </div>
            </div>

            <div className="messages">
                {loading && <p className="loading">Cargando mensajes...</p>}
                {messages.length === 0 && !loading && <p className="no-messages">No hay mensajes aún</p>}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.user_name === userName ? 'own' : ''}`}>
                        <strong className="message-user">{msg.user_name}</strong>
                        <p className="message-text">{msg.message}</p>
                        <small className="message-time">
                            {new Date(msg.created_at).toLocaleTimeString('es-ES')}
                        </small>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="message-input"
                />
                <button type="submit" className="send-button">Enviar</button>
            </form>
        </div>
    );
}
