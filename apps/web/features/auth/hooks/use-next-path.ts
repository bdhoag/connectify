"use client"

import { useSearchParams } from "next/navigation"

// Where to go after signing in. Only same-site paths are accepted, so a
// crafted `?next=https://evil.example` link can't redirect off Connectify.
export function useNextPath() {
  const next = useSearchParams().get("next")
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/"
}
