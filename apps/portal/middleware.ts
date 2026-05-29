import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/.swa/health.html') {
    return new NextResponse('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|.swa).*)', '/'],
}
