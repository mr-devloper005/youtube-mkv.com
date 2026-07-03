'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const hiddenFrontFacingTasks = new Set(['classified', 'profile'])

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const taskItems = useMemo(
    () =>
      SITE_CONFIG.tasks
        .filter((task) => task.enabled && !hiddenFrontFacingTasks.has(task.key))
        .slice(0, 4)
        .map((task) => ({ label: task.label, href: task.route })),
    []
  )
  const navItems: Array<{ label: string; href: string; cta?: boolean }> = [{ label: 'Home', href: '/' }, ...taskItems, { label: 'Contact Us', href: '/contact', cta: true }]

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(9,20,19,0.78)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[86px] max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(176,228,204,0.22)] bg-[rgba(176,228,204,0.05)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="editable-display block text-lg font-semibold text-[#eefbf6]">{SITE_CONFIG.name}</span>
            <span className="block text-[10px] uppercase tracking-[0.34em] text-[rgba(231,246,240,0.48)]">Local growth and visibility</span>
          </span>
        </Link>

        <div className="mx-auto hidden items-center gap-2 xl:flex">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  item.cta
                    ? 'ml-4 inline-flex h-14 items-center rounded-2xl bg-[linear-gradient(135deg,#408A71_0%,#285A48_100%)] px-7 text-sm font-semibold text-[#f5fffb] shadow-[0_18px_34px_rgba(40,90,72,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(40,90,72,0.42)]'
                    : `inline-flex h-12 items-center rounded-full px-5 text-sm font-medium transition ${
                        active ? 'text-[#b0e4cc]' : 'text-[rgba(231,246,240,0.78)] hover:text-white'
                      }`
                }
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="hidden max-w-[260px] flex-1 xl:block">
          <label className="flex h-12 items-center gap-3 rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] px-4">
            <Search className="h-4 w-4 text-[rgba(176,228,204,0.75)]" />
            <input
              name="q"
              type="search"
              placeholder="Search"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#eefbf6] outline-none placeholder:text-[rgba(231,246,240,0.42)]"
            />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/create"
                className="hidden h-11 items-center gap-2 rounded-full border border-[rgba(176,228,204,0.15)] bg-[rgba(176,228,204,0.05)] px-4 text-sm font-semibold text-[#eefbf6] sm:inline-flex"
              >
                <PlusCircle className="h-4 w-4" /> Create
              </Link>
              <button type="button" onClick={logout} className="hidden h-11 rounded-full px-4 text-sm font-medium text-[rgba(231,246,240,0.66)] transition hover:text-white sm:inline-flex sm:items-center">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-[rgba(231,246,240,0.72)] transition hover:text-white sm:inline-flex">
                <LogIn className="h-4 w-4" /> Login
              </Link>
              <Link href="/signup" className="hidden h-11 items-center gap-2 rounded-full border border-[rgba(176,228,204,0.15)] bg-[rgba(176,228,204,0.05)] px-4 text-sm font-semibold text-[#eefbf6] sm:inline-flex">
                <UserPlus className="h-4 w-4" /> Sign up
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(176,228,204,0.15)] bg-[rgba(176,228,204,0.05)] text-[#eefbf6] xl:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/6 bg-[rgba(9,20,19,0.96)] px-4 py-5 xl:hidden">
          <form action="/search" className="mb-4">
            <label className="flex h-12 items-center gap-3 rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] px-4">
              <Search className="h-4 w-4 text-[rgba(176,228,204,0.75)]" />
              <input
                name="q"
                type="search"
                placeholder="Search"
                className="min-w-0 flex-1 bg-transparent text-sm text-[#eefbf6] outline-none placeholder:text-[rgba(231,246,240,0.42)]"
              />
            </label>
          </form>
          <div className="grid gap-2">
            {[
              ...navItems,
              ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }]),
            ].map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                    active ? 'bg-[rgba(64,138,113,0.18)] text-[#b0e4cc]' : 'bg-[rgba(176,228,204,0.04)] text-[rgba(231,246,240,0.78)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? (
              <button type="button" onClick={logout} className="rounded-2xl bg-[rgba(176,228,204,0.04)] px-4 py-3 text-left text-sm font-medium text-[rgba(231,246,240,0.78)]">
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
