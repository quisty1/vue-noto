/**
 * Shared TanStack QueryClient defaults for the SPA
 */
import { QueryClient } from '@tanstack/vue-query'

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Local IndexedDB reads; avoid aggressive refetch noise
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}
