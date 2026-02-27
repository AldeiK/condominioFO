import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// global error logging to surface issues causing blank screen
window.addEventListener('error', (e) => {
  console.error('Global error', e.error || e.message);
  alert('Error en la aplicación: ' + (e.error ? e.error.message : e.message));
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection', e.reason);
  alert('Promise rejected: ' + (e.reason?.message || e.reason));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
