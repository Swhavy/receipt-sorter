'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Upload, Zap, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LandingPage() {
  const [isHovering, setIsHovering] = useState(false)

  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description:
        'Drag and drop receipt images or entire folders for instant processing',
      image: '/upload-interface-with-drag-and-drop.jpg',
    },
    {
      icon: Zap,
      title: 'Auto Sort by Date',
      description:
        'Automatically organize receipts chronologically with intelligent detection',
      image: '/calendar-with-sorted-receipts.jpg',
    },
    {
      icon: FileText,
      title: 'Export to Word',
      description:
        'Generate beautifully formatted Word documents with all receipt details',
      image: '/word-document-with-receipts.jpg',
    },
    {
      icon: CheckCircle2,
      title: 'Organized & Ready',
      description:
        'Get perfectly sorted receipts ready for accounting and tax purposes',
      image: '/organized-files-and-checkmarks.jpg',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 transition-theme">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-sm bg-white/30 dark:bg-slate-900/30 border-b border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">AF</span>
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">
            ARCFLOW
          </span>
        </div>
        <ThemeToggle />
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              {/* Animated badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 mb-8 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Now Available
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Sort. Simplify.{' '}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                  Streamline
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Organize your receipts effortlessly. Upload, sort by date, and
                export to Word in seconds. Perfect for businesses and
                individuals managing expenses.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    Try ARCFLOW Now
                    <ArrowRight
                      className={`ml-2 h-5 w-5 transition-transform ${
                        isHovering ? 'translate-x-1' : ''
                      }`}
                    />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-3xl" />
              <div className="relative glass-effect-light rounded-2xl p-8 overflow-hidden">
                <img
                  src="/receipt-sorting-dashboard-interface-with-documents.jpg"
                  alt="ARCFLOW Dashboard"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need to manage receipts efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="glass-effect-light rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-105 group"
                >
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <img
                      src={feature.image || '/placeholder.svg'}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-8">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 group-hover:from-blue-500/30 group-hover:to-cyan-500/30 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-2xl p-12 sm:p-16 text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              Ready to streamline your receipts?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
              Join thousands of users organizing their receipts with ARCFLOW
            </p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 sm:px-8 lg:px-12 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto text-center text-slate-600 dark:text-slate-400">
          <p>© 2025 ARCFLOW. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
