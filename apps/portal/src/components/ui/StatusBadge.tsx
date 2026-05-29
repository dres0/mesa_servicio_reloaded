import { cn, getStatusLabel, getStatusBadgeClass } from '@/lib/utils'
import type { CaseStatus } from '@mesa-servicio/shared'

interface Props {
  status: CaseStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: Props) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      getStatusBadgeClass(status)
    )}>
      {getStatusLabel(status)}
    </span>
  )
}
