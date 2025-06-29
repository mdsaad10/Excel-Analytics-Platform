import React, { useState, useRef } from 'react';
import { parseExcelFile } from './ExcelParser';
import { useAuth } from '../auth/AuthContext';
import { saveFileUploadHistory } from '../../utils/mongodbUtils';

const ExcelUploader = ({ onDataParsed }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is Excel
      if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
        setError('Please select a valid Excel or CSV file.');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const { currentUser } = useAuth();

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Parse the Excel file
      const parsedData = await parseExcelFile(selectedFile);
      
      // Save file upload history to MongoDB if user is authenticated
      if (currentUser) {
        try {
          const result = await saveFileUploadHistory(currentUser.id, {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type,
            sheets: Object.keys(parsedData.sheets)
          });
          
          if (!result.success) {
            console.warn('Failed to save file history:', result.message);
          }
        } catch (historyError) {
          console.error('Error saving file history:', historyError);
          // Continue with the upload process even if history saving fails
        }
      }
      
      // Pass the parsed data to parent component
      onDataParsed(parsedData);
    } catch (err) {
      console.error('Error parsing Excel file:', err);
      setError(`Failed to parse file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
        setError('Please drop a valid Excel or CSV file.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:border-blue-500 transition-all"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          accept=".xlsx,.xls,.csv" 
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        
        <svg 
          className="w-12 h-12 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        
        <p className="mt-2 text-sm text-gray-600">
          {selectedFile 
            ? `Selected: ${selectedFile.name}` 
            : 'Drop your Excel file here or click to browse'
          }
        </p>
        
        <p className="mt-1 text-xs text-gray-500">
          Supports .xlsx, .xls, .csv files
        </p>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-4">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          onClick={handleUpload}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? 'Processing...' : 'Upload and Process File'}
        </button>
      </div>
    </div>
  );
};

export default ExcelUploader;