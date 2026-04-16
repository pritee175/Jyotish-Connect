import { useState, useRef, useEffect } from 'react'
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { useLang } from '@/hooks/useLang'
import { Button, Input } from '@/components/shared/UI'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { sendOtp, confirmOtp, user, isAdmin } = useAuth()
  const { T } = useLang()
  const navigate = useNavigate()

  const [step,        setStep]        = useState<'phone' | 'otp'>('phone')
  const [isNew,       setIsNew]       = useState(false)
  const [phone,       setPhone]       = useState('+91')
  const [name,        setName]        = useState('')
  const [otp,         setOtp]         = useState('')
  const [loading,     setLoading]     = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const recaptchaRef  = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    if (user) navigate(isAdmin ? '/admin/dashboard' : '/app/queries')
  }, [user, isAdmin, navigate])

  const initRecaptcha = () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
    return recaptchaRef.current
  }

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error('Enter a valid phone number')
      return
    }
    setLoading(true)
    try {
      const recaptcha = initRecaptcha()
      const result    = await sendOtp(phone, recaptcha)
      setConfirmation(result)
      setStep('otp')
      toast.success(T('otpSent'))
    } catch (e: unknown) {
      toast.error('Failed to send OTP. Check phone number.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!confirmation || otp.length !== 6) {
      toast.error('Enter 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      await confirmOtp(confirmation, otp, isNew ? name : undefined)
    } catch (e: unknown) {
      toast.error('Invalid OTP. Try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-saffron-50 to-white flex flex-col items-center justify-center p-4">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🔮</div>
        <h1 className="text-2xl font-bold text-gray-900">{T('appName')}</h1>
        <p className="text-gray-500 text-sm mt-1">{T('tagline')}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-6">

        {step === 'phone' && (
          <>
            <h2 className="font-semibold text-gray-800 mb-4">
              {isNew ? T('register') : T('login')}
            </h2>

            {isNew && (
              <div className="mb-3">
                <Input
                  label={T('name')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
            )}

            <div className="mb-4">
              <Input
                label={T('phoneNumber')}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                type="tel"
              />
            </div>

            <Button className="w-full" loading={loading} onClick={handleSendOtp}>
              {T('sendOtp')}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              {isNew ? T('existingUser') : T('newUser')}{' '}
              <button
                className="text-saffron-600 font-medium hover:underline"
                onClick={() => setIsNew(!isNew)}
              >
                {isNew ? T('login') : T('register')}
              </button>
            </p>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="font-semibold text-gray-800 mb-1">{T('verifyOtp')}</h2>
            <p className="text-sm text-gray-500 mb-4">{T('otpSent')} {phone}</p>

            <div className="mb-4">
              <Input
                label={T('enterOtp')}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                type="text"
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <Button className="w-full" loading={loading} onClick={handleVerifyOtp}>
              {T('verifyOtp')}
            </Button>

            <button
              className="text-sm text-gray-500 mt-3 w-full text-center hover:underline"
              onClick={() => { setStep('phone'); setOtp('') }}
            >
              ← Change number
            </button>
          </>
        )}
      </div>

      {/* Invisible reCAPTCHA */}
      <div id="recaptcha-container" />
    </div>
  )
}
