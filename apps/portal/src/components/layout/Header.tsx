'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="font-semibold text-slate-900 text-sm">Mesa de Servicio</span>
              <span className="text-slate-400 text-xs block leading-none">Seguros Falabella</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link href="/casos"
              className="text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md transition-colors">
              Mis Solicitudes
            </Link>
            <Link href="/casos/nuevo"
              className="ml-2 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 px-4 py-2 rounded-md transition-colors">
              + Nueva Solicitud
            </Link>
          </nav>

          {/* User */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.companyName}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={logout}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                title="Cerrar sesión">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
