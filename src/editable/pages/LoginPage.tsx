import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Login', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[#091413] text-[#eefbf6]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[1280px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b0e4cc]">{pagesContent.auth.login.badge}</p>
            <h1 className="editable-display mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.94] sm:text-6xl">
              Welcome back to your account workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-[rgba(231,246,240,0.72)]">{pagesContent.auth.login.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: ShieldCheck, title: 'Private account access', body: 'Sign in to manage your publishing space and account activity.' },
                { icon: Sparkles, title: 'Fast local workflow', body: 'Pick up where you left off without leaving the site theme behind.' },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-5">
                  <item.icon className="h-6 w-6 text-[#b0e4cc]" />
                  <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[rgba(231,246,240,0.66)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-full rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[linear-gradient(180deg,rgba(14,30,27,0.9),rgba(10,22,21,0.92))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(64,138,113,0.16)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">
                <CheckCircle2 className="h-4 w-4" /> {pagesContent.auth.login.formTitle}
              </div>
              <h2 className="editable-display mt-5 text-3xl font-semibold">Secure access, same visual system.</h2>
              <p className="mt-3 text-sm leading-7 text-[rgba(231,246,240,0.68)]">
                Enter your details to return to your dashboard and continue working with the site.
              </p>
              <EditableLocalLoginForm />
              <p className="mt-6 text-sm text-[rgba(231,246,240,0.62)]">
                New here?{' '}
                <Link href="/signup" className="inline-flex items-center gap-1 font-semibold text-[#b0e4cc]">
                  {pagesContent.auth.login.createCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
