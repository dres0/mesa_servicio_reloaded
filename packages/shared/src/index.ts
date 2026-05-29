import { z } from 'zod'

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const CaseStatusEnum = z.enum(['nuevo', 'en_proceso', 'escalado', 'resuelto', 'cerrado'])
export type CaseStatus = z.infer<typeof CaseStatusEnum>

export const CaseTypeIdEnum = z.enum([
  'perdida_total',
  'solicitud_documentos',
  'solicitud_grabaciones',
  'solicitud_baja',
  'consulta_devoluciones',
])
export type CaseTypeId = z.infer<typeof CaseTypeIdEnum>

export const UserRoleEnum = z.enum(['solicitante', 'analista', 'supervisor', 'admin'])
export type UserRole = z.infer<typeof UserRoleEnum>

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface CaseType {
  id: CaseTypeId
  name: string
  description: string
  requiresAttachment: boolean
}

export interface Empresa {
  id: string
  name: string
  rut: string
  domain: string
  country: 'CL' | 'PE'
  active: boolean
}

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  companyId: string
  companyName: string
}

export interface Attachment {
  id: string
  filename: string
  contentType: string
  sizeBytes: number
  uploadedAt: string
  uploadedBy: string
  sasUri?: string
}

export interface StateLogEntry {
  id: string
  previousStatus: CaseStatus | null
  newStatus: CaseStatus
  changedBy: string
  changedByEmail: string
  changedAt: string
  comment?: string
}

export interface Caso {
  id: string
  caseNumber: string          // CASO-2026-001
  title: string
  description: string
  typeId: CaseTypeId
  typeName: string
  status: CaseStatus
  priority: 'normal' | 'alta'
  companyId: string
  companyName: string
  contactName: string
  contactEmail: string
  assignedTo?: string
  assignedToEmail?: string
  createdAt: string
  updatedAt: string
  slaDeadline: string
  resolvedAt?: string
  attachments: Attachment[]
  history: StateLogEntry[]
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ─── ZOD SCHEMAS (validación compartida portal + api) ─────────────────────────

export const createCasoSchema = z.object({
  title: z.string().min(5, 'Mínimo 5 caracteres').max(200),
  description: z.string().min(10, 'Mínimo 10 caracteres').max(2000),
  typeId: CaseTypeIdEnum,
  contactName: z.string().min(2, 'Requerido'),
  contactEmail: z.string().email('Email inválido'),
  priority: z.enum(['normal', 'alta']).default('normal'),
})
export type CreateCasoInput = z.infer<typeof createCasoSchema>

export const updateCasoStatusSchema = z.object({
  status: CaseStatusEnum,
  comment: z.string().min(1, 'El comentario es requerido').optional(),
})
export type UpdateCasoStatusInput = z.infer<typeof updateCasoStatusSchema>

export const listCasosQuerySchema = z.object({
  status: CaseStatusEnum.optional(),
  typeId: CaseTypeIdEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
})
export type ListCasosQuery = z.infer<typeof listCasosQuerySchema>

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const CASE_TYPES: CaseType[] = [
  {
    id: 'perdida_total',
    name: 'Análisis de Pérdida Total',
    description: 'Solicitud de análisis para pérdida total de bien asegurado',
    requiresAttachment: true,
  },
  {
    id: 'solicitud_documentos',
    name: 'Solicitud de Documentos',
    description: 'Propuestas, endosos, pólizas y documentación asociada',
    requiresAttachment: false,
  },
  {
    id: 'solicitud_grabaciones',
    name: 'Solicitud de Grabaciones',
    description: 'Grabaciones de llamadas o videollamadas de atención',
    requiresAttachment: false,
  },
  {
    id: 'solicitud_baja',
    name: 'Solicitud de Baja',
    description: 'Cancelación o baja de póliza o servicio',
    requiresAttachment: false,
  },
  {
    id: 'consulta_devoluciones',
    name: 'Consulta de Devoluciones',
    description: 'Estado y seguimiento de devoluciones de primas',
    requiresAttachment: false,
  },
]

export const STATUS_LABELS: Record<CaseStatus, string> = {
  nuevo: 'Nuevo',
  en_proceso: 'En Proceso',
  escalado: 'Escalado',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

export const STATUS_COLORS: Record<CaseStatus, string> = {
  nuevo: 'blue',
  en_proceso: 'amber',
  escalado: 'orange',
  resuelto: 'green',
  cerrado: 'gray',
}

export const SLA_BUSINESS_DAYS = 5
