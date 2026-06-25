'use client'
import { useState, useRef, useEffect } from 'react'

const sportsData: any = {
  cricket: {
    name: 'Cricket',
    roles: {
      batsman: { name: 'Batsman', actions: [{id: 'cover_drive', name: 'Cover Drive'}, {id: 'sweep_shot', name: 'Sweep Shot'}] },
      bowler: { name: 'Bowler', actions: [{id: 'fast_bowling', name: 'Fast Bowling'}, {id: 'spin_bowling', name: 'Spin Bowling'}] }
    },
    guideline: 'Camera should face the action directly or from a stable side view. For bowling, face the direction of the run-up.'
  },
  football: {
    name: 'Football',
    roles: {
      striker: { name: 'Striker', actions: [{id: 'shot', name: 'Shot'}, {id: 'pass', name: 'Pass'}] },
      goalkeeper: { name: 'Goalkeeper', actions: [{id: 'save', name: 'Diving Save'}, {id: 'clearance', name: 'Clearance'}] }
    },
    guideline: 'Record the complete movement and kicking action from a stable position.'
  },
  weightlifting: {
    name: 'Weightlifting',
    roles: {
      lifter: { name: 'Lifter', actions: [{id: 'snatch', name: 'Snatch'}, {id: 'clean_jerk', name: 'Clean & Jerk'}] }
    },
    guideline: 'Record the entire lift from the initial setup to completion, ideally from a 45-degree front-side angle.'
  },
  badminton: {
    name: 'Badminton',
    roles: {
      player: { name: 'Player', actions: [{id: 'smash', name: 'Smash'}, {id: 'drop_shot', name: 'Drop Shot'}] }
    },
    guideline: 'Accurately capture the moment when the shot is played from the back or side of the court.'
  },
  running: {
    name: 'Athlete Running',
    roles: {
      runner: { name: 'Runner', actions: [{id: 'sprint', name: 'Sprint'}, {id: 'jogging', name: 'Jogging'}] }
    },
    guideline: 'Record the complete running motion from a side profile view to analyze stride and posture.'
  }
}

export default function FileUploader({ onAnalyze }: { onAnalyze: (file: File, sport: string) => void }) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  
  const [selectedSport, setSelectedSport] = useState('cricket')
  const [selectedRole, setSelectedRole] = useState('batsman')
  const [selectedAction, setSelectedAction] = useState('cover_drive')
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Auto-update dependent dropdowns
  useEffect(() => {
    const roles = Object.keys(sportsData[selectedSport].roles)
    setSelectedRole(roles[0])
  }, [selectedSport])

  useEffect(() => {
    if (sportsData[selectedSport].roles[selectedRole]) {
      const actions = sportsData[selectedSport].roles[selectedRole].actions
      setSelectedAction(actions[0].id)
    }
  }, [selectedRole, selectedSport])

  const handleExecute = () => {
    if (videoFile) {
      // Combining the settings to a single string to maintain compatibility with backend signature for now
      const finalSportId = `${selectedSport}_${selectedRole}_${selectedAction}`
      onAnalyze(videoFile, finalSportId)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-wide">1. Upload Media</h2>
          
          {/* Video Upload */}
          <div 
            className="border-2 border-dashed border-cyan-500/50 hover:border-cyan-400 bg-cyan-950/10 rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 shadow-[inset_0_0_15px_rgba(34,211,238,0.05)] group"
            onClick={() => videoInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && videoInputRef.current?.click()}
            tabIndex={0}
            role="button"
            aria-label="Upload Performance Video"
          >
            <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => e.target.files && setVideoFile(e.target.files[0])} />
            {videoFile ? (
              <div className="space-y-2">
                <span className="text-3xl block text-cyan-400" aria-hidden="true">🎥</span>
                <p className="text-sm text-cyan-400 font-bold truncate px-4">{videoFile.name}</p>
                <p className="text-xs text-slate-400">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-10 h-10 rounded-full border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-cyan-400 bg-cyan-950/20" aria-hidden="true">
                  <span className="text-lg">➕</span>
                </div>
                <p className="text-sm text-slate-300 font-medium">Upload Performance Video</p>
              </div>
            )}
          </div>

          {/* Photo Upload (Optional for better tracking) */}
          <div 
            className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/10 rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 group"
            onClick={() => photoInputRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && photoInputRef.current?.click()}
            tabIndex={0}
            role="button"
            aria-label="Upload Player Photo"
          >
            <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && setPhotoFile(e.target.files[0])} />
            {photoFile ? (
              <div className="space-y-1">
                <span className="text-2xl block text-emerald-400" aria-hidden="true">📸</span>
                <p className="text-sm text-emerald-400 font-bold truncate px-4">{photoFile.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-8 h-8 rounded-full border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 text-emerald-400" aria-hidden="true">
                  <span>📸</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Upload Player Photo <span className="text-slate-500 text-[10px]">(Optional for 10x better tracking)</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white tracking-wide">2. Analysis Configuration</h2>
          
          <div className="space-y-4 bg-slate-950/40 p-6 rounded-2xl border border-white/5">
            <div>
              <label htmlFor="sport-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sport</label>
              <select id="sport-select" value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 appearance-none">
                {Object.keys(sportsData).map(key => (
                  <option key={key} value={key}>{sportsData[key].name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="role-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Role</label>
                <select id="role-select" value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 appearance-none">
                  {Object.keys(sportsData[selectedSport].roles).map(roleKey => (
                    <option key={roleKey} value={roleKey}>{sportsData[selectedSport].roles[roleKey].name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="action-select" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Action</label>
                <select id="action-select" value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 appearance-none">
                  {sportsData[selectedSport].roles[selectedRole]?.actions.map((act: any) => (
                    <option key={act.id} value={act.id}>{act.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-cyan-950/20 border-l-4 border-cyan-500 p-4 rounded-r-xl">
            <h3 className="text-xs font-bold text-cyan-400 uppercase mb-1 flex items-center gap-2">
              <span aria-hidden="true">📐</span> Camera Guidelines
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {sportsData[selectedSport].guideline}
            </p>
          </div>
        </div>

      </div>

      <div className="mt-10 border-t border-white/10 pt-8">
        <button 
          onClick={handleExecute}
          disabled={!videoFile}
          className="w-full py-4 bg-cyan-500 text-slate-950 rounded-xl font-bold tracking-widest uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] disabled:shadow-none transition-all duration-300"
        >
          Execute AI Analysis
        </button>
      </div>

    </div>
  )
}
