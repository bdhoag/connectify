"use client"

import { useMe } from "@/features/auth/api/use-auth"

// Hydrated from the (app) layout's server prefetch, so there's no loading flash.
export function CurrentUser() {
  const { data: user } = useMe()
  if (!user) return null
  return (
    <div className="flex min-w-0 flex-col text-right leading-tight">
      <span className="truncate text-small font-medium">
        {user.displayName || user.username}
      </span>
      <span className="truncate text-caption text-muted-foreground">
        @{user.username}
      </span>
    </div>
  )
}
