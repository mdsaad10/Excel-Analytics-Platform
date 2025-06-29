// src/utils/mongodbUtils.js
// Mock database for browser environment
let mockUsers = JSON.parse(localStorage.getItem('mockUsers')) || [];
let mockUploadHistory = JSON.parse(localStorage.getItem('mockUploadHistory')) || [];

// Create mock MongoDB functionality for browser environment
const createMockDb = () => {
  console.info('Using mock MongoDB client for browser environment');
  return { 
    client: null,
    db: {
      collection: (collectionName) => {
        // Different behavior based on collection
        if (collectionName === 'users') {
          return {
            findOne: async (query) => {
              return mockUsers.find(user => user.auth0Id === query.auth0Id) || null;
            },
            insertOne: async (doc) => {
              const newUser = { ...doc, _id: `user_${Date.now()}` };
              mockUsers.push(newUser);
              localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
              return { insertedId: newUser._id, ...doc };
            },
            findOneAndUpdate: async (query, update) => {
              const userIndex = mockUsers.findIndex(user => user.auth0Id === query.auth0Id);
              if (userIndex >= 0) {
                mockUsers[userIndex] = { ...mockUsers[userIndex], ...update.$set };
                localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
                return { value: mockUsers[userIndex] };
              }
              return { value: null };
            },
            find: async () => ({
              sort: () => ({
                toArray: async () => mockUsers
              })
            })
          };
        } else if (collectionName === 'fileUploadHistory') {
          return {
            findOne: async (query) => {
              return mockUploadHistory.find(item => item._id === query._id) || null;
            },
            insertOne: async (doc) => {
              const newHistory = { ...doc, _id: `history_${Date.now()}` };
              mockUploadHistory.push(newHistory);
              localStorage.setItem('mockUploadHistory', JSON.stringify(mockUploadHistory));
              return { insertedId: newHistory._id, ...doc };
            },
            find: async (query) => ({
              sort: (sortCriteria) => ({
                toArray: async () => {
                  let filtered = mockUploadHistory;
                  if (query.userId) {
                    filtered = filtered.filter(item => item.userId === query.userId);
                  }
                  return filtered.sort((a, b) => b.timestamp - a.timestamp);
                }
              })
            })
          };
        }
        
        // Default mock collection behavior
        return {
          findOne: async () => null,
          insertOne: async (doc) => ({ insertedId: `mock_${Date.now()}`, ...doc }),
          findOneAndUpdate: async (_, doc) => ({ value: doc.$set }),
          find: async () => ({
            sort: () => ({
              toArray: async () => []
            })
          })
        };
      }
    } 
  };
};

/**
 * Connect to MongoDB and return the client and database
 * @returns {Promise<{client: Object, db: Object}>}
 */
export const connectToDatabase = async () => {
  // Always return mock DB for browser environment
  // In a real app, you would use a REST API to connect to MongoDB
  return createMockDb();
};

/**
 * Save user information to database
 * @param {Object} userData - User data from Auth0
 * @returns {Promise<Object>} - Saved user document
 */
export const saveUser = async (userData) => {
  try {
    if (!userData || !userData.sub) {
      console.error('Invalid user data provided');
      return { success: false, message: 'Invalid user data provided' };
    }
    
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    
    // Check if user already exists
    const existingUser = await users.findOne({ auth0Id: userData.sub });
    
    if (existingUser) {
      // Update existing user
      const updatedUser = await users.findOneAndUpdate(
        { auth0Id: userData.sub },
        { 
          $set: { 
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            lastLogin: new Date(),
          } 
        },
        { returnDocument: 'after' }
      );
      return { success: true, user: updatedUser.value || updatedUser };
    } else {
      // Create new user
      const newUser = await users.insertOne({
        auth0Id: userData.sub,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        role: 'user',
        createdAt: new Date(),
        lastLogin: new Date(),
      });
      return { success: true, user: newUser };
    }
  } catch (error) {
    console.error('Error saving user:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Save file upload history
 * @param {string} userId - User ID
 * @param {Object} fileData - Information about the uploaded file
 * @returns {Promise<Object>} - Saved history document
 */
export const saveFileUploadHistory = async (userId, fileData) => {
  try {
    if (!userId) {
      console.error('User ID is required to save file history');
      return { success: false, message: 'User ID is required' };
    }
    
    if (!fileData || !fileData.name) {
      console.error('File data is required to save file history');
      return { success: false, message: 'File data is required' };
    }
    
    const { db } = await connectToDatabase();
    const history = db.collection('fileHistory');
    
    const historyData = {
      userId,
      fileName: fileData.name,
      fileSize: fileData.size || 0,
      fileType: fileData.type || 'unknown',
      sheets: fileData.sheets || [],
      uploadedAt: new Date(),
    };
    
    const newHistory = await history.insertOne(historyData);
    
    return { 
      success: true, 
      history: { ...historyData, _id: newHistory.insertedId }
    };
  } catch (error) {
    console.error('Error saving file history:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get file upload history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Object containing success status and history array
 */
export const getFileUploadHistory = async (userId) => {
  try {
    if (!userId) {
      return { success: false, message: 'User ID is required', history: [] };
    }
    
    const { db } = await connectToDatabase();
    const history = db.collection('fileHistory');
    
    const userHistory = await history
      .find({ userId })
      .sort({ uploadedAt: -1 })
      .toArray();
    
    return { 
      success: true, 
      history: userHistory || [] 
    };
  } catch (error) {
    console.error('Error getting file history:', error);
    return { success: false, message: error.message, history: [] };
  }
};

/**
 * Get all users (for admin purposes)
 * @returns {Promise<Object>} - Object containing success status and users array
 */
export const getAllUsers = async () => {
  try {
    const { db } = await connectToDatabase();
    const users = db.collection('users');
    
    const allUsers = await users.find({}).toArray();
    return { success: true, users: allUsers || [] };
  } catch (error) {
    console.error('Error getting users:', error);
    return { success: false, message: error.message, users: [] };
  }
};

/**
 * Get all file upload history (for admin purposes)
 * @returns {Promise<Object>} - Object containing success status and history array
 */
export const getAllFileHistory = async () => {
  try {
    const { db } = await connectToDatabase();
    const history = db.collection('fileHistory');
    
    const allHistory = await history
      .find({})
      .sort({ uploadedAt: -1 })
      .toArray();
    
    return { success: true, history: allHistory || [] };
  } catch (error) {
    console.error('Error getting file history:', error);
    return { success: false, message: error.message, history: [] };
  }
};