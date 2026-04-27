import { BrowserRouter } from 'react-router-dom'
import { Toaster }       from 'react-hot-toast'
import { AuthProvider }  from '@/hooks/useAuth'
import { LangProvider }  from '@/hooks/useLang'
import { AppRouter }     from '@/AppRouter'
import { useEffect } from 'react'

export default function App() {
  useEffect(() => {
    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <AppRouter />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
