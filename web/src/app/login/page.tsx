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
      router.push('/history')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Sign in to AuraKinematics</h2>
          <p className="mt-2 text-sm text-slate-400">
            Or <a href="/signup" className="text-[#10B981] hover:text-[#059669]">create a new account</a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">Email address</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-slate-700 bg-slate-900/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-slate-700 bg-slate-900/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-black bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#10B981] transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
