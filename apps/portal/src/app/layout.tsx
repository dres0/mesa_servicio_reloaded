import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'Mesa de Servicio | Seguros Falabella',
  description: 'Portal de gestión de solicitudes — Seguros Falabella',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
