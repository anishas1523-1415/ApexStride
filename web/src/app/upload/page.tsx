'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthContext } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';
import { SPORTS } from '@/lib/constants';

interface RoleOptions {
  [key: string]: string[];
}

const ROLE_OPTIONS: RoleOptions = {
  cricket: ['Batsman', 'Bowler'],
  football: ['Striker', 'Goalkeeper', 'Defender'],
  badminton: ['Singles', 'Doubles'],
  weightlifting: ['Squat', 'Deadlift', 'Bench Press'],
  running: ['Sprint', 'Long Distance'],
};

const SHOT_OPTIONS: RoleOptions = {
  cricket_batsman: ['Cover Drive', 'Sweep Shot', 'Straight Drive', 'Pull Shot'],
  cricket_bowler: ['Fast Bowling', 'Spin Bowling', 'Yorker'],
  football_striker: ['Shooting', 'Passing', 'Dribbling'],
  football_goalkeeper: ['Diving', 'Punching', 'Throwing'],
  football_defender: ['Tackling', 'Blocking'],
  badminton_singles: ['Smash', 'Drop Shot', 'Clear'],
  badminton_doubles: ['Smash', 'Drop Shot', 'Net Play'],
};

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const initialSport = searchParams.get('sport') || 'cricket';

  const [sport, setSport] = useState(initialSport);
  const [role, setRole] = useState('');
  const [shot, setShot] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('Video file must be less than 500MB');
        return;
      }
      setVideoFile(file);
      setError(null);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Photo file must be less than 10MB');
        return;
      }
      setPhotoFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    if (!role) {
      setError('Please select a role');
      return;
    }

    if (!shot) {
      setError('Please select a shot/action type');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('sport_type', sport);
      formData.append('role', role);
      formData.append('shot_type', shot);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const response = await apiClient.postFormData<{ task_id: string }>(
        '/api/v1/analyze',
        formData
      );

      router.push(`/analysis/${response.task_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const currentSport = SPORTS.find((s) => s.id === sport);
  const roleOptions = ROLE_OPTIONS[sport] || [];
  const shotKey = `${sport}_${role.toLowerCase()}`;
  const shotOptions = SHOT_OPTIONS[shotKey] || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold neon-text-green mb-4">Upload Video</h1>
        <p className="text-neon-cyan/70 text-lg">
          Analyze your motion with our advanced AI technology
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card variant="glass" glowColor="cyan" className="p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sport Selection */}
            <div>
              <label className="block text-sm font-semibold text-neon-cyan mb-3">
                Sport
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {SPORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSport(s.id);
                      setRole('');
                      setShot('');
                    }}
                    className={`p-3 rounded-lg font-semibold transition-all ${
                      sport === s.id
                        ? 'glow-green bg-neon-green/20 text-neon-green border-2 border-neon-green'
                        : 'bg-stadium-surface text-neon-cyan/70 border border-stadium-card hover:border-neon-cyan'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            {roleOptions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-neon-cyan mb-3">
                  Role / Position
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roleOptions.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setRole(r);
                        setShot('');
                      }}
                      className={`p-3 rounded-lg font-semibold transition-all ${
                        role === r
                          ? 'glow-cyan bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan'
                          : 'bg-stadium-surface text-neon-cyan/70 border border-stadium-card hover:border-neon-cyan'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shot/Action Selection */}
            {shotOptions.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-neon-cyan mb-3">
                  Shot / Action Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {shotOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setShot(s)}
                      className={`p-3 rounded-lg font-semibold transition-all ${
                        shot === s
                          ? 'glow-lime bg-neon-lime/20 text-neon-lime border-2 border-neon-lime'
                          : 'bg-stadium-surface text-neon-cyan/70 border border-stadium-card hover:border-neon-cyan'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-semibold text-neon-cyan mb-3">
                Video File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neon-cyan/50 rounded-lg p-8 text-center cursor-pointer hover:border-neon-green transition-colors"
              >
                <div className="text-4xl mb-3">📹</div>
                <p className="text-neon-cyan font-semibold mb-1">
                  {videoFile ? videoFile.name : 'Click to select video'}
                </p>
                <p className="text-neon-cyan/50 text-sm">
                  MP4, AVI, MOV • Max 500MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
            </div>

            {/* Photo Upload (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-neon-cyan mb-3">
                Player Photo (Optional)
              </label>
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-neon-cyan/30 rounded-lg p-8 text-center cursor-pointer hover:border-neon-cyan transition-colors"
              >
                <div className="text-4xl mb-3">📸</div>
                <p className="text-neon-cyan/70 font-semibold mb-1">
                  {photoFile ? photoFile.name : 'Click to select photo'}
                </p>
                <p className="text-neon-cyan/50 text-sm">
                  For better accuracy in crowded scenes • Max 10MB
                </p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              glow="green"
              size="lg"
              isLoading={uploading}
              className="w-full mt-8"
            >
              Analyze Video
            </Button>
          </form>
        </Card>
      </motion.div>

      {/* Recording Guidelines */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-12 p-6 glass-dark rounded-xl border border-neon-cyan/20"
      >
        <h3 className="text-lg font-bold text-neon-cyan mb-4">📍 Camera Positioning Guide</h3>
        <div className="space-y-3 text-neon-cyan/70 text-sm">
          <p>🎬 <strong>Keep camera stable</strong> - Use a tripod or fixed position</p>
          <p>👁️ <strong>Clear view</strong> - Ensure full body is visible in frame</p>
          <p>💡 <strong>Good lighting</strong> - Bright, natural light works best</p>
          <p>🎯 <strong>Centered position</strong> - Record from side or front view</p>
        </div>
      </motion.div>
    </div>
  );
}