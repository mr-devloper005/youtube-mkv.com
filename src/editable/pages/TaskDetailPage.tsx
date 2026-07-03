import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Star, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const single = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...single].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyText = (value: string) =>
  value.replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const sanitizeHtml = (html: string) =>
  html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(value)
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const leadText = (post: SitePost) => {
  const summary = stripHtml(summaryText(post))
  if (!summary) return ''
  const body = stripHtml(getBody(post))
  return summary !== body ? summary : ''
}

const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback

const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
      </main>
    </EditableSiteShell>
  )
}

const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.9 + (hashStr(post.slug || post.id || post.title || 'x') % 11) / 10) * 10) / 10
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || 'posts'}
    </Link>
  )
}

function DetailMeta({ post, category }: { post: SitePost; category?: string }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--tk-muted)]">
      <div className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </div>
      <span className="font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      {category ? <span>{category}</span> : null}
      <span>{SITE_CONFIG.name}</span>
    </div>
  )
}

function BodyContent({ post }: { post: SitePost }) {
  return <div className="article-content mt-8 max-w-none text-[1.02rem] leading-8" dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }} />
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof MapPin }) {
  return (
    <div className="rounded-[1.4rem] border border-[var(--tk-line)] bg-[rgba(176,228,204,0.04)] p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tk-muted)]">
        <Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}
      </div>
      <p className="mt-2 break-words text-sm font-medium leading-6 text-[var(--tk-text)]">{value}</p>
    </div>
  )
}

function ActionButtons({ website, phone, email }: { website?: string; phone?: string; email?: string }) {
  if (!website && !phone && !email) return null
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)]">Visit website</Link> : null}
      {phone ? <a href={`tel:${phone}`} className="rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-semibold">Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="rounded-full border border-[var(--tk-line)] px-5 py-3 text-sm font-semibold">Email</a> : null}
    </div>
  )
}

function SideInfo({ post, task }: { post: SitePost; task: TaskKey }) {
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url', 'link'])
  const mapSrc = mapSrcFor(post)

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[1.9rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">{task.toUpperCase()}</p>
        <div className="mt-5 grid gap-3">
          {address ? <StatCard label="Location" value={address} icon={MapPin} /> : null}
          {phone ? <StatCard label="Phone" value={phone} icon={Phone} /> : null}
          {email ? <StatCard label="Email" value={email} icon={Mail} /> : null}
          {website ? <StatCard label="Website" value={website} icon={Globe2} /> : null}
        </div>
        <ActionButtons website={website} phone={phone} email={email} />
      </div>
      {mapSrc ? (
        <div className="overflow-hidden rounded-[1.9rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
          <div className="px-5 py-4 text-sm font-semibold">Location preview</div>
          <iframe src={mapSrc} title="Map" loading="lazy" className="h-72 w-full border-0" />
        </div>
      ) : null}
      <RelatedPanel task={task} related={relatedForTask(task, post)} />
    </aside>
  )
}

function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <article className="min-w-0">
            <BackLink task="article" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
            <h1 className="editable-display mt-4 max-w-[14ch] text-5xl font-semibold leading-[0.94] sm:text-6xl">{post.title}</h1>
            <DetailMeta post={post} category={categoryOf(post, 'Article')} />
            {leadText(post) ? <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            {images[0] ? <img src={images[0]} alt={post.title} className="mt-8 aspect-[16/9] w-full rounded-[2rem] border border-[var(--tk-line)] object-cover" /> : null}
            <BodyContent post={post} />
            <Gallery images={images.slice(1)} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="article-bottom" showLabel eager className="mx-auto w-full" />
            </div>
            <EditableArticleComments slug={post.slug} comments={comments} />
          </article>
          <div className="space-y-5">
            {related.length ? <RelatedPanel task="article" related={related} /> : null}
          </div>
        </div>
      </section>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const website = getField(post, ['website', 'url'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <BackLink task="listing" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
          <article className="min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[180px_1fr] lg:items-center">
                <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-[1.75rem] bg-[var(--tk-raised)]">
                  {images[0] ? <img src={images[0]} alt={post.title} className="h-full w-full object-cover" /> : <Building2 className="h-16 w-16 text-[var(--tk-muted)]" />}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">Business profile</p>
                  <h1 className="editable-display mt-4 text-4xl font-semibold leading-[0.98] sm:text-5xl">{post.title}</h1>
                  <DetailMeta post={post} category={categoryOf(post, 'Listing')} />
                  {leadText(post) ? <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
                  <ActionButtons website={website} phone={phone} email={email} />
                </div>
              </div>
            </div>
            <BodyContent post={post} />
            <Gallery images={images.slice(1)} />
          </article>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="sidebar" showLabel eager className="mx-auto w-full" />
            </div>
            <DetailSideInfo post={post} task="listing" related={related} />
          </aside>
        </div>
      </section>
      <RelatedStrip task="listing" related={related} />
    </>
  )
}

function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget']) || 'Open offer'
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <BackLink task="classified" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">Classified</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight">{post.title}</h1>
            <DetailMeta post={post} category={categoryOf(post, 'Classified')} />
            <p className="editable-display mt-6 text-5xl font-semibold text-[var(--tk-accent)]">{price}</p>
            {condition ? <p className="mt-4 rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--tk-accent)]">{condition}</p> : null}
            <DetailSideInfo post={post} task="classified" related={related} hideRelated />
          </aside>
          <article className="min-w-0">
            {images[0] ? <img src={images[0]} alt={post.title} className="aspect-[16/10] w-full rounded-[2rem] border border-[var(--tk-line)] object-cover" /> : null}
            <BodyContent post={post} />
            <Gallery images={images.slice(1)} />
          </article>
        </div>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt={post.title} className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <article className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">
                <Camera className="h-4 w-4" /> Visual highlight
              </div>
              <h1 className="editable-display mt-5 text-4xl font-semibold leading-[0.98] sm:text-5xl">{post.title}</h1>
              {leadText(post) ? <p className="mt-5 text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
              <BodyContent post={post} />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <section className="mx-auto max-w-[980px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <BackLink task="sbm" />
        <article className="mt-8 rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
            <Bookmark className="h-7 w-7" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">Saved resource</p>
          <h1 className="editable-display mt-4 text-4xl font-semibold leading-[0.98] sm:text-5xl">{post.title}</h1>
          {leadText(post) ? <p className="mt-5 text-base leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
          {website ? (
            <Link href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)]">
              Open resource <ExternalLink className="h-4 w-4" />
            </Link>
          ) : null}
          <BodyContent post={post} />
        </article>
      </section>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <BackLink task="pdf" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
          <article className="min-w-0 rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Document')}</p>
                <h1 className="editable-display mt-2 text-3xl font-semibold sm:text-4xl">{post.title}</h1>
              </div>
            </div>
            <BodyContent post={post} />
            {fileUrl ? (
              <div className="mt-8 overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)]">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] px-5 py-4">
                  <span className="text-sm font-semibold">Document preview</span>
                  <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2 text-sm font-semibold text-[var(--tk-on-accent)]">
                    Download <Download className="h-4 w-4" />
                  </Link>
                </div>
                <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[72vh] w-full bg-[var(--tk-raised)]" />
              </div>
            ) : null}
          </article>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {fileUrl ? (
              <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
                <p className="text-sm font-semibold">Get the full file</p>
                <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Open or download this document in a new tab.</p>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)]">
                  Download <Download className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
            <RelatedPanel task="pdf" related={related} />
          </aside>
        </div>
      </section>
      <RelatedStrip task="pdf" related={related} />
    </>
  )
}

