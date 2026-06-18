'use client'
import { useState, useRef } from 'react'

export default function FileUploader({ onAnalyze }: { onAnalyze: (file: File, sport: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [sport, setSport] = useState('cricket_batting')
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto shadow-[0_0_30px_rgba(0,0,0,0.3)]">
      <div 
        className="border-2 border-dashed border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/10 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[inset_0_0_25px_rgba(34,211,238,0.1)] group"
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
          <div className="space-y-2">
            <span className="text-4xl block animate-bounce">📂</span>
            <p className="text-lg text-cyan-400 font-bold tracking-tight">{file.name}</p>
            <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 bg-cyan-950/20 text-cyan-400">
              ➕
            </div>
            <p className="text-slate-300 font-medium group-hover:text-cyan-300 transition-colors">Drag and drop a video, or click to browse</p>
            <p className="text-xs text-slate-500">Supports MP4, MOV, AVI (Max 500MB)</p>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <p className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Select Sport Discipline</p>
        <div className="relative">
          <select 
            value={sport} 
            onChange={(e) => setSport(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer font-medium"
          >
            <option className="bg-slate-900 text-white" value="cricket_batting">Cricket Batting (Cover Drive)</option>
            <option className="bg-slate-900 text-white" value="cricket_bowling">Cricket Bowling</option>
            <option className="bg-slate-900 text-white" value="badminton_smash">Badminton Smash</option>
            <option className="bg-slate-900 text-white" value="badminton_drop">Badminton Drop Shot</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-cyan-400">
            ▼
          </div>
        </div>
      </div>

      <button 
        onClick={() => file && onAnalyze(file, sport)}
        disabled={!file}
        className="mt-8 w-full py-4 bg-cyan-500 text-slate-950 rounded-xl font-bold tracking-wide uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] disabled:shadow-none transition-all duration-300"
      >
        Execute Analysis
      </button>
    </div>
  )
}
