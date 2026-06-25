'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold neon-text-green mb-4">Your Profile</h1>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-12"
      >
        <Card variant="glass" glowColor="cyan" className="p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center text-4xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-neon-green mb-2">{user.username}</h2>
              <p className="text-neon-cyan/70">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 pt-8 border-t border-neon-cyan/20">
            <div>
              <p className="text-neon-cyan/70 text-sm mb-2">Account Status</p>
              <p className="text-neon-green font-semibold">Active</p>
            </div>
            <div>
              <p className="text-neon-cyan/70 text-sm mb-2">Member Since</p>
              <p className="text-neon-cyan font-semibold">2026</p>
            </div>
            <div>
              <p className="text-neon-cyan/70 text-sm mb-2">Subscription</p>
              <p className="text-neon-cyan font-semibold">Free</p>
            </div>
          </div>

          <Button
            variant="outline"
            glow="pink"
            size="lg"
            onClick={async () => {
              await logout();
              router.push('/auth/login');
            }}
            className="w-full"
          >
            Sign Out
          </Button>
        </Card>
      </motion.div>

      {/* Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-neon-cyan mb-6">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            variant="glass"
            glowColor="cyan"
            className="p-4 cursor-pointer hover:shadow-glass"
            onClick={() => router.push('/dashboard')}
          >
            <p className="font-semibold text-neon-cyan">📊 View Dashboard</p>
            <p className="text-neon-cyan/50 text-sm">See your analysis history</p>
          </Card>
          <Card
            variant="glass"
            glowColor="green"
            className="p-4 cursor-pointer hover:shadow-glass"
            onClick={() => router.push('/')}
          >
            <p className="font-semibold text-neon-green">🚀 New Analysis</p>
            <p className="text-neon-cyan/50 text-sm">Upload a new video</p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}