function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-center lg:sticky lg:top-24 lg:self-start">
            <div className="mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
              {images[0] ? <img src={images[0]} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-16 w-16 text-[var(--tk-muted)]" />}
            </div>
            <h1 className="mt-6 text-3xl font-semibold">{post.title}</h1>
            {role ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">{role}</p> : null}
            <DetailMeta post={post} category={categoryOf(post, 'Profile')} />
            <ActionButtons website={website} email={email} />
          </aside>
          <article className="min-w-0">
            <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">Profile overview</p>
              <BodyContent post={post} />
            </div>
            <Gallery images={images.slice(1)} />
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot="footer" showLabel eager className="mx-auto w-full" />
            </div>
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

function Gallery({ images }: { images: string[] }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">Gallery</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {images.slice(0, 6).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] w-full rounded-[1.6rem] border border-[var(--tk-line)] object-cover" />
        ))}
      </div>
    </section>
  )
}

function DetailSideInfo({ post, task, related, hideRelated = false }: { post: SitePost; task: TaskKey; related: SitePost[]; hideRelated?: boolean }) {
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url', 'link'])
  const mapSrc = mapSrcFor(post)

  return (
    <div className="space-y-5">
      <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[rgba(176,228,204,0.04)] p-5">
        <div className="grid gap-3">
          {address ? <StatCard label="Location" value={address} icon={MapPin} /> : null}
          {phone ? <StatCard label="Phone" value={phone} icon={Phone} /> : null}
          {email ? <StatCard label="Email" value={email} icon={Mail} /> : null}
          {website ? <StatCard label="Website" value={website} icon={Globe2} /> : null}
        </div>
        <ActionButtons website={website} phone={phone} email={email} />
      </div>
      {mapSrc ? (
        <div className="overflow-hidden rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
          <div className="px-5 py-4 text-sm font-semibold">Map</div>
          <iframe src={mapSrc} title="Map" loading="lazy" className="h-72 w-full border-0" />
        </div>
      ) : null}
      {!hideRelated ? <RelatedPanel task={task} related={related} /> : null}
    </div>
  )
}

function RelatedPanel({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <div className="rounded-[1.8rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="editable-display text-xl font-semibold">More like this</h2>
        <Link href={taskConfig?.route || '/'} className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tk-accent)]">View all</Link>
      </div>
      <div className="mt-5 grid gap-3">
        {related.map((item) => <RelatedCard key={item.slug || item.id || item.title} task={task} post={item} compact />)}
      </div>
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="editable-display text-3xl font-semibold">More {(taskConfig?.label || 'posts').toLowerCase()}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-accent)]">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.slug || item.id || item.title} task={task} post={item} />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, compact = false }: { task: TaskKey; post: SitePost; compact?: boolean }) {
  const images = getImages(post)
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  const fallbackIcon = task === 'profile' ? UserRound : task === 'listing' ? Building2 : task === 'image' ? Camera : task === 'pdf' ? FileText : Bookmark

  if (compact) {
    return (
      <Link href={href} className="group flex gap-3 rounded-[1.25rem] border border-[var(--tk-line)] bg-[rgba(176,228,204,0.03)] p-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--tk-raised)]">
          {images[0] ? <img src={images[0]} alt={post.title} className="h-full w-full object-cover" /> : (() => { const Icon = fallbackIcon; return <Icon className="h-5 w-5 text-[var(--tk-muted)]" /> })()}
        </div>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-6">{post.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group overflow-hidden rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="overflow-hidden">
        {images[0] ? (
          <img src={images[0]} alt={post.title} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center bg-[var(--tk-raised)]">
            {(() => { const Icon = fallbackIcon; return <Icon className="h-7 w-7 text-[var(--tk-muted)]" /> })()}
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

function relatedForTask(_task: TaskKey, _post: SitePost) {
  return []
}
