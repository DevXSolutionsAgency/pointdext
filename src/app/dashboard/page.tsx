// src/app/dashboard/page.tsx
'use client'; // Mark this as a Client Component
import { useUser, useClerk } from '@clerk/nextjs';
import { useState } from 'react';

export default function DashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'quotes', label: 'Quotes', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                PointDex
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  {user?.firstName?.[0] || 'U'}
                </div>
                <span className="text-gray-700">{user?.firstName}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={item.icon}
                      />
                    </svg>
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome back, {user?.firstName}!</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-medium mb-2">Total Quotes</h3>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-medium mb-2">Active Projects</h3>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-medium mb-2">Completed</h3>
                      <p className="text-3xl font-bold">0</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'quotes' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Quotes</h2>
                    <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-colors duration-200">
                      New Quote
                    </button>
                  </div>
                  <div className="text-center text-gray-500 py-8">
                    No quotes yet. Click "New Quote" to create one.
                  </div>
                </div>
              )}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Settings</h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Notifications
                      </label>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-600">
                          Receive email notifications for new quotes
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md">
                        <option>Light</option>
                        <option>Dark</option>
                        <option>System</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}