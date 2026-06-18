'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.4)]">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
            Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">Account</span>
          </h2>
          <p className="text-sm text-slate-400">
            Or <a href="/login" className="text-cyan-400 hover:text-cyan-300 font-bold underline decoration-cyan-500/30">sign in to existing account</a>
          </p>
        </div>
        
        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl text-center space-y-4">
            <h3 className="text-emerald-400 font-bold text-lg">Verification Email Sent</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              We've dispatched a confirmation link to <span className="text-white font-semibold font-mono">{email}</span>. Click the link to authenticate.
            </p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all"
            >
              Proceed to Login
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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
                  placeholder="Password (min 6 characters)"
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
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
