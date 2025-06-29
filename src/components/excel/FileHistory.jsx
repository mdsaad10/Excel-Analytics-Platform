import React, { useState, useEffect } from 'react';
import { getFileUploadHistory } from '../../utils/mongodbUtils';
import { useAuth } from '../auth/AuthContext';

const FileHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser || !currentUser.id) {
        setLoading(false);
        return;
      }

      try {
        const result = await getFileUploadHistory(currentUser.id);
        if (result.success) {
          setHistory(result.history);
        } else {
          setError('Could not load file history');
          console.error(result.message);
        }
      } catch (err) {
        setError('Error loading file history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 py-2">{error}</div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2">No file upload history found</div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Recent File Uploads</h4>
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filename
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {history.map((file) => (
              <tr key={file._id}>
                <td className="py-2 pl-4 pr-3 text-sm font-medium text-gray-900">
                  {file.fileName}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {file.fileType}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {file.fileSize ? `${(file.fileSize / 1024).toFixed(2)} KB` : 'N/A'}
                </td>
                <td className="px-3 py-2 text-sm text-gray-500">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileHistory;