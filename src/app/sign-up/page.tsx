// src/app/sign-up/[[...sign-up]]/page.tsx
'use client'; // Mark this as a Client Component
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Join PointDex Today
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Create your account and start calculating quotes instantly
          </p>
          <div className="hidden md:block space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-700">Free account setup</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-700">Instant access to all features</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <span className="text-gray-700">Cloud-based calculations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="w-full md:w-1/2 p-8">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md mx-auto border border-gray-100">
          <SignUp
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
            afterSignUpUrl="/dashboard"
            signInUrl="/"
          />
        </div>
      </div>
    </div>
  );
}