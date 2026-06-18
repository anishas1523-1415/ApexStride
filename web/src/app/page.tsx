'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative min-h-[80vh] flex flex-col justify-center items-center overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-cyan-500/15 rounded-full mix-blend-screen filter blur-[128px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[128px]"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block mb-6 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-cyan-400 text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          ⚡ AuraKinematics 2.0 Pro
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter text-white leading-tight"
        >
          Transform Your Game <br className="hidden md:block" /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
            With Pure AI
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 max-w-3xl mx-auto text-lg md:text-xl text-slate-300/95 leading-relaxed font-light"
        >
          Upload a 2D smartphone video. Get instant 3D biomechanical coaching feedback without any sensors, markers, or wearable hardware.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <Link href="/analyze" className="group relative px-10 py-5 bg-cyan-500 text-slate-950 rounded-2xl font-bold text-lg hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300 w-full sm:w-auto text-center">
            Analyze Your Technique
          </Link>
          <Link href="/dashboard" className="px-10 py-5 bg-white/5 backdrop-blur-md text-white border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-lg transition-all duration-300 w-full sm:w-auto text-center">
            View Dashboard
          </Link>
        </motion.div>
        
        <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'AI Pose Detection', desc: 'Extracts 33 anatomical 3D landmarks instantly from standard video.', icon: '🤖' },
            { title: 'Physics Engine', desc: 'Calculates precise joint angles, temporal sequences, and angular velocities.', icon: '⚡' },
            { title: 'Pro Coaching', desc: 'Compares your form dynamically against professional baseline datasets.', icon: '📊' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 + (i * 0.2) }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-left hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] transition-all duration-300"
            >
              <div className="text-4xl mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
