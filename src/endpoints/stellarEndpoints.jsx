// frontend/src/endpoints/stellarEndpoints.js

const API_BASE_URL = 'https://kmonitor.onrender.com/api';

// Helper function to make API calls
const apiRequest = async (method, url, data = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, options);
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Get all endpoints for a network
export const getEndpoints = async (network) => {
  const response = await apiRequest('GET', `/endpoints/${network}`);
  return response;
};

// Add or update a collection
export const addCollection = async (network, collectionName, endpoints = []) => {
  return await apiRequest('POST', `/endpoints/${network}/collections/${collectionName}`, { endpoints });
};

// Add or update an endpoint
export const addEndpoint = async (network, collectionName, endpoint) => {
  return await apiRequest('POST', `/endpoints/${network}/collections/${collectionName}/endpoints`, endpoint);
};

// Remove a collection
export const removeCollection = async (network, collectionName) => {
  return await apiRequest('DELETE', `/endpoints/${network}/collections/${collectionName}`);
};

// Remove an endpoint
export const removeEndpoint = async (network, collectionName, method, path) => {
  return await apiRequest('DELETE', `/endpoints/${network}/collections/${collectionName}/endpoints`, { method, path });
};

// Initialize with empty endpoints
let stellarEndpoints = {
  testnet: { Accounts: [], Transactions: [], AccountInfo: [] },
  public: { Accounts: [], Transactions: [], AccountInfo: [] },
  kipaji: { Accounts: [], Transactions: [], AccountInfo: [] }
};

// Load endpoints from backend on initialization
(async () => {
  try {
    const endpoints = await getEndpoints('testnet');
    stellarEndpoints.testnet = endpoints;
  } catch (error) {
    console.error('Failed to load endpoints:', error);
  }
})();

export default stellarEndpoints;