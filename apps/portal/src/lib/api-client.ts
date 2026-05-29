'use client'

import type { Caso, CaseType, CreateCasoInput } from '@mesa-servicio/shared'
import { MOCK_CASOS, MOCK_USER } from './mock-data'
import { CASE_TYPES } from '@mesa-servicio/shared'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:7071/api'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('access_token') : null
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<T>
}

// ─── TIPOS DE CASO ────────────────────────────────────────────────────────────

export async function fetchTiposCaso(): Promise<CaseType[]> {
  if (USE_MOCK) {
    await delay(200)
    return CASE_TYPES
  }
  return apiFetch<CaseType[]>('/tipos-caso')
}

// ─── CASOS ────────────────────────────────────────────────────────────────────

export async function fetchCasos(filters?: {
  status?: string
  typeId?: string
  search?: string
}): Promise<{ items: Caso[]; total: number }> {
  if (USE_MOCK) {
    await delay(400)
    let result = [...MOCK_CASOS]
    if (filters?.status) result = result.filter(c => c.status === filters.status)
    if (filters?.typeId) result = result.filter(c => c.typeId === filters.typeId)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q)
      )
    }
    return { items: result, total: result.length }
  }

  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.typeId) params.set('typeId', filters.typeId)
  if (filters?.search) params.set('search', filters.search)

  return apiFetch<{ items: Caso[]; total: number }>(`/casos?${params.toString()}`)
}

export async function fetchCaso(id: string): Promise<Caso> {
  if (USE_MOCK) {
    await delay(300)
    const caso = MOCK_CASOS.find(c => c.id === id)
    if (!caso) throw new Error('Caso no encontrado')
    return caso
  }
  return apiFetch<Caso>(`/casos/${id}`)
}

export async function createCaso(data: CreateCasoInput): Promise<Caso> {
  if (USE_MOCK) {
    await delay(600)
    const newCaso: Caso = {
      id: `caso-${Date.now()}`,
      caseNumber: `CASO-2026-${String(MOCK_CASOS.length + 1).padStart(3, '0')}`,
      title: data.title,
      description: data.description,
      typeId: data.typeId,
      typeName: CASE_TYPES.find(t => t.id === data.typeId)?.name ?? data.typeId,
      status: 'nuevo',
      priority: data.priority ?? 'normal',
      companyId: MOCK_USER.companyId,
      companyName: MOCK_USER.companyName,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
      attachments: [],
      history: [{
        id: `log-${Date.now()}`,
        previousStatus: null,
        newStatus: 'nuevo',
        changedBy: 'Sistema',
        changedByEmail: 'sistema@mesa.cl',
        changedAt: new Date().toISOString(),
      }],
    }
    MOCK_CASOS.unshift(newCaso)
    return newCaso
  }

  return apiFetch<Caso>('/casos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function uploadAdjunto(caseId: string, file: File): Promise<{ id: string; filename: string }> {
  if (USE_MOCK) {
    await delay(800)
    return { id: `att-${Date.now()}`, filename: file.name }
  }

  const token = sessionStorage.getItem('access_token')
  const res = await fetch(`${API_URL}/casos/${caseId}/adjuntos`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type,
      'X-Filename': file.name,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: await file.arrayBuffer(),
  })
  if (!res.ok) throw new Error(`Upload error ${res.status}`)
  return res.json()
}

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
