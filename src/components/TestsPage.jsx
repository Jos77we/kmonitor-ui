import React, { useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import axios from 'axios';
import { 
  Play, Code2, History, ChevronDown, ChevronRight, Sun, Moon,
  Search, Plus, Settings, User, Database, FileJson, Clock,
  Layers, Download, Copy, RefreshCw, X, Save, Eye, EyeOff, Edit, Trash2
} from 'lucide-react';

import stellarEndpoints, { 
  getEndpoints, 
  addCollection, 
  addEndpoint, 
  removeCollection, 
  removeEndpoint 
} from '../endpoints/stellarEndpoints';

export function TestsPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [requestBody, setRequestBody] = useState('{\n  \n}');
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('body');
  const [responseTab, setResponseTab] = useState('pretty');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('testnet');
  const [requestHistory, setRequestHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [showEnvForm, setShowEnvForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [showEndpointForm, setShowEndpointForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editingEndpoint, setEditingEndpoint] = useState(null);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });
  const [newEndpoint, setNewEndpoint] = useState({
    method: 'GET',
    path: '',
    description: '',
    requestBody: '{\n  \n}'
  });
  const [envVariables, setEnvVariables] = useState({
    testnet: {
      BASE_URL: 'https://kmonitor.onrender.com/testnet',
      API_KEY: 'test_1234567890'
    },
    public: {
      BASE_URL: 'https://kmonitor.onrender.com/public',
      API_KEY: 'prod_1234567890'
    },
    kipaji: {
      BASE_URL: 'https://kmonitor.onrender.com/kipaji',
      API_KEY: 'kipaji_1234567890'
    }
  });
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '' });
  const [showApiKey, setShowApiKey] = useState(false);
  const [endpoints, setEndpoints] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadEndpoints = async () => {
      setIsLoading(true);
      try {
        const endpoints = await getEndpoints(selectedNetwork);
        setEndpoints(endpoints);
      } catch (error) {
        console.error('Failed to load endpoints:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEndpoints();
  }, [selectedNetwork]);

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const selectEndpoint = (group, endpoint) => {
    setSelectedEndpoint({ ...endpoint, group });
    if (endpoint.method !== 'GET') {
      setRequestBody(endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : '{\n  \n}');
    } else {
      setRequestBody('{\n  \n}');
    }
    setResponse(null);
  };

  const handleSendRequest = async () => {
    if (!selectedEndpoint) return;
    
    setIsSending(true);
    setResponse(null);

    const baseUrl = envVariables[selectedNetwork]?.BASE_URL || '';
    const fullUrl = `${baseUrl}${selectedEndpoint.path}`;
    const apiKey = envVariables[selectedNetwork]?.API_KEY || '';
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      ...headers.reduce((acc, header) => {
        if (header.key) acc[header.key] = header.value;
        return acc;
      }, {})
    };

    const requestConfig = {
      method: selectedEndpoint.method.toLowerCase(),
      url: fullUrl,
      headers: requestHeaders,
      data: selectedEndpoint.method !== 'GET' ? JSON.parse(requestBody) : undefined
    };

    const newRequest = {
      timestamp: new Date().toISOString(),
      method: selectedEndpoint.method,
      path: selectedEndpoint.path,
      body: requestBody,
      network: selectedNetwork
    };

    try {
      const axiosResponse = await axios(requestConfig);
      
      setResponse({
        status: axiosResponse.status,
        data: axiosResponse.data,
        headers: axiosResponse.headers
      });

      setRequestHistory(prev => [newRequest, ...prev].slice(0, 10));
    } catch (error) {
      let errorResponse = {
        status: 500,
        error: 'Unknown error occurred',
        headers: {}
      };

      if (error.response) {
        errorResponse = {
          status: error.response.status,
          error: error.response.data || error.message,
          headers: error.response.headers || {}
        };
      } else if (error.request) {
        errorResponse = {
          status: 0,
          error: 'No response received from server',
          headers: {}
        };
      } else {
        errorResponse = {
          status: 500,
          error: error.message,
          headers: {}
        };
      }

      setResponse(errorResponse);
    } finally {
      setIsSending(false);
    }
  };
  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const handleAddCollection = async () => {
    if (newCollection.name) {
      const collectionKey = newCollection.name.replace(/\s+/g, '');
      try {
        await addCollection(selectedNetwork, collectionKey, []);
        const updatedEndpoints = await getEndpoints(selectedNetwork);
        setEndpoints(updatedEndpoints);
        setNewCollection({ name: '', description: '' });
        setShowCollectionForm(false);
        setEditingCollection(null);
      } catch (error) {
        console.error('Failed to add collection:', error);
      }
    }
  };

  const handleEditCollection = async () => {
    if (editingCollection && newCollection.name) {
      const newCollectionKey = newCollection.name.replace(/\s+/g, '');
      
      try {
        if (editingCollection !== newCollectionKey) {
          const endpointsToMove = endpoints[editingCollection] || [];
          await addCollection(selectedNetwork, newCollectionKey, endpointsToMove);
          await removeCollection(selectedNetwork, editingCollection);
        }
        
        const updatedEndpoints = await getEndpoints(selectedNetwork);
        setEndpoints(updatedEndpoints);
        setNewCollection({ name: '', description: '' });
        setShowCollectionForm(false);
        setEditingCollection(null);
      } catch (error) {
        console.error('Failed to edit collection:', error);
      }
    }
  };

  const handleDeleteCollection = async (collectionName) => {
    if (window.confirm(`Are you sure you want to delete the collection "${collectionName}"?`)) {
      try {
        await removeCollection(selectedNetwork, collectionName);
        const updatedEndpoints = await getEndpoints(selectedNetwork);
        setEndpoints(updatedEndpoints);
      } catch (error) {
        console.error('Failed to delete collection:', error);
      }
    }
  };

  const handleAddEndpoint = async () => {
    if (newEndpoint.method && newEndpoint.path && newEndpoint.description) {
      try {
        await addEndpoint(selectedNetwork, selectedEndpoint.group, {
          method: newEndpoint.method,
          path: newEndpoint.path,
          description: newEndpoint.description,
          requestBody: JSON.parse(newEndpoint.requestBody)
        });
        const updatedEndpoints = await getEndpoints(selectedNetwork);
        setEndpoints(updatedEndpoints);
        setNewEndpoint({
          method: 'GET',
          path: '',
          description: '',
          requestBody: '{\n  \n}'
        });
        setShowEndpointForm(false);
        setEditingEndpoint(null);
      } catch (error) {
        console.error('Failed to add endpoint:', error);
      }
    }
  };

  const handleEditEndpoint = async () => {
    if (editingEndpoint && newEndpoint.method && newEndpoint.path && newEndpoint.description) {
      try {
        await addEndpoint(selectedNetwork, selectedEndpoint.group, {
          method: newEndpoint.method,
          path: newEndpoint.path,
          description: newEndpoint.description,
          requestBody: JSON.parse(newEndpoint.requestBody)
        });
        const updatedEndpoints = await getEndpoints(selectedNetwork);
        setEndpoints(updatedEndpoints);
        setNewEndpoint({
          method: 'GET',
          path: '',
          description: '',
          requestBody: '{\n  \n}'
        });
        setShowEndpointForm(false);
        setEditingEndpoint(null);
      } catch (error) {
        console.error('Failed to edit endpoint:', error);
      }
    }
  };

  const handleDeleteEndpoint = async (group, endpoint) => {
    if (window.confirm(`Are you sure you want to delete the ${endpoint.method} ${endpoint.path} endpoint?`)) {
      try {
        await removeEndpoint(selectedNetwork, group, endpoint.method, endpoint.path);
        const updatedEndpoints = await getEndpoints(selectedNetwork);
        setEndpoints(updatedEndpoints);
      } catch (error) {
        console.error('Failed to delete endpoint:', error);
      }
    }
  };

  const handleEnvVarChange = (key, value) => {
    setEnvVariables(prev => ({
      ...prev,
      [selectedNetwork]: {
        ...prev[selectedNetwork],
        [key]: value
      }
    }));
  };

  const handleAddEnvVar = () => {
    if (newEnvVar.key && newEnvVar.value) {
      setEnvVariables(prev => ({
        ...prev,
        [selectedNetwork]: {
          ...prev[selectedNetwork],
          [newEnvVar.key]: newEnvVar.value
        }
      }));
      setNewEnvVar({ key: '', value: '' });
    }
  };

  const handleRemoveEnvVar = (key) => {
    const currentEnv = envVariables[selectedNetwork];
    const newEnv = { ...currentEnv };
    delete newEnv[key];
    setEnvVariables(prev => ({
      ...prev,
      [selectedNetwork]: newEnv
    }));
  };

  const currentEnv = envVariables[selectedNetwork];

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading endpoints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
        <div className="flex items-center space-x-4">
          <Code2 className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-bold">Stellar API Test Suite</h2>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Network Dropdown */}
          <div className="relative">
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className={`appearance-none px-4 py-1.5 pr-8 rounded-full text-sm font-medium ${
                isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            >
              <option value="testnet" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Testnet</option>
              <option value="public" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Public Net</option>
              <option value="kipaji" className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>Kipaji</option>
            </select>
            <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button className={`p-2 rounded-full ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Environment Variables Popup Form */}
      {showEnvForm && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'}`}>
          <div className={`relative w-full max-w-md mx-4 p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={() => {
                setShowEnvForm(false);
                setShowApiKey(false);
              }}
              className={`absolute top-4 right-4 p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-medium mb-6 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)} Environment Variables
            </h3>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {Object.entries(currentEnv).map(([key, value]) => (
                <div key={key} className="flex items-start space-x-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">Variable</div>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newValue = currentEnv[key];
                        handleRemoveEnvVar(key);
                        handleEnvVarChange(e.target.value, newValue);
                      }}
                      className={`w-full px-3 py-2 text-sm ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      } border rounded-lg`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">Value</div>
                    <div className="relative">
                      <input
                        type={key === 'API_KEY' && !showApiKey ? 'password' : 'text'}
                        value={value}
                        onChange={(e) => handleEnvVarChange(key, e.target.value)}
                        className={`w-full px-3 py-2 text-sm ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                        } border rounded-lg pr-10`}
                      />
                      {key === 'API_KEY' && (
                        <button
                          onClick={() => setShowApiKey(!showApiKey)}
                          className={`absolute right-2 top-2 p-1 rounded ${
                            isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          {showApiKey ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveEnvVar(key)}
                    className={`mt-6 p-2 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'} rounded-lg`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Add New Variable</h4>
                <div className="flex items-start space-x-2">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Variable name"
                      value={newEnvVar.key}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
                      className={`w-full px-3 py-2 text-sm ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      } border rounded-lg`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Value"
                      value={newEnvVar.value}
                      onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
                      className={`w-full px-3 py-2 text-sm ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      } border rounded-lg`}
                    />
                  </div>
                  <button
                    onClick={handleAddEnvVar}
                    disabled={!newEnvVar.key || !newEnvVar.value}
                    className={`mt-1 p-2 rounded-lg ${
                      newEnvVar.key && newEnvVar.value
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowEnvForm(false);
                  setShowApiKey(false);
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEnvForm(false);
                  setShowApiKey(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Collection Popup Form */}
      {showCollectionForm && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'}`}>
          <div className={`relative w-full max-w-md mx-4 p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={() => setShowCollectionForm(false)}
              className={`absolute top-4 right-4 p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-medium mb-6 flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              {editingCollection ? 'Edit Collection' : 'Create New Collection'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Collection Name</label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={(e) => setNewCollection({...newCollection, name: e.target.value})}
                  className={`w-full px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  } border rounded-lg`}
                  placeholder="e.g. Payments, Users"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description (Optional)</label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({...newCollection, description: e.target.value})}
                  className={`w-full px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  } border rounded-lg`}
                  rows="3"
                  placeholder="Describe what this collection is for"
                ></textarea>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Network</h4>
                <div className={`px-3 py-2 text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } border rounded-lg`}>
                  {selectedNetwork.charAt(0).toUpperCase() + selectedNetwork.slice(1)}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCollectionForm(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={editingCollection ? handleEditCollection : handleAddCollection}
                disabled={!newCollection.name}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  newCollection.name
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingCollection ? 'Update Collection' : 'Create Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Endpoint Form */}
      {showEndpointForm && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${isDarkMode ? 'bg-black bg-opacity-70' : 'bg-black bg-opacity-50'}`}>
          <div className={`relative w-full max-w-md mx-4 p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <button
              onClick={() => setShowEndpointForm(false)}
              className={`absolute top-4 right-4 p-1 rounded-full ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <X className="h-5 w-5" />
            </button>
            
            <h3 className="text-lg font-medium mb-6 flex items-center">
              <Code2 className="h-5 w-5 mr-2" />
              {editingEndpoint ? 'Edit Endpoint' : 'Create New Endpoint'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">HTTP Method</label>
                <select
                  value={newEndpoint.method}
                  onChange={(e) => setNewEndpoint({...newEndpoint, method: e.target.value})}
                  className={`w-full px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  } border rounded-lg`}
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Path</label>
                <input
                  type="text"
                  value={newEndpoint.path}
                  onChange={(e) => setNewEndpoint({...newEndpoint, path: e.target.value})}
                  className={`w-full px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  } border rounded-lg`}
                  placeholder="e.g. /api/users"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={newEndpoint.description}
                  onChange={(e) => setNewEndpoint({...newEndpoint, description: e.target.value})}
                  className={`w-full px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  } border rounded-lg`}
                  rows="3"
                  placeholder="Describe what this endpoint does"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Request Body (JSON)</label>
                <div className={`border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} rounded-lg`}>
                  <Editor
                    height="200px"
                    defaultLanguage="json"
                    value={newEndpoint.requestBody}
                    onChange={(value) => setNewEndpoint({...newEndpoint, requestBody: value})}
                    theme={isDarkMode ? 'vs-dark' : 'light'}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true
                    }}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Collection</h4>
                <div className={`px-3 py-2 text-sm ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } border rounded-lg`}>
                  {selectedEndpoint?.group || 'New Collection'}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowEndpointForm(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={editingEndpoint ? handleEditEndpoint : handleAddEndpoint}
                disabled={!newEndpoint.method || !newEndpoint.path || !newEndpoint.description}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  newEndpoint.method && newEndpoint.path && newEndpoint.description
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingEndpoint ? 'Update Endpoint' : 'Create Endpoint'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-3">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                } border rounded-lg`}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => {
                  setNewCollection({ name: '', description: '' });
                  setEditingCollection(null);
                  setShowCollectionForm(true);
                }}
                className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-indigo-600 ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                } rounded-lg`}
              >
                <Plus className="h-4 w-4" />
                <span>New Collection</span>
              </button>
            </div>

            <div className="mt-4 space-y-2 h-[calc(100vh-20rem)] overflow-y-auto">
              {Object.entries(endpoints).map(([group, items]) => (
                <div key={group} className={`border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                } rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleGroup(group)}
                      className={`flex-1 flex items-center justify-between p-3 text-left ${
                        isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{group}</span>
                      {expandedGroups[group] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex space-x-1 pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewCollection({ name: group, description: '' });
                          setEditingCollection(group);
                          setShowCollectionForm(true);
                        }}
                        className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCollection(group);
                        }}
                        className={`p-1.5 rounded ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedGroups[group] && (
                    <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      {items.map((endpoint, idx) => (
                        <div key={idx} className="group relative">
                          <button
                            onClick={() => selectEndpoint(group, endpoint)}
                            className={`w-full p-3 text-left text-sm border-b last:border-b-0 ${
                              isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
                            } ${
                              selectedEndpoint?.path === endpoint.path ? isDarkMode ? 'bg-gray-700' : 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </span>
                              <span className="truncate">{endpoint.path}</span>
                            </div>
                            <p className={`mt-1 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {endpoint.description}
                            </p>
                          </button>
                          <div className="absolute right-2 top-2 flex space-x-1 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewEndpoint({
                                  method: endpoint.method,
                                  path: endpoint.path,
                                  description: endpoint.description,
                                  requestBody: endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : '{\n  \n}'
                                });
                                setEditingEndpoint(endpoint);
                                setShowEndpointForm(true);
                              }}
                              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEndpoint(group, endpoint);
                              }}
                              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-500'}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setNewEndpoint({
                            method: 'GET',
                            path: '',
                            description: '',
                            requestBody: '{\n  \n}'
                          });
                          setEditingEndpoint(null);
                          setShowEndpointForm(true);
                        }}
                        className={`w-full p-2 text-xs text-center ${
                          isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Plus className="h-3 w-3 inline mr-1" />
                        Add Endpoint
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
       <div className="col-span-6 space-y-6">
          {/* Request Builder */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
            {selectedEndpoint ? (
              <>
                <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedEndpoint.method}
                      className={`px-3 py-1.5 rounded text-sm font-medium ${getMethodColor(selectedEndpoint.method)}`}
                      disabled
                    >
                      <option>{selectedEndpoint.method}</option>
                    </select>
                    <input
                      type="text"
                      value={`${envVariables[selectedNetwork]?.BASE_URL || ''}${selectedEndpoint.path}`}
                      className={`flex-1 ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                      } border rounded-lg px-3 py-1.5`}
                      readOnly
                    />
                    <button
                      onClick={handleSendRequest}
                      disabled={isSending}
                      className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg transition-colors ${
                        isSending
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isSending ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      <span>{isSending ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setActiveTab('body')}
                      className={`px-4 py-2 text-sm rounded-lg ${
                        activeTab === 'body'
                          ? isDarkMode ? 'bg-gray-700 font-medium' : 'bg-gray-100 font-medium'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Body
                    </button>
                    <button
                      onClick={() => setActiveTab('headers')}
                      className={`px-4 py-2 text-sm rounded-lg ${
                        activeTab === 'headers'
                          ? isDarkMode ? 'bg-gray-700 font-medium' : 'bg-gray-100 font-medium'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Headers
                    </button>
                    <button
                      onClick={() => setActiveTab('params')}
                      className={`px-4 py-2 text-sm rounded-lg ${
                        activeTab === 'params'
                          ? isDarkMode ? 'bg-gray-700 font-medium' : 'bg-gray-100 font-medium'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Params
                    </button>
                  </div>

                  {activeTab === 'body' && selectedEndpoint.method !== 'GET' && (
                    <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                      <Editor
                        height="300px"
                        defaultLanguage="json"
                        value={requestBody}
                        onChange={setRequestBody}
                        theme={isDarkMode ? 'vs-dark' : 'light'}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          scrollBeyondLastLine: false,
                          automaticLayout: true
                        }}
                      />
                    </div>
                  )}

                  {activeTab === 'headers' && (
                    <div className="space-y-3">
                      {headers.map((header, idx) => (
                        <div key={idx} className="flex space-x-2">
                          <input
                            type="text"
                            value={header.key}
                            onChange={(e) => {
                              const newHeaders = [...headers];
                              newHeaders[idx].key = e.target.value;
                              setHeaders(newHeaders);
                            }}
                            placeholder="Header"
                            className={`flex-1 px-3 py-2 ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            } border rounded-lg`}
                          />
                          <input
                            type="text"
                            value={header.value}
                            onChange={(e) => {
                              const newHeaders = [...headers];
                              newHeaders[idx].value = e.target.value;
                              setHeaders(newHeaders);
                            }}
                            placeholder="Value"
                            className={`flex-1 px-3 py-2 ${
                              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            } border rounded-lg`}
                          />
                          <button
                            onClick={() => {
                              const newHeaders = [...headers];
                              newHeaders.splice(idx, 1);
                              setHeaders(newHeaders);
                            }}
                            className={`p-2 ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-500'} rounded-lg`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => setHeaders([...headers, { key: '', value: '' }])}
                        className="text-sm text-indigo-600 dark:text-indigo-400"
                      >
                        + Add Header
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select an endpoint from the sidebar to start testing</p>
              </div>
            )}
          </div>

          {/* Response Viewer */}
          {response && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
              <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      response.status >= 200 && response.status < 300
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {response.status}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {response.headers['x-response-time'] || ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
                      }}
                      className={`p-2 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-lg`}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="flex space-x-4 mb-4">
                  <button
                    onClick={() => setResponseTab('pretty')}
                    className={`px-4 py-2 text-sm rounded-lg ${
                      responseTab === 'pretty'
                        ? isDarkMode ? 'bg-gray-700 font-medium' : 'bg-gray-100 font-medium'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Pretty
                  </button>
                  <button
                    onClick={() => setResponseTab('raw')}
                    className={`px-4 py-2 text-sm rounded-lg ${
                      responseTab === 'raw'
                        ? isDarkMode ? 'bg-gray-700 font-medium' : 'bg-gray-100 font-medium'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Raw
                  </button>
                  <button
                    onClick={() => setResponseTab('headers')}
                    className={`px-4 py-2 text-sm rounded-lg ${
                      responseTab === 'headers'
                        ? isDarkMode ? 'bg-gray-700 font-medium' : 'bg-gray-100 font-medium'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Headers
                  </button>
                </div>

                <div className={`border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                  <Editor
                    height="300px"
                    defaultLanguage="json"
                    value={
                      responseTab === 'pretty'
                        ? JSON.stringify(response.data || response.error, null, 2)
                        : responseTab === 'raw'
                        ? JSON.stringify(response.data || response.error)
                        : JSON.stringify(response.headers, null, 2)
                    }
                    theme={isDarkMode ? 'vs-dark' : 'light'}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                      automaticLayout: true
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-3 space-y-6">
          {/* Environment Variables */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Environment
              </h3>
              <button 
                onClick={() => setShowEnvForm(true)}
                className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-2">
              {Object.entries(currentEnv).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{key}:</span>
                  <span className="ml-2">
                    {key === 'API_KEY' ? '••••••••' : value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Request History */}
          {requestHistory.length > 0 && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  History
                </h3>
                <button className={`p-1 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded`}>
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2">
                {requestHistory.map((request, idx) => (
                  <button
                    key={idx}
                    className={`w-full text-left p-2 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } rounded-lg`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(request.method)}`}>
                        {request.method}
                      </span>
                      <span className="text-sm truncate">{request.path}</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(request.timestamp).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className={
                        request.network === 'testnet' ? 'text-purple-500' : 
                        request.network === 'public' ? 'text-green-500' : 'text-blue-500'
                      }>
                        {request.network}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}