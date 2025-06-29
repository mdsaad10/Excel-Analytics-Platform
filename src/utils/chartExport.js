// src/utils/chartExport.js
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Export chart as PNG image
 * @param {string} elementId - ID of the chart container element
 * @param {string} fileName - Name for the downloaded file (without extension)
 * @returns {Promise<void>}
 */
export const exportChartAsPNG = async (elementId, fileName = 'chart') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true
    });

    // Create download link
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${fileName}.png`;
    link.click();
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    throw error;
  }
};

/**
 * Export chart as PDF document
 * @param {string} elementId - ID of the chart container element
 * @param {string} fileName - Name for the downloaded file (without extension)
 * @param {Object} options - PDF options (orientation, title)
 * @returns {Promise<void>}
 */
export const exportChartAsPDF = async (elementId, fileName = 'chart', options = {}) => {
  try {
    const { orientation = 'landscape', title = 'Chart Export' } = options;
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
    });
    
    // Add title
    pdf.setFontSize(16);
    pdf.text(title, 15, 15);
    
    // Get dimensions
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Add image
    pdf.addImage(imgData, 'PNG', 15, 25, pdfWidth, pdfHeight);
    
    // Add timestamp
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 15, pdfHeight + 35);
    
    // Save PDF
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting chart as PDF:', error);
    throw error;
  }
};

/**
 * Generate unique element ID for chart export
 * @returns {string} Unique ID
 */
export const generateChartId = () => {
  return `chart-${Math.random().toString(36).substring(2, 9)}`;
};