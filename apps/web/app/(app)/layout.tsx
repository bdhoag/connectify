import Link from "next/link"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { Wordmark } from "@/components/shared/wordmark"
import { getMeOnServer } from "@/features/auth/api/auth.server"
import { meQueryOptions } from "@/features/auth/api/keys"
import { CurrentUser } from "@/features/auth/components/current-user"
import { LogoutButton } from "@/features/auth/components/logout-button"
import { SessionRecovery } from "@/features/auth/components/session-recovery"
import { ApiError } from "@/lib/api-client"
import { getQueryClient } from "@/lib/query-client"

// Placeholder shell for the signed-in area; the real AppShell (side nav,
// right rail, bottom nav) replaces the header in the next step.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = getQueryClient()
  try {
    await queryClient.fetchQuery({
      ...meQueryOptions(),
      queryFn: getMeOnServer,
    })
  } catch (error) {
    // proxy.ts only checks that a cookie exists, so this is where a stale or
    // revoked session shows up. Try to renew it in the browser before giving up.
    if (error instanceof ApiError && error.status === 401) {
      return <SessionRecovery />
    }
    throw error
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-10 border-b bg-card">
          <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 md:px-6">
            <Link
              href="/"
              aria-label="Connectify home"
              className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Wordmark />
            </Link>
            <div className="flex min-w-0 items-center gap-3">
              <CurrentUser />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[680px] flex-1 px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </HydrationBoundary>
  )
}
