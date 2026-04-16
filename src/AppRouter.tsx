import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/shared/Navbar'
import { Spinner } from '@/components/shared/UI'

// Pages
import { LoginPage }         from '@/pages/LoginPage'
import { UserQueriesPage }   from '@/pages/user/UserQueriesPage'
import { AskQueryPage }      from '@/pages/user/AskQueryPage'
import { QueryDetailPage }   from '@/pages/user/QueryDetailPage'
import { SavedPersonsPage }  from '@/pages/user/SavedPersonsPage'
import { AdminDashboard }    from '@/pages/admin/AdminDashboard'
import { AdminInbox }        from '@/pages/admin/AdminInbox'
import { AdminQueryDetail }  from '@/pages/admin/AdminQueryDetail'
import { TemplatesPage }     from '@/pages/admin/TemplatesPage'
import { RemediesPage }      from '@/pages/admin/RemediesPage'

function ProtectedRoute({ children, adminOnly = false }: {
  children: React.ReactNode
  adminOnly?: boolean
}) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/app/queries" replace />
  return <>{children}</>
}

export function AppRouter() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            user
              ? <Navigate to={isAdmin ? '/admin/dashboard' : '/app/queries'} replace />
              : <LoginPage />
          } />

          {/* Default redirect */}
          <Route path="/" element={
            <Navigate to={user ? (isAdmin ? '/admin/dashboard' : '/app/queries') : '/login'} replace />
          } />

          {/* User routes */}
          <Route path="/app/queries" element={
            <ProtectedRoute><UserQueriesPage /></ProtectedRoute>
          } />
          <Route path="/app/ask" element={
            <ProtectedRoute><AskQueryPage /></ProtectedRoute>
          } />
          <Route path="/app/query/:id" element={
            <ProtectedRoute><QueryDetailPage /></ProtectedRoute>
          } />
          <Route path="/app/persons" element={
            <ProtectedRoute><SavedPersonsPage /></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/inbox" element={
            <ProtectedRoute adminOnly><AdminInbox /></ProtectedRoute>
          } />
          <Route path="/admin/query/:id" element={
            <ProtectedRoute adminOnly><AdminQueryDetail /></ProtectedRoute>
          } />
          <Route path="/admin/templates" element={
            <ProtectedRoute adminOnly><TemplatesPage /></ProtectedRoute>
          } />
          <Route path="/admin/remedies" element={
            <ProtectedRoute adminOnly><RemediesPage /></ProtectedRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
