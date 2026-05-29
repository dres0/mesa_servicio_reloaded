import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

interface TokenClaims {
  sub: string
  email: string
  name?: string
  extension_companyId?: string
  roles?: string[]
}

const b2cClient = jwksClient({
  jwksUri: process.env.B2C_JWKS_URI ?? '',
  cache: true,
  cacheMaxAge: 600_000,
})

const aadClient = jwksClient({
  jwksUri: process.env.AAD_JWKS_URI ?? '',
  cache: true,
  cacheMaxAge: 600_000,
})

async function getSigningKey(client: jwksClient.JwksClient, kid: string): Promise<string> {
  const key = await client.getSigningKey(kid)
  return key.getPublicKey()
}

export async function validateToken(authHeader: string | null): Promise<TokenClaims> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const decoded = jwt.decode(token, { complete: true })

  if (!decoded || typeof decoded.payload === 'string') {
    throw new Error('Invalid token format')
  }

  const kid = decoded.header.kid
  if (!kid) throw new Error('Token missing kid')

  // Detectar si es token B2C o AAD por el issuer
  const issuer = String((decoded.payload as Record<string, unknown>).iss ?? '')
  const isB2C = issuer.includes('b2clogin.com')

  const publicKey = await getSigningKey(isB2C ? b2cClient : aadClient, kid)

  const verified = jwt.verify(token, publicKey, {
    algorithms: ['RS256'],
    audience: process.env.B2C_AUDIENCE,
  }) as TokenClaims

  return verified
}

/**
 * Mock token para desarrollo local (MOCK_MODE=true)
 * Retorna claims fijos simulando un usuario externo autenticado
 */
export function getMockClaims(): TokenClaims {
  return {
    sub: 'mock-user-001',
    email: 'demo@seguros-xyz.cl',
    name: 'María González (Demo)',
    extension_companyId: 'emp-001',
    roles: ['solicitante'],
  }
}
