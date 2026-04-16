import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import { getAllQueries } from '@/lib/db'
import { Card, DomainIcon, StatusBadge, Countdown, Spinner } from '@/components/shared/UI'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { AstroQuery } from '@/types'

export function AdminDashboard() {
  const { T, domainLabel } = useLang()
  const [queries,  setQueries]  = useState<AstroQuery[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const unsub = getAllQueries(q => { setQueries(q); setLoading(false) })
    return unsub
  }, [])

  const newQ       = queries.filter(q => q.status === 'pending_review')
  const pendingPay = queries.filter(q => q.status === 'fee_set')
  const paid       = queries.filter(q => q.status === 'paid' || q.status === 'in_progress' || q.status === 'clarification')
  const answered   = queries.filter(q => q.status === 'answered' || q.status === 'closed')
  const thisMonth  = queries.filter(q => {
    const d = new Date(q.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const monthEarnings = thisMonth
    .filter(q => q.fee && (q.status === 'paid' || q.status === 'in_progress' || q.status === 'answered' || q.status === 'closed'))
    .reduce((sum, q) => sum + (q.fee ?? 0), 0)

  const urgent = paid.filter(q => {
    if (!q.deadline) return false
    const h = (new Date(q.deadline).getTime() - Date.now()) / 3600000
    return h < 12
  })

  if (loading) return <Spinner />

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🔮</span>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{T('dashboard')}</h1>
          <p className="text-xs text-gray-500">Welcome back, Astrologer</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: T('queriesNew'),    value: newQ.length,      color: 'bg-orange-50 border-orange-200',  text: 'text-orange-700' },
          { label: T('queriesPending'), value: pendingPay.length, color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
          { label: T('queriesAnswered'), value: answered.length, color: 'bg-green-50 border-green-200',   text: 'text-green-700' },
          { label: T('thisMonth'),     value: `₹${monthEarnings}`, color: 'bg-saffron-50 border-saffron-200', text: 'text-saffron-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Urgent queries */}
      {urgent.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <h2 className="font-semibold text-red-700 mb-3">⚠️ Urgent — Answer Deadline Near</h2>
          <div className="flex flex-col gap-2">
            {urgent.map(q => (
              <Link key={q.id} to={`/admin/query/${q.id}`}>
                <div className="flex items-center justify-between bg-white rounded-lg p-3 hover:shadow-sm">
                  <div className="flex items-center gap-2">
                    <DomainIcon domain={q.domain} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{q.personDetails.name}</p>
                      <p className="text-xs text-gray-500">{domainLabel(q.domain)}</p>
                    </div>
                  </div>
                  {q.deadline && <Countdown deadline={q.deadline} />}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* New queries */}
      {newQ.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">🆕 New Queries</h2>
          <div className="flex flex-col gap-2">
            {newQ.map(q => <QueryCard key={q.id} q={q} />)}
          </div>
        </div>
      )}

      {/* Paid awaiting answer */}
      {paid.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">💰 Paid — Awaiting Answer</h2>
          <div className="flex flex-col gap-2">
            {paid.map(q => <QueryCard key={q.id} q={q} />)}
          </div>
        </div>
      )}

      {/* Pending payment */}
      {pendingPay.length > 0 && (
        <div className="mb-6">
          <h2 className="font-semibold text-gray-800 mb-3 text-gray-500">⏳ Fee Set — Awaiting Payment</h2>
          <div className="flex flex-col gap-2">
            {pendingPay.map(q => <QueryCard key={q.id} q={q} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function QueryCard({ q }: { q: AstroQuery }) {
  const { domainLabel } = useLang()
  return (
    <Link to={`/admin/query/${q.id}`}>
      <Card className="hover:shadow-md hover:border-saffron-100 transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <DomainIcon domain={q.domain} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sm text-gray-900">{q.userName}</p>
                <p className="text-xs text-gray-500">{q.personDetails.name} · {domainLabel(q.domain)}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={q.status} />
                {q.fee && <span className="text-xs font-medium text-saffron-600">₹{q.fee}</span>}
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-1.5 line-clamp-1">{q.queryText}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
              </p>
              <div className="flex items-center gap-2">
                {q.deadline && q.status !== 'answered' && <Countdown deadline={q.deadline} />}
                {q.messages?.length > 0 && (
                  <span className="text-xs text-purple-500">💬 {q.messages.length}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}
