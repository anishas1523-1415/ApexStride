'use client';

import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stadium-darker via-stadium-dark to-stadium-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-neon-purple/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {showNavbar && <Navbar />}
        <main className="pt-20 md:pt-24">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;