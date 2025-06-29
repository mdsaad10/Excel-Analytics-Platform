// src/components/excel/ExcelParser.js
import { read, utils } from 'xlsx';

/**
 * Parse Excel file and return data as JSON
 * @param {File} file - Excel file to parse
 * @returns {Promise<{sheets: Object, headers: Object, firstSheet: string}>}
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Parse the Excel file data
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        
        // Get sheet names from workbook
        const sheetNames = workbook.SheetNames;
        
        // If no sheets found, reject
        if (sheetNames.length === 0) {
          reject(new Error('No sheets found in the Excel file.'));
          return;
        }
        
        // Process each sheet
        const sheets = {};
        const headers = {};
        
        sheetNames.forEach(sheetName => {
          // Convert sheet to JSON
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(worksheet);
          
          // Store sheet data
          sheets[sheetName] = jsonData;
          
          // Extract headers (column names) from the first row
          if (jsonData.length > 0) {
            headers[sheetName] = Object.keys(jsonData[0]);
          } else {
            headers[sheetName] = [];
          }
        });
        
        // Resolve with the parsed data
        resolve({
          sheets,
          headers,
          firstSheet: sheetNames[0]
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };
    
    // Read Excel file as an array buffer
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Get statistical summary of numerical columns in the data
 * @param {Array} data - Array of objects representing table data
 * @returns {Object} - Statistical summary
 */
export const getDataSummary = (data) => {
  if (!data || data.length === 0) {
    return {};
  }

  const summary = {};
  
  // Get all keys from the first data point
  const keys = Object.keys(data[0]);
  
  // For each key, check if it contains numerical data
  keys.forEach(key => {
    const values = data.map(d => d[key]).filter(val => 
      !isNaN(parseFloat(val)) && isFinite(val)
    );
    
    if (values.length > 0) {
      // Convert strings to numbers
      const numericValues = values.map(v => parseFloat(v));
      
      // Calculate statistics
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const mean = sum / numericValues.length;
      
      // Sort for median and percentiles
      const sorted = [...numericValues].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      
      // Min, max
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      
      summary[key] = {
        count: numericValues.length,
        min,
        max,
        sum,
        mean,
        median
      };
    }
  });
  
  return summary;
};