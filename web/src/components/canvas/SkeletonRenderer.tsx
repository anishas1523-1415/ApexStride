'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FrameKinematics, JointCoordinate } from '@/lib/api'

interface SkeletonRendererProps {
  videoUrl: string
  kinematicTimeline: FrameKinematics[]
  showGhostPro?: boolean
  impactTimestamp?: number
  sportType: string
}

export default function SkeletonRenderer({ videoUrl, kinematicTimeline, showGhostPro = false, impactTimestamp, sportType }: SkeletonRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [baselinePro, setBaselinePro] = useState<FrameKinematics[] | null>(null)

  useEffect(() => {
    if (showGhostPro) {
      // Fetch dynamic ghost baseline from backend
      import('@/lib/api').then(({ API_BASE }) => {
        fetch(`${API_BASE}/ghosts/${sportType}`)
          .then(res => res.json())
          .then(data => setBaselinePro(data.kinematic_timeline))
          .catch(err => console.warn("Ghost pro data not found", err))
      })
    }
  }, [showGhostPro, sportType])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!video || !canvas || !container) return

    let animationFrameId: number

    // Strict ResizeObserver for Zero-Misalignment Canvas
    const resizeObserver = new ResizeObserver(() => {
      if (!video.videoWidth || !video.videoHeight) return
      
      const containerRect = container.getBoundingClientRect()
      const containerRatio = containerRect.width / containerRect.height
      const videoRatio = video.videoWidth / video.videoHeight

      let actualWidth, actualHeight
      let offsetX = 0
      let offsetY = 0

      if (containerRatio > videoRatio) {
        // Window is wider than video: letterboxing on sides
        actualHeight = containerRect.height
        actualWidth = actualHeight * videoRatio
        offsetX = (containerRect.width - actualWidth) / 2
      } else {
        // Window is taller than video: letterboxing on top/bottom
        actualWidth = containerRect.width
        actualHeight = actualWidth / videoRatio
        offsetY = (containerRect.height - actualHeight) / 2
      }

      // Match canvas explicitly to the active video area
      canvas.width = actualWidth
      canvas.height = actualHeight
      canvas.style.width = `${actualWidth}px`
      canvas.style.height = `${actualHeight}px`
      canvas.style.left = `${offsetX}px`
      canvas.style.top = `${offsetY}px`
    })

    resizeObserver.observe(container)

    const renderLoop = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      // CRITICAL: Bind clearRect strictly to the frame update to prevent paintbrush smearing
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const currentTime = video.currentTime
      const frameIndex = Math.floor(currentTime * 30) 
      
      if (showGhostPro && baselinePro && baselinePro[frameIndex]) {
         drawSkeleton(ctx, baselinePro[frameIndex].landmarks, 'rgba(255, 255, 255, 0.4)', false)
      }

      if (kinematicTimeline[frameIndex]) {
         drawSkeleton(ctx, kinematicTimeline[frameIndex].landmarks, '#10B981', true)
      }

      animationFrameId = requestAnimationFrame(renderLoop)
    }

    const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: Record<string, JointCoordinate>, color: string, isLive: boolean) => {
      ctx.strokeStyle = color
      ctx.lineWidth = isLive ? 4 : 3
      ctx.fillStyle = color
      
      if (isLive) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(16, 185, 129, 0.8)'; // Neon Glow
      } else {
        ctx.shadowBlur = 0;
      }
      
      const drawBone = (joint1: string, joint2: string) => {
         const p1 = landmarks[joint1]
         const p2 = landmarks[joint2]
         if (p1 && p2 && p1.visibility > 0.4 && p2.visibility > 0.4) {
             ctx.beginPath()
             ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
             ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
             ctx.stroke()
         }
      }

      const bones = [
        ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
        ['LEFT_SHOULDER', 'LEFT_ELBOW'],
        ['RIGHT_SHOULDER', 'RIGHT_ELBOW'],
        ['LEFT_ELBOW', 'LEFT_WRIST'],
        ['RIGHT_ELBOW', 'RIGHT_WRIST'],
        ['LEFT_SHOULDER', 'LEFT_HIP'],
        ['RIGHT_SHOULDER', 'RIGHT_HIP'],
        ['LEFT_HIP', 'RIGHT_HIP'],
        ['LEFT_HIP', 'LEFT_KNEE'],
        ['RIGHT_HIP', 'RIGHT_KNEE'],
        ['LEFT_KNEE', 'LEFT_ANKLE'],
        ['RIGHT_KNEE', 'RIGHT_ANKLE'],
      ]

      bones.forEach(bone => drawBone(bone[0], bone[1]))

      for (const joint in landmarks) {
        const point = landmarks[joint]
        if (point.visibility > 0.4) {
           ctx.beginPath()
           ctx.arc(point.x * canvas.width, point.y * canvas.height, isLive ? 6 : 4, 0, 2 * Math.PI)
           ctx.fill()
        }
      }
      // Reset shadow
      ctx.shadowBlur = 0;
    }

    video.addEventListener('play', () => {
      renderLoop()
    })
    
    video.addEventListener('loadedmetadata', () => {
      resizeObserver.observe(container)
      if (impactTimestamp !== undefined && impactTimestamp !== null) {
        video.currentTime = Math.max(0, impactTimestamp - 1.0)
      }
      // Trigger a single render frame to draw initial state even when paused
      requestAnimationFrame(renderLoop)
    })

    return () => {
      resizeObserver.disconnect()
      cancelAnimationFrame(animationFrameId)
    }
  }, [kinematicTimeline, showGhostPro, baselinePro, impactTimestamp])

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px] bg-[#050810] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="absolute inset-0 w-full h-full object-contain"
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none z-10"
      />
    </div>
  )
}
