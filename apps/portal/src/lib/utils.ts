import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { CaseStatus } from '@mesa-servicio/shared'
import { STATUS_LABELS } from '@mesa-servicio/shared'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(iso))
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isSlaExpired(deadline: string): boolean {
  return new Date(deadline) < new Date()
}

export function isSlaWarning(deadline: string): boolean {
  const diff = new Date(deadline).getTime() - Date.now()
  return diff > 0 && diff < 24 * 60 * 60 * 1000 // menos de 24h
}

export function getStatusLabel(status: CaseStatus): string {
  return STATUS_LABELS[status]
}

export function getStatusBadgeClass(status: CaseStatus): string {
  const map: Record<CaseStatus, string> = {
    nuevo: 'bg-blue-100 text-blue-800 border-blue-200',
    en_proceso: 'bg-amber-100 text-amber-800 border-amber-200',
    escalado: 'bg-orange-100 text-orange-800 border-orange-200',
    resuelto: 'bg-green-100 text-green-800 border-green-200',
    cerrado: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  return map[status]
}
