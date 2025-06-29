import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { saveUser } from '../../utils/mongodbUtils';

// Create the auth context
const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Sync Auth0 user with our state
  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        try {
          // Get access token for API calls
          const token = await getAccessTokenSilently();
          setAccessToken(token);
          
          // Save user to MongoDB
          const saveResult = await saveUser(user);
          if (!saveResult.success) {
            console.warn('Failed to save user data:', saveResult.message);
          }
          
          setCurrentUser({
            name: user.name,
            email: user.email,
            id: user.sub,
            picture: user.picture,
            role: user['https://excelanalytics.com/roles'] || 'user'
          });
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      } else if (!isLoading) {
        setCurrentUser(null);
        setAccessToken(null);
      }
      
      if (!isLoading) {
        setLoading(false);
      }
    };
    
    syncUser();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently]);

  // Login function
  const login = async () => {
    await loginWithRedirect();
  };

  // Register function (with Auth0, registration is part of the login flow)
  const register = async () => {
    await loginWithRedirect({ screen_hint: 'signup' });
  };

  // Logout function
  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    accessToken,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;