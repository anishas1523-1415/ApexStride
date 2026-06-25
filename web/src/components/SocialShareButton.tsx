'use client'
import React, { useState } from 'react'
import html2canvas from 'html2canvas'
import { motion } from 'framer-motion'

interface SocialShareProps {
  elementId: string
  fileName?: string
}

export default function SocialShareButton({ elementId, fileName = 'AuraKinematics_Pro.png' }: SocialShareProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  const handleShare = async () => {
    setIsCapturing(true)
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error("Element not found")
        setIsCapturing(false)
        return
      }

      // Add a watermarked logo temporarily for the screenshot
      const watermark = document.createElement('div')
      watermark.innerHTML = '⚡ AuraKinematics 2.0 Pro'
      watermark.style.position = 'absolute'
      watermark.style.bottom = '20px'
      watermark.style.right = '20px'
      watermark.style.color = '#22d3ee'
      watermark.style.fontWeight = 'bold'
      watermark.style.fontSize = '24px'
      watermark.style.zIndex = '9999'
      element.appendChild(watermark)

      const canvas = await html2canvas(element, {
        backgroundColor: '#050810',
        useCORS: true,
        scale: 2 // High-res
      })

      element.removeChild(watermark)

      const image = canvas.toDataURL("image/png")
      const link = document.createElement('a')
      link.href = image
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (err) {
      console.error("Failed to capture screen", err)
    } finally {
      setIsCapturing(false)
    }
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      disabled={isCapturing}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-violet-500 text-white rounded-xl font-bold tracking-wide shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all disabled:opacity-50"
    >
      <span className="text-xl">📸</span> 
      {isCapturing ? "Capturing..." : "Share to TikTok / IG"}
    </motion.button>
  )
}
