'use client'
import { useState, useMemo } from 'react'
import FileUploader from '@/components/ui/FileUploader'
import { useAnalysis } from '@/hooks/useAnalysis'
import { motion } from 'framer-motion'
import SkeletonRenderer from '@/components/canvas/SkeletonRenderer'
import { CoachingInsight, FrameKinematics } from '@/lib/api'
import TrajectoryLoader from '@/components/ui/TrajectoryLoader'
import SocialShareButton from '@/components/SocialShareButton'

export default function AnalyzePage() {
  const { isAnalyzing, result, error, startAnalysis } = useAnalysis()
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showGhostPro, setShowGhostPro] = useState(false)

  const handleAnalyze = async (file: File, sportType: string) => {
    setVideoUrl(URL.createObjectURL(file))
    await startAnalysis(file, sportType)
  }

  // Extract key metrics at impact or max extension
  const impactFrame = useMemo(() => {
    if (!result || !result.kinematic_timeline.length) return null
    if (result.impact_timestamp) {
      const index = Math.floor(result.impact_timestamp * (result.video_metadata?.fps || 30))
      return result.kinematic_timeline[Math.min(index, result.kinematic_timeline.length - 1)]
    }
    // Fallback to middle frame
    return result.kinematic_timeline[Math.floor(result.kinematic_timeline.length / 2)]
  }, [result])

  const criticalInsights = result?.coaching_insights.filter((i: CoachingInsight) => i.severity === 'critical') || []
  const improvementInsights = result?.coaching_insights.filter((i: CoachingInsight) => i.severity !== 'critical') || []

  if (result) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
            <div>
              <h2 className="text-4xl font-bold text-white tracking-tight">Analysis <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Complete</span></h2>
              <p className="text-slate-400 mt-2">Biomechanical profile generated for {result.sport_type.replace(/_/g, ' ').toUpperCase()}</p>
            </div>
            <button 
               onClick={() => setShowGhostPro(!showGhostPro)}
               className={`px-6 py-3 rounded-xl font-bold tracking-wide uppercase transition-all shadow-lg ${showGhostPro ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'bg-slate-900 border border-white/20 text-white hover:border-cyan-500'}`}
            >
                {showGhostPro ? 'Ghost-Pro Sync: ON' : 'Compare Pro Athlete'}
            </button>
        </div>
        
        {/* Main Video & Skeleton View */}
        <div id="aura-share-card" className="p-4 rounded-3xl bg-slate-950">
          {videoUrl && (
              <div className="mb-10 relative">
                  <SkeletonRenderer 
                      videoUrl={videoUrl} 
                      kinematicTimeline={result.kinematic_timeline} 
                      showGhostPro={showGhostPro}
                      impactTimestamp={result.impact_timestamp ?? undefined}
                      sportType={result.sport_type}
                  />
              </div>
          )}

          {/* Gemini AI Coach Summary */}
          {result.gemini_summary && (
            <div className="mb-8 p-6 bg-gradient-to-r from-violet-900/20 to-fuchsia-900/20 border border-fuchsia-500/30 rounded-2xl shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <h3 className="text-fuchsia-400 font-bold mb-3 flex items-center gap-2">
                <span>✨</span> AI Coach Notes
              </h3>
              <p className="text-white text-lg font-light leading-relaxed italic">
                "{result.gemini_summary}"
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mb-8 mt-4">
          <SocialShareButton elementId="aura-share-card" fileName={`AuraKinematics_${result.sport_type}.png`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Score */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center flex flex-col justify-center items-center">
            <h3 className="text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">Overall Technique Score</h3>
            <div className="relative">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="80" cy="80" r="70" fill="transparent" stroke={result.overall_score > 80 ? '#10B981' : result.overall_score > 60 ? '#F59E0B' : '#EF4444'} strokeWidth="12" strokeDasharray="440" strokeDashoffset={440 - (440 * result.overall_score) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-5xl font-extrabold text-white">{result.overall_score}</span>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-400">Based on kinematic accuracy and timing</p>
          </div>

          {/* Biomechanics Dashboard */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Key Biomechanics (At Impact)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {impactFrame?.joint_angles.map((angle, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${angle.is_optimal ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">{angle.joint_name.replace(/_/g, ' ')}</p>
                  <p className={`text-2xl font-bold ${angle.is_optimal ? 'text-emerald-400' : 'text-red-400'}`}>
                    {angle.angle_degrees.toFixed(1)}°
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Target: {angle.threshold_min}° - {angle.threshold_max}°</p>
                </div>
              ))}
              {!impactFrame?.joint_angles.length && (
                <p className="text-slate-500 col-span-full">No joint data extracted for impact frame.</p>
              )}
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          
          {/* Mistakes & Risk Detection */}
          <div className="bg-red-950/10 border border-red-500/20 p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2"><span>⚠️</span> Critical Mistakes & Injury Risks</h3>
            <ul className="space-y-4">
              {criticalInsights.length === 0 ? (
                <p className="text-slate-400 text-sm">No critical risks detected. Good job protecting your joints!</p>
              ) : (
                criticalInsights.map((tip: CoachingInsight, i: number) => (
                  <li key={i} className="flex gap-4 p-4 bg-slate-950/50 rounded-xl border-l-4 border-red-500">
                    <div>
                      <p className="text-white text-sm leading-relaxed">{tip.message}</p>
                      <p className="text-xs text-slate-500 mt-2 font-mono">Frame: {tip.frame_index} • {tip.timestamp_seconds}s</p>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Coaching Recommendations */}
          <div className="bg-cyan-950/10 border border-cyan-500/20 p-8 rounded-3xl">
            <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-2"><span>💡</span> Coaching Improvements</h3>
            <ul className="space-y-4">
              {improvementInsights.length === 0 ? (
                <p className="text-slate-400 text-sm">Perfect form detected!</p>
              ) : (
                improvementInsights.map((tip: CoachingInsight, i: number) => (
                  <li key={i} className="flex gap-4 p-4 bg-slate-950/50 rounded-xl border-l-4 border-cyan-500">
                    <div>
                      <p className="text-white text-sm leading-relaxed">{tip.message}</p>
                      {tip.angle_actual && tip.angle_ideal && (
                        <p className="text-xs text-cyan-500 mt-2">Current: {tip.angle_actual}° → Target: {tip.angle_ideal}°</p>
                      )}
                    </div>
                  </li>
                ))
              )}
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
          Upload <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Athletic Media</span>
        </h1>
        <p className="text-slate-400 max-w-md mx-auto text-sm md:text-base font-light leading-relaxed">
          Our biomechanical AI engine extracts 3D joint telemetry and compares your kinematics against professional baselines.
        </p>
      </div>

      {isAnalyzing ? (
        <TrajectoryLoader message="Executing Biomechanical Pipeline..." />
      ) : (
        <FileUploader onAnalyze={handleAnalyze} />
      )}
      
      {error && <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-center">
        <p className="text-red-400 font-semibold">{error}</p>
      </div>}
    </motion.div>
  )
}
