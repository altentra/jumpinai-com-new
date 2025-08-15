import React from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.tsx'
import './index.css'

const AUTH0_DOMAIN = "dev-iyfpdob2thyte37k.us.auth0.com"
const AUTH0_CLIENT_ID = "XX2TPAzKsR98BETXcC4EdJoR4hI85Tlw"

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={AUTH0_DOMAIN}
      clientId={AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin + "/auth"
      }}
    >
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </Auth0Provider>
  </React.StrictMode>
)
