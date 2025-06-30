import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = () => {
    register();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register for Excel Analytics</h2>
        
        <div className="text-center mb-4">
          <img src="src\components\auth\assets\excel-icon.svg" alt="Excel Analytics" className="h-24 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">Create your account to access the analytics dashboard</p>
        </div>

        <div className="flex flex-col space-y-4">
          <button
            onClick={handleRegister}
            className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Create Account with Auth0
          </button>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button 
              type="button"
              className="text-blue-500 hover:text-blue-800"
              onClick={() => navigate('/login')}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;