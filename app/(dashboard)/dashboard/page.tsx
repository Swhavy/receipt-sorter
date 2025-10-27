'use client'

import type React from 'react'
import { useState, useRef } from 'react'
import { FileText, Download, Loader2, Home, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import UploadZone from '@/components/upload-zone'
import ReceiptPreview from '@/components/receipt-preview'
import ProcessingIndicator from '@/components/processing-indicator'
import { ThemeToggle } from '@/components/theme-toggle'
import ProcessConsole from '@/components/process-console'

export default function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [jobId, setJobId] = useState<string | undefined>(undefined)
  const [isSorted, setIsSorted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (files: File[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    handleFileSelect(files)
  }

  const handleProcessReceipts = async () => {
    if (uploadedFiles.length === 0) return

    setIsProcessing(true)
    setIsSorted(false)
    setDownloadUrl(null)
    setJobId(undefined)
    setError(null)

    try {
      const formData = new FormData()
      uploadedFiles.forEach((file) => formData.append('files', file))

      // Send to backend - this now returns job_id immediately
      const response = await fetch('http://127.0.0.1:8000/process-receipts', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Processing failed')
      }

      // Get job_id - processing happens in background
      const data = await response.json()
      console.log('Job started:', data)

      // Set job_id to trigger ProcessConsole SSE connection
      setJobId(data.job_id)

      // ProcessConsole will now handle the SSE connection and call onComplete when done
    } catch (err) {
      console.error('Error starting processing:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsProcessing(false)
      setJobId(undefined)
    }
  }

  const handleProcessComplete = (completedJobId: string) => {
    console.log('✅ Processing completed for job:', completedJobId)

    // Set download URL
    const downloadFilename = `sorted_receipts_${completedJobId}.docx`
    setDownloadUrl(`http://127.0.0.1:8000/download/${downloadFilename}`)

    // Update UI state
    setIsSorted(true)
    setIsProcessing(false)
  }

  const handleProcessError = (errorMessage: string) => {
    console.error('❌ Processing error:', errorMessage)
    setError(errorMessage)
    setIsProcessing(false)
    setIsSorted(false)
  }

  const handleDownload = async () => {
    if (!downloadUrl) {
      alert('No file ready for download yet.')
      return
    }

    try {
      const response = await fetch(downloadUrl)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'sorted-receipts.docx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('Download failed. Please try again.')
    }
  }

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearAll = () => {
    setUploadedFiles([])
    setIsSorted(false)
    setJobId(undefined)
    setDownloadUrl(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 transition-theme">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 glass-effect-light dark:glass-effect border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">AF</span>
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                ARCFLOW
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Upload Receipts
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Drag & drop or upload image receipts or folders.
          </p>

          {/* Folder Upload */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFolderUpload}
            className="hidden"
            // @ts-ignore
            webkitdirectory=""
            // @ts-ignore
            directory=""
          />
          <UploadZone
            onFilesSelected={handleFileSelect}
            onFolderUpload={handleFolderUpload}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 glass-effect-light dark:glass-effect border-red-200/50 dark:border-red-900/50 bg-gradient-to-r from-red-50/50 to-pink-50/50 dark:from-red-950/20 dark:to-pink-950/20">
            <div className="p-6">
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </Card>
        )}

        {uploadedFiles.length > 0 && (
          <>
            {/* Uploaded Files Section */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  Uploaded Receipts ({uploadedFiles.length})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent border-slate-300 dark:border-slate-700 disabled:opacity-50"
                >
                  Clear All
                </Button>
              </div>

              <div className="glass-effect-light dark:glass-effect rounded-2xl border border-white/20 dark:border-white/10 p-6 overflow-hidden">
                <div className="overflow-x-auto scrollbar-custom">
                  <div className="flex gap-4 pb-4 min-w-min">
                    {uploadedFiles.map((file, index) => (
                      <ReceiptPreview
                        key={index}
                        file={file}
                        index={index}
                        onRemove={handleRemoveFile}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Process Section */}
            <div className="mb-12 space-y-6">
              <Card className="glass-effect-light dark:glass-effect border-white/20 dark:border-white/10">
                <div className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      Ready to sort?
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Click below to sort receipts by date.
                    </p>
                  </div>
                  <Button
                    onClick={handleProcessReceipts}
                    disabled={isProcessing}
                    size="lg"
                    className="min-w-fit bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Sort by Date
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {isProcessing && <ProcessingIndicator />}

              {isSorted && !isProcessing && (
                <Card className="glass-effect-light dark:glass-effect border-green-200/50 dark:border-green-900/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <div className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
                    <div>
                      <h3 className="font-semibold text-green-900 dark:text-green-300">
                        Sorting Complete!
                      </h3>
                      <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                        Your receipts have been sorted and are ready for
                        download.
                      </p>
                    </div>
                    <Button
                      onClick={handleDownload}
                      size="lg"
                      className="min-w-fit bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Word File
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </>
        )}

        {/* Process Console (SSE Live Updates) */}
        <ProcessConsole
          isProcessing={isProcessing}
          jobId={jobId}
          onComplete={handleProcessComplete}
          onError={handleProcessError}
        />

        {/* DEBUG: Manual completion trigger */}
        {isProcessing && jobId && (
          <button
            onClick={() => {
              console.log('Manual complete triggered')
              handleProcessComplete(jobId)
            }}
            className="fixed bottom-24 right-6 z-50 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow-lg text-sm font-medium"
          >
            🔧 Force Complete (Debug)
          </button>
        )}
      </main>
    </div>
  )
}
