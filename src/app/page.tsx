// src/app/page.tsx
'use client'; // Mark this as a Client Component
import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            PoinDexter Quote Calculator
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Your intelligent solution for precise and efficient quote calculations
          </p>
          <div className="hidden md:block space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-700">Instant quote calculations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-gray-700">Real-time updates</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-gray-700">Secure and reliable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full md:w-1/2 p-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-100">
          <SignIn
            routing="hash"
            appearance={{
              elements: {
                formButtonPrimary: 
                  'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white transition-all duration-200 transform hover:scale-[1.02]',
                footerActionLink: 
                  'text-red-600 hover:text-red-700 transition-colors duration-200',
                formFieldInput: 
                  'border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200',
                formFieldLabel: 
                  'text-gray-700 font-medium',
                formHeaderTitle: 
                  'text-2xl font-bold text-center text-gray-800',
                formHeaderSubtitle: 
                  'text-center text-gray-600',
                socialButtonsBlockButton: 
                  'border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200',
                dividerLine: 
                  'bg-gray-300',
                dividerText: 
                  'text-gray-500',
                card: 
                  'bg-transparent shadow-none',
              },
            }}
            afterSignInUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}