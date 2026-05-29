'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCasoSchema, type CreateCasoInput, CASE_TYPES } from '@mesa-servicio/shared'
import { useCreateCaso } from '@/hooks/useCasos'
import { useAuth } from '@/hooks/useAuth'
import { uploadAdjunto } from '@/lib/api-client'
import { formatFileSize, cn } from '@/lib/utils'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]
const MAX_SIZE_BYTES = 300 * 1024 // 300 KB

export default function NuevaSolicitudPage() {
  const router = useRouter()
  const { user } = useAuth()
  const createCaso = useCreateCaso()

  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateCasoInput>({
    resolver: zodResolver(createCasoSchema),
    defaultValues: {
      priority: 'normal',
      contactName: user?.name ?? '',
      contactEmail: user?.email ?? '',
    },
  })

  const selectedTypeId = watch('typeId')
  const selectedType = CASE_TYPES.find(t => t.id === selectedTypeId)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null)
    const f = e.target.files?.[0] ?? null
    if (!f) { setFile(null); return }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setFileError('Solo se permiten archivos PDF o Excel (.xlsx, .xls)')
      setFile(null)
      return
    }
    if (f.size > MAX_SIZE_BYTES) {
      setFileError(`El archivo supera el límite de ${formatFileSize(MAX_SIZE_BYTES)}`)
      setFile(null)
      return
    }
    setFile(f)
  }

  async function onSubmit(data: CreateCasoInput) {
    if (selectedType?.requiresAttachment && !file) {
      setFileError('Este tipo de solicitud requiere un adjunto')
      return
    }

    try {
      const newCaso = await createCaso.mutateAsync(data)

      if (file) {
        setUploadingFile(true)
        try {
          await uploadAdjunto(newCaso.id, file)
        } finally {
          setUploadingFile(false)
        }
      }

      router.push(`/casos/${newCaso.id}?created=1`)
    } catch (err) {
      // error ya capturado en createCaso.error
    }
  }

  const isBusy = isSubmitting || uploadingFile

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/casos" className="hover:text-primary-600 transition-colors">Mis Solicitudes</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-900 font-medium">Nueva Solicitud</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nueva Solicitud</h1>
        <p className="text-sm text-slate-500 mt-1">
          {user?.companyName} · Completa el formulario para enviar tu solicitud a Mesa de Servicio
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Tipo de solicitud */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-700">Tipo de solicitud</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CASE_TYPES.map(type => {
                const selected = selectedTypeId === type.id
                return (
                  <label
                    key={type.id}
                    className={cn(
                      'relative flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      selected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    )}>
                    <input
                      type="radio"
                      value={type.id}
                      {...register('typeId')}
                      className="sr-only"
                    />
                    <div className={cn(
                      'mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                      selected ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                    )}>
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="min-w-0">
                      <div className={cn('text-sm font-medium', selected ? 'text-primary-700' : 'text-slate-800')}>
                        {type.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {type.description}
                      </div>
                      {type.requiresAttachment && (
                        <span className="inline-block mt-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                          Requiere adjunto
                        </span>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
            {errors.typeId && (
              <p className="mt-2 text-xs text-red-600">{errors.typeId.message}</p>
            )}
          </div>
        </div>

        {/* Detalle de la solicitud */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-700">Detalle</h2>
          </div>
          <div className="card-body space-y-4">

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej: Solicitud endoso póliza hogar — incorporación nuevos bienes"
                {...register('title')}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  errors.title ? 'border-red-300 bg-red-50' : 'border-slate-200'
                )}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Describe tu solicitud con el mayor detalle posible: número de póliza, fecha del evento, datos del vehículo / bien asegurado, etc."
                {...register('description')}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none',
                  errors.description ? 'border-red-300 bg-red-50' : 'border-slate-200'
                )}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Prioridad */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Prioridad</label>
              <div className="flex gap-3">
                {(['normal', 'alta'] as const).map(p => {
                  const checked = watch('priority') === p
                  return (
                    <label key={p} className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all',
                      checked
                        ? p === 'alta'
                          ? 'border-red-400 bg-red-50 text-red-700'
                          : 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    )}>
                      <input type="radio" value={p} {...register('priority')} className="sr-only" />
                      {p === 'alta' && <span className="w-2 h-2 rounded-full bg-red-500" />}
                      {p === 'normal' ? 'Normal' : 'Alta'}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Datos de contacto */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-700">Datos de contacto</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('contactName')}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    errors.contactName ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  )}
                />
                {errors.contactName && (
                  <p className="mt-1 text-xs text-red-600">{errors.contactName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email de contacto <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...register('contactEmail')}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  )}
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-xs text-red-600">{errors.contactEmail.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Adjunto */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-700">
              Adjunto
              {selectedType?.requiresAttachment && (
                <span className="ml-2 text-xs text-amber-600 font-normal">(requerido para este tipo)</span>
              )}
            </h2>
          </div>
          <div className="card-body">
            {file ? (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors hover:bg-slate-50',
                  fileError ? 'border-red-300' : 'border-slate-200 hover:border-slate-300'
                )}>
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-slate-600 font-medium">Haz clic para adjuntar archivo</p>
                <p className="text-xs text-slate-400 mt-1">PDF o Excel — máximo 300 KB</p>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileError && (
              <p className="mt-2 text-xs text-red-600">{fileError}</p>
            )}
          </div>
        </div>

        {/* Error de submit */}
        {createCaso.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <strong>Error al crear la solicitud:</strong> {String(createCaso.error)}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/casos"
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium rounded-lg transition-colors text-sm shadow-sm">
            {isBusy ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploadingFile ? 'Subiendo adjunto...' : 'Enviando...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar Solicitud
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
