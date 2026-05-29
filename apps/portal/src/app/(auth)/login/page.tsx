'use client'

import { useRouter } from 'next/navigation'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = () => {
    if (USE_MOCK) {
      router.push('/casos')
      return
    }
    // TODO: trigger MSAL login redirect
    // instance.loginRedirect(loginRequest)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Mesa de Servicio</h1>
          <p className="text-slate-500 text-sm mt-1">Seguros Falabella — Portal de Solicitudes</p>
        </div>

        {USE_MOCK && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-800">
            <strong>Modo Demo activo:</strong> se omite autenticación real.
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm">
          <svg className="w-5 h-5" viewBox="0 0 21 21" fill="currentColor">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          {USE_MOCK ? 'Entrar al portal (demo)' : 'Iniciar sesión con Microsoft'}
        </button>

        <p className="text-xs text-slate-400 text-center mt-6">
          Acceso restringido a dominios corporativos autorizados.<br />
          ¿Problemas para acceder? Contacta a tu administrador.
        </p>
      </div>
    </div>
  )
}
