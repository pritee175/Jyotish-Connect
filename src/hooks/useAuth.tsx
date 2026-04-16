import {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react'
import {
  User, onAuthStateChanged, signOut,
  RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, ADMIN_UID } from '@/lib/firebase'
import type { UserProfile } from '@/types'

interface AuthContextType {
  user:           User | null
  profile:        UserProfile | null
  isAdmin:        boolean
  loading:        boolean
  sendOtp:        (phone: string, recaptcha: RecaptchaVerifier) => Promise<ConfirmationResult>
  confirmOtp:     (result: ConfirmationResult, otp: string, name?: string) => Promise<void>
  logout:         () => Promise<void>
  updateProfile:  (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.uid === ADMIN_UID

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid))
        if (snap.exists()) {
          setProfile(snap.data() as UserProfile)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const sendOtp = (phone: string, recaptcha: RecaptchaVerifier) =>
    signInWithPhoneNumber(auth, phone, recaptcha)

  const confirmOtp = async (
    result: ConfirmationResult,
    otp: string,
    name?: string
  ) => {
    const cred = await result.confirm(otp)
    const u    = cred.user
    const ref  = doc(db, 'users', u.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      const newProfile: UserProfile = {
        uid:       u.uid,
        name:      name ?? '',
        phone:     u.phoneNumber ?? '',
        email:     u.email ?? '',
        createdAt: new Date().toISOString(),
        lang:      'en',
      }
      await setDoc(ref, newProfile)
      setProfile(newProfile)
    } else {
      setProfile(snap.data() as UserProfile)
    }
  }

  const logout = () => signOut(auth)

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, data, { merge: true })
    setProfile(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, isAdmin, loading,
      sendOtp, confirmOtp, logout, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
