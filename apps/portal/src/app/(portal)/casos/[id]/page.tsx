'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCaso } from '@/hooks/useCasos'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDate, formatDateShort, formatFileSize, isSlaExpired, isSlaWarning, cn } from '@/lib/utils'
import type { CaseStatus, StateLogEntry, Attachment } from '@mesa-servicio/shared'

// ─── STATUS STEP CONFIG ────────────────────────────────────────────────────────

const STATUS_STEPS: CaseStatus[] = ['nuevo', 'en_proceso', 'escalado', 'resuelto', 'cerrado']

const STATUS_STEP_LABELS: Record<CaseStatus, string> = {
  nuevo: 'Nuevo',
  en_proceso: 'En Proceso',
  escalado: 'Escalado',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function SlaChip({ deadline, isClosed }: { deadline: string; isClosed: boolean }) {
  if (isClosed) return null
  const expired = isSlaExpired(deadline)
  const warning = !expired && isSlaWarning(deadline)
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
      expired ? 'bg-red-100 text-red-700' :
      warning ? 'bg-amber-100 text-amber-700' :
      'bg-slate-100 text-slate-600'
    )}>
      {expired ? '⚠' : warning ? '⏰' : '🕐'}
      {expired ? 'SLA vencido' : warning ? 'Vence hoy' : `SLA: ${formatDateShort(deadline)}`}
    </span>
  )
}

