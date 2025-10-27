import { Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function ProcessingIndicator() {
  return (
    <Card className="glass-effect-light dark:glass-effect border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
      <div className="flex items-center gap-4 p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 dark:text-blue-300">Processing receipts...</h3>
          <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
            Analyzing and sorting your receipts by date. This may take a moment.
          </p>
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-blue-200 dark:from-blue-900 to-cyan-200 dark:to-cyan-900">
        <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-blue-600 dark:from-blue-400 to-cyan-600 dark:to-cyan-400"></div>
      </div>
    </Card>
  )
}
