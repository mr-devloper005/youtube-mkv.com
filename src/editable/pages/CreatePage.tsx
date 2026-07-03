'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, ImageIcon, Lock, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'
const hiddenCreateTasks = new Set<TaskKey>(['classified', 'profile'])

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  image: ImageIcon,
  pdf: FileText,
  sbm: ArrowRight,
}

const fieldClass =
  'rounded-[1.4rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(9,20,19,0.55)] px-4 py-3 text-sm text-[#eefbf6] outline-none transition placeholder:text-[rgba(231,246,240,0.35)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenCreateTasks.has(task.key)), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[#091413] px-4 py-16 text-[#eefbf6] sm:px-6 lg:px-8">
          <section className="mx-auto grid max-w-[1180px] gap-8 rounded-[2.4rem] border border-[rgba(176,228,204,0.12)] bg-[linear-gradient(180deg,rgba(14,30,27,0.9),rgba(10,22,21,0.92))] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.28)] md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div className="flex min-h-72 items-center justify-center rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)]">
              <Lock className="h-20 w-20 text-[#b0e4cc]" />
            </div>
            <div className="self-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b0e4cc]">{pagesContent.create.locked.badge}</p>
              <h1 className="editable-display mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.94] sm:text-6xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(231,246,240,0.7)]">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#408A71_0%,#285A48_100%)] px-6 py-3 text-sm font-semibold text-[#f5fffb]">
                  Login <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] px-6 py-3 text-sm font-semibold text-[#eefbf6]">
                  Sign up
                </Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[#091413] text-[#eefbf6]">
        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 rounded-[2.4rem] border border-[rgba(176,228,204,0.12)] bg-[linear-gradient(180deg,rgba(14,30,27,0.9),rgba(10,22,21,0.92))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.28)] lg:grid-cols-[0.88fr_1.12fr] lg:p-10">
            <aside>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b0e4cc]">{pagesContent.create.hero.badge}</p>
              <h1 className="editable-display mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.94] sm:text-6xl">{pagesContent.create.hero.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(231,246,240,0.7)]">{pagesContent.create.hero.description}</p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`rounded-[1.6rem] border p-5 text-left transition ${
                        active
                          ? 'border-[rgba(176,228,204,0.18)] bg-[rgba(64,138,113,0.2)] text-[#eefbf6]'
                          : 'border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] text-[#eefbf6]'
                      }`}
                    >
                      <Icon className="h-5 w-5 text-[#b0e4cc]" />
                      <span className="mt-3 block text-base font-semibold">{item.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-[rgba(231,246,240,0.62)]">{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">Create {activeTask?.label || 'post'}</p>
                  <h2 className="editable-display mt-2 text-3xl font-semibold">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(9,20,19,0.45)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#eefbf6]">
                  {session.name}
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-5 rounded-[1.5rem] border border-emerald-800/40 bg-emerald-950/35 p-4 text-emerald-200">
                  <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm opacity-80">{created.title}</p>
                </div>
              ) : null}

              <button
                type="submit"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#408A71_0%,#285A48_100%)] px-6 text-sm font-semibold text-[#f5fffb] shadow-[0_18px_38px_rgba(40,90,72,0.35)] transition hover:opacity-95"
              >
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
