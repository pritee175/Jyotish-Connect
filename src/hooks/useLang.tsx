import { createContext, useContext, useState, ReactNode } from 'react'
import type { Lang } from '@/types'
import { t, domainLabel, statusLabel, remedyLabel } from '@/locales'
import type { QueryDomain, QueryStatus, RemedyType } from '@/types'

interface LangContextType {
  lang:         Lang
  toggleLang:   () => void
  T:            (key: string) => string
  domainLabel:  (d: QueryDomain) => string
  statusLabel:  (s: QueryStatus) => string
  remedyLabel:  (r: RemedyType) => string
}

const LangContext = createContext<LangContextType | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(
    () => (localStorage.getItem('lang') as Lang) ?? 'en'
  )

  const toggleLang = () => {
    const next: Lang = lang === 'en' ? 'mr' : 'en'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  const value: LangContextType = {
    lang,
    toggleLang,
    T:           (key) => t(lang, key),
    domainLabel: (d)   => domainLabel(lang, d),
    statusLabel: (s)   => statusLabel(lang, s),
    remedyLabel: (r)   => remedyLabel(lang, r),
  }

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
