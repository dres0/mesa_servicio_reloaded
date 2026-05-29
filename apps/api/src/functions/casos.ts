import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { createCasoSchema, listCasosQuerySchema } from '@mesa-servicio/shared'
import { validateToken, getMockClaims } from '../lib/auth.js'
import { listCasos, createCaso } from '../lib/dataverse.js'

const isMock = process.env.MOCK_MODE === 'true'

async function getClaims(req: HttpRequest) {
  if (isMock) return getMockClaims()
  return validateToken(req.headers.get('Authorization'))
}

// GET /api/casos  — listar casos de la empresa del usuario
// POST /api/casos — crear nuevo caso
app.http('casos', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  route: 'casos',
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const claims = await getClaims(req)
      const companyId = claims.extension_companyId ?? 'mock-company'

      if (req.method === 'GET') {
        const url = new URL(req.url)
        const query = listCasosQuerySchema.parse({
          status: url.searchParams.get('status') ?? undefined,
          typeId: url.searchParams.get('typeId') ?? undefined,
          search: url.searchParams.get('search') ?? undefined,
          page: url.searchParams.get('page') ?? 1,
          pageSize: url.searchParams.get('pageSize') ?? 20,
        })

        const casos = await listCasos(companyId, {
          status: query.status,
          typeId: query.typeId,
          search: query.search,
        })

        return {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: casos, total: casos.length }),
        }
      }

      if (req.method === 'POST') {
        const body = await req.json() as unknown
        const parsed = createCasoSchema.safeParse(body)

        if (!parsed.success) {
          return {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: 'Validation error', details: parsed.error.flatten() }),
          }
        }

        const caso = await createCaso(parsed.data, companyId, claims.email)
        return {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(caso),
        }
      }

      return { status: 405, body: 'Method Not Allowed' }
    } catch (err) {
      ctx.error('Error en /api/casos:', err)
      if (err instanceof Error && err.message.includes('token')) {
        return { status: 401, body: JSON.stringify({ error: 'Unauthorized' }) }
      }
      return { status: 500, body: JSON.stringify({ error: 'Internal server error' }) }
    }
  },
})
