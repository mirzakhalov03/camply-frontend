import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

type Health = { status: string; uptime: number }

// A read — `useQuery`. React Query handles loading/error/caching for us.
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<Health>('/health'),
  })
}
