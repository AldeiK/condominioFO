import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  authEndpoint: 'http://localhost:8000/broadcasting/auth',
  auth: {
    headers: {
      Accept: 'application/json',
    },
  },
});

export function setEchoAuthToken(token) {
  if (!echo?.options?.auth) {
    echo.options.auth = { headers: {} };
  }

  if (!echo.options.auth.headers) {
    echo.options.auth.headers = {};
  }

  echo.options.auth.headers.Accept = 'application/json';

  if (token) {
    echo.options.auth.headers.Authorization = `Bearer ${token}`;
  } else {
    delete echo.options.auth.headers.Authorization;
  }
}

export default echo;