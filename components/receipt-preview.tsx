"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptPreviewProps {
  file: File
  index: number
  onRemove: (index: number) => void
}

export default function ReceiptPreview({ file, index, onRemove }: ReceiptPreviewProps) {
  const [imageUrl, setImageUrl] = useState<string>("")

  // Generate preview URL
  if (!imageUrl && file.type.startsWith("image/")) {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm dark:shadow-md transition-all hover:shadow-lg dark:hover:shadow-xl hover:scale-105 w-40 flex-shrink-0">
      {imageUrl && (
        <img src={imageUrl || "/placeholder.svg"} alt={`Receipt ${index + 1}`} className="h-40 w-full object-cover" />
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/40">
        <Button
          onClick={() => onRemove(index)}
          size="sm"
          variant="ghost"
          className="opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2">
        <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
    </div>
  )
}
