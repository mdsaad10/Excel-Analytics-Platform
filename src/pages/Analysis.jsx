import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import ChartSelector from '../components/excel/ChartSelector';
import DataViewer from '../components/excel/DataViewer';

const Analysis = () => {
  const [excelData, setExcelData] = useState(null);
  const [activeSheet, setActiveSheet] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Load data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem('lastExcelData');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setExcelData(parsedData);
          if (parsedData.firstSheet) {
            setActiveSheet(parsedData.firstSheet);
          }
        } else {
          // No data found, redirect to dashboard
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        navigate('/dashboard');
      }
    };

    loadSavedData();
  }, [navigate]);

  // Return to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };

  if (!excelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Data Analysis</h1>
          <div className="flex items-center">
            <div className="mr-4">
              <span className="text-sm text-gray-600">Welcome, </span>
              <span className="font-semibold">{currentUser?.name || 'User'}</span>
            </div>
            <button
              onClick={logout}
              className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Visualization Tools</h2>
            <button
              onClick={goToDashboard}
              className="flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 border-blue-600 transition ease-in-out duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          {/* Sheet tabs */}
          {excelData && excelData.sheets && (
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {Object.keys(excelData.sheets).map((sheetName) => (
                  <button
                    key={sheetName}
                    onClick={() => setActiveSheet(sheetName)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeSheet === sheetName
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {sheetName}
                  </button>
                ))}
              </nav>
            </div>
          )}

          {/* Chart selector */}
          <div className="mb-8">
            <ChartSelector data={excelData} activeSheet={activeSheet} />
          </div>
          
          {/* Data preview */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Data Preview</h3>
            <DataViewer data={excelData} activeSheet={activeSheet} />
          </div>
          
          {/* AI Insights section - placeholder for future implementation */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Coming Soon
              </span>
            </div>
            <p className="text-gray-600 mb-4">
              Automated insights from your data will be available in a future update. This feature will:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Identify trends and patterns automatically</li>
              <li>Suggest optimal visualization formats for your data</li>
              <li>Provide text summaries of key findings</li>
              <li>Offer predictive analysis based on historical data</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;