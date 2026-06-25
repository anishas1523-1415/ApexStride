'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import Button from './ui/Button';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 glass-dark border-b border-neon-cyan/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-3xl glow-green p-2 rounded-lg">
            🎯
          </div>
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold neon-text-green">AuraKinematics</h1>
            <p className="text-xs text-neon-cyan/60">Motion Analysis</p>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className={`text-sm font-semibold transition-colors ${
                isActive('/dashboard')
                  ? 'text-neon-green'
                  : 'text-neon-cyan/70 hover:text-neon-cyan'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/upload"
              className={`text-sm font-semibold transition-colors ${
                isActive('/upload')
                  ? 'text-neon-green'
                  : 'text-neon-cyan/70 hover:text-neon-cyan'
              }`}
            >
              Upload
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="hidden sm:block">
                <Button variant="ghost" size="sm" glow="cyan">
                  {user?.username || 'Profile'}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                glow="pink"
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" glow="cyan">
                  Login
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="primary" size="sm" glow="green">
                  Sign Up
                </Button>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden text-neon-cyan hover:text-neon-green transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-neon-cyan/20 p-4 space-y-2"
        >
          <Link href="/dashboard" className="block py-2 text-neon-cyan hover:text-neon-green">
            Dashboard
          </Link>
          <Link href="/upload" className="block py-2 text-neon-cyan hover:text-neon-green">
            Upload
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;