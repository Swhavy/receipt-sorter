"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void
  onFolderUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function UploadZone({ onFilesSelected, onFolderUpload }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "rounded-2xl border-2 border-dashed transition-all duration-200",
        isDragActive
          ? "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 shadow-lg"
          : "border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-white/5 hover:border-slate-400 dark:hover:border-slate-600",
      )}
    >
      <div className="flex flex-col items-center justify-center gap-6 px-6 py-12 sm:px-8 sm:py-16">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
            <Folder className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Drag and drop your receipts here</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">or use the buttons below to select files</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            Select Files
          </Button>
          <Button
            onClick={() => folderInputRef.current?.click()}
            variant="outline"
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent"
          >
            <Folder className="mr-2 h-4 w-4" />
            Select Folder
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <input ref={folderInputRef} type="file" webkitdirectory="true" onChange={onFolderUpload} className="hidden" />

        <p className="text-xs text-slate-500 dark:text-slate-500">Supported formats: JPG, PNG, GIF, WebP</p>
      </div>
    </div>
  )
}
