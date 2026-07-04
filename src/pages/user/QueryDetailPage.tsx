import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLang } from '@/hooks/useLang'
import { useAuth } from '@/hooks/useAuth'
import { subscribeQuery, confirmPayment, addMessage } from '@/lib/db'
import { openRazorpayPayment, isRazorpayConfigured } from '@/lib/razorpay'
import {
  Card, Button, StatusBadge, DomainIcon,
  Textarea, Input, Spinner, Divider, Countdown
} from '@/components/shared/UI'
import toast from 'react-hot-toast'
import type { AstroQuery } from '@/types'

const ADMIN_UPI = import.meta.env.VITE_ADMIN_UPI ?? 'astrologer@upi'

export function QueryDetailPage() {
  const { id }        = useParams<{ id: string }>()
  const { T }         = useLang()
  const { user, profile } = useAuth()
  const navigate      = useNavigate()

  const [query,    setQuery]    = useState<AstroQuery | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [txnId,    setTxnId]    = useState('')
  const [message,  setMessage]  = useState('')
  const [sending,  setSending]  = useState(false)
  const [paying,   setPaying]   = useState(false)
  const [copied,   setCopied]   = useState(false)
  const [showManualUpi, setShowManualUpi] = useState(false)
  const razorpayEnabled = isRazorpayConfigured()

  useEffect(() => {
    if (!id) return
    const unsub = subscribeQuery(id, q => {
      setQuery(q)
      setLoading(false)
    })
    return unsub
  }, [id])

  const handleRazorpayPayment = async () => {
    if (!query || !query.fee || !user || !profile) return
    
    setPaying(true)
    try {
      await openRazorpayPayment({
        queryId: id!,
        amount: query.fee,
        userName: profile.name,
        userEmail: profile.email,
        userPhone: profile.phone,
        onSuccess: (paymentId, orderId) => {
          console.log('Payment successful:', paymentId, orderId)
          toast.success(T('paymentSubmitted'))
        },
        onFailure: (error) => {
          console.error('Payment failed:', error)
          toast.error('Payment failed. Please try again.')
        }
      })
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Failed to process payment')
    } finally {
      setPaying(false)
    }
  }

  const handleUPIPayment = async () => {
    if (!txnId.trim()) { toast.error('Enter transaction ID'); return }
    setPaying(true)
    try {
      await confirmPayment(id!, txnId)
      toast.success(T('paymentSubmitted'))
      setTxnId('')
    } catch { toast.error('Failed to submit payment') }
    finally { setPaying(false) }
  }

  const handleSendMessage = async () => {
    if (!message.trim()) return
    setSending(true)
    try {
      await addMessage(id!, 'user', message)
      setMessage('')
    } catch { toast.error('Failed to send message') }
    finally { setSending(false) }
  }

  const copyUpi = () => {
    navigator.clipboard.writeText(ADMIN_UPI)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <Spinner />
  if (!query)  return <div className="p-4 text-gray-500">Query not found</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">
        ← Back
      </button>

      {/* Header */}
      <Card className="mb-4">
        <div className="flex items-start gap-3">
          <DomainIcon domain={query.domain} size="lg" />
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900">{query.personDetails.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {query.personDetails.dob} · {query.personDetails.tob} · {query.personDetails.pob}
                </p>
              </div>
              <StatusBadge status={query.status} />
            </div>
            {query.deadline && query.status !== 'answered' && (
              <div className="mt-2">
                <Countdown deadline={query.deadline} />
              </div>
            )}
          </div>
        </div>

        <Divider />
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{query.queryText}</p>
      </Card>

      {/* Fee + Payment */}
      {query.status === 'fee_set' && query.fee && (
        <Card className="mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">{T('payNow')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-0.5">₹{query.fee}</p>
            </div>
            <span className="text-xs font-medium text-gray-400 border border-gray-200 rounded-full px-2.5 py-1 mt-1">
              Query #{id?.slice(0, 6)}
            </span>
          </div>

          {razorpayEnabled ? (
            <>
              <Button className="w-full" size="lg" loading={paying} onClick={handleRazorpayPayment}>
                Pay ₹{query.fee}
              </Button>
              <p className="text-xs text-gray-400 text-center mt-2">
                UPI, cards, netbanking & wallets — secured by Razorpay
              </p>

              <button
                onClick={() => setShowManualUpi(v => !v)}
                className="text-xs text-gray-500 hover:text-gray-700 hover:underline mt-4 block mx-auto"
              >
                {showManualUpi ? 'Hide manual payment' : 'Already paid via UPI app? Submit reference here'}
              </button>

              {showManualUpi && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <ManualUpiForm
                    adminUpi={ADMIN_UPI}
                    fee={query.fee}
                    queryId={id!}
                    copied={copied}
                    onCopy={copyUpi}
                    txnId={txnId}
                    onTxnIdChange={setTxnId}
                    paying={paying}
                    onSubmit={handleUPIPayment}
                    T={T}
                  />
                </div>
              )}
            </>
          ) : (
            <ManualUpiForm
              adminUpi={ADMIN_UPI}
              fee={query.fee}
              queryId={id!}
              copied={copied}
              onCopy={copyUpi}
              txnId={txnId}
              onTxnIdChange={setTxnId}
              paying={paying}
              onSubmit={handleUPIPayment}
              T={T}
            />
          )}
        </Card>
      )}

      {/* Clarification messages */}
      {query.messages && query.messages.length > 0 && (
        <Card className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">💬 Messages</h3>
          <div className="flex flex-col gap-3">
            {query.messages.map(m => (
              <div
                key={m.id}
                className={`rounded-lg p-3 text-sm ${
                  m.from === 'admin'
                    ? 'bg-purple-50 border border-purple-100 text-purple-900'
                    : 'bg-gray-50 border border-gray-100 text-gray-800 ml-6'
                }`}
              >
                <p className="font-medium text-xs mb-1 opacity-60">
                  {m.from === 'admin' ? '🔮 Astrologer' : '👤 You'}
                </p>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Reply input */}
          {(query.status === 'clarification' || query.status === 'in_progress') && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                placeholder="Type your reply..."
                className="flex-1"
              />
              <Button size="sm" loading={sending} onClick={handleSendMessage}>
                {T('send')}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Answer */}
      {query.answer && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <h3 className="font-semibold text-green-800 mb-3">✨ Answer</h3>
          <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
            {query.answer}
          </p>
          <p className="text-xs text-gray-400 mt-3">
            Answered {query.answeredAt ? new Date(query.answeredAt).toLocaleDateString() : ''}
          </p>
        </Card>
      )}

      {/* Person details */}
      <Card className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">📋 Person Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            ['Name', query.personDetails.name],
            ['DOB', query.personDetails.dob],
            ['Time', query.personDetails.tob || '—'],
            ['Born at', query.personDetails.pob],
            ['City', query.personDetails.currentCity || '—'],
            ['Gender', query.personDetails.gender],
            ['Relation', query.personDetails.relation],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-gray-400 text-xs">{k}</span>
              <p className="font-medium text-gray-700 break-words">{v}</p>
            </div>
          ))}
        </div>
        {query.personDetails.pastRemedies && (
          <div className="mt-3">
            <span className="text-gray-400 text-xs">Past remedies</span>
            <p className="text-sm text-gray-700 mt-1">{query.personDetails.pastRemedies}</p>
          </div>
        )}
      </Card>
    </div>
  )
}

