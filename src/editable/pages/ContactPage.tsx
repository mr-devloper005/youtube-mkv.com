'use client'

import { Bookmark, Building2, FileText, Image as ImageIcon, Mail, MapPin, Phone, Sparkles } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { getFactoryState } from '@/design/factory/get-factory-state'
import { getProductKind } from '@/design/factory/get-product-kind'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

function getLanes(kind: ReturnType<typeof getProductKind>) {
  if (kind === 'directory') {
    return [
      { icon: Building2, title: 'Business onboarding', body: 'Add listings, tune profile details, and prepare stronger public-facing pages.' },
      { icon: Phone, title: 'Partnership support', body: 'Discuss growth campaigns, local visibility, and account-level setup needs.' },
      { icon: MapPin, title: 'Coverage requests', body: 'Expand into new cities, service areas, or category lanes with a cleaner structure.' },
    ]
  }
  if (kind === 'editorial') {
    return [
      { icon: FileText, title: 'Editorial submissions', body: 'Pitch useful stories, updates, and long-form content built for public readers.' },
      { icon: Mail, title: 'Newsletter partnerships', body: 'Coordinate collaborations, sponsorship placements, and support requests.' },
      { icon: Sparkles, title: 'Contributor support', body: 'Get help with formatting, publishing flow, and content presentation.' },
    ]
  }
  if (kind === 'visual') {
    return [
      { icon: ImageIcon, title: 'Creator collaborations', body: 'Plan visual launches, campaign imagery, and gallery-led highlights.' },
      { icon: Sparkles, title: 'Licensing and use', body: 'Reach out about creative usage, placement, and image-based promotions.' },
      { icon: Mail, title: 'Media kits', body: 'Request presentation support, promo material, or campaign documentation.' },
    ]
  }
  return [
    { icon: Bookmark, title: 'Collection submissions', body: 'Suggest useful resources, links, and reference pages worth surfacing.' },
    { icon: Mail, title: 'Resource partnerships', body: 'Coordinate curated collections, public pages, and co-branded resources.' },
    { icon: Sparkles, title: 'Curator support', body: 'Get help organizing sections, archive groups, and related content blocks.' },
  ]
}

export default function ContactPage() {
  const { recipe } = getFactoryState()
  const productKind = getProductKind(recipe)
  const lanes = getLanes(productKind)

  return (
    <EditableSiteShell>
      <main className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b0e4cc]">{pagesContent.contact.eyebrow}</p>
            <h1 className="editable-display mt-4 max-w-[12ch] text-5xl font-semibold leading-[0.94] text-[#eefbf6] sm:text-6xl">
              Built for better conversations with business owners and contributors.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[rgba(231,246,240,0.72)]">{pagesContent.contact.description}</p>
            <div className="mt-8 grid gap-4">
              {lanes.map((lane) => (
                <div key={lane.title} className="rounded-[1.8rem] border border-[rgba(176,228,204,0.12)] bg-[rgba(176,228,204,0.04)] p-5">
                  <lane.icon className="h-5 w-5 text-[#b0e4cc]" />
                  <h2 className="editable-display mt-3 text-2xl font-semibold text-[#eefbf6]">{lane.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[rgba(231,246,240,0.68)]">{lane.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[rgba(176,228,204,0.12)] bg-[linear-gradient(180deg,rgba(14,30,27,0.9),rgba(10,22,21,0.92))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-8">
            <h2 className="editable-display text-3xl font-semibold text-[#eefbf6]">{pagesContent.contact.formTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[rgba(231,246,240,0.68)]">
              Share what you are trying to launch, update, or improve and the right lane will pick it up.
            </p>
            <EditableContactLeadForm />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
