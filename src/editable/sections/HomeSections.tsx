import Link from 'next/link'
import { ArrowRight, BadgeCheck, BookOpen, BriefcaseBusiness, Building2, Check, ChevronRight, FileText, Image as ImageIcon, MapPin, Search, ShieldCheck, Sparkles, Star, TrendingUp, UserRound } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditableCategory, getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8'
const frontFacingTaskKeys = new Set<TaskKey>(['article', 'listing', 'image', 'sbm', 'pdf'])

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: BriefcaseBusiness,
  image: ImageIcon,
  sbm: BookOpen,
  pdf: FileText,
  profile: UserRound,
}

function uniquePosts(posts: SitePost[]) {
  return Array.from(new Map(posts.map((post) => [post.slug || post.id || post.title, post])).values())
}

function safePosts(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return uniquePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).filter(Boolean)
}

function metricValue(post?: SitePost, fallback = '4.9') {
  const raw = Number((post?.content as Record<string, unknown> | undefined)?.rating)
  if (raw >= 1 && raw <= 5) return raw.toFixed(1)
  return fallback
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b0e4cc]">{eyebrow}</p>
      <h2 className="editable-display mt-4 text-4xl font-semibold leading-[0.98] text-[#eefbf6] sm:text-5xl">{title}</h2>
      {description ? <p className="mt-4 text-sm leading-7 text-[rgba(231,246,240,0.72)] sm:text-base">{description}</p> : null}
    </div>
  )
}

function FeaturedCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group relative overflow-hidden rounded-[2rem] border border-[rgba(176,228,204,0.14)] bg-[rgba(176,228,204,0.04)]">
      <div className="relative aspect-[5/4] overflow-hidden">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,9,9,0.08),rgba(4,9,9,0.76))]" />
        <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
          Featured
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">{getEditableCategory(post)}</p>
          <h3 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-3xl">{post.title}</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/78">{getEditableExcerpt(post, 160)}</p>
        </div>
      </div>
    </Link>
  )
}

function CompactCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="premium-soft-card group rounded-[1.5rem] p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(64,138,113,0.2)] text-sm font-bold text-[#b0e4cc]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b0e4cc]">{getEditableCategory(post)}</p>
          <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-[#eefbf6]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[rgba(231,246,240,0.68)]">{getEditableExcerpt(post, 90)}</p>
        </div>
      </div>
    </Link>
  )
}

