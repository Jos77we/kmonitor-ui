import React, { useState } from 'react';
import { Activity, FileText, TestTube2, Archive, ChevronLeft, ChevronRight } from 'lucide-react';

const menuItems = [
  { icon: Activity, label: 'Status', id: 'status' },
  { icon: FileText, label: 'Transactions', id: 'transactions' },
  { icon: TestTube2, label: 'Tests', id: 'tests' },
  { icon: Archive, label: 'Archived', id: 'archived' },
];

export function Sidebar({ onPageChange, activePage }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`bg-gray-800 text-white fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center px-4 py-3 hover:bg-gray-700 transition-colors ${
                activePage === item.id ? 'bg-gray-700' : ''
              }`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-4 hover:bg-gray-700 flex items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}