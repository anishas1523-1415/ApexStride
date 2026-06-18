'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'
import SkeletonRenderer from '@/components/canvas/SkeletonRenderer'
import { batsmanSwingTransition, playerDiveReveal, goalPostPop, sprintStaggerContainer } from '@/lib/animations'

import { AnalysisResponse, CoachingInsight } from '@/lib/api'

import TrajectoryLoader from '@/components/ui/TrajectoryLoader'

export default function ResultsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showGhostPro, setShowGhostPro] = useState(false)
  const [activeTab, setActiveTab] = useState<'athlete' | 'coach'>('athlete')

  const loadAnalysis = async (recordId: string) => {
    try {
      setLoading(true)
      const res = await fetchWithAuth(`/analysis/${recordId}`)
      if (!res.ok) {
        throw new Error('Failed to load analysis record')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      loadAnalysis(id as string)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
        <TrajectoryLoader message="Resolving Biomechanical Telemetry" />
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-[#94A3B8]">{error || 'Record not found'}</p>
        <button 
          onClick={() => router.push('/history')}
          className="mt-6 px-6 py-2 bg-slate-800 rounded-full hover:bg-slate-700 transition"
        >
          Back to History
        </button>
      </div>
    )
  }

  const videoUrl = `http://localhost:8000/uploads/${result.video_metadata?.filename}` || ''

  return (
    <motion.div 
      variants={batsmanSwingTransition}
      initial="hidden"
      animate="enter"
      exit="exit"
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800/50 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            {result.sport_type.replace('_', ' ')} <span className="text-gradient">Analysis</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1 uppercase tracking-widest font-bold">Session ID: {id}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-[#0A0E1A] p-1.5 rounded-full border border-slate-800 shadow-inner flex">
            <button 
              onClick={() => setActiveTab('athlete')}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'athlete' ? 'bg-[#10B981] text-[#0A0E1A] shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'text-slate-500 hover:text-white'}`}
            >
              Athlete
            </button>
            <button 
              onClick={() => setActiveTab('coach')}
              className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'coach' ? 'bg-[#06B6D4] text-[#0A0E1A] shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-500 hover:text-white'}`}
            >
              Coach
            </button>
          </div>
          
          <AnimatePresence>
            {activeTab === 'coach' && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setShowGhostPro(!showGhostPro)}
                className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${showGhostPro ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.8)]' : 'bg-transparent border border-white/20 text-white hover:border-white/50 hover:bg-white/5'}`}
              >
                Ghost-Pro {showGhostPro ? 'ON' : 'OFF'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Primary Canvas/Video Player */}
      <div className="mb-8 relative rounded-[2rem] overflow-hidden border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
          <SkeletonRenderer 
              videoUrl={videoUrl} 
              kinematicTimeline={result.kinematic_timeline} 
              showGhostPro={activeTab === 'coach' ? showGhostPro : false}
              impactTimestamp={result.impact_timestamp ?? undefined}
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Goal Post Metric Pop */}
        <motion.div 
          variants={goalPostPop}
          initial="hidden"
          animate="visible"
          className="lg:col-span-4 glass-card p-10 rounded-[2rem] text-center flex flex-col justify-center items-center border border-[#10B981]/30 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#10B981]/5 to-transparent pointer-events-none"></div>
          <h3 className="text-[#10B981] uppercase tracking-[0.2em] text-xs font-black mb-4">Total Form Score</h3>
          <div className="text-8xl md:text-9xl font-black text-white drop-shadow-[0_0_25px_rgba(16,185,129,0.8)] tabular-nums tracking-tighter">
            {result.overall_score}
          </div>
          <div className="mt-6 text-slate-400 font-semibold tracking-wide uppercase text-sm">Target Achieved</div>
        </motion.div>

        {/* Player Dive Reveal for Insights */}
        <motion.div 
          variants={playerDiveReveal}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 glass-card p-8 rounded-[2rem] border border-slate-800/80 h-[400px] flex flex-col"
        >
          <h3 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center">
            <span className="w-3 h-8 bg-gradient-to-b from-[#10B981] to-[#06B6D4] rounded-full mr-4 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></span>
            Coaching Insights
          </h3>
          <ul className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
            {result.coaching_insights?.length > 0 ? (
              result.coaching_insights.map((tip: CoachingInsight, i: number) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex gap-4 p-5 rounded-2xl border-l-4 transition-all hover:bg-slate-800/50 ${
                  tip.severity === 'critical' ? 'bg-red-500/5 border-red-500 hover:border-red-400' : 
                  tip.severity === 'warning' ? 'bg-amber-500/5 border-amber-500 hover:border-amber-400' : 
                  'bg-blue-500/5 border-blue-500 hover:border-blue-400'
                }`}>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm ${
                        tip.severity === 'critical' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50' : 
                        tip.severity === 'warning' ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50' : 
                        'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                      }`}>
                        {tip.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-500 font-mono tracking-wider">@ {tip.timestamp_seconds?.toFixed(2)}s</span>
                    </div>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed font-medium">{tip.message}</p>
                  </div>
                </motion.li>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 font-medium tracking-wide">
                No insights available for this session.
              </div>
            )}
          </ul>
        </motion.div>
      </div>
      
      {/* Coach Dashboard View Extrusion */}
      <AnimatePresence>
        {activeTab === 'coach' && (
          <motion.div 
            variants={playerDiveReveal}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-8 glass-card p-10 rounded-[2rem] border border-cyan-500/20 bg-[#0A0E1A]/80 shadow-[0_0_50px_rgba(6,182,212,0.05)]"
          >
            <h3 className="text-xl font-black text-white uppercase tracking-wider mb-8 flex items-center">
              <span className="w-3 h-8 bg-cyan-500 rounded-full mr-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]"></span>
              Granular Biometrics Data
            </h3>
            <motion.div 
              variants={sprintStaggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { label: "Frames Analyzed", value: result.kinematic_timeline?.length || 0 },
                { label: "Critical Events", value: result.critical_events?.length || 0 },
                { label: "Avg FPS", value: result.video_metadata?.fps?.toFixed(1) || '--' },
                { label: "Duration", value: `${result.video_metadata?.duration_seconds?.toFixed(2) || '--'}s` }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  variants={goalPostPop}
                  className="bg-[#050810] p-6 rounded-2xl border border-slate-800 ring-1 ring-white/5 hover:border-cyan-500/30 transition-colors"
                >
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-white font-mono">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