function HorizontalCard({ post, href, label }: { post: SitePost; href: string; label: string }) {
  return (
    <Link href={href} className="group grid overflow-hidden rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] md:grid-cols-[0.95fr_1.05fr]">
      <div className="aspect-[4/3] overflow-hidden md:aspect-auto">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b0e4cc]">{label}</p>
        <h3 className="editable-display mt-4 text-3xl font-semibold leading-[1.02] text-[#eefbf6] sm:text-4xl">{post.title}</h3>
        <p className="mt-4 text-sm leading-7 text-[rgba(231,246,240,0.72)]">{getEditableExcerpt(post, 170)}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#b0e4cc]">
          Explore details <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function EditorialCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group flex gap-4 rounded-[1.5rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.25rem] bg-[rgba(176,228,204,0.08)]">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">{getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-[#eefbf6]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[rgba(231,246,240,0.66)]">{getEditableExcerpt(post, 90)}</p>
      </div>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group overflow-hidden rounded-[1.75rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)]">
      <div className="aspect-[4/5] overflow-hidden">
        <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
      </div>
      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b0e4cc]">{getEditableCategory(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-xl font-semibold leading-tight text-[#eefbf6]">{post.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[rgba(231,246,240,0.68)]">{getEditableExcerpt(post, 100)}</p>
      </div>
    </Link>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = safePosts(posts, timeSections)
  const hero = pool[0]
  const side = pool[1]
  const extra = pool.slice(2, 5)
  const serviceTasks = SITE_CONFIG.tasks.filter((task) => task.enabled && frontFacingTaskKeys.has(task.key)).slice(0, 4)

  return (
    <section className="relative overflow-hidden">
      <div className="premium-ring left-[-6rem] top-16 h-72 w-72 opacity-40" />
      <div className="premium-ring right-[6%] top-32 h-28 w-28 opacity-60" />
      <div className={`grid gap-10 py-12 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center ${container}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#b0e4cc]">{pagesContent.home.hero.badge || 'Growth-ready discovery'}</p>
          <h1 className="editable-display mt-5 max-w-[12ch] text-5xl font-semibold leading-[0.92] text-[#eefbf6] sm:text-6xl lg:text-7xl">
            Advertising-ready listings, content, and results that feel premium.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[rgba(231,246,240,0.74)]">
            Help local business owners show up with more clarity through polished listings, trusted updates, and a smoother browsing experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="premium-button-secondary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">
              Contact Us
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex -space-x-3">
              {pool.slice(0, 3).map((post) => (
                <span key={post.slug || post.id || post.title} className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#091413] bg-[rgba(176,228,204,0.08)]">
                  <img src={getEditablePostImage(post)} alt="" className="h-full w-full object-cover" />
                </span>
              ))}
            </div>
            <div className="rounded-full bg-[rgba(176,228,204,0.08)] px-4 py-2 text-[#eefbf6]">
              <span className="text-xl font-semibold">{metricValue(hero)}</span>
            </div>
            <p className="text-sm text-[rgba(231,246,240,0.74)]">Built for high-visibility pages, stronger trust signals, and public discovery.</p>
          </div>

          <form action="/search" className="premium-card mt-8 flex w-full max-w-2xl flex-col gap-3 rounded-[1.8rem] p-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-full bg-[rgba(176,228,204,0.05)] px-4 py-3">
              <Search className="h-5 w-5 text-[#b0e4cc]" />
              <input
                name="q"
                placeholder={pagesContent.home.hero.searchPlaceholder || 'Search categories, services, and local results'}
                className="w-full bg-transparent text-sm text-[#eefbf6] outline-none placeholder:text-[rgba(231,246,240,0.42)]"
              />
            </div>
            <button className="premium-button rounded-full px-6 py-3 text-sm font-semibold">Search</button>
          </form>
        </div>

        <div className="relative">
          <div className="absolute right-0 top-[-1.5rem] h-[82%] w-[72%] rounded-[2rem] bg-[linear-gradient(180deg,rgba(64,138,113,0.25),rgba(64,138,113,0.08))]" />
          {hero ? (
            <div className="premium-card relative overflow-hidden rounded-[2.2rem] p-4 sm:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative overflow-hidden rounded-[1.75rem]">
                  <img src={getEditablePostImage(hero)} alt={hero.title} className="aspect-[4/4.6] w-full object-cover" />
                </div>
                <div className="grid gap-4">
                  {side ? <CompactCard post={side} href={postHref(primaryTask, side, primaryRoute)} index={1} /> : null}
                  <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(64,138,113,0.18),rgba(176,228,204,0.08))] p-5">
                    <div className="flex items-center justify-between">
                      <div className="h-20 w-20 rounded-full border-[10px] border-[#b0e4cc] border-r-[#285a48] border-b-[#408a71]" />
                      <BadgeCheck className="h-10 w-10 text-[#b0e4cc]" />
                    </div>
                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#b0e4cc]">Performance</p>
                    <p className="mt-2 text-lg font-semibold text-[#eefbf6]">Structured pages that keep discovery easy and action-friendly.</p>
                  </div>
                  {extra[0] ? <EditorialCard post={extra[0]} href={postHref(primaryTask, extra[0], primaryRoute)} /> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-y border-[rgba(176,228,204,0.08)] bg-[rgba(176,228,204,0.03)]">
        <div className={`grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4 ${container}`}>
          {serviceTasks.map((task) => {
            const Icon = taskIcon[task.key] || FileText
            return (
              <Link key={task.key} href={task.route} className="group flex items-center gap-4 rounded-[1.5rem] border border-[rgba(176,228,204,0.1)] bg-[rgba(176,228,204,0.04)] px-5 py-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(64,138,113,0.18)] text-[#b0e4cc]">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-base font-semibold text-[#eefbf6]">{task.label}</p>
                  <p className="text-sm text-[rgba(231,246,240,0.58)]">Explore active pages</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = safePosts(posts, timeSections)
  const topRow = pool.slice(0, 3)
  const sideList = pool.slice(3, 7)

  return (
    <section className="py-16 sm:py-20">
      <div className={container}>
        <SectionHeading
          eyebrow="Our services"
          title="Performance-focused sections designed to scale business visibility."
          description="A homepage rhythm inspired by service-led landing pages, but still powered by your existing post feed."
        />

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {topRow.map((post, index) => (
              <div key={post.slug || post.id || post.title} className="premium-card rounded-[2rem] p-5">
                <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.4rem] bg-[rgba(176,228,204,0.06)]">
                  <img src={getEditablePostImage(post)} alt={post.title} className="h-full w-full object-cover" />
                </div>
                <h3 className="mt-5 text-center text-2xl font-semibold text-[#eefbf6]">{getEditableCategory(post) || `Service ${index + 1}`}</h3>
                <p className="mt-3 text-center text-sm leading-7 text-[rgba(231,246,240,0.68)]">{getEditableExcerpt(post, 160)}</p>
                <div className="mt-5 text-center">
                  <Link href={postHref(primaryTask, post, primaryRoute)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#b0e4cc]">
                    Learn more <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="premium-card premium-grid relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
            <div className="premium-ring right-8 top-8 h-24 w-24 opacity-60" />
            <div className="premium-ring right-24 top-28 h-16 w-16 opacity-50" />
            <h3 className="editable-display max-w-[10ch] text-4xl font-semibold leading-[0.98] text-[#eefbf6] sm:text-5xl">Strategic plans that stay readable.</h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[rgba(231,246,240,0.7)]">
              Use structured sections to surface business details, directory content, and related offers without overwhelming the page.
            </p>
            <div className="mt-8 grid gap-4">
              {sideList.map((post, index) => (
                <CompactCard key={post.slug || post.id || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = safePosts(posts, timeSections)
  const process = pool.slice(0, 2)
  const grid = pool.slice(2, 6)

  return (
    <section className="py-16 sm:py-20">
      <div className={container}>
        <div className="grid gap-8">
          {process[0] ? <HorizontalCard post={process[0]} href={postHref(primaryTask, process[0], primaryRoute)} label="Discovery" /> : null}
          {process[1] ? <HorizontalCard post={process[1]} href={postHref(primaryTask, process[1], primaryRoute)} label="Execution" /> : null}
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {grid.map((post, index) => {
            const icons = [ShieldCheck, TrendingUp, Star, Sparkles]
            const Icon = icons[index % icons.length] || ShieldCheck
            return (
              <Link
                key={post.slug || post.id || post.title}
                href={postHref(primaryTask, post, primaryRoute)}
                className="premium-card group rounded-[1.75rem] p-6 text-center"
              >
                <Icon className="mx-auto h-11 w-11 text-[#b0e4cc]" />
                <p className="mt-4 text-5xl font-semibold text-[#b0e4cc]">{['3k', '8k', '5k', '7k'][index] || '1k'}</p>
                <h3 className="mt-3 text-lg font-semibold text-[#eefbf6]">{getEditableCategory(post)}</h3>
                <p className="mt-2 text-sm text-[rgba(231,246,240,0.64)]">{post.title}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
  spotlight: {
    eyebrow: 'Campaign proof',
    title: 'Proven layouts for business-ready content blocks.',
    description: 'Mix editorial, visual, and compact cards so the site feels designed instead of duplicated.',
  },
  browse: {
    eyebrow: 'Fresh updates',
    title: 'New sections with more visual rhythm.',
    description: 'Browse newer posts in image-first cards and denser editorial blocks.',
  },
  index: {
    eyebrow: 'Browse deeper',
    title: 'More pages visitors can keep exploring.',
    description: 'Structured rails help surface older but still relevant listings, resources, and visual content.',
  },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const fallback = [
    { key: 'spotlight', posts: posts.slice(0, 6), href: primaryRoute },
    { key: 'browse', posts: posts.slice(6, 12), href: primaryRoute },
    { key: 'index', posts: posts.slice(12, 18), href: primaryRoute },
  ]
  const sections = timeSections.length ? timeSections : fallback
  const visible = sections.filter((section) => section.posts.length)

  return (
    <>
      {visible.map((section, sectionIndex) => {
        const copy = sectionCopy[section.key] || sectionCopy.spotlight
        const items = section.posts.slice(0, 6)
        return (
          <section key={section.key} className="py-16 sm:py-20">
            <div className={container}>
              {sectionIndex === 0 ? (
                <div className="overflow-hidden rounded-[2.25rem] bg-[#060908]">
                  <div className="grid gap-6 px-6 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
                    <div>
                      <SectionHeading eyebrow="Connect with us" title="High-contrast content blocks for trust and action." description="Blend bold dark sections with lighter content rails so the homepage keeps moving and never feels like one repeated template." />
                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link href="/about" className="inline-flex items-center gap-2 rounded-xl bg-[#ff6f61] px-5 py-3 text-sm font-semibold text-white">
                          More About Us
                        </Link>
                        <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-[#4066d1] px-5 py-3 text-sm font-semibold text-white">
                          Book a Demo Call
                        </Link>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {items.slice(0, 4).map((post) => (
                        <FeaturedCard key={post.slug || post.id || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
                    <Link href={section.href || primaryRoute} className="inline-flex items-center gap-2 text-sm font-semibold text-[#b0e4cc]">
                      View all <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className={`mt-10 grid gap-5 ${sectionIndex % 2 === 0 ? 'xl:grid-cols-[0.9fr_1.1fr]' : 'xl:grid-cols-[1.1fr_0.9fr]'}`}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {items.slice(0, 2).map((post) => (
                        <ImageFirstCard key={post.slug || post.id || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                      ))}
                    </div>
                    <div className="grid gap-5">
                      {items.slice(2, 6).map((post) => (
                        <EditorialCard key={post.slug || post.id || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section id="get-app" className="py-16 sm:py-20">
      <div className={container}>
        <div className="premium-card relative overflow-hidden rounded-[2.5rem] px-6 py-10 sm:px-8 lg:px-12">
          <div className="absolute right-[-5rem] top-[-4rem] h-56 w-56 rounded-full bg-[rgba(64,138,113,0.18)] blur-3xl" />
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b0e4cc]">{pagesContent.home.cta.badge || 'Start exploring'}</p>
              <h2 className="editable-display mt-4 max-w-3xl text-4xl font-semibold leading-[0.98] text-[#eefbf6] sm:text-5xl">
                Built to help business owners look current, credible, and easy to find.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[rgba(231,246,240,0.72)]">
                Use your existing content feed to power a cleaner homepage, richer section layouts, and stronger detail pages without changing backend behavior.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/create" className="premium-button inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">
                Create a post
              </Link>
              <Link href="/contact" className="premium-button-secondary inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">
                Contact us
              </Link>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'Local-ready discovery' },
              { icon: ShieldCheck, title: 'Safer content fallbacks' },
              { icon: Check, title: 'Responsive by default' },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.5rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.05)] p-5">
                <item.icon className="h-6 w-6 text-[#b0e4cc]" />
                <p className="mt-3 text-base font-semibold text-[#eefbf6]">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
