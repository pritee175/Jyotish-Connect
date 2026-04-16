import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { getUserQueries } from '@/lib/db'
import { Card, StatusBadge, DomainIcon, EmptyState, Spinner, Countdown } from '@/components/shared/UI'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import type { AstroQuery } from '@/types'

export function UserQueriesPage() {
  const { user }   = useAuth()
  const { T, domainLabel } = useLang()
  const [queries,  setQueries]  = useState<AstroQuery[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = getUserQueries(user.uid, q => { setQueries(q); setLoading(false) })
    return unsub
  }, [user])

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">{T('myQueries')}</h1>
        <Link to="/app/ask">
          <button className="bg-saffron-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-saffron-600 transition-colors">
            + {T('askQuery')}
          </button>
        </Link>
      </div>

      {queries.length === 0 ? (
        <EmptyState icon="🔮" text={T('noQueries')} />
      ) : (
        <div className="flex flex-col gap-3">
          {queries.map(q => (
            <Link key={q.id} to={`/app/query/${q.id}`}>
              <Card className="hover:shadow-md hover:border-saffron-100 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <DomainIcon domain={q.domain} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{domainLabel(q.domain)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{q.personDetails.name} · {q.personDetails.pob}</p>
                      </div>
                      <StatusBadge status={q.status} />
                    </div>

                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{q.queryText}</p>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                      </p>
                      <div className="flex items-center gap-3">
                        {q.fee && (
                          <span className="text-xs font-medium text-saffron-600">₹{q.fee}</span>
                        )}
                        {q.deadline && q.status !== 'answered' && (
                          <Countdown deadline={q.deadline} />
                        )}
                        {q.messages?.length > 0 && (
                          <span className="text-xs text-purple-600">
                            💬 {q.messages.length} message{q.messages.length > 1 ? 's' : ''}
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
