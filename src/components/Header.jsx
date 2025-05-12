import React from 'react';
import { Bell, MessageSquare, LogOut, Boxes } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 fixed w-full top-0 z-50">
      <div className="flex items-center space-x-3">
        <Boxes className="h-8 w-8 text-indigo-600" />
        <h1 className="text-xl font-semibold text-gray-800">TeamDash</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-600 hover:text-gray-800">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
        </button>
        <button className="relative text-gray-600 hover:text-gray-800">
          <MessageSquare className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">2</span>
        </button>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">John Doe</span>
          <button className="text-gray-600 hover:text-gray-800">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}