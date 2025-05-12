// src/apiEndpoints.js
export const networkEndpoints = {
  testnet: {
    Users: [
      { 
        method: 'POST',
        path: '/create-account',
        description: 'Create a new testnet account'
      },
      {
        method: 'POST',
        path: '/fund-account',
        description: 'Fund a testnet account using friendbot'
      }
    ],
    Transactions: [
      {
        method: 'POST',
        path: '/trustline',
        description: 'Create a trustline'
      },
      {
        method: 'POST',
        path: '/swap-usdc',
        description: 'Swap USDC on testnet'
      },
      {
        method: 'POST',
        path: '/sponsor-account',
        description: 'Sponsor an account'
      },
      {
        method: 'POST',
        path: '/award-tokens',
        description: 'Award tokens'
      }
    ],
    Account: [
      {
        method: 'POST',
        path: '/account-balance',
        description: 'Get account balance'
      },
      {
        method: 'POST',
        path: '/check-balances',
        description: 'Check account balances'
      },
      {
        method: 'POST',
        path: '/checkAcc-balances',
        description: 'Check account balances with validation'
      }
    ],
    History: [
      {
        method: 'POST',
        path: '/transact-history',
        description: 'Get transaction history'
      }
    ],
    Management: [
      {
        method: 'POST',
        path: '/find-account',
        description: 'Find account details'
      }
    ]
  },
  public: {
    Users: [
      { method: 'GET', path: '/api/users', description: 'List all users' },
      { method: 'POST', path: '/api/users', description: 'Create new user' },
      { method: 'PUT', path: '/api/users/:id', description: 'Update user' }
    ],
    Authentication: [
      { method: 'POST', path: '/api/auth/login', description: 'User login' },
      { method: 'POST', path: '/api/auth/logout', description: 'User logout' },
      { method: 'POST', path: '/api/auth/refresh', description: 'Refresh token' }
    ]
  },
  kipaji: {
    KipajiUsers: [
      { method: 'GET', path: '/api/kipaji/users', description: 'List Kipaji users' },
      { method: 'POST', path: '/api/kipaji/users', description: 'Create Kipaji user' }
    ],
    KipajiTransactions: [
      { method: 'GET', path: '/api/kipaji/transactions', description: 'List Kipaji transactions' },
      { method: 'POST', path: '/api/kipaji/transactions', description: 'Create Kipaji transaction' }
    ]
  }
};

export function addEndpoint(network, group, endpoint) {
  if (!networkEndpoints[network]) {
    networkEndpoints[network] = {};
  }
  if (!networkEndpoints[network][group]) {
    networkEndpoints[network][group] = [];
  }
  networkEndpoints[network][group].push(endpoint);
}

export function updateEndpoint(network, group, oldPath, newEndpoint) {
  if (networkEndpoints[network][group]) {
    const index = networkEndpoints[network][group].findIndex(
      endpoint => endpoint.path === oldPath
    );
    if (index !== -1) {
      networkEndpoints[network][group][index] = newEndpoint;
    }
  }
}

export function removeEndpoint(network, group, path) {
  if (networkEndpoints[network][group]) {
    networkEndpoints[network][group] = 
      networkEndpoints[network][group].filter(
        endpoint => endpoint.path !== path
      );
  }
}