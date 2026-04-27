import { useState, useEffect, useRef } from 'react'

// Web Speech API — not fully typed in standard TS DOM lib
interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative
  readonly length: number
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
  readonly confidence: number
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult
  readonly length: number
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
  readonly resultIndex: number
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((e: SpeechRecognitionEvent) => void) | null
  onerror:  ((e: Event) => void) | null
  onend:    (() => void) | null
}
declare global {
  interface Window {
    SpeechRecognition:        new () => ISpeechRecognition
    webkitSpeechRecognition:  new () => ISpeechRecognition
  }
}
import { useParams, useNavigate } from 'react-router-dom'
import { useLang } from '@/hooks/useLang'
import {
  getQuery, setQueryFee, updateQueryStatus,
  sendAnswer, addMessage, getTemplates, getRemedies
} from '@/lib/db'
import {
  Card, Button, Textarea, StatusBadge,
  DomainIcon, Modal, Spinner, Divider, Countdown
} from '@/components/shared/UI'
import toast from 'react-hot-toast'
import type { AstroQuery, AnswerTemplate, Remedy } from '@/types'

export function AdminQueryDetail() {
  const { id }     = useParams<{ id: string }>()
  const { T, lang } = useLang()
  const navigate   = useNavigate()

  const [query,       setQuery]       = useState<AstroQuery | null>(null)
  const [templates,   setTemplates]   = useState<AnswerTemplate[]>([])
  const [remedies,    setRemedies]    = useState<Remedy[]>([])
  const [loading,     setLoading]     = useState(true)
  const [fee,         setFee]         = useState('')
  const [answer,      setAnswer]      = useState('')
  const [message,     setMessage]     = useState('')
  const [usedTpls,    setUsedTpls]    = useState<string[]>([])
  const [showTpl,     setShowTpl]     = useState(false)
  const [showRemedy,  setShowRemedy]  = useState(false)
  const [tplSearch,   setTplSearch]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [listening,   setListening]   = useState(false)
  const answerRef      = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const answerBaseRef  = useRef('')   // answer text at the moment recording started

  useEffect(() => {
    if (!id) return
    getQuery(id).then(q => { setQuery(q); setLoading(false) })
    const unsubT = getTemplates(setTemplates)
    const unsubR = getRemedies(setRemedies)
    return () => { unsubT(); unsubR() }
  }, [id])

  // Voice recognition setup
  const startListening = () => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SR) { toast.error('Voice not supported in this browser'); return }
    answerBaseRef.current = answer   // snapshot existing text before recording
    const rec = new SR()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = 'hi-IN'   // Hindi; falls back to Devanagari
    rec.onresult = (e: SpeechRecognitionEvent) => {
      // Rebuild full spoken text from all results each time to avoid duplicates
      // (interim results get re-fired as final — appending would double them)
      let spoken = ''
      for (let i = 0; i < e.results.length; i++) {
        spoken += e.results[i][0].transcript
      }
      const base = answerBaseRef.current
      setAnswer(base + (base ? '\n' : '') + spoken)
    }
    rec.onerror = () => { setListening(false) }
    rec.onend   = () => { setListening(false) }
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const insertTemplate = (tpl: AnswerTemplate) => {
    const content = lang === 'mr' ? tpl.contentMr : tpl.content
    setAnswer(prev => prev ? prev + '\n\n' + content : content)
    if (!usedTpls.includes(tpl.id)) setUsedTpls(prev => [...prev, tpl.id])
    setShowTpl(false)
    toast.success('Template inserted')
  }

  const insertRemedy = (r: Remedy) => {
    const text = `\n\nUPAY / उपाय:\n${r.name} — ${r.detail}`
    setAnswer(prev => prev + text)
    setShowRemedy(false)
    toast.success('Remedy inserted')
  }

  const handleSetFee = async () => {
    const n = parseInt(fee)
    if (!n || n <= 0) { toast.error('Enter valid fee'); return }
    setSubmitting(true)
    try {
      await setQueryFee(id!, n)
      toast.success('Fee set. Customer will be notified.')
      setQuery(q => q ? { ...q, status: 'fee_set', fee: n } : null)
    } catch { toast.error('Failed') }
    finally { setSubmitting(false) }
  }

  const handleReject = async () => {
    if (!confirm('Reject this query?')) return
    await updateQueryStatus(id!, 'rejected')
    navigate('/admin/inbox')
  }

  const handleMarkInProgress = async () => {
    await updateQueryStatus(id!, 'in_progress')
    setQuery(q => q ? { ...q, status: 'in_progress' } : null)
    toast.success('Marked in progress')
  }

  const handleSendAnswer = async () => {
    if (!answer.trim()) { toast.error('Write an answer first'); return }
    setSubmitting(true)
    try {
      await sendAnswer(id!, answer, usedTpls)
      toast.success(T('answerSent'))
      navigate('/admin/inbox')
    } catch { toast.error('Failed to send answer') }
    finally { setSubmitting(false) }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    await addMessage(id!, 'admin', message)
    setMessage('')
    toast.success('Message sent')
  }

  const filteredTpls = templates.filter(t =>
    !tplSearch ||
    t.title.toLowerCase().includes(tplSearch.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(tplSearch.toLowerCase())) ||
    (query?.domain && (t.domain === query.domain || t.domain === 'general'))
  )

  if (loading)  return <Spinner />
  if (!query)   return <div className="p-4 text-gray-500">Query not found</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4 flex items-center gap-1 hover:text-gray-700">
        ← Back
      </button>

      {/* Query header */}
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <DomainIcon domain={query.domain} size="lg" />
            <div>
              <p className="font-semibold text-gray-900">{query.userName}</p>
              <p className="text-xs text-gray-500">{query.userPhone}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(query.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={query.status} />
            {query.fee && <span className="text-sm font-semibold text-saffron-600">₹{query.fee}</span>}
            {query.paymentMethod && (
              <span className="text-xs text-gray-500">
                {query.paymentMethod === 'razorpay' ? '💳 Razorpay' : '📱 UPI'}
              </span>
            )}
            {query.deadline && <Countdown deadline={query.deadline} />}
          </div>
        </div>

        <Divider />

        {/* Person details */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs mb-3">
          {[
            ['Name',   query.personDetails.name],
            ['DOB',    query.personDetails.dob],
            ['Time',   query.personDetails.tob || '—'],
            ['Born',   query.personDetails.pob],
            ['City',   query.personDetails.currentCity || '—'],
            ['Gender', query.personDetails.gender],
          ].map(([k, v]) => (
            <div key={k} className="bg-gray-50 rounded p-2">
              <p className="text-gray-400">{k}</p>
              <p className="font-medium text-gray-800 truncate">{v}</p>
            </div>
          ))}
        </div>
        {query.personDetails.pastRemedies && (
          <p className="text-xs text-gray-500 bg-amber-50 rounded p-2">
            <strong>Past remedies:</strong> {query.personDetails.pastRemedies}
          </p>
        )}

        <Divider />
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{query.queryText}</p>
      </Card>

      {/* Action: Set Fee (for new queries) */}
      {query.status === 'pending_review' && (
        <Card className="mb-4 border-orange-200 bg-orange-50">
          <h3 className="font-semibold text-gray-900 mb-3">Set Consultation Fee</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
              <input
                type="number"
                value={fee}
                onChange={e => setFee(e.target.value)}
                placeholder="500"
                className="border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm w-full outline-none focus:border-saffron-400"
              />
            </div>
            {/* Quick fee buttons */}
            <div className="flex gap-2">
              {[200, 300, 500, 1000].map(v => (
                <button
                  key={v}
                  onClick={() => setFee(String(v))}
                  className="px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:border-saffron-300 hover:bg-saffron-50 flex-1 sm:flex-none"
                >
                  ₹{v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button loading={submitting} onClick={handleSetFee} className="flex-1">
              ✓ {T('approve')}
            </Button>
            <Button variant="danger" size="sm" onClick={handleReject}>
              {T('reject')}
            </Button>
          </div>
        </Card>
      )}

      {/* Action: Clarification + Answer (for paid queries) */}
      {(query.status === 'paid' || query.status === 'in_progress' || query.status === 'clarification') && (
        <>
          {/* Quick actions */}
          {query.status === 'paid' && (
            <div className="mb-3">
              <Button variant="secondary" size="sm" onClick={handleMarkInProgress}>
                Mark In Progress
              </Button>
            </div>
          )}

          {/* Clarification */}
          <Card className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm">💬 {T('askClarification')}</h3>
            {query.messages?.map(m => (
              <div
                key={m.id}
                className={`rounded-lg p-3 text-sm mb-2 ${
                  m.from === 'admin'
                    ? 'bg-purple-50 border border-purple-100'
                    : 'bg-gray-50 border border-gray-100 ml-4'
                }`}
              >
                <p className="text-xs text-gray-400 mb-1">
                  {m.from === 'admin' ? '🔮 You' : '👤 Customer'}
                </p>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="Ask for more info..."
                className="flex-1"
              />
              <Button size="sm" onClick={handleSendMessage}>{T('send')}</Button>
            </div>
          </Card>

          {/* Answer panel */}
          <Card className="mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="font-semibold text-gray-900">{T('sendAnswer')}</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => setShowTpl(true)}>
                  📄 <span className="hidden sm:inline">{T('insertTemplate')}</span><span className="sm:hidden">Template</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowRemedy(true)}>
                  💎 <span className="hidden sm:inline">{T('insertRemedy')}</span><span className="sm:hidden">Remedy</span>
                </Button>
                <button
                  onClick={listening ? stopListening : startListening}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    listening
                      ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-purple-50'
                  }`}
                >
                  🎤 {listening ? 'Stop' : <span className="hidden sm:inline">{T('useVoice')}</span>}<span className="sm:hidden">Voice</span>
                </button>
              </div>
            </div>

            <textarea
              ref={answerRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              rows={10}
              placeholder={T('answerPlaceholder')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-saffron-400 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{answer.length} chars</p>

            {usedTpls.length > 0 && (
              <p className="text-xs text-purple-500 mt-1">
                Using {usedTpls.length} template(s)
              </p>
            )}

            <Button
              className="w-full mt-3"
              variant="success"
              loading={submitting}
              onClick={handleSendAnswer}
            >
              🚀 {T('sendAnswer')}
            </Button>
          </Card>
        </>
      )}

      {/* Answered — show sent answer */}
      {(query.status === 'answered' || query.status === 'closed') && query.answer && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-800 mb-2">✅ Answer Sent</h3>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{query.answer}</p>
          <p className="text-xs text-gray-400 mt-3">
            {query.answeredAt ? new Date(query.answeredAt).toLocaleString() : ''}
          </p>
        </Card>
      )}

      {/* Template picker modal */}
      <Modal open={showTpl} onClose={() => setShowTpl(false)} title={T('insertTemplate')}>
        <input
          type="search"
          value={tplSearch}
          onChange={e => setTplSearch(e.target.value)}
          placeholder={T('search')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-saffron-400"
        />
        {filteredTpls.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No templates found</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {filteredTpls.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => insertTemplate(tpl)}
                className="text-left p-3 rounded-lg border border-gray-100 hover:border-saffron-300 hover:bg-saffron-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-gray-900">{tpl.title}</p>
                  <span className="text-xs text-gray-400">Used {tpl.usedCount}x</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{tpl.titleMr}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tpl.content}</p>
                {tpl.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {tpl.tags.map(tag => (
                      <span key={tag} className="text-xs bg-saffron-50 text-saffron-700 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Remedy picker modal */}
      <Modal open={showRemedy} onClose={() => setShowRemedy(false)} title={T('insertRemedy')}>
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {remedies.map(r => (
            <button
              key={r.id}
              onClick={() => insertRemedy(r)}
              className="text-left p-3 rounded-lg border border-gray-100 hover:border-saffron-300 hover:bg-saffron-50"
            >
              <p className="font-medium text-sm text-gray-900">{r.name}</p>
              <p className="text-xs text-gray-400">{r.nameMr}</p>
              <p className="text-xs text-gray-600 mt-1">{r.detail}</p>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