function ManualUpiForm({
  adminUpi, fee, queryId, copied, onCopy, txnId, onTxnIdChange, paying, onSubmit, T,
}: {
  adminUpi: string
  fee: number
  queryId: string
  copied: boolean
  onCopy: () => void
  txnId: string
  onTxnIdChange: (v: string) => void
  paying: boolean
  onSubmit: () => void
  T: (k: string) => string
}) {
  return (
    <div>
      <a
        href={`upi://pay?pa=${adminUpi}&pn=JyotishConnect&am=${fee}&cu=INR&tn=Astrology%20Consultation%20Query%20${queryId.slice(0, 8)}`}
        className="flex items-center justify-center gap-2 w-full bg-saffron-500 text-white text-center py-3 rounded-lg text-sm font-semibold hover:bg-saffron-600 active:bg-saffron-700 transition-colors mb-3"
      >
        Pay via GPay / PhonePe / Paytm
      </a>

      <div className="relative mb-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-gray-400">or pay manually and enter reference below</span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
        <span className="text-sm font-mono text-gray-800 flex-1 break-all">{adminUpi}</span>
        <button
          onClick={onCopy}
          className="text-xs text-saffron-600 font-medium hover:underline whitespace-nowrap shrink-0"
        >
          {copied ? '✓ ' + T('copied') : T('copyUpi')}
        </button>
      </div>

      <Input
        label={T('transactionId')}
        value={txnId}
        onChange={e => onTxnIdChange(e.target.value)}
        placeholder="e.g. YBL123456789"
      />
      <Button className="w-full mt-3" variant="secondary" loading={paying} onClick={onSubmit}>
        {T('submitPayment')}
      </Button>
    </div>
  )
}
