import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { validateToken, getMockClaims } from '../lib/auth.js'
import { uploadFile } from '../lib/storage.js'

const isMock = process.env.MOCK_MODE === 'true'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]
const MAX_SIZE_BYTES = 300 * 1024 // 300 KB

// POST /api/casos/{id}/adjuntos
app.http('adjuntos', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'casos/{id}/adjuntos',
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    try {
      const _claims = isMock ? getMockClaims() : await validateToken(req.headers.get('Authorization'))
      const { id: caseId } = req.params

      const contentType = req.headers.get('Content-Type') ?? ''
      const filename = req.headers.get('X-Filename') ?? `adjunto-${Date.now()}.bin`

      if (!ALLOWED_TYPES.some(t => contentType.includes(t.split('/')[1]))) {
        return {
          status: 400,
          body: JSON.stringify({ error: `Tipo de archivo no permitido. Permitidos: PDF, Excel` }),
        }
      }

      const arrayBuffer = await req.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      if (buffer.length > MAX_SIZE_BYTES) {
        return {
          status: 400,
          body: JSON.stringify({ error: `Archivo supera el límite de ${MAX_SIZE_BYTES / 1024} KB` }),
        }
      }

      const blobRef = await uploadFile(caseId, filename, buffer, contentType)

      return {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `att-${Date.now()}`,
          filename,
          contentType,
          sizeBytes: buffer.length,
          blobRef,
          uploadedAt: new Date().toISOString(),
        }),
      }
    } catch (err) {
      ctx.error('Error en POST /api/casos/{id}/adjuntos:', err)
      return { status: 500, body: JSON.stringify({ error: 'Internal server error' }) }
    }
  },
})
