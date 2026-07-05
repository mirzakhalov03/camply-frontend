import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export type User = {
  _id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

const usersKey = ['users'] as const

// Read the list.
export function useUsers() {
  return useQuery({
    queryKey: usersKey,
    queryFn: () => api.get<User[]>('/users'),
  })
}

// A write — `useMutation`. On success we invalidate the list so React Query
// refetches it, keeping the UI in sync without manual state juggling.
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string; email: string }) => api.post<User>('/users', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKey })
    },
  })
}
