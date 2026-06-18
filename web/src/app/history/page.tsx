"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface AnalysisRecord {
  id: string;
  sport_type: string;
  overall_score: number;
  created_at: string;
  filename: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const loadHistory = async () => {
    try {
      // In a real app, you would have a GET /api/v1/history endpoint
      // We assume it's created or we'll add it to the backend soon
      const res = await fetchWithAuth("/history");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadHistory();
    }
  }, [loading, user]);

  if (loading) return <div className="text-center mt-20 text-slate-400">Loading profile...</div>;

  if (!user) {
    return <div className="text-center mt-20 text-slate-400">You must be logged in to view history.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto mt-10"
    >
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#06B6D4] mb-8">
        Your Kinematic History
      </h1>
      
      {loadingRecords ? (
        <div className="animate-pulse flex flex-col space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-lg border border-[#10B981]/20"></div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-slate-800/50 rounded-lg border border-[#10B981]/20">
          <p className="text-slate-400">No analysis records found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {records.map(record => (
            <div key={record.id} onClick={() => router.push(`/results/${record.id}`)} className="bg-slate-900/80 backdrop-blur border border-[#10B981]/30 p-6 rounded-xl hover:border-[#10B981] transition-colors flex justify-between items-center cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <div>
                <p className="text-sm text-slate-400">{new Date(record.created_at).toLocaleDateString()}</p>
                <h3 className="text-lg font-semibold text-slate-100 capitalize">{record.sport_type.replace('_', ' ')}</h3>
                <p className="text-xs text-slate-500 mt-1">{record.filename}</p>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${record.overall_score >= 80 ? 'text-[#10B981]' : record.overall_score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {record.overall_score.toFixed(1)}
                </span>
                <p className="text-xs text-slate-400">Score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
