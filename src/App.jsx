import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Terminal } from './components/Terminal';
import { StatusTable } from './components/StatusTable';
import { TransactionsPage } from './components/TransactionsPage';
import { TestsPage } from './components/TestsPage';

function App() {
  const [activePage, setActivePage] = useState('status');

  const renderPage = () => {
    switch (activePage) {
      case 'transactions':
        return <TransactionsPage />;
      case 'tests':
        return <TestsPage />;
      case 'archived':
        return <h2 className="text-2xl font-bold text-gray-800">Archived Page</h2>;
      case 'status':
      default:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-800">System Status</h2>
            <div className="grid gap-6">
              <Terminal />
              <StatusTable />
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Sidebar onPageChange={setActivePage} activePage={activePage} />
      
      <main className={`ml-64 pt-16 p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;