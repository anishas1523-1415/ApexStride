'use client'
import { useEffect, useState } from 'react'
import { API_BASE } from '@/lib/api'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const headers = { 'Authorization': `Bearer ${session.access_token}` }
      
      const [histRes, achRes] = await Promise.all([
        fetch(`${API_BASE}/history`, { headers }),
        fetch(`${API_BASE}/achievements`, { headers })
      ])

      if (histRes.ok) setHistory(await histRes.json())
      if (achRes.ok) setAchievements(await achRes.json())
      setLoading(false)
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400"></div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
          Athlete <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Dashboard</span>
        </h1>
        <p className="text-slate-400">Track your progress, review past telemetry, and unlock achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Achievements */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-yellow-400">🏆</span> Unlocked Badges
            </h3>
            {achievements.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Analyze your first video to unlock achievements.</p>
            ) : (
              <ul className="space-y-4">
                {achievements.map((ach: any) => (
                  <li key={ach.id} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-colors">
                    <div className="text-4xl bg-white/5 p-3 rounded-full">{ach.icon}</div>
                    <div>
                      <h4 className="text-white font-bold">{ach.title}</h4>
                      <p className="text-xs text-slate-400">{ach.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 rounded-3xl p-8 text-center">
            <h3 className="text-xl font-bold text-cyan-400 mb-2">Record New Session</h3>
            <p className="text-sm text-slate-300 mb-6">Capture new telemetry to beat your previous scores.</p>
            <Link href="/analyze" className="inline-block px-8 py-3 bg-cyan-500 text-slate-950 rounded-xl font-bold uppercase tracking-wide hover:bg-cyan-400 transition-colors">
              Analyze Now
            </Link>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-full">
            <h3 className="text-xl font-bold text-white mb-6">Recent Biomechanical Analyses</h3>
            
            {history.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No telemetry recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((record: any) => (
                  <div key={record.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-900/50 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-cyan-950/50 text-cyan-400 text-xs font-bold rounded-full uppercase tracking-wider">
                          {record.sport_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(record.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white font-medium text-sm truncate max-w-xs">{record.filename}</p>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Score</p>
                        <p className={`text-2xl font-bold ${record.overall_score >= 80 ? 'text-emerald-400' : record.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {record.overall_score}
                        </p>
                      </div>
                      <Link 
                        href={`/analyze/${record.id}`} 
                        className="p-3 bg-white/5 text-white rounded-xl hover:bg-cyan-500 hover:text-slate-950 transition-colors shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
