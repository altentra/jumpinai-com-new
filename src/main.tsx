import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'

// Force dark mode permanently
document.documentElement.classList.add('dark');
localStorage.setItem('theme', 'dark');

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </AuthProvider>
  </React.StrictMode>
)

