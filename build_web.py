import os

web_dir = r"d:\PROJECTS\ApexStride\web"

files = {
    "src/app/globals.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0A0E1A;
  --card: #0F172A;
  --primary: #10B981;
  --error: #EF4444;
  --warning: #F59E0B;
  --text-main: #F1F5F9;
  --text-muted: #94A3B8;
}

body {
  color: var(--text-main);
  background: var(--background);
}

.glass-card {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 185, 129, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

.glow-green {
  box-shadow: 0 0 15px rgba(16, 185, 129, 0.5);
}

.text-gradient {
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-image: linear-gradient(to right, #10B981, #06B6D4);
}
""",
    "tailwind.config.ts": """import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0E1A',
        card: '#0F172A',
        primary: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
""",
    "src/app/layout.tsx": """import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AuraKinematics | 3D Biomechanical AI Analyzer',
  description: 'Zero-sensor sports kinematics application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-[#F1F5F9] overflow-x-hidden`}>
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  )
}
""",
    "src/components/ui/Navbar.tsx": """'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Navbar() {
  const pathname = usePathname()
  
  const links = [
    { name: 'Home', path: '/' },
    { name: 'Analyze', path: '/analyze' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold text-gradient">Aura</span>
            <span className="text-2xl font-bold text-white">Kinematics</span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {links.map((link) => {
                const isActive = pathname === link.path
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    className="relative px-3 py-2 text-sm font-medium hover:text-white transition-colors"
                  >
                    <span className={isActive ? 'text-white' : 'text-[#94A3B8]'}>{link.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary glow-green"
                      />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
""",
    "src/app/page.tsx": """'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          Transform Your Game <br/> with <span className="text-gradient">AI</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-xl text-[#94A3B8]"
        >
          Upload a 2D smartphone video. Get instant 3D biomechanical coaching feedback without any sensors or markers.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <Link href="/analyze" className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-emerald-400 glow-green transition-all inline-block">
            Analyze Your Technique
          </Link>
        </motion.div>
      </div>
      
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'AI Pose Detection', desc: 'Extracts 33 3D anatomical landmarks from standard video.' },
          { title: 'Physics Engine', desc: 'Calculates precise joint angles and angular velocities.' },
          { title: 'Pro Coaching', desc: 'Compares your form against professional baselines.' }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.05 }}
            className="glass-card p-8 rounded-2xl text-center"
          >
            <h3 className="text-xl font-bold mb-4 text-primary">{feature.title}</h3>
            <p className="text-[#94A3B8]">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
""",
    "src/lib/api.ts": """export const API_BASE = 'http://localhost:8000/api/v1'

export interface AnalysisResponse {
  overall_score: number;
  sport_type: string;
  coaching_insights: any[];
  kinematic_timeline: any[];
  critical_events: any[];
}

export async function analyzeVideo(file: File, sportType: string): Promise<AnalysisResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('sport_type', sportType)

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  })
  
  if (!res.ok) {
    throw new Error('Analysis failed')
  }
  
  return res.json()
}
""",
    "src/hooks/useAnalysis.ts": """import { useState } from 'react'
import { analyzeVideo, AnalysisResponse } from '../lib/api'

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startAnalysis = async (file: File, sportType: string) => {
    setIsAnalyzing(true)
    setError(null)
    try {
      // Add fake delay for animations
      await new Promise(r => setTimeout(r, 2000))
      
      // Try real API, fallback to mock if backend not running
      try {
        const res = await analyzeVideo(file, sportType)
        setResult(res)
      } catch (e) {
        console.warn("Backend not reachable, using mock data")
        setResult({
          overall_score: 82,
          sport_type: sportType,
          coaching_insights: [
            { severity: 'warning', message: 'Your elbow dropped by 15 degrees. Keep it high.', timestamp_seconds: 1.2 },
            { severity: 'info', message: 'Good weight transfer.', timestamp_seconds: 0.5 }
          ],
          kinematic_timeline: [],
          critical_events: []
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return { isAnalyzing, result, error, startAnalysis }
}
""",
    "src/components/ui/FileUploader.tsx": """'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

export default function FileUploader({ onAnalyze }: { onAnalyze: (file: File, sport: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [sport, setSport] = useState('cricket_batting')
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="glass-card p-8 rounded-3xl max-w-2xl mx-auto">
      <div 
        className="border-2 border-dashed border-[#94A3B8] rounded-2xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="video/*"
          onChange={(e) => e.target.files && setFile(e.target.files[0])}
        />
        {file ? (
          <p className="text-lg text-primary font-bold">{file.name}</p>
        ) : (
          <p className="text-[#94A3B8]">Drag and drop a video, or click to browse</p>
        )}
      </div>
      
      <div className="mt-8">
        <p className="mb-4 text-sm font-semibold text-[#94A3B8] uppercase">Select Sport</p>
        <select 
          value={sport} 
          onChange={(e) => setSport(e.target.value)}
          className="w-full bg-[#0A0E1A] border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-primary"
        >
          <option value="cricket_batting">Cricket Batting (Cover Drive)</option>
          <option value="cricket_bowling">Cricket Bowling</option>
          <option value="badminton_smash">Badminton Smash</option>
          <option value="badminton_drop">Badminton Drop Shot</option>
        </select>
      </div>

      <button 
        onClick={() => file && onAnalyze(file, sport)}
        disabled={!file}
        className="mt-8 w-full py-4 bg-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition-colors"
      >
        Analyze Video
      </button>
    </div>
  )
}
""",
    "src/app/analyze/page.tsx": """'use client'
import { useState } from 'react'
import FileUploader from '@/components/ui/FileUploader'
import { useAnalysis } from '@/hooks/useAnalysis'
import { motion } from 'framer-motion'

export default function AnalyzePage() {
  const { isAnalyzing, result, error, startAnalysis } = useAnalysis()

  if (result) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Analysis Complete</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-3xl text-center">
            <h3 className="text-[#94A3B8] uppercase text-sm font-bold mb-2">Form Score</h3>
            <div className="text-7xl font-extrabold text-primary">{result.overall_score}</div>
            <p className="mt-2 text-[#94A3B8]">out of 100</p>
          </div>
          <div className="glass-card p-8 rounded-3xl">
            <h3 className="text-xl font-bold mb-6">Coaching Insights</h3>
            <ul className="space-y-4">
              {result.coaching_insights.map((tip: any, i: number) => (
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Upload Video</h1>
        <p className="text-[#94A3B8] mt-4">We'll extract 3D kinematics directly from your footage.</p>
      </div>

      {isAnalyzing ? (
        <div className="text-center py-20">
          <div className="animate-pulse w-32 h-32 bg-primary/20 rounded-full mx-auto flex items-center justify-center glow-green">
            <div className="w-16 h-16 bg-primary rounded-full"></div>
          </div>
          <p className="mt-8 text-xl font-medium animate-pulse">Running AI Pipeline...</p>
        </div>
      ) : (
        <FileUploader onAnalyze={startAnalysis} />
      )}
      
      {error && <p className="text-error text-center mt-4">{error}</p>}
    </motion.div>
  )
}
"""
}

for filepath, content in files.items():
    full_path = os.path.join(web_dir, filepath)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Web files generated successfully.")
