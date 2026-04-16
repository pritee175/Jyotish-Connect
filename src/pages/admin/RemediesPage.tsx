import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import { getRemedies, addRemedy, deleteRemedy } from '@/lib/db'
import { Card, Button, Input, Textarea, Select, Modal, EmptyState, Spinner } from '@/components/shared/UI'
import toast from 'react-hot-toast'
import type { Remedy, RemedyType } from '@/types'

const REMEDY_TYPES: RemedyType[] = ['gemstone', 'puja', 'mantra', 'donation', 'fasting', 'other']

const REMEDY_ICONS: Record<RemedyType, string> = {
  gemstone: '💎', puja: '🪔', mantra: '📿',
  donation: '🤲', fasting: '🌙', other: '✨'
}

const emptyRemedy = (): Omit<Remedy, 'id'> => ({
  type: 'gemstone', name: '', nameMr: '', detail: '', detailMr: ''
})

export function RemediesPage() {
  const { T, remedyLabel } = useLang()
  const [remedies,   setRemedies]   = useState<Remedy[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState(emptyRemedy())
  const [saving,     setSaving]     = useState(false)
  const [filter,     setFilter]     = useState<RemedyType | 'all'>('all')

  useEffect(() => {
    const unsub = getRemedies(r => { setRemedies(r); setLoading(false) })
    return unsub
  }, [])

  const handleSave = async () => {
    if (!form.name || !form.detail) { toast.error('Name and detail required'); return }
    setSaving(true)
    try {
      await addRemedy(form)
      toast.success('Remedy added')
      setShowModal(false)
      setForm(emptyRemedy())
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this remedy?')) return
    await deleteRemedy(id)
    toast.success('Deleted')
  }

  const filtered = remedies.filter(r => filter === 'all' || r.type === filter)

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">{T('remedies')}</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>+ {T('addRemedy')}</Button>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
        {(['all', ...REMEDY_TYPES] as (RemedyType | 'all')[]).map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap font-medium transition-colors flex items-center gap-1
              ${filter === type ? 'bg-saffron-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {type !== 'all' && REMEDY_ICONS[type as RemedyType]}
            {type === 'all' ? 'All' : remedyLabel(type as RemedyType)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="💎" text="No remedies yet. Add your first remedy!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(r => (
            <Card key={r.id} className="relative">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <span className="text-xl mt-0.5">{REMEDY_ICONS[r.type]}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.nameMr}</p>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {remedyLabel(r.type)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-gray-300 hover:text-red-400 text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-2">{r.detail}</p>
              {r.detailMr && (
                <p className="text-xs text-gray-400 mt-1">{r.detailMr}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={T('addRemedy')}>
        <div className="flex flex-col gap-3">
          <Select
            label="Type"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value as RemedyType }))}
            options={REMEDY_TYPES.map(t => ({ value: t, label: `${REMEDY_ICONS[t]} ${remedyLabel(t)}` }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Name (English)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Blue Sapphire"
            />
            <Input
              label="Name (मराठी)"
              value={form.nameMr}
              onChange={e => setForm(f => ({ ...f, nameMr: e.target.value }))}
              placeholder="निळा इंद्रनीळ"
            />
          </div>
          <Textarea
            label="Details (English)"
            value={form.detail}
            onChange={e => setForm(f => ({ ...f, detail: e.target.value }))}
            rows={3}
            placeholder="Wear on the middle finger of right hand on Saturday..."
          />
          <Textarea
            label="Details (मराठी)"
            value={form.detailMr}
            onChange={e => setForm(f => ({ ...f, detailMr: e.target.value }))}
            rows={3}
            placeholder="शनिवारी उजव्या हाताच्या मधल्या बोटात घाला..."
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowModal(false)}>{T('cancel')}</Button>
            <Button loading={saving} onClick={handleSave}>{T('save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
