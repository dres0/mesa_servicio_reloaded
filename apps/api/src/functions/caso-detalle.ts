import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { validateToken, getMockClaims } from '../lib/auth.js'
import { getCasoById } from '../lib/dataverse.js'
import { generateSasUri } from '../lib/storage.js'

const isMock = process.env.MOCK_MODE === 'true'

// GET /api/casos/{id} — detalle de caso con SAS URIs para adjuntos
app.http('caso-detalle', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'casos/{id}',
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const claims = isMock ? getMockClaims() : await validateToken(req.headers.get('Authorization'))
      const { id } = req.params

      const caso = await getCasoById(id)
      if (!caso) {
        return { status: 404, body: JSON.stringify({ error: 'Caso no encontrado' }) }
      }

      // Verificar acceso: solo puede ver su empresa (excepto internos con roles)
      const isInternal = claims.roles?.some(r => ['analista', 'supervisor', 'admin'].includes(r))
      if (!isInternal && caso.companyId !== claims.extension_companyId) {
        return { status: 403, body: JSON.stringify({ error: 'Acceso denegado' }) }
      }

      // Enriquecer adjuntos con SAS URIs temporales
      const casoConSas = {
        ...caso,
        attachments: caso.attachments.map(att => ({
          ...att,
          sasUri: generateSasUri(`${caso.id}/${att.filename}`),
        })),
      }

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(casoConSas),
      }
    } catch (err) {
      ctx.error('Error en GET /api/casos/{id}:', err)
      return { status: 500, body: JSON.stringify({ error: 'Internal server error' }) }
    }
  },
})
