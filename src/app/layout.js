'use client';

import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import './globals.css';

function AppShell({ children }) {
  const { isAuthenticated, initialized } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted || !initialized) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          <div className="loading-icon">🏫</div>
          <h1 className="loading-title">VOO School</h1>
          <p className="loading-subtitle">Vidhya • Ojas • Omkara</p>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  // Not authenticated — show login page
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Authenticated — show app shell with sidebar
  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="VOO School ERP — School Management System" />
        <meta name="theme-color" content="#0F172A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <title>VOO School ERP</title>
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
