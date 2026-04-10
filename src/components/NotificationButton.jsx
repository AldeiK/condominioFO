import { useState, useEffect, useRef, useTransition } from 'react';
import { CSSTransition } from 'react-transition-group';
import echo from '../services/echo';
import './NotificationButton.css';
import { useAuth } from '../contexts/AuthContext';
import TransitionAlert from './TransitionAlert';

export default function NotificationButton() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const bcRef = useRef(null);
  const { authFetch, user, loading } = useAuth();
  const [actionLoading, setActionLoading] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [badgePulse, setBadgePulse] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    let cancelled = false;

    (async () => {
      setActionLoading('load');
      try {
        const res = await authFetch('http://127.0.0.1:8000/api/notifications');

        if (!cancelled && res.ok) {
          const data = await res.json();
          startTransition(() => {
            setNotifications(Array.isArray(data) ? data : []);
          });
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Error cargando notificaciones:', e);
          setAlert({ show: true, message: 'Error cargando notificaciones', type: 'error' });
        }
      } finally {
        if (!cancelled) {
          setActionLoading(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authFetch, user, loading]);

  useEffect(() => {
    if (loading || !user) return;

    try {
      bcRef.current = new BroadcastChannel('notifications');
      bcRef.current.onmessage = (e) => {
        const n = e.data;

        setNotifications((prev) => {
          if (prev.some((p) => p.id === n.id)) return prev;
          return [n, ...prev];
        });
      };
    } catch {
      //
    }

    return () => bcRef.current?.close();
  }, [user, loading]);

  useEffect(() => {
    if (loading || !user) return;

    const channel = echo.channel('notifications');

    channel.listen('.notification.sent', (payload) => {
      const notification = payload?.notification || payload?.data || payload;

      if (!notification?.message) return;

      if (!notification.id) {
        notification.id = Date.now();
      }

      startTransition(() => {
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notification.id)) return prev;
          return [notification, ...prev];
        });
      });

      setAlert({
        show: true,
        message: notification.message || 'Nueva notificación',
        type: 'success',
      });

      setBadgePulse(true);
      setTimeout(() => setBadgePulse(false), 900);

      bcRef.current?.postMessage(notification);
    });

    setConnected(true);

    return () => {
      echo.leave('notifications');
      setConnected(false);
    };
  }, [user, loading]);

  const unreadCount = notifications.length;

  const iconMap = {
    mensaje: '💬',
    multa: '⚠️',
    asamblea: '📢',
    'pago-atraso': '💰',
    pago: '✅',
    alerta: '🚨',
    advertencia: '⚠️',
    información: 'ℹ️',
    éxito: '🎉',
  };

  const badgeRef = useRef(null);
  const dropdownRef = useRef(null);

  return (
    <div className="notification-wrapper">
      <button
        className={`notification-button ${connected ? 'connected' : 'disconnected'}`}
        onClick={() => setOpen((o) => !o)}
        title="Notificaciones en tiempo real"
      >
        {actionLoading === 'load' ? '⏳' : '🔔'}
        <CSSTransition
          nodeRef={badgeRef}
          in={unreadCount > 0}
          timeout={360}
          classNames="badge"
          unmountOnExit
        >
          <span ref={badgeRef} className={`notification-badge ${badgePulse ? 'pulse' : ''}`}>
            {unreadCount}
          </span>
        </CSSTransition>
      </button>

      <CSSTransition
        nodeRef={dropdownRef}
        in={open}
        timeout={220}
        classNames="notif-dropdown"
        unmountOnExit
      >
        <div ref={dropdownRef} className="notification-dropdown">
          <div className="notification-header">
            <h3>📬 Notificaciones</h3>
            {notifications.length > 0 && (
              <button className="clear-btn" onClick={() => setNotifications([])}>
                Limpiar
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notification-empty">Sin notificaciones</div>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li key={n.id} className="notification-item">
                  <div className="notification-link">
                    <span className="notification-icon">{iconMap[n.type] || '🔔'}</span>
                    <div className="notification-content">
                      <strong>{n.type || 'Notificación'}</strong>
                      <p>{n.message}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CSSTransition>

      <TransitionAlert
        show={alert.show}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, show: false })}
      />
    </div>
  );
}