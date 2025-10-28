'use client'

import { Toaster } from 'sonner'
import { useTheme } from 'next-themes'

export function ThemeToaster() {
  const { theme } = useTheme()

  return (
    <Toaster
      theme={theme === 'dark' ? 'dark' : 'light'}
      position="top-right"
      richColors
      toastOptions={{
        style: {
          borderRadius: '8px',
          background: theme === 'dark' ? '#111' : '#fff',
          color: theme === 'dark' ? '#f5f5f5' : '#111',
        },
      }}
    />
  )
}
