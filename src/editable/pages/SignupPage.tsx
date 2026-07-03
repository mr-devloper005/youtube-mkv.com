import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, UserPlus2 } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[#091413] text-[#eefbf6]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[1280px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.98fr_1.02fr] lg:px-8 lg:py-20">
          <div className="flex items-center order-2 lg:order-1">
            <div className="w-full rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[linear-gradient(180deg,rgba(14,30,27,0.9),rgba(10,22,21,0.92))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(64,138,113,0.16)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">
                <UserPlus2 className="h-4 w-4" /> {pagesContent.auth.signup.formTitle}
              </div>
              <h1 className="editable-display mt-5 text-3xl font-semibold">Create your access and start publishing faster.</h1>
              <p className="mt-3 text-sm leading-7 text-[rgba(231,246,240,0.68)]">
                Open your account with the same premium interface used across the rest of the site.
              </p>
              <EditableLocalSignupForm />
              <p className="mt-6 text-sm text-[rgba(231,246,240,0.62)]">
                Already have an account?{' '}
                <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-[#b0e4cc]">
                  {pagesContent.auth.signup.loginCta} <ArrowRight className="h-4 w-4" />
                </Link>
              </p>
            </div>
          </div>

          <div className="order-1 flex flex-col justify-center lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b0e4cc]">{pagesContent.auth.signup.badge}</p>
            <h2 className="editable-display mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.94] sm:text-6xl">
              Build your account inside the base theme.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[rgba(231,246,240,0.72)]">{pagesContent.auth.signup.description}</p>

            <div className="mt-8 grid gap-4">
              {[
                { icon: ShieldCheck, title: 'Keep your workflow connected', body: 'Sign up once and use the same account surface for creation, browsing, and updates.' },
                { icon: CheckCircle2, title: 'Designed like the rest of the site', body: 'The signup screen now follows the same dark premium spacing, type, and card system.' },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-5">
                  <item.icon className="h-6 w-6 text-[#b0e4cc]" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[rgba(231,246,240,0.66)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
