import { useState, useEffect } from 'react'
import { useLang } from '@/hooks/useLang'
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from '@/lib/db'
import { Card, Button, Input, Textarea, Modal, EmptyState, Spinner } from '@/components/shared/UI'
import toast from 'react-hot-toast'
import type { AnswerTemplate, QueryDomain } from '@/types'

const DOMAINS: (QueryDomain | 'general')[] = [
  'general', 'career', 'marriage', 'daily_life', 'baby_children',
  'health', 'finance', 'education', 'property', 'travel', 'others'
]

const empty = (): Omit<AnswerTemplate, 'id' | 'usedCount' | 'createdAt'> => ({
  title: '', titleMr: '', domain: 'general',
  content: '', contentMr: '', tags: []
})

export function TemplatesPage() {
  const { T, domainLabel } = useLang()
  const [templates,  setTemplates]  = useState<AnswerTemplate[]>([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editing,    setEditing]    = useState<AnswerTemplate | null>(null)
  const [form,       setForm]       = useState(empty())
  const [tagsInput,  setTagsInput]  = useState('')
  const [search,     setSearch]     = useState('')
  const [saving,     setSaving]     = useState(false)

  useEffect(() => {
    const unsub = getTemplates(t => { setTemplates(t); setLoading(false) })
    return unsub
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(empty())
    setTagsInput('')
    setShowModal(true)
  }

  const openEdit = (tpl: AnswerTemplate) => {
    setEditing(tpl)
    setForm({
      title: tpl.title, titleMr: tpl.titleMr,
      domain: tpl.domain, content: tpl.content,
      contentMr: tpl.contentMr, tags: tpl.tags
    })
    setTagsInput(tpl.tags.join(', '))
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error('Title and content required'); return }
    setSaving(true)
    try {
      const data = { ...form, tags: tagsInput.split(',').map(s => s.trim()).filter(Boolean) }
      if (editing) {
        await updateTemplate(editing.id, data)
        toast.success('Template updated')
      } else {
        await addTemplate(data)
        toast.success('Template added')
      }
      setShowModal(false)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    await deleteTemplate(id)
    toast.success('Deleted')
  }

  const filtered = templates.filter(t =>
    !search ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.titleMr.includes(search) ||
    t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) return <Spinner />

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900">{T('templates')}</h1>
        <Button size="sm" onClick={openAdd}>+ {T('addTemplate')}</Button>
      </div>

      <input
        type="search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={T('search') + ' templates...'}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-saffron-400"
      />

      {filtered.length === 0 ? (
        <EmptyState icon="📄" text="No templates yet. Add your first template!" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(tpl => (
            <Card key={tpl.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm">{tpl.title}</p>
                    <span className="text-xs bg-saffron-50 text-saffron-700 px-2 py-0.5 rounded-full">
                      {tpl.domain === 'general' ? 'General' : domainLabel(tpl.domain as QueryDomain)}
                    </span>
                    <span className="text-xs text-gray-400">Used {tpl.usedCount}×</span>
                  </div>
                  {tpl.titleMr && (
                    <p className="text-xs text-gray-400 mt-0.5">{tpl.titleMr}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3 whitespace-pre-wrap">
                    {tpl.content}
                  </p>
                  {tpl.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {tpl.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(tpl)}>✏️</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tpl.id)}
                    className="text-red-500 hover:bg-red-50">🗑</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Edit Template' : T('addTemplate')}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={T('templateTitle') + ' (English)'}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Marriage delay answer"
            />
            <Input
              label={T('templateTitle') + ' (मराठी)'}
              value={form.titleMr}
              onChange={e => setForm(f => ({ ...f, titleMr: e.target.value }))}
              placeholder="विवाह विलंब उत्तर"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Domain</label>
            <select
              value={form.domain}
              onChange={e => setForm(f => ({ ...f, domain: e.target.value as typeof form.domain }))}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-saffron-400"
            >
              {DOMAINS.map(d => (
                <option key={d} value={d}>
                  {d === 'general' ? 'General (all domains)' : domainLabel(d as QueryDomain)}
                </option>
              ))}
            </select>
          </div>

          <Textarea
            label={T('templateContent') + ' (English)'}
            value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            rows={5}
            placeholder="Based on the birth chart analysis..."
          />
          <Textarea
            label={T('templateContent') + ' (मराठी)'}
            value={form.contentMr}
            onChange={e => setForm(f => ({ ...f, contentMr: e.target.value }))}
            rows={5}
            placeholder="जन्मकुंडलीच्या विश्लेषणानुसार..."
          />
          <Input
            label={T('tags')}
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="marriage, delay, saturn, शनि"
          />

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>{T('cancel')}</Button>
            <Button loading={saving} onClick={handleSave}>{T('save')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
