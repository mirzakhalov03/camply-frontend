import { QueryClient } from '@tanstack/react-query'

// Central React Query config. `staleTime` avoids refetching data that's
// still fresh; tune per-query when a resource needs different behavior.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