function HistoryTimeline({ entries }: { entries: StateLogEntry[] }) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  )

  const STATUS_ICON_BG: Partial<Record<CaseStatus, string>> = {
    nuevo: 'bg-blue-500',
    en_proceso: 'bg-amber-500',
    escalado: 'bg-orange-500',
    resuelto: 'bg-green-500',
    cerrado: 'bg-slate-400',
  }

  return (
    <div className="space-y-0">
      {sorted.map((entry, i) => (
        <div key={entry.id} className="flex gap-4">
          {/* timeline line */}
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
              STATUS_ICON_BG[entry.newStatus] ?? 'bg-slate-400'
            )}>
              {entry.newStatus === 'resuelto' ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : entry.newStatus === 'cerrado' ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : entry.newStatus === 'escalado' ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            {i < sorted.length - 1 && (
              <div className="w-0.5 bg-slate-200 flex-1 my-1" style={{ minHeight: '24px' }} />
            )}
          </div>

          {/* content */}
          <div className="pb-5 min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-sm font-semibold text-slate-800">
                {STATUS_STEP_LABELS[entry.newStatus]}
              </span>
              {entry.previousStatus && (
                <span className="text-xs text-slate-400">
                  ← desde {STATUS_STEP_LABELS[entry.previousStatus]}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {entry.changedBy} · {formatDate(entry.changedAt)}
            </div>
            {entry.comment && (
              <p className="mt-2 text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                {entry.comment}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function AttachmentRow({ att }: { att: Attachment }) {
  const isExcel = att.contentType.includes('spreadsheet') || att.contentType.includes('excel')
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        isExcel ? 'bg-green-100' : 'bg-red-100'
      )}>
        <svg className={cn('w-5 h-5', isExcel ? 'text-green-600' : 'text-red-600')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{att.filename}</p>
        <p className="text-xs text-slate-500">{formatFileSize(att.sizeBytes)} · {formatDateShort(att.uploadedAt)}</p>
      </div>
      {att.sasUri ? (
        <a
          href={att.sasUri}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline flex-shrink-0">
          Descargar
        </a>
      ) : (
        <span className="text-xs text-slate-400 flex-shrink-0">Sin enlace</span>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

// Separamos useSearchParams en su propio componente para cumplir con Suspense en Next.js 14
function CasoDetalleInner({ id }: { id: string }) {
  const searchParams = useSearchParams()
  const justCreated = searchParams.get('created') === '1'

  const { data: caso, isLoading, error } = useCaso(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Cargando solicitud...</p>
        </div>
      </div>
    )
  }

  if (error || !caso) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Solicitud no encontrada</h2>
        <p className="text-sm text-slate-500 mb-6">
          {error ? String(error) : 'No se pudo cargar la información de este caso.'}
        </p>
        <Link href="/casos" className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium">
          ← Volver a Mis Solicitudes
        </Link>
      </div>
    )
  }

  const isClosed = ['resuelto', 'cerrado'].includes(caso.status)

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Banner de caso creado */}
      {justCreated && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-green-800">
            <strong>Solicitud enviada correctamente.</strong> Recibirás actualizaciones por email a medida que avance.
          </p>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/casos" className="hover:text-primary-600 transition-colors">Mis Solicitudes</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-mono text-xs font-medium">{caso.caseNumber}</span>
      </nav>

      {/* Header card */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {caso.caseNumber}
                </span>
                {caso.priority === 'alta' && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Prioridad Alta
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-snug">{caso.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusBadge status={caso.status as CaseStatus} />
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">{caso.typeName}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">Creado {formatDate(caso.createdAt)}</span>
              </div>
            </div>
            <SlaChip deadline={caso.slaDeadline} isClosed={isClosed} />
          </div>

          {/* Progress steps — only for open cases */}
          {!isClosed && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center">
                {STATUS_STEPS.filter(s => s !== 'cerrado').map((step, i, arr) => {
                  const stepIndex = arr.indexOf(step)
                  // const currentIndex = arr.indexOf(caso.status as CaseStatus)
                  const currentStatus = caso.status === 'cerrado' ? 'resuelto' : caso.status
                  const currentIndex = arr.indexOf(currentStatus as any)
                  const done = stepIndex < currentIndex
                  const active = stepIndex === currentIndex

                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
                          done ? 'bg-primary-500 text-white' :
                          active ? 'bg-primary-500 text-white ring-4 ring-primary-100' :
                          'bg-slate-100 text-slate-400'
                        )}>
                          {done ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (i + 1)}
                        </div>
                        <span className={cn(
                          'text-xs mt-1.5 text-center leading-tight hidden sm:block',
                          active ? 'text-primary-700 font-semibold' :
                          done ? 'text-slate-500' : 'text-slate-400'
                        )}>
                          {STATUS_STEP_LABELS[step]}
                        </span>
                      </div>
                      {i < arr.length - 1 && (
                        <div className={cn(
                          'flex-1 h-0.5 mx-2 -mt-5 sm:-mt-4',
                          done ? 'bg-primary-400' : 'bg-slate-200'
                        )} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Descripción */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-700">Descripción</h2>
            </div>
            <div className="card-body">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{caso.description}</p>
            </div>
          </div>

          {/* Historial */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-700">
                Historial
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {caso.history.length} {caso.history.length === 1 ? 'evento' : 'eventos'}
                </span>
              </h2>
            </div>
            <div className="card-body">
              {caso.history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Sin historial de cambios</p>
              ) : (
                <HistoryTimeline entries={caso.history} />
              )}
            </div>
          </div>

          {/* Adjuntos */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-700">
                Adjuntos
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {caso.attachments.length} {caso.attachments.length === 1 ? 'archivo' : 'archivos'}
                </span>
              </h2>
            </div>
            <div className="card-body">
              {caso.attachments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Sin archivos adjuntos</p>
              ) : (
                caso.attachments.map(att => (
                  <AttachmentRow key={att.id} att={att} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Datos del caso */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-700">Datos del caso</h2>
            </div>
            <div className="card-body space-y-4">
              <InfoRow label="Número" value={caso.caseNumber} mono />
              <InfoRow label="Tipo" value={caso.typeName} />
              <InfoRow label="Empresa" value={caso.companyName} />
              <InfoRow label="Creado" value={formatDate(caso.createdAt)} />
              <InfoRow label="Actualizado" value={formatDate(caso.updatedAt)} />
              {caso.resolvedAt && (
                <InfoRow label="Resuelto" value={formatDate(caso.resolvedAt)} />
              )}
            </div>
          </div>

          {/* Contacto */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-slate-700">Contacto solicitante</h2>
            </div>
            <div className="card-body space-y-4">
              <InfoRow label="Nombre" value={caso.contactName} />
              <InfoRow label="Email" value={caso.contactEmail} />
            </div>
          </div>

          {/* Asignado */}
          {caso.assignedTo && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-slate-700">Analista asignado</h2>
              </div>
              <div className="card-body">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                    {caso.assignedTo.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{caso.assignedTo}</p>
                    <p className="text-xs text-slate-500">{caso.assignedToEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Volver */}
          <Link
            href="/casos"
            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a mis solicitudes
          </Link>
        </div>
      </div>
    </div>
  )
}

// Componente wrapper: en Next.js 14 params es un objeto directo, no una Promise
export default function CasoDetallePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CasoDetalleInner id={params.id} />
    </Suspense>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className={cn('text-sm text-slate-800', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}
