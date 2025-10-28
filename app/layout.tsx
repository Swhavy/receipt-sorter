import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToaster } from '@/components/theme-toaster'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'ARC FLOW',
  description:
    'ArcFlow is an intelligent receipt processing platform that automatically organizes, sorts, and compiles uploaded receipts into a neatly formatted Word document.',
    icons:{
      icon: '/AF.png',
    }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased transition-theme`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <ThemeToaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
