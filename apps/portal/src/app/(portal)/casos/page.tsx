'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCasos } from '@/hooks/useCasos'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { formatDateShort, isSlaExpired, isSlaWarning, cn } from '@/lib/utils'
import { CASE_TYPES, type CaseStatus } from '@mesa-servicio/shared'

const STATUS_OPTS: { value: string; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'en_proceso', label: 'En Proceso' },
  { value: 'escalado', label: 'Escalado' },
  { value: 'resuelto', label: 'Resuelto' },
  { value: 'cerrado', label: 'Cerrado' },
]

export default function CasosPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [typeId, setTypeId] = useState('')

  const { data, isLoading, error } = useCasos({
    status: status || undefined,
    typeId: typeId || undefined,
    search: search || undefined,
  })

  const casos = data?.items ?? []

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Solicitudes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.companyName} · {data?.total ?? 0} solicitudes
          </p>
        </div>
        <Link
          href="/casos/nuevo"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm shadow-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Solicitud
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar por título o número..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700">
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={typeId}
              onChange={e => setTypeId(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700">
              <option value="">Todos los tipos</option>
              {CASE_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Cargando solicitudes...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">
            <p className="font-medium">Error al cargar las solicitudes</p>
            <p className="text-sm mt-1 text-red-400">{String(error)}</p>
          </div>
        ) : casos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No hay solicitudes</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || status || typeId ? 'Prueba ajustando los filtros' : 'Crea tu primera solicitud'}
            </p>
            {!search && !status && !typeId && (
              <Link href="/casos/nuevo"
                className="inline-flex items-center gap-2 mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
                + Nueva solicitud
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">N° / Título</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden sm:table-cell">SLA</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Creado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {casos.map(caso => {
                  const expired = isSlaExpired(caso.slaDeadline)
                  const warning = !expired && isSlaWarning(caso.slaDeadline)
                  const isOpen = !['resuelto', 'cerrado'].includes(caso.status)
                  return (
                    <tr key={caso.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-2">
                          {caso.priority === 'alta' && (
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" title="Prioridad alta" />
                          )}
                          <div>
                            <div className="font-mono text-xs text-slate-400 mb-0.5">{caso.caseNumber}</div>
                            <div className="font-medium text-slate-900 line-clamp-1 max-w-xs">{caso.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="text-slate-600">{caso.typeName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={caso.status as CaseStatus} />
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        {isOpen ? (
                          <span className={cn(
                            'text-xs font-medium',
                            expired ? 'text-red-600' : warning ? 'text-amber-600' : 'text-slate-500'
                          )}>
                            {expired ? '⚠ Vencido' : warning ? '⏰ Hoy' : formatDateShort(caso.slaDeadline)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-500 hidden lg:table-cell text-xs">
                        {formatDateShort(caso.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/casos/${caso.id}`}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
