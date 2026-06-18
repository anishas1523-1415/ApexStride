'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/analyze')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.4)]">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
            Aura<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Kinematics</span> Auth
          </h2>
          <p className="text-sm text-slate-400">
            Or <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/30">create a new account</a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
              <input
                name="email"
                type="email"
                required
                className="appearance-none block w-full px-4 py-3.5 border border-white/10 bg-slate-950/80 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all sm:text-sm font-medium"
                placeholder="athlete@aurakinematics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                className="appearance-none block w-full px-4 py-3.5 border border-white/10 bg-slate-950/80 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all sm:text-sm font-medium"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-950/20 p-4 rounded-xl border border-red-500/20 font-semibold">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-cyan-500 text-slate-950 rounded-xl font-bold tracking-wide uppercase disabled:opacity-40 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] transition-all duration-300 disabled:shadow-none"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
