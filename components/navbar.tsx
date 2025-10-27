import { Receipt } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Smart Receipt Sorter</h1>
        </div>
      </div>
    </nav>
  )
}
