'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && !['classified', 'profile'].includes(task.key)).slice(0, 6)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="site-layer mt-20 border-t border-[rgba(176,228,204,0.1)] bg-[linear-gradient(180deg,rgba(13,29,27,0.9),rgba(9,20,19,0.98))] text-[#eefbf6]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[linear-gradient(135deg,rgba(17,38,34,0.96),rgba(11,23,22,0.92))] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 border-b border-[rgba(176,228,204,0.1)] pb-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(176,228,204,0.16)] bg-[rgba(176,228,204,0.05)]">
                  <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-9 w-9 object-contain" />
                </span>
                <span>
                  <span className="editable-display block text-2xl font-semibold">{SITE_CONFIG.name}</span>
                  <span className="block text-xs uppercase tracking-[0.3em] text-[rgba(231,246,240,0.44)]">Local discovery and business visibility</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-7 text-[rgba(231,246,240,0.72)]">
                A polished discovery surface for local business owners, service providers, public-facing updates, and searchable local content.
              </p>
            </div>
          </div>

          <div className="grid gap-8 py-8 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b0e4cc]">Quick Links</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {taskLinks.map((task) => (
                  <Link key={task.key} href={task.route} className="inline-flex items-center gap-2 text-sm text-[rgba(231,246,240,0.74)] transition hover:text-white">
                    {task.label} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
                <Link href="/about" className="text-sm text-[rgba(231,246,240,0.74)] transition hover:text-white">About</Link>
                <Link href="/contact" className="text-sm text-[rgba(231,246,240,0.74)] transition hover:text-white">Contact</Link>
                {session ? <Link href="/create" className="text-sm text-[rgba(231,246,240,0.74)] transition hover:text-white">Create</Link> : null}
                {!session ? <Link href="/login" className="text-sm text-[rgba(231,246,240,0.74)] transition hover:text-white">Login</Link> : null}
                {!session ? <Link href="/signup" className="text-sm text-[rgba(231,246,240,0.74)] transition hover:text-white">Sign up</Link> : null}
                {session ? (
                  <button type="button" onClick={logout} className="text-left text-sm text-[rgba(231,246,240,0.74)] transition hover:text-white">
                    Logout
                  </button>
                ) : null}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-5">
              <h3 className="editable-display text-2xl font-semibold">Stay visible where decisions happen.</h3>
              <p className="mt-3 text-sm leading-7 text-[rgba(231,246,240,0.7)]">
                Browse active sections, highlight your business, and keep your public presence current.
              </p>
              <Link href="/contact" className="premium-button mt-5 inline-flex rounded-full px-5 py-3 text-sm font-semibold">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[rgba(176,228,204,0.08)] px-4 py-5 text-center text-sm text-[rgba(231,246,240,0.56)]">
        Copyright {year} {SITE_CONFIG.name}. Privacy Policy and Terms & Conditions.
      </div>
    </footer>
  )
}
