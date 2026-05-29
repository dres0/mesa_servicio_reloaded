import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { CASE_TYPES } from '@mesa-servicio/shared'

// GET /api/tipos-caso — catálogo de tipos de caso (público, sin auth)
app.http('tipos-caso', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'tipos-caso',
  handler: async (_req: HttpRequest): Promise<HttpResponseInit> => {
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify(CASE_TYPES),
    }
  },
})
