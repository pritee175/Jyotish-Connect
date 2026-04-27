import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLang } from '@/hooks/useLang'
import { useAuth } from '@/hooks/useAuth'
import { subscribeQuery, confirmPayment, addMessage } from '@/lib/db'
import { openRazorpayPayment } from '@/lib/razorpay'
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
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi'>('razorpay')

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
        <Card className="mb-4 border-yellow-200 bg-yellow-50">
          <h3 className="font-semibold text-gray-900 mb-1">💳 {T('payNow')}</h3>
          <p className="text-2xl font-bold text-saffron-600 mb-3">₹{query.fee}</p>
          <p className="text-sm text-gray-600 mb-4">{T('paymentInstructions')}</p>

          {/* Payment Method Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPaymentMethod('razorpay')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                paymentMethod === 'razorpay'
                  ? 'bg-saffron-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              💳 Card/UPI/Wallet
            </button>
            <button
              onClick={() => setPaymentMethod('upi')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                paymentMethod === 'upi'
                  ? 'bg-saffron-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              📱 Manual UPI
            </button>
          </div>

          {/* Razorpay Payment */}
          {paymentMethod === 'razorpay' && (
            <div>
              <div className="bg-white border border-yellow-200 rounded-lg p-4 mb-3">
                <p className="text-sm text-gray-700 mb-2">✅ Secure payment via Razorpay</p>
                <p className="text-xs text-gray-500">
                  • Pay with Credit/Debit Card, UPI, Netbanking, or Wallet
                  <br />• Instant payment confirmation
                  <br />• No need to enter transaction ID
                </p>
              </div>
              <Button 
                className="w-full" 
                loading={paying} 
                onClick={handleRazorpayPayment}
              >
                🔒 Pay ₹{query.fee} Securely
              </Button>
            </div>
          )}

          {/* Manual UPI Payment */}
          {paymentMethod === 'upi' && (
            <div>
              {/* UPI ID */}
              <div className="flex items-center gap-2 bg-white border border-yellow-200 rounded-lg p-3 mb-3">
                <span className="text-sm font-mono text-gray-800 flex-1 break-all">{ADMIN_UPI}</span>
                <button
                  onClick={copyUpi}
                  className="text-xs text-saffron-600 font-medium hover:underline whitespace-nowrap shrink-0"
                >
                  {copied ? '✓ ' + T('copied') : T('copyUpi')}
                </button>
              </div>

              {/* UPI deeplink */}
              <a
                href={`upi://pay?pa=${ADMIN_UPI}&am=${query.fee}&tn=AstroQuery`}
                className="block w-full bg-saffron-500 text-white text-center py-3 rounded-lg text-sm font-medium hover:bg-saffron-600 mb-3 active:bg-saffron-700"
              >
                📱 Open GPay / PhonePe / Paytm
              </a>

              <Input
                label={T('transactionId')}
                value={txnId}
                onChange={e => setTxnId(e.target.value)}
                placeholder="e.g. YBL123456789"
              />
              <Button className="w-full mt-3" loading={paying} onClick={handleUPIPayment}>
                {T('submitPayment')}
              </Button>
            </div>
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
