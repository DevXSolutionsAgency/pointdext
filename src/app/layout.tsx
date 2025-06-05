// src/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Poindexter Calculator',
  description: 'A quote calculator application',
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.png" type="image/png" />
          <title>Poindexter Calculator</title>
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}