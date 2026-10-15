import {
  environmentManager,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query"

import { ApiError } from "@/lib/api-client"

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      // Set on mutations where a 401 means "wrong credentials", not
      // "session expired" (login, register, logout).
      skipAuthRedirect?: boolean
    }
  }
}

let browserQueryClient: QueryClient | undefined

function redirectToLogin(error: unknown) {
  if (
    environmentManager.isServer() ||
    !(error instanceof ApiError) ||
    error.status !== 401
  )
    return
  browserQueryClient?.clear()
  const next = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/login?next=${encodeURIComponent(next)}`)
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: redirectToLogin }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.meta?.skipAuthRedirect) redirectToLogin(error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        // Client errors (4xx) won't fix themselves; retry network/5xx twice.
        retry: (count, error) =>
          !(
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) && count < 2,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: false },
    },
  })
}

// A fresh client per server request; one lazily created client in the browser.
export function getQueryClient() {
  if (environmentManager.isServer()) return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}
