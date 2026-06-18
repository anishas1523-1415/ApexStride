'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const loadingSteps = [
  "Extracting 33 multi-modal joint landmarks...",
  "Calibrating ResizeObserver bounding boxes...",
  "Executing Savitzky-Golay temporal smoothing filter...",
  "Calculating 3D vector dot product angles...",
  "Running acoustic impact detection...",
  "Generating final kinematic coaching insights..."
]

export default function TrajectoryLoader({ message = "Processing Biomechanical Stream" }: { message?: string }) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % loadingSteps.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden">
      {/* Background Flooding Lights */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 space-y-8">
        {/* Parabolic Trajectory SVG Animation */}
        <div className="w-full h-32 flex items-center justify-center relative">
          <svg className="w-96 h-24 overflow-visible" viewBox="0 0 400 100">
            {/* Parabolic Path */}
            <path 
              d="M 10,90 Q 200,-50 390,90" 
              fill="none" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="4" 
              strokeDasharray="8 8"
            />
            {/* Dynamic Neon Glow Path */}
            <motion.path 
              d="M 10,90 Q 200,-50 390,90" 
              fill="none" 
              stroke="url(#gradient-cyan-emerald)" 
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="gradient-cyan-emerald" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            {/* Moving Ball / Object */}
            <motion.circle
              r="8"
              fill="#22d3ee"
              className="shadow-[0_0_15px_#22d3ee]"
              style={{
                offsetPath: "path('M 10,90 Q 200,-50 390,90')",
                offsetRotate: "auto",
              }}
              animate={{
                offsetDistance: ["0%", "100%"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>

        {/* Loading Message and Step Indicator */}
        <div className="space-y-3">
          <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">
            {message}
          </h2>
          <div className="h-6">
            <motion.p 
              key={stepIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-cyan-400 font-mono text-xs md:text-sm tracking-widest uppercase"
            >
              {loadingSteps[stepIndex]}
            </motion.p>
          </div>
        </div>

        {/* Outer progress indicators */}
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
          <motion.div 
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>
    </div>
  )
}
