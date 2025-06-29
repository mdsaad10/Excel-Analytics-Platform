// src/utils/auth0Config.js
import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Auth0 configuration
// In production, these values should be stored in environment variables
const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || 'dev-placeholder.auth0.com',
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || 'placeholder-client-id',
  redirectUri: window.location.origin,
  // Remove the audience as it's causing the "Service not found" error
  // audience: 'https://api.excelanalytics.com',
  scope: 'openid profile email'
};

/**
 * Auth0 provider component with navigation history integration
 * @param {Object} props - Component props
 * @returns {JSX.Element} Auth0Provider component
 */
export const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        // Removing audience parameter
        scope: auth0Config.scope,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default auth0Config;