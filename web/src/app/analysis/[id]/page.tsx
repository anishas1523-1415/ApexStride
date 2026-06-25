'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FrameKinematics {
  frame_index: number;
  timestamp_seconds: number;
  joint_angles: Array<{
    joint_name: string;
    angle_degrees: number;
    is_optimal: boolean;
  }>;
}

interface AnalysisResponse {
  video_metadata: {
    filename: string;
    duration_seconds: number;
    fps: number;
  };
  sport_type: string;
  overall_score: number;
  kinematic_timeline: FrameKinematics[];
  coaching_insights: Array<{
    category: string;
    severity: string;
    message: string;
  }>;
  critical_events: Array<{
    event_type: string;
    description: string;
    timestamp_seconds: number;
  }>;
}

export default function AnalysisPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthContext();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchAnalysis();
  }, [isAuthenticated, params.id, router]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<AnalysisResponse>(
        `/api/v1/analysis/${params.id}`
      );
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-neon-cyan/70 animate-pulse">Loading analysis...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Card variant="glass" glowColor="pink" className="text-center py-12">
          <p className="text-red-400 mb-6">{error || 'Analysis not found'}</p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Back Home
          </Button>
        </Card>
      </div>
    );
  }

  const chartData = analysis.kinematic_timeline.map((frame) => ({
    time: frame.timestamp_seconds.toFixed(2),
    angleAvg: frame.joint_angles.reduce((acc, j) => acc + j.angle_degrees, 0) / (frame.joint_angles.length || 1),
  }));

  const criticalIssues = analysis.coaching_insights.filter((i) => i.severity === 'critical');
  const warnings = analysis.coaching_insights.filter((i) => i.severity === 'warning');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold neon-text-green mb-2">
              Analysis Results
            </h1>
            <p className="text-neon-cyan/70">{analysis.video_metadata.filename}</p>
          </div>
          <Button variant="primary" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <Card variant="glass" glowColor="green" className="text-center py-12">
          <div className="inline-block">
            <div className="text-7xl font-bold neon-text-green mb-4">
              {analysis.overall_score.toFixed(1)}%
            </div>
            <p className="text-neon-cyan/70 text-lg">Overall Performance Score</p>
          </div>
        </Card>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        <Card variant="glass" glowColor="cyan">
          <p className="text-neon-cyan/70 text-sm mb-2">Duration</p>
          <p className="text-2xl font-bold text-neon-cyan">
            {analysis.video_metadata.duration_seconds.toFixed(1)}s
          </p>
        </Card>
        <Card variant="glass" glowColor="lime">
          <p className="text-neon-cyan/70 text-sm mb-2">Frames Analyzed</p>
          <p className="text-2xl font-bold text-neon-lime">
            {analysis.kinematic_timeline.length}
          </p>
        </Card>
        <Card variant="glass" glowColor="pink">
          <p className="text-neon-cyan/70 text-sm mb-2">FPS</p>
          <p className="text-2xl font-bold text-neon-pink">
            {analysis.video_metadata.fps.toFixed(0)}
          </p>
        </Card>
      </motion.div>

      {/* Joint Angle Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <Card variant="glass" glowColor="blue" className="p-6">
          <h3 className="text-xl font-bold text-neon-cyan mb-6">Joint Angle Timeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 255, 0.1)" />
              <XAxis dataKey="time" stroke="rgba(0, 255, 255, 0.5)" />
              <YAxis stroke="rgba(0, 255, 255, 0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 14, 26, 0.8)',
                  border: '1px solid rgba(0, 255, 0, 0.3)',
                }}
              />
              <Line
                type="monotone"
                dataKey="angleAvg"
                stroke="#00FF00"
                dot={false}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Issues and Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
      >
        {/* Critical Issues */}
        <Card variant="glass" glowColor="pink" className="p-6">
          <h3 className="text-lg font-bold text-neon-pink mb-4">🚨 Critical Issues</h3>
          {criticalIssues.length === 0 ? (
            <p className="text-neon-cyan/50 text-sm">No critical issues detected</p>
          ) : (
            <div className="space-y-3">
              {criticalIssues.map((issue, i) => (
                <div key={i} className="p-3 bg-neon-pink/10 rounded border border-neon-pink/30">
                  <p className="text-neon-pink font-semibold text-sm">{issue.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Warnings */}
        <Card variant="glass" glowColor="lime" className="p-6">
          <h3 className="text-lg font-bold text-neon-lime mb-4">⚠️ Warnings</h3>
          {warnings.length === 0 ? (
            <p className="text-neon-cyan/50 text-sm">No warnings</p>
          ) : (
            <div className="space-y-3">
              {warnings.map((warning, i) => (
                <div key={i} className="p-3 bg-neon-lime/10 rounded border border-neon-lime/30">
                  <p className="text-neon-lime font-semibold text-sm">{warning.message}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Coaching Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <Card variant="glass" glowColor="cyan" className="p-6">
          <h3 className="text-xl font-bold text-neon-cyan mb-6">💡 Coaching Insights</h3>
          <div className="space-y-4">
            {analysis.coaching_insights.slice(0, 5).map((insight, i) => (
              <div key={i} className="flex gap-3">
                <div className="text-2xl flex-shrink-0">
                  {insight.severity === 'critical' ? '🔴' : insight.severity === 'warning' ? '🟡' : '🟢'}
                </div>
                <div>
                  <p className="font-semibold text-neon-cyan">{insight.category}</p>
                  <p className="text-neon-cyan/70 text-sm">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 justify-center"
      >
        <Button variant="primary" glow="green" size="lg" onClick={() => router.push('/')}>
          Analyze Another Video
        </Button>
        <Button variant="outline" glow="cyan" size="lg" onClick={() => router.push('/dashboard')}>
          View Dashboard
        </Button>
      </motion.div>
    </div>
  );
}