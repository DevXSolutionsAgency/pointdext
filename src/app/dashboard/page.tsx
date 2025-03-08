// src/app/dashboard/page.tsx
'use client'; // Mark this as a Client Component
import { useUser, useClerk } from '@clerk/nextjs';

export default function DashboardPage() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          Welcome to Your Dashboard, {user?.firstName}!
        </h1>
        <p className="text-center text-gray-600">
          You are now logged in and ready to use the PointDex Quote Calculator.
        </p>
        <button
          onClick={() => signOut()}
          className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}