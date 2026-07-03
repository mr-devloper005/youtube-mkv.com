import type { ReactNode } from 'react'
import { EditableNavbar } from '@/editable/shell/EditableNavbar'
import { EditableFooter } from '@/editable/shell/EditableFooter'
import { EditablePageMotion } from '@/editable/shell/EditablePageMotion'

export function EditableSiteShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`editable-site-root site-shell-bg flex min-h-screen flex-col ${className}`}>
      <EditableNavbar />
      <EditablePageMotion>
        <div className="site-layer flex-1">{children}</div>
      </EditablePageMotion>
      <EditableFooter />
    </div>
  )
}
