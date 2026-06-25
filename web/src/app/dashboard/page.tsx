'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';

interface AnalysisRecord {
  id: string;
  sport_type: string;
  overall_score: number;
  filename: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    fetchHistory();
  }, [isAuthenticated, router]);

  const fetchHistory = async () => {
    try {
      const data = await apiClient.get<AnalysisRecord[]>('/api/v1/history');
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text-green">Your Analysis History</h1>
        <p className="text-neon-cyan/70 text-lg mb-6">Review all your motion analysis recordings</p>
        <Button
          variant="primary"
          glow="green"
          size="lg"
          onClick={() => router.push('/')}
        >
          Analyze New Video
        </Button>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-neon-cyan/70">Loading your history...</p>
        </div>
      ) : records.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-neon-cyan/70 mb-4">No analysis records yet. Start by uploading a video!</p>
          <Button
            variant="primary"
            glow="green"
            onClick={() => router.push('/')}
          >
            Upload Your First Video
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record, index) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(`/analysis/${record.id}`)}
              className="cursor-pointer"
            >
              <Card variant="glass" glowColor="cyan" className="hover:shadow-glass">
                <div className="mb-4">
                  <div className="text-2xl font-bold text-neon-green mb-2">
                    {record.overall_score.toFixed(1)}%
                  </div>
                  <p className="text-neon-cyan text-sm font-semibold capitalize">
                    {record.sport_type.replace('_', ' ')}
                  </p>
                </div>
                <p className="text-neon-cyan/70 text-xs mb-4 truncate">
                  {record.filename}
                </p>
                <p className="text-neon-cyan/50 text-xs">
                  {new Date(record.created_at).toLocaleDateString()}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}