export const API_BASE = 'http://localhost:8000/api/v1'

export interface TaskResponse {
  task_id: string;
  status: string;
}

export interface JointCoordinate {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface JointAngles {
  joint_name: string;
  angle_degrees: number;
  is_optimal: boolean;
  threshold_min: number;
  threshold_max: number;
}

export interface FrameKinematics {
  frame_index: number;
  timestamp_seconds: number;
  landmarks: Record<string, JointCoordinate>;
  joint_angles: JointAngles[];
  angular_velocities?: Record<string, number> | null;
}

export interface CriticalEvent {
  event_type: string;
  frame_index: number;
  timestamp_seconds: number;
  description: string;
}

export interface CoachingInsight {
  category: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  frame_index: number;
  timestamp_seconds: number;
  angle_actual?: number | null;
  angle_ideal?: number | null;
}

export interface AnalysisResponse {
  overall_score: number;
  sport_type: string;
  coaching_insights: CoachingInsight[];
  kinematic_timeline: FrameKinematics[];
  critical_events: CriticalEvent[];
  impact_timestamp?: number | null;
  video_metadata?: {
    filename: string;
    total_frames: number;
    fps: number;
    duration_seconds: number;
    width: number;
    height: number;
  } | null;
}

export interface TaskStatusResponse {
  task_id: string;
  status: string;
  result?: AnalysisResponse;
}

import { createClient } from '@/utils/supabase/client'

export async function analyzeVideo(file: File, sportType: string): Promise<TaskResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('sport_type', sportType)

  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const headers: Record<string, string> = {}
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  })
  
  if (!res.ok) {
    throw new Error('Failed to enqueue video analysis')
  }
  
  return res.json()
}

export async function pollTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`${API_BASE}/status/${taskId}`)
  if (!res.ok) {
    throw new Error('Failed to poll task status')
  }
  return res.json()
}
