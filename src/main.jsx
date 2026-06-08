import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'sonner'

import '@/styles/globals.css'

import App from './app'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/sonner'

const queryClient = new QueryClient()

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

window.addEventListener('online', () => {
  toast.success('İnternet bağlantısı geri geldi', { duration: 3000 })
})

window.addEventListener('offline', () => {
  toast.error('İnternet bağlantısı kesildi — çevrimdışı mod aktif', { duration: 5000 })
})

const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
)
