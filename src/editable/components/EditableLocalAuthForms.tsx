'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, Mail, User2 } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'

const USERS_KEY = 'slot4:local-auth-users'
const SESSION_KEY = 'slot4:local-auth-session'

type LocalUser = {
  name: string
  email: string
  password: string
  createdAt: string
}

const readUsers = (): LocalUser[] => {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveUsers = (users: LocalUser[]) => window.localStorage.setItem(USERS_KEY, JSON.stringify(users))

const saveSession = (user: Pick<LocalUser, 'name' | 'email'>) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email, loggedInAt: new Date().toISOString() }))
  window.dispatchEvent(new Event('slot4-auth-change'))
}

const fieldShell = 'flex items-center gap-3 rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(9,20,19,0.55)] px-4'
const inputClass = 'h-12 w-full bg-transparent text-sm text-[#eefbf6] outline-none placeholder:text-[rgba(231,246,240,0.35)]'
const buttonClass = 'inline-flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#408A71_0%,#285A48_100%)] px-6 text-sm font-semibold text-[#f5fffb] shadow-[0_18px_38px_rgba(40,90,72,0.35)] transition hover:opacity-95 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60'

function Field({
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: typeof Mail
}) {
  return (
    <label className={fieldShell}>
      <Icon className="h-4 w-4 shrink-0 text-[#b0e4cc]" />
      <input className={inputClass} {...props} />
    </label>
  )
}

function Message({ status, message }: { status: 'idle' | 'success' | 'error'; message: string | null }) {
  if (!message) return null
  return (
    <p
      className={`rounded-[1.2rem] px-4 py-3 text-sm font-semibold ${
        status === 'success'
          ? 'bg-emerald-950/40 text-emerald-300'
          : 'bg-[rgba(64,138,113,0.12)] text-[#b0e4cc]'
      }`}
    >
      {message}
    </p>
  )
}

export function EditableLocalLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    const user = readUsers().find((item) => item.email.toLowerCase() === normalizedEmail)
    if (!user || user.password !== password) {
      setStatus('error')
      setMessage(pagesContent.auth.login.noAccount)
      return
    }
    saveSession(user)
    setStatus('success')
    setMessage(pagesContent.auth.login.success)
    window.setTimeout(() => router.push('/'), 500)
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <Field
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Field
        icon={LockKeyhole}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <Message status={status} message={message} />
      <button type="submit" className={buttonClass}>{pagesContent.auth.login.submitLabel}</button>
    </form>
  )
}

export function EditableLocalSignupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()
    if (password.length < 4) {
      setStatus('error')
      setMessage(pagesContent.auth.signup.passwordShort)
      return
    }
    const users = readUsers()
    const nextUser: LocalUser = {
      name: normalizedName || normalizedEmail.split('@')[0] || 'Member',
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    }
    saveUsers([nextUser, ...users.filter((item) => item.email.toLowerCase() !== normalizedEmail)])
    saveSession(nextUser)
    setStatus('success')
    setMessage(pagesContent.auth.signup.success)
    window.setTimeout(() => router.push('/'), 500)
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <Field
        icon={User2}
        placeholder="Full name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Field
        icon={Mail}
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Field
        icon={LockKeyhole}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <Message status={status} message={message} />
      <button type="submit" className={buttonClass}>{pagesContent.auth.signup.submitLabel}</button>
    </form>
  )
}

export function useEditableLocalAuthSession() {
  const [session, setSession] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const load = () => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
        setSession(parsed && typeof parsed.email === 'string' ? parsed : null)
      } catch {
        setSession(null)
      }
    }
    load()
    window.addEventListener('slot4-auth-change', load)
    window.addEventListener('storage', load)
    return () => {
      window.removeEventListener('slot4-auth-change', load)
      window.removeEventListener('storage', load)
    }
  }, [])

  const logout = () => {
    window.localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('slot4-auth-change'))
    setSession(null)
  }

  return { session, logout }
}
