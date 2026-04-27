import {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react'
import {
  User, onAuthStateChanged, signOut,
  RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup
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
  signUpWithEmail: (email: string, password: string, name: string, phone: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
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

  const signUpWithEmail = async (email: string, password: string, name: string, phone: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const u = cred.user
    const newProfile: UserProfile = {
      uid: u.uid,
      name,
      phone,
      email: u.email ?? email,
      createdAt: new Date().toISOString(),
      lang: 'en',
    }
    await setDoc(doc(db, 'users', u.uid), newProfile)
    setProfile(newProfile)
  }

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    const u = cred.user
    
    // Check if user profile exists
    const ref = doc(db, 'users', u.uid)
    const snap = await getDoc(ref)
    
    if (!snap.exists()) {
      // Create new profile for first-time Google sign-in
      const newProfile: UserProfile = {
        uid: u.uid,
        name: u.displayName ?? '',
        phone: u.phoneNumber ?? '',
        email: u.email ?? '',
        createdAt: new Date().toISOString(),
        lang: 'en',
      }
      await setDoc(ref, newProfile)
      setProfile(newProfile)
    } else {
      setProfile(snap.data() as UserProfile)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return
    const ref = doc(db, 'users', user.uid)
    await setDoc(ref, data, { merge: true })
    setProfile(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{
      user, profile, isAdmin, loading,
      sendOtp, confirmOtp, signUpWithEmail, signInWithEmail, signInWithGoogle, logout, updateProfile
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
