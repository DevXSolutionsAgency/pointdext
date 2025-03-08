// src/app/sign-up/[[...sign-up]]/page.tsx
'use client'; // Mark this as a Client Component
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          PointDex Quote Calculator
        </h1>

        {/* Sign Up Form */}
        <SignUp
          routing="hash"
          appearance={{
            elements: {
              formButtonPrimary: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white',
              footerActionLink: 'text-red-600 hover:text-red-700',
              formFieldInput: 'border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent',
              formFieldLabel: 'text-gray-700',
              formHeaderTitle: 'text-2xl font-bold text-center text-black',
              formHeaderSubtitle: 'text-center text-gray-600',
              socialButtons: 'border border-gray-300 rounded-lg hover:bg-gray-50',
              dividerLine: 'bg-gray-300',
              dividerText: 'text-gray-500',
            },
          }}
          afterSignUpUrl="/dashboard" // Redirect to dashboard after signing up
          signInUrl="/" // Redirect to custom Sign In page
        />
      </div>
    </div>
  );
}