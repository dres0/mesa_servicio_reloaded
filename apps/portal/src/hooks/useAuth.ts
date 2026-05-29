'use client'

import { useMemo } from 'react'
import { MOCK_USER } from '@/lib/mock-data'
import type { AppUser } from '@mesa-servicio/shared'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

export interface AuthState {
  user: AppUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
}

export function useAuth(): AuthState {
  // En modo mock: usuario siempre autenticado
  if (USE_MOCK) {
    return {
      user: MOCK_USER,
      isAuthenticated: true,
      isLoading: false,
      login: () => {},
      logout: () => { window.location.href = '/login' },
    }
  }

  // TODO: implementar con MSAL cuando B2C esté disponible
  // import { useMsal } from '@azure/msal-react'
  // const { instance, accounts, inProgress } = useMsal()
  // ...
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: () => { window.location.href = '/login' },
    logout: () => { window.location.href = '/login' },
  }
}

export function useRequireAuth(): AppUser {
  const { user, isAuthenticated, login } = useAuth()
  useMemo(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      login()
    }
  }, [isAuthenticated, login])
  return user!
}
