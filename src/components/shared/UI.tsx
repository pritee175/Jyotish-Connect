import { ReactNode, ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import type { QueryStatus } from '@/types'
import { useLang } from '@/hooks/useLang'

// ─── Button ───────────────────────────────────────────────────────────────────
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?:    'sm' | 'md' | 'lg'
  loading?: boolean
}
export function Button({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-saffron-500 text-white hover:bg-saffron-600 active:bg-saffron-700',
    secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    ghost:     'text-saffron-600 hover:bg-saffron-50',
    success:   'bg-green-600 text-white hover:bg-green-700',
  }
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  }
  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100 p-4', className)}>
      {children}
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusColors: Record<QueryStatus, string> = {
  pending_review: 'bg-gray-100 text-gray-700',
  fee_set:        'bg-yellow-100 text-yellow-800',
  paid:           'bg-blue-100 text-blue-800',
  in_progress:    'bg-purple-100 text-purple-800',
  clarification:  'bg-orange-100 text-orange-800',
  answered:       'bg-green-100 text-green-800',
  closed:         'bg-gray-200 text-gray-600',
  rejected:       'bg-red-100 text-red-700',
}

export function StatusBadge({ status }: { status: QueryStatus }) {
  const { statusLabel } = useLang()
  return (
    <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-medium', statusColors[status])}>
      {statusLabel(status)}
    </span>
  )
}

// ─── Domain Icon ──────────────────────────────────────────────────────────────
const domainEmoji: Record<string, string> = {
  career:         '💼',
  marriage:       '💑',
  daily_life:     '🌅',
  baby_children:  '👶',
  health:         '❤️',
  finance:        '💰',
  education:      '📚',
  property:       '🏠',
  travel:         '✈️',
  others:         '🔮',
}
export function DomainIcon({ domain, size = 'md' }: { domain: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-base', md: 'text-2xl', lg: 'text-3xl' }
  return <span className={sizes[size]}>{domainEmoji[domain] ?? '🔮'}</span>
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}
export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={clsx(
          'border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none',
          'focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100',
          'disabled:bg-gray-50 disabled:text-gray-500',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}
export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        className={clsx(
          'border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none resize-none',
          'focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100',
          className
        )}
        {...props}
      />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}
export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <select
        className={clsx(
          'border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none bg-white',
          'focus:border-saffron-400 focus:ring-2 focus:ring-saffron-100',
          className
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider() {
  return <hr className="border-gray-100 my-3" />
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <span className="text-5xl mb-3">{icon}</span>
      <p className="text-sm">{text}</p>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin h-8 w-8 border-3 border-saffron-400 border-t-transparent rounded-full" />
    </div>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────
export function Countdown({ deadline }: { deadline: string }) {
  const ms = new Date(deadline).getTime() - Date.now()
  if (ms <= 0) return <span className="text-xs text-red-600 font-medium">OVERDUE</span>
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const color = h < 6 ? 'text-red-600' : h < 24 ? 'text-orange-500' : 'text-green-600'
  return <span className={`text-xs font-medium ${color}`}>⏱ {h}h {m}m left</span>
}
