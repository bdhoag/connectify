import { queryOptions } from "@tanstack/react-query"

import { getMe } from "@/features/auth/api/auth"

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
}

export function meQueryOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: getMe,
    staleTime: 5 * 60_000,
  })
}
