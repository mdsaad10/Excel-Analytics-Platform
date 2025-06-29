import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = () => {
    login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Excel Analytics</h2>
        
        <div className="text-center mb-4">
          <img src="/assets/excel-icon.svg" alt="Excel Analytics" className="h-24 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">Sign in with your account to access your analytics dashboard</p>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleLogin}
            className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 10.414V14a1 1 0 102 0v-3.586l1.293 1.293a1 1 0 001.414-1.414l-3-3z" clipRule="evenodd" />
            </svg>
            Sign in with Auth0
          </button>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Don't have an account? You'll be able to create one in the next step.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;