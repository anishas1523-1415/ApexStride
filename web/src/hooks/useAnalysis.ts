import { useState } from 'react'
import { analyzeVideo, pollTaskStatus, AnalysisResponse } from '../lib/api'
import { toast } from 'sonner'

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startAnalysis = async (file: File, sportType: string) => {
    setIsAnalyzing(true)
    setError(null)
    try {
      const taskRes = await analyzeVideo(file, sportType)
      const taskId = taskRes.task_id
      
      let attempts = 0
      const maxAttempts = 300 // 10 minutes timeout
      
      const poll = async () => {
        if (attempts >= maxAttempts) {
            toast.error("Timeout: The referee called a foul on the server.")
            throw new Error("Polling timeout")
        }
        const statusRes = await pollTaskStatus(taskId)
        if (statusRes.status === 'success') {
            setResult(statusRes.result!)
            setIsAnalyzing(false)
        } else if (statusRes.status === 'failed') {
            toast.error("Task failed. Please try again.")
            throw new Error("Task failed")
        } else {
            attempts++
            setTimeout(poll, 2000)
        }
      }
      poll()

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An error occurred during analysis.";
      setError(errMsg)
      toast.error(errMsg)
      setIsAnalyzing(false)
    }
  }

  return { isAnalyzing, result, error, startAnalysis }
}
