import Link from 'next/link'
import { ArrowRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing published here yet',
  description = 'Fresh posts will appear here automatically once this section has content.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-8 text-center text-[#eefbf6]', className)}>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(64,138,113,0.16)] text-[#b0e4cc]">
        <SearchX className="h-7 w-7" />
      </div>
      <h2 className="editable-display mt-5 text-3xl font-semibold">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[rgba(231,246,240,0.68)]">{description}</p>
      <Link href={actionHref} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#408A71_0%,#285A48_100%)] px-5 py-3 text-sm font-semibold text-[#f5fffb]">
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'posts', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Published ${taskLabel} will appear here automatically once new content is available.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}
