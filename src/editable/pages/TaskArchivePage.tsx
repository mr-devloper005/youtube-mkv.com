import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, ChevronDown, Download, FileText, Globe, MapPin, Phone, Search, Star, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const single = [asText(content.image), asText(content.featuredImage), asText(content.thumbnail), asText(content.logo), asText(content.avatar)].filter((item) => item && isUrl(item))
  return [...media, ...images, ...single].filter(Boolean)
}

const getImage = (post: SitePost) => getImages(post)[0] || '/placeholder.svg?height=900&width=1200'
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body) || 'Details coming soon.')
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 xl:grid-cols-[1.05fr_0.95fr]',
  listing: 'grid gap-5',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-4',
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const featured = posts[0]
  const sidePosts = posts.slice(1, 5)
  const adSlot = task === 'article' ? 'in-feed' : task === 'listing' ? 'header' : task === 'profile' ? 'sidebar' : null

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="relative overflow-hidden border-b border-[var(--tk-line)]">
          <div className="absolute left-[-10rem] top-[-6rem] h-72 w-72 rounded-full bg-[var(--tk-glow)] blur-3xl" />
          <div className="absolute right-[-8rem] top-10 h-64 w-64 rounded-full bg-[var(--tk-glow)] blur-3xl" />
          <div className="relative mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
              <div>
                <div className="inline-flex items-center gap-3 rounded-full border border-[var(--tk-line)] bg-[var(--tk-accent-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">
                  <span>{theme.kicker}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)]" />
                  <span className="text-[var(--tk-muted)]">{label}</span>
                </div>
                <h1 className="editable-display mt-6 max-w-[13ch] text-5xl font-semibold leading-[0.94] sm:text-6xl">{voice?.headline || `Browse ${label}`}</h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>

                <div className="mt-8 flex flex-wrap gap-2.5">
                  {(voice?.chips || []).slice(0, 5).map((chip) => (
                    <span key={chip} className="rounded-full border border-[var(--tk-line)] bg-[rgba(176,228,204,0.04)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]">
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-10 flex flex-col gap-4 rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--tk-muted)]">
                    <span className="font-semibold text-[var(--tk-text)]">{posts.length}</span> items in <span className="font-semibold text-[var(--tk-text)]">{categoryLabel}</span>
                  </p>
                  <form action={basePath} className="flex items-center gap-2">
                    <div className="relative">
                      <select
                        name="category"
                        defaultValue={category}
                        className="h-11 appearance-none rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] pl-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none"
                      >
                        <option value="all">All categories</option>
                        {CATEGORY_OPTIONS.map((item) => (
                          <option key={item.slug} value={item.slug}>{item.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                    </div>
                    <button className="rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)]">Apply</button>
                  </form>
                </div>
              </div>

              <div className="premium-grid rounded-[2rem] border border-[var(--tk-line)] bg-[rgba(176,228,204,0.03)] p-5">
                {featured ? (
                  <Link href={`${basePath}/${featured.slug}`} className="group grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="overflow-hidden rounded-[1.75rem]">
                      <img src={getImage(featured)} alt={featured.title} className="aspect-[4/4.5] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--tk-accent)]">Featured</p>
                      <h2 className="editable-display mt-3 text-3xl font-semibold leading-[1.02]">{featured.title}</h2>
                      <p className="mt-4 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(featured)}</p>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-accent)]">
                        Open page <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-[1.75rem] border border-dashed border-[var(--tk-line)] px-8 py-14 text-center">
                    <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
                    <h2 className="editable-display mt-5 text-2xl font-semibold">Nothing here yet</h2>
                    <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">Try another category or check back after new content is published.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
          {adSlot ? (
            <div className="mx-auto max-w-6xl px-4 py-6">
              <Ads slot={adSlot} showLabel eager className="mx-auto w-full" />
            </div>
          ) : null}

          {sidePosts.length ? (
            <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {sidePosts.map((post, index) => (
                <Link key={post.slug || post.id || post.title} href={`${basePath}/${post.slug}`} className="rounded-[1.5rem] border border-[var(--tk-line)] bg-[rgba(176,228,204,0.04)] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">No. {String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-3 line-clamp-2 text-xl font-semibold">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
                </Link>
              ))}
            </div>
          ) : null}

          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => <ArchivePostCard key={post.id || post.slug || index} post={post} task={task} basePath={basePath} index={index} />)}
            </div>
          ) : null}

          {posts.length ? (
            <nav className="mt-14 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--tk-line)] px-5 py-2.5 font-medium">Previous</Link> : null}
              <span className="rounded-full border border-[var(--tk-line)] bg-[rgba(176,228,204,0.04)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="rounded-full bg-[var(--tk-accent)] px-5 py-2.5 font-medium text-[var(--tk-on-accent)]">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}`
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
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

function RatingLine({ post, center = false }: { post: SitePost; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-3 flex items-center gap-2 ${center ? 'justify-center' : ''}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
      ))}
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
    </div>
  )
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]">
      {label}
      <ArrowRight className="h-4 w-4" />
    </span>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return index % 3 === 0 ? (
    <Link href={href} className="group overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] xl:grid xl:grid-cols-[1fr_1fr]">
      <div className="overflow-hidden">
        <img src={getImage(post)} alt={post.title} className="aspect-[4/3] h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">{getCategory(post, 'Article')}</p>
        <h2 className="editable-display mt-3 text-3xl font-semibold leading-[1.02]">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read article" />
      </div>
    </Link>
  ) : (
    <Link href={href} className="group overflow-hidden rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="overflow-hidden">
        <img src={getImage(post)} alt={post.title} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">Read {String(index + 1).padStart(2, '0')}</p>
        <h2 className="mt-3 line-clamp-2 text-2xl font-semibold">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className="group flex flex-col gap-5 rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt={post.title} className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display text-2xl font-semibold">{post.title}</h2>
        <RatingLine post={post} />
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 text-[var(--tk-muted)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className="rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-semibold text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="mt-5 text-2xl font-semibold">{post.title}</h2>
      <RatingLine post={post} />
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-5 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 text-sm text-[var(--tk-muted)]">
        <span>{location || 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <img src={getImage(post)} alt={post.title} className={`w-full object-cover transition duration-700 group-hover:scale-[1.04] ${index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`} />
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-accent)]">{getCategory(post, 'Image')}</p>
        <h2 className="mt-2 line-clamp-2 text-xl font-semibold">{post.title}</h2>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--tk-muted)]">Saved {String(index + 1).padStart(2, '0')}</p>
      <h2 className="mt-3 text-xl font-semibold">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      {website ? <p className="mt-4 text-sm font-semibold text-[var(--tk-accent)]">{website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</p> : null}
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <FileText className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold">{post.title}</h2>
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className="rounded-[1.75rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt={post.title} className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="mt-5 text-xl font-semibold">{post.title}</h2>
      {role ? <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{role}</p> : null}
      <RatingLine post={post} center />
      <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}
