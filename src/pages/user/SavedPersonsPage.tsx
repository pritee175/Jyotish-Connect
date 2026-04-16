import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { getSavedPersons, deleteSavedPerson } from '@/lib/db'
import { Card, Button, EmptyState, Spinner } from '@/components/shared/UI'
import toast from 'react-hot-toast'
import type { SavedPerson } from '@/types'

export function SavedPersonsPage() {
  const { user }   = useAuth()
  const { T }      = useLang()
  const [persons,  setPersons]  = useState<SavedPerson[]>([])
  const [loading,  setLoading]  = useState(true)

  const load = async () => {
    if (!user) return
    const p = await getSavedPersons(user.uid)
    setPersons(p)
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const handleDelete = async (id: string) => {
    if (!user) return
    if (!confirm('Delete this saved person?')) return
    try {
      await deleteSavedPerson(user.uid, id)
      setPersons(p => p.filter(x => x.id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{T('savedPersons')}</h1>

      {persons.length === 0 ? (
        <EmptyState icon="👥" text="No saved persons yet. Save a person while submitting a query." />
      ) : (
        <div className="flex flex-col gap-3">
          {persons.map(sp => (
            <Card key={sp.id} className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">{sp.details.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {sp.details.dob} · {sp.details.pob} · {T(sp.details.relation)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {sp.details.gender} · {sp.details.currentCity}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(sp.id)}
                className="text-red-500 hover:bg-red-50">
                🗑
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
