'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCasos, fetchCaso, createCaso } from '@/lib/api-client'
import type { CreateCasoInput } from '@mesa-servicio/shared'

export function useCasos(filters?: { status?: string; typeId?: string; search?: string }) {
  return useQuery({
    queryKey: ['casos', filters],
    queryFn: () => fetchCasos(filters),
    staleTime: 30_000,
  })
}

export function useCaso(id: string) {
  return useQuery({
    queryKey: ['caso', id],
    queryFn: () => fetchCaso(id),
    enabled: !!id,
    staleTime: 15_000,
  })
}

export function useCreateCaso() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateCasoInput) => createCaso(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['casos'] })
    },
  })
}
