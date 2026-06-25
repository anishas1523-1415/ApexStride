'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import SportCard from '@/components/SportCard';
import { SPORTS } from '@/lib/constants';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();

  const handleSportSelect = (sportId: string) => {
    router.push(`/upload?sport=${sportId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 neon-text-green">
            Welcome to AuraKinematics
          </h1>
          <p className="text-xl text-neon-cyan/80 mb-8">
            Advanced biomechanical motion analysis using just your smartphone camera.
            Analyze your performance, improve your technique, prevent injuries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="primary"
              glow="green"
              onClick={() => router.push('/auth/signup')}
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              glow="cyan"
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          <span className="neon-text-green">Welcome back,</span>
          <span className="text-neon-cyan ml-3">{user?.username || 'Athlete'}</span>
        </h1>
        <p className="text-neon-cyan/70 text-lg">
          Ready to analyze your performance? Select a sport to begin.
        </p>
      </motion.div>

      {/* Sport Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {SPORTS.map((sport, index) => (
          <SportCard
            key={sport.id}
            sport={sport}
            onSelect={handleSportSelect}
            animationDelay={index * 0.1}
          />
        ))}
      </div>

      {/* Quick Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
      >
        <div className="glass-dark p-6 rounded-xl border border-neon-cyan/20">
          <div className="text-3xl font-bold text-neon-green mb-2">0</div>
          <p className="text-neon-cyan/70">Videos Analyzed</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-neon-cyan/20">
          <div className="text-3xl font-bold text-neon-cyan mb-2">0.0%</div>
          <p className="text-neon-cyan/70">Average Score</p>
        </div>
        <div className="glass-dark p-6 rounded-xl border border-neon-cyan/20">
          <div className="text-3xl font-bold text-neon-lime mb-2">0</div>
          <p className="text-neon-cyan/70">Achievements Unlocked</p>
        </div>
      </motion.div>
    </div>
  );
}