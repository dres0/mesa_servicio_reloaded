import { ClientSecretCredential } from '@azure/identity'
import type { Caso, CreateCasoInput } from '@mesa-servicio/shared'
import { mockCasos } from './mock-data.js'

const isMock = process.env.MOCK_MODE === 'true'

let credential: ClientSecretCredential | null = null

function getCredential(): ClientSecretCredential {
  if (!credential) {
    credential = new ClientSecretCredential(
      process.env.AZURE_TENANT_ID!,
      process.env.AZURE_CLIENT_ID!,
      process.env.AZURE_CLIENT_SECRET!
    )
  }
  return credential
}

async function getToken(): Promise<string> {
  const token = await getCredential().getToken(
    `${process.env.DATAVERSE_URL}/.default`
  )
  if (!token?.token) throw new Error('Failed to get Dataverse token')
  return token.token
}

async function dvFetch(path: string, options?: RequestInit): Promise<unknown> {
  const token = await getToken()
  const url = `${process.env.DATAVERSE_URL}/api/data/v9.2${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'odata.include-annotations="*"',
      ...options?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Dataverse error ${res.status}: ${err}`)
  }
  if (res.status === 204) return null
  return res.json()
}

// ─── CASOS ────────────────────────────────────────────────────────────────────

export async function listCasos(companyId: string, filters?: {
  status?: string
  typeId?: string
  search?: string
}): Promise<Caso[]> {
  if (isMock) {
    let result = mockCasos.filter(c => c.companyId === companyId)
    if (filters?.status) result = result.filter(c => c.status === filters.status)
    if (filters?.typeId) result = result.filter(c => c.typeId === filters.typeId)
    if (filters?.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q)
      )
    }
    return result
  }

  // TODO: reemplazar con nombres reales de entidades Dataverse cuando estén definidos
  let filter = `crf5e_accountid eq '${companyId}'`
  if (filters?.status) filter += ` and crf5e_status eq '${filters.status}'`
  if (filters?.typeId) filter += ` and crf5e_typeid eq '${filters.typeId}'`

  const data = await dvFetch(
    `/crf5e_cases?$filter=${encodeURIComponent(filter)}&$orderby=createdon desc`
  ) as { value: Caso[] }
  return data.value
}

export async function getCasoById(id: string): Promise<Caso | null> {
  if (isMock) {
    return mockCasos.find(c => c.id === id) ?? null
  }
  try {
    const data = await dvFetch(`/crf5e_cases(${id})`) as Caso
    return data
  } catch {
    return null
  }
}

export async function createCaso(
  input: CreateCasoInput,
  companyId: string,
  contactEmail: string
): Promise<Caso> {
  if (isMock) {
    const newCaso: Caso = {
      id: `caso-${Date.now()}`,
      caseNumber: `CASO-2026-${String(mockCasos.length + 1).padStart(3, '0')}`,
      title: input.title,
      description: input.description,
      typeId: input.typeId,
      typeName: input.typeId,
      status: 'nuevo',
      priority: input.priority ?? 'normal',
      companyId,
      companyName: 'Empresa Demo',
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 5 * 86400000).toISOString(),
      attachments: [],
      history: [
        {
          id: `log-${Date.now()}`,
          previousStatus: null,
          newStatus: 'nuevo',
          changedBy: 'Sistema',
          changedByEmail: 'sistema@mesa.cl',
          changedAt: new Date().toISOString(),
        },
      ],
    }
    mockCasos.push(newCaso)
    return newCaso
  }

  // TODO: mapear campos al schema real de Dataverse
  const body = {
    crf5e_title: input.title,
    crf5e_description: input.description,
    crf5e_typeid: input.typeId,
    crf5e_status: 'nuevo',
    crf5e_contactemail: contactEmail,
  }
  const data = await dvFetch('/crf5e_cases', {
    method: 'POST',
    body: JSON.stringify(body),
  }) as Caso
  return data
}
