'use client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

const sports = [
  { id: 'cricket', name: 'Cricket', icon: '🏏', gradient: 'from-emerald-500/20 to-cyan-500/20', borderHover: 'hover:border-cyan-400', shadowHover: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]' },
  { id: 'football', name: 'Football', icon: '⚽', gradient: 'from-blue-500/20 to-indigo-500/20', borderHover: 'hover:border-blue-400', shadowHover: 'hover:shadow-[0_0_30px_rgba(96,165,250,0.4)]' },
  { id: 'weightlifting', name: 'Weightlifting', icon: '🏋️', gradient: 'from-orange-500/20 to-red-500/20', borderHover: 'hover:border-orange-400', shadowHover: 'hover:shadow-[0_0_30px_rgba(251,146,60,0.4)]' },
  { id: 'badminton', name: 'Badminton', icon: '🏸', gradient: 'from-yellow-500/20 to-amber-500/20', borderHover: 'hover:border-yellow-400', shadowHover: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]' },
  { id: 'running', name: 'Athlete Running', icon: '🏃', gradient: 'from-purple-500/20 to-pink-500/20', borderHover: 'hover:border-purple-400', shadowHover: 'hover:shadow-[0_0_30px_rgba(192,132,252,0.4)]' }
]

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [transitioningSport, setTransitioningSport] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    fetchUser()
  }, [])

  const handleSportSelect = (sportId: string) => {
    setTransitioningSport(sportId)
    // Simulate the specific animation delay (e.g. bat swing)
    setTimeout(() => {
      router.push(`/analyze?sport=${sportId}`)
    }, 1200)
  }

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center overflow-hidden pt-12 pb-24">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full mix-blend-screen filter blur-[150px] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[150px] pointer-events-none"></div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-light text-slate-300">
              Welcome back, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">{user.user_metadata?.full_name || 'Athlete'}</span>!
            </h2>
            <p className="mt-2 text-slate-400">Ready to break your records today?</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block mb-6 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-cyan-400 text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(34,211,238,0.2)]"
          >
            ⚡ AuraKinematics 2.0 Pro
          </motion.div>
        )}
        
        {!user && (
          <>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white leading-tight"
            >
              Transform Your Game <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                With Pure AI
              </span>
            </motion.h1>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-10 mb-16 flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/signup" className="px-10 py-4 bg-cyan-500 text-slate-950 rounded-xl font-bold text-lg hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all">
                Get Started Free
              </Link>
            </motion.div>
          </>
        )}

        {/* Sport Cards Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-12"
        >
          <h3 className="text-2xl font-bold text-white mb-8 tracking-wide uppercase">Select Your Sport</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {sports.map((sport, i) => (
              <motion.div
                key={sport.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                whileHover={{ y: -10, scale: 1.05 }}
                onClick={() => handleSportSelect(sport.id)}
                className={`relative cursor-pointer overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[220px] transition-all duration-300 ${sport.borderHover} ${sport.shadowHover}`}
              >
                {/* Dynamic Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sport.gradient} opacity-0 hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 text-6xl mb-4 filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {sport.icon}
                </div>
                <h4 className="relative z-10 text-xl font-bold text-white tracking-wide text-center">{sport.name}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Features Section */}
        {!user && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-32 border-t border-white/10 pt-20"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white tracking-tight">Pro-Level Biomechanics. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">In Your Pocket.</span></h2>
              <p className="mt-4 text-slate-400 text-lg">No expensive lab equipment. Just your smartphone camera and our AI.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-white mb-2">Generative AI Coach</h3>
                <p className="text-slate-400">Powered by Gemini. Our AI doesn't just track your joints—it speaks to you like an elite coach, giving you personalized 3-sentence summaries of what to fix.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <div className="text-4xl mb-4">👻</div>
                <h3 className="text-2xl font-bold text-white mb-2">Ghost-Pro Sync</h3>
                <p className="text-slate-400">Overlay your motion directly on top of a professional athlete's skeleton. Compare your kinematics frame-by-frame at impact.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                <div className="text-4xl mb-4">🏅</div>
                <h3 className="text-2xl font-bold text-white mb-2">Gamified Progression</h3>
                <p className="text-slate-400">Earn badges like 'Kinematic Perfection' and 'Mechanics Master'. Share your aesthetic trading cards directly to TikTok and Instagram.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Full Screen Transition Overlay */}
      <AnimatePresence>
        {transitioningSport && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.2, 10], opacity: [1, 1, 0] }}
              transition={{ duration: 1, times: [0, 0.6, 1] }}
              className="text-8xl"
            >
              {sports.find(s => s.id === transitioningSport)?.icon}
            </motion.div>
            <div className="absolute bottom-20 text-cyan-400 font-mono text-xl tracking-widest animate-pulse">
              ANALYZING MOTION DYNAMICS...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
