import { BrowserRouter } from 'react-router-dom'
import { Toaster }       from 'react-hot-toast'
import { AuthProvider }  from '@/hooks/useAuth'
import { LangProvider }  from '@/hooks/useLang'
import { AppRouter }     from '@/AppRouter'

export default function App() {
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
