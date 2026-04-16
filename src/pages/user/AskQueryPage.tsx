import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { submitQuery, getSavedPersons, savePersonForUser } from '@/lib/db'
import { Button, Input, Textarea, Select, Card, Modal, DomainIcon } from '@/components/shared/UI'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { QueryDomain, PersonDetails, SavedPerson } from '@/types'

const DOMAINS: QueryDomain[] = [
  'career', 'marriage', 'daily_life', 'baby_children',
  'health', 'finance', 'education', 'property', 'travel', 'others'
]

const RELATIONS = ['self', 'spouse', 'child', 'parent', 'sibling', 'friend', 'other']

const emptyPerson = (): PersonDetails => ({
  name: '', dob: '', tob: '', pob: '', currentCity: '',
  gender: 'male', relation: 'self', pastRemedies: ''
})

export function AskQueryPage() {
  const { user, profile } = useAuth()
  const { T, domainLabel } = useLang()
  const navigate = useNavigate()

  const [step,          setStep]          = useState<1 | 2 | 3>(1)
  const [domain,        setDomain]        = useState<QueryDomain | ''>('')
  const [person,        setPerson]        = useState<PersonDetails>(emptyPerson())
  const [queryText,     setQueryText]     = useState('')
  const [savePerson,    setSavePerson]    = useState(false)
  const [savedPersons,  setSavedPersons]  = useState<SavedPerson[]>([])
  const [showSaved,     setShowSaved]     = useState(false)
  const [loading,       setLoading]       = useState(false)

  useEffect(() => {
    if (user) getSavedPersons(user.uid).then(setSavedPersons)
  }, [user])

  const updatePerson = (k: keyof PersonDetails, v: string) =>
    setPerson(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!user || !profile || !domain) return
    if (!person.name || !person.dob || !person.pob) {
      toast.error('Please fill all required person details')
      return
    }
    if (!queryText.trim()) {
      toast.error('Please enter your question')
      return
    }
    setLoading(true)
    try {
      if (savePerson) await savePersonForUser(user.uid, person)
      await submitQuery(
        user.uid, profile.name || 'User',
        profile.phone || '', domain, person, queryText
      )
      toast.success(T('querySubmitted'))
      navigate('/app/queries')
    } catch (e) {
      toast.error('Failed to submit query')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">{T('askQuery')}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {step === 1 ? T('selectDomain') : step === 2 ? T('personDetails') : T('queryText')}
      </p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
              ${step >= s ? 'bg-saffron-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-saffron-400' : 'bg-gray-100'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Domain */}
      {step === 1 && (
        <div>
          <div className="grid grid-cols-2 gap-3">
            {DOMAINS.map(d => (
              <button
                key={d}
                onClick={() => setDomain(d)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                  ${domain === d
                    ? 'border-saffron-400 bg-saffron-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-saffron-200 hover:bg-saffron-50/40'}`}
              >
                <DomainIcon domain={d} />
                <span className="text-sm font-medium text-gray-800">{domainLabel(d)}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <Button disabled={!domain} onClick={() => setStep(2)}>
              Next →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Person Details */}
      {step === 2 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium text-gray-800">{T('personDetails')}</h2>
            {savedPersons.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowSaved(true)}>
                {T('loadSavedPerson')}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={`${T('personName')} *`}
              value={person.name}
              onChange={e => updatePerson('name', e.target.value)}
              placeholder="Ramesh Kulkarni"
            />
            <Select
              label={T('relation')}
              value={person.relation}
              onChange={e => updatePerson('relation', e.target.value)}
              options={RELATIONS.map(r => ({ value: r, label: T(r) }))}
            />
            <Input
              label={`${T('dob')} *`}
              type="date"
              value={person.dob}
              onChange={e => updatePerson('dob', e.target.value)}
            />
            <Input
              label={T('tob')}
              type="time"
              value={person.tob}
              onChange={e => updatePerson('tob', e.target.value)}
            />
            <Input
              label={`${T('pob')} *`}
              value={person.pob}
              onChange={e => updatePerson('pob', e.target.value)}
              placeholder="Pune, Maharashtra"
            />
            <Input
              label={T('currentCity')}
              value={person.currentCity}
              onChange={e => updatePerson('currentCity', e.target.value)}
              placeholder="Mumbai"
            />
            <Select
              label={T('gender')}
              value={person.gender}
              onChange={e => updatePerson('gender', e.target.value as PersonDetails['gender'])}
              options={[
                { value: 'male',   label: T('male') },
                { value: 'female', label: T('female') },
                { value: 'other',  label: T('other') },
              ]}
            />
          </div>

          <div className="mt-3">
            <Textarea
              label={T('pastRemedies')}
              value={person.pastRemedies ?? ''}
              onChange={e => updatePerson('pastRemedies', e.target.value)}
              rows={2}
              placeholder="e.g. Wearing blue sapphire since 2020..."
            />
          </div>

          {/* Save person checkbox */}
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={savePerson}
              onChange={e => setSavePerson(e.target.checked)}
              className="accent-saffron-500 w-4 h-4"
            />
            <span className="text-sm text-gray-600">{T('saveThisPerson')}</span>
          </label>

          <div className="mt-5 flex gap-3 justify-between">
            <Button variant="secondary" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={() => setStep(3)}>Next →</Button>
          </div>
        </Card>
      )}

      {/* Step 3 — Query Text */}
      {step === 3 && (
        <Card>
          {/* Summary */}
          <div className="flex items-center gap-3 bg-saffron-50 rounded-lg p-3 mb-4">
            <DomainIcon domain={domain} />
            <div>
              <p className="text-sm font-medium text-gray-800">{domainLabel(domain as QueryDomain)}</p>
              <p className="text-xs text-gray-500">{person.name} · {person.dob} · {person.pob}</p>
            </div>
          </div>

          <Textarea
            label={`${T('queryText')} *`}
            value={queryText}
            onChange={e => setQueryText(e.target.value)}
            rows={6}
            placeholder={T('queryPlaceholder')}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{queryText.length} chars</p>

          <div className="mt-5 flex gap-3 justify-between">
            <Button variant="secondary" onClick={() => setStep(2)}>← Back</Button>
            <Button loading={loading} onClick={handleSubmit}>
              🚀 {T('submitQuery')}
            </Button>
          </div>
        </Card>
      )}

      {/* Load saved person modal */}
      <Modal open={showSaved} onClose={() => setShowSaved(false)} title={T('loadSavedPerson')}>
        <div className="flex flex-col gap-2">
          {savedPersons.map(sp => (
            <button
              key={sp.id}
              className="text-left p-3 rounded-lg border border-gray-100 hover:bg-saffron-50 hover:border-saffron-200 transition-colors"
              onClick={() => { setPerson(sp.details); setShowSaved(false) }}
            >
              <p className="font-medium text-sm text-gray-800">{sp.details.name}</p>
              <p className="text-xs text-gray-500">{sp.details.dob} · {sp.details.pob} · {T(sp.details.relation)}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
