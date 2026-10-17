import './globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';

export const metadata = {
  title: 'AI-Powered Preventive Healthcare & Emergency Response System',
  description: 'College Computer Engineering Capstone Project - Real ML Predictions & Preventive Health Guidance',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
