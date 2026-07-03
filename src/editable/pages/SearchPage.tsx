import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Filter, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { Ads } from '@/lib/ads'

export const revalidate = 3

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => (typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : '')
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? (content.images.find((item) => typeof item === 'string') as string | undefined) : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || '/placeholder.svg?height=900&width=1200'
}
const summaryOf = (post: SitePost) => compactRaw(post.summary) || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || 'Explore this result for more details.'

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function SearchResultCard({ post, index }: { post: SitePost; index: number }) {
  const task = getPostTaskKey(post) as TaskKey | null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const taskLabel = SITE_CONFIG.tasks.find((item) => item.key === task)?.label || 'Post'
  const strong = index % 6 === 0

  return strong ? (
    <Link href={href} className="group overflow-hidden rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] md:col-span-2 xl:grid xl:grid-cols-[1.05fr_0.95fr]">
      <div className="overflow-hidden">
        <img src={image} alt={post.title} className="aspect-[16/10] h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b0e4cc]">{taskLabel}</p>
        <h2 className="editable-display mt-4 text-3xl font-semibold leading-[1.02] text-[#eefbf6] sm:text-4xl">{post.title}</h2>
        <p className="mt-4 line-clamp-4 text-sm leading-7 text-[rgba(231,246,240,0.72)]">{summary}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b0e4cc]">
          Open result <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  ) : (
    <Link href={href} className="group overflow-hidden rounded-[1.75rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)]">
      <div className="overflow-hidden">
        <img src={image} alt={post.title} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">{taskLabel}</p>
        <h2 className="mt-3 line-clamp-2 text-2xl font-semibold leading-snug text-[#eefbf6]">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[rgba(231,246,240,0.68)]">{summary}</p>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length ? feed.posts : useMaster ? [] : SITE_CONFIG.tasks.filter((item) => item.enabled).flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  const enabledTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && !['classified', 'profile'].includes(item.key))
  const lead = results[0]
  const quickList = results.slice(1, 5)

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[#091413] text-[#eefbf6]">
        <section className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr] xl:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b0e4cc]">{pagesContent.search.hero.badge}</p>
              <h1 className="editable-display mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.94] sm:text-6xl">
                Find listings, articles, and resources in one polished search surface.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[rgba(231,246,240,0.72)]">{pagesContent.search.hero.description}</p>
            </div>

            <form action="/search" className="rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-5 sm:p-6">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(9,20,19,0.5)] px-4 py-3">
                <Search className="h-5 w-5 text-[#b0e4cc]" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent text-base text-[#eefbf6] outline-none placeholder:text-[rgba(231,246,240,0.35)]"
                />
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(9,20,19,0.5)] px-4 py-3">
                  <Filter className="h-4 w-4 text-[#b0e4cc]" />
                  <input name="category" defaultValue={category} placeholder="Category" className="min-w-0 flex-1 bg-transparent text-sm text-[#eefbf6] outline-none placeholder:text-[rgba(231,246,240,0.35)]" />
                </label>
                <select name="task" defaultValue={task} className="rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(9,20,19,0.5)] px-4 py-3 text-sm text-[#eefbf6] outline-none">
                  <option value="">All content types</option>
                  {enabledTasks.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
                </select>
              </div>
              <button className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#408A71_0%,#285A48_100%)] px-6 text-sm font-semibold text-[#f5fffb]" type="submit">
                Search
              </button>
            </form>
          </div>

          <div className="mx-auto max-w-6xl px-4 py-6">
            <Ads slot="header" showLabel eager className="mx-auto w-full" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(231,246,240,0.48)]">{results.length} results</p>
              <h2 className="editable-display mt-3 text-3xl font-semibold">
                {query ? `Results for "${query}"` : pagesContent.search.resultsTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[rgba(231,246,240,0.68)]">
                Browse mixed content blocks with the same rhythm used across the home page.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {quickList.map((post) => {
                const taskKey = getPostTaskKey(post) as TaskKey | null
                const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === taskKey)?.route
                const href = `${taskRoute || `/${taskKey || 'article'}`}/${post.slug}`
                return (
                  <Link key={post.id || post.slug} href={href} className="rounded-[1.5rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">{SITE_CONFIG.tasks.find((item) => item.key === taskKey)?.label || 'Post'}</p>
                    <h3 className="mt-2 line-clamp-2 text-xl font-semibold">{post.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[rgba(231,246,240,0.66)]">{summaryOf(post)}</p>
                  </Link>
                )
              })}
            </div>
          </div>

          {lead ? (
            <div className="mt-8">
              <SearchResultCard post={lead} index={0} />
            </div>
          ) : null}

          {results.length > 1 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.slice(lead ? 1 : 0).map((post, index) => <SearchResultCard key={post.id || post.slug} post={post} index={index + 1} />)}
            </div>
          ) : null}

          {!results.length ? (
            <div className="mt-8 rounded-[2rem] border border-dashed border-[rgba(176,228,204,0.16)] bg-[rgba(176,228,204,0.04)] p-10 text-center">
              <p className="text-2xl font-semibold">No matching posts found.</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(231,246,240,0.62)]">Try a different keyword, task type, or category.</p>
            </div>
          ) : null}

          <div className="mt-10">
            <Link href="/article" className="inline-flex items-center gap-2 rounded-full border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] px-5 py-3 text-sm font-semibold text-[#eefbf6]">
              Browse latest <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
