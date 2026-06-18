'use client'
import { useState } from 'react'
import FileUploader from '@/components/ui/FileUploader'
import { useAnalysis } from '@/hooks/useAnalysis'
import { motion } from 'framer-motion'
import SkeletonRenderer from '@/components/canvas/SkeletonRenderer'
import { CoachingInsight } from '@/lib/api'
import TrajectoryLoader from '@/components/ui/TrajectoryLoader'

export default function AnalyzePage() {
  const { isAnalyzing, result, error, startAnalysis } = useAnalysis()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showGhostPro, setShowGhostPro] = useState(false)

  const handleAnalyze = async (file: File, sportType: string) => {
    setVideoUrl(URL.createObjectURL(file))
    await startAnalysis(file, sportType)
  }

  if (result) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Analysis Complete</h2>
            <button 
               onClick={() => setShowGhostPro(!showGhostPro)}
               className={`px-6 py-2 rounded-full font-bold transition-all ${showGhostPro ? 'bg-white text-black glow-white' : 'bg-transparent border border-white text-white'}`}
            >
                {showGhostPro ? 'Ghost-Pro: ON' : 'Ghost-Pro: OFF'}
            </button>
        </div>
        
        {videoUrl && (
            <div className="mb-8">
                <SkeletonRenderer 
                    videoUrl={videoUrl} 
                    kinematicTimeline={result.kinematic_timeline} 
                    showGhostPro={showGhostPro}
                />
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl text-center">
            <h3 className="text-[#94A3B8] uppercase text-sm font-bold mb-2">Form Score</h3>
            <div className="text-7xl font-extrabold text-primary">{result.overall_score}</div>
            <p className="mt-2 text-[#94A3B8]">out of 100</p>
          </div>
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6">Coaching Insights</h3>
            <ul className="space-y-4">
              {result.coaching_insights.map((tip: CoachingInsight, i: number) => (
                <li key={i} className="flex gap-4 p-4 bg-[#0A0E1A] rounded-xl border-l-4 border-warning">
                  <div>
                    <p className="text-white">{tip.message}</p>
                    <p className="text-sm text-[#94A3B8] mt-1">@ {tip.timestamp_seconds}s</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12"
    >
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Upload <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Athletic Video</span>
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base font-light leading-relaxed">
          Our biomechanical AI engine will automatically extract 3D joint telemetry and analyze form kinematics.
        </p>
      </div>

      {isAnalyzing ? (
        <TrajectoryLoader message="Executing Biomechanical Pipeline" />
      ) : (
        <FileUploader onAnalyze={handleAnalyze} />
      )}
      
      {error && <p className="text-error text-center mt-6 font-semibold">{error}</p>}
    </motion.div>
  )
}
