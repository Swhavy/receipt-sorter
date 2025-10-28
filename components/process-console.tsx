'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Zap } from 'lucide-react'

interface ProcessLog {
  id: string
  message: string
  timestamp: Date
  status: 'pending' | 'processing' | 'completed' | 'error'
}

interface ProcessConsoleProps {
  jobId?: string
  isProcessing: boolean
  onComplete?: (jobId: string) => void // Callback when processing completes
  onError?: (error: string) => void // Callback on error
}

export default function ProcessConsole({
  jobId,
  isProcessing,
  onComplete,
  onError,
}: ProcessConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [logs, setLogs] = useState<ProcessLog[]>([])

  useEffect(() => {
    if (!isProcessing || !jobId) {
      setLogs([])
      return
    }

    let source: EventSource | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    const connect = () => {
      console.log(`Connecting to SSE for job ${jobId}...`)
      source = new EventSource(`https://backend-production-8af5.up.railway.app/events/${jobId}`)

      source.onmessage = (event) => {
        const message = event.data
        reconnectAttempts = 0 // Reset on successful message

        // Check for stream end marker
        if (message === '[STREAM_END]') {
          console.log('Stream ended gracefully')
          source?.close()
          return
        }

        // Determine message status
        let status: ProcessLog['status'] = 'processing'
        if (message.includes('✅')) status = 'completed'
        if (message.includes('❌') || message.toLowerCase().includes('error'))
          status = 'error'

        setLogs((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${prev.length}`,
            message,
            timestamp: new Date(),
            status,
          },
        ])

        // Check for completion - multiple patterns
        if (
          message.includes('🎉 Processing complete') ||
          message.includes('Processing complete!') ||
          message.includes('Ready for download') ||
          message.includes('Word document saved')
        ) {
          console.log(
            '✅ Processing completed! Triggering onComplete callback...'
          )
          if (onComplete) {
            // Small delay to ensure all messages are received
            setTimeout(() => {
              onComplete(jobId)
            }, 500)
          }
        }

        // Check for error
        if (
          message.includes('❌ Processing failed') ||
          message.toLowerCase().includes('processing failed')
        ) {
          console.error('❌ Processing failed!')
          if (onError) {
            onError(message)
          }
        }
      }

      source.onerror = (err) => {
        console.error('⚠️ SSE connection error:', err)

        // Check if this is a normal close (readyState 2 = CLOSED)
        if (source?.readyState === EventSource.CLOSED) {
          console.log('SSE stream closed normally')
          return
        }

        setLogs((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${prev.length}`,
            message: 'Connection lost. Retrying...',
            timestamp: new Date(),
            status: 'error',
          },
        ])

        source?.close()

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts - 1),
            10000
          )
          console.log(
            `Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`
          )

          setTimeout(() => {
            if (isProcessing) {
              connect()
            }
          }, delay)
        } else {
          setLogs((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${prev.length}`,
              message:
                '❌ Max reconnection attempts reached. Please refresh the page.',
              timestamp: new Date(),
              status: 'error',
            },
          ])
          if (onError) {
            onError('Connection failed after multiple attempts')
          }
        }
      }
    }

    // Small delay to ensure backend has registered the job_id
    const timeout = setTimeout(() => {
      connect()
    }, 300)

    // Cleanup function
    return () => {
      clearTimeout(timeout)
      source?.close()
      console.log('Closed SSE connection.')
    }
  }, [isProcessing, jobId, onComplete, onError])

  if (!isProcessing) return null

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-48px)] z-50">
      <div className="glass-effect-light dark:glass-effect rounded-xl border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20 border-b border-white/20 dark:border-white/10 cursor-pointer hover:bg-gradient-to-r hover:from-blue-500/15 hover:to-cyan-500/15 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              Process Console
            </span>
          </div>
          <button className="p-1 hover:bg-white/10 dark:hover:bg-white/5 rounded transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>
        </div>

        {/* Console Logs */}
        {isExpanded && (
          <div className="max-h-64 scrollbar-custom overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/50 scrollbar-track-transparent hover:scrollbar-thumb-blue-500/70">
            <div className="p-4 space-y-2 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="text-slate-500 dark:text-slate-400">
                  Connecting to processing stream...
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 text-slate-700 dark:text-slate-300"
                  >
                    <span className="text-slate-400 dark:text-slate-600 flex-shrink-0 w-4">
                      {log.status === 'completed'
                        ? '✓'
                        : log.status === 'error'
                        ? '✗'
                        : '→'}
                    </span>
                    <div className="flex-1">
                      <span className="text-slate-600 dark:text-slate-400">
                        [{log.timestamp.toLocaleTimeString()}]
                      </span>
                      <span className="ml-2 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-white/20 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Receiving updates...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
