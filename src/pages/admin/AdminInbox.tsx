import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import { getAllQueries } from '@/lib/db'
import { Card, StatusBadge, DomainIcon, EmptyState, Spinner, Countdown } from '@/components/shared/UI'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { AstroQuery, QueryStatus } from '@/types'
import clsx from 'clsx'

const FILTERS: { label: string; statuses: QueryStatus[] | 'all' }[] = [
  { label: 'All',       statuses: 'all' },
  { label: 'New',       statuses: ['pending_review'] },
  { label: 'Fee Set',   statuses: ['fee_set'] },
  { label: 'Paid',      statuses: ['paid', 'in_progress', 'clarification'] },
  { label: 'Answered',  statuses: ['answered', 'closed'] },
  { label: 'Rejected',  statuses: ['rejected'] },
]

export function AdminInbox() {
  const { T, domainLabel } = useLang()
  const [queries,   setQueries]   = useState<AstroQuery[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<number>(1)  // default: New
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    const unsub = getAllQueries(q => { setQueries(q); setLoading(false) })
    return unsub
  }, [])

  const active   = FILTERS[filter]
  const filtered = queries.filter(q => {
    const matchStatus = active.statuses === 'all' || active.statuses.includes(q.status)
    const matchSearch = !search || [q.userName, q.userPhone, q.personDetails.name, q.queryText]
      .some(s => s.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-4">{T('queryInbox')}</h1>

      {/* Search */}
      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={T('search') + ' queries...'}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-saffron-400"
      />

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
        {FILTERS.map((f, i) => {
          const count = queries.filter(q =>
            f.statuses === 'all' || f.statuses.includes(q.status)
          ).length
          return (
            <button
              key={i}
              onClick={() => setFilter(i)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-colors',
                filter === i
                  ? 'bg-saffron-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f.label} {count > 0 && `(${count})`}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📭" text="No queries in this category" />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(q => (
            <Link key={q.id} to={`/admin/query/${q.id}`}>
              <Card className="hover:shadow-md hover:border-saffron-100 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <DomainIcon domain={q.domain} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{q.userName}</p>
                        <p className="text-xs text-gray-500">
                          {q.personDetails.name} · {domainLabel(q.domain)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={q.status} />
                        {q.fee && (
                          <span className="text-xs font-medium text-saffron-600">₹{q.fee}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{q.queryText}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                      </p>
                      <div className="flex items-center gap-2">
                        {q.deadline && q.status !== 'answered' && (
                          <Countdown deadline={q.deadline} />
                        )}
                        {(q.messages?.length ?? 0) > 0 && (
                          <span className="text-xs text-purple-500">
                            💬 {q.messages.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
