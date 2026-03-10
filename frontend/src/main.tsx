import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'

// Importar Font Awesome localmente
import '@fortawesome/fontawesome-free/css/all.min.css'

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = '742120950726-4t9bb72rhpomsrbks10r8mgdjrtunv3k.apps.googleusercontent.com'

// Registrar service worker para cache agresivo
if (
  'serviceWorker' in navigator &&
  import.meta.env.PROD &&
  !import.meta.env.VITE_DISABLE_SW &&
  !(window as any).__PW_TEST__
) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
)
