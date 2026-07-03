import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Outfit', 'Manrope', system-ui, sans-serif"
const BODY_FONT = "'Manrope', system-ui, sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#091413',
  surface: 'rgba(14, 30, 27, 0.88)',
  raised: '#112622',
  text: '#eefbf6',
  muted: 'rgba(231, 246, 240, 0.7)',
  line: 'rgba(176, 228, 204, 0.12)',
  accent: '#408A71',
  accentSoft: 'rgba(64, 138, 113, 0.16)',
  onAccent: '#f7fffb',
  glow: 'rgba(64, 138, 113, 0.18)',
  radius: '1.75rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Insights', note: 'Guides, stories, and perspective built for practical decisions.' },
  listing: { ...base, kicker: 'Directory', note: 'A polished index of businesses, services, and local operators.' },
  classified: { ...base, kicker: 'Opportunities', note: 'Active offers, openings, and direct-response listings.' },
  image: { ...base, kicker: 'Visuals', note: 'Image-led highlights with cleaner browsing and stronger focus.' },
  sbm: { ...base, kicker: 'Resources', note: 'Useful links, references, and saved destinations worth revisiting.' },
  pdf: { ...base, kicker: 'Documents', note: 'Reports, downloads, and reference files in one premium workspace.' },
  profile: { ...base, kicker: 'Profiles', note: 'People and business identities presented with more confidence.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
