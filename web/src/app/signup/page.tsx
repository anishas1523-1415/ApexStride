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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="max-w-md w-full space-y-8 glass-card p-10 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Or <a href="/login" className="text-[#10B981] hover:text-[#059669]">sign in to your existing account</a>
          </p>
        </div>
        
        {success ? (
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 p-6 rounded-xl text-center">
            <h3 className="text-[#10B981] font-bold text-lg mb-2">Check your email</h3>
            <p className="text-slate-300 text-sm">We've sent a confirmation link to {email}. Please click the link to verify your account before logging in.</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-6 px-4 py-2 border border-[#10B981] text-[#10B981] rounded-xl hover:bg-[#10B981]/10 transition"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
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
                  placeholder="Password (min 6 characters)"
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
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
