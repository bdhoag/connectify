"use client"

import { useEffect, useRef } from "react"

import { Skeleton } from "@workspace/ui/components/skeleton"

import { refreshSession } from "@/lib/api-client"

const ATTEMPT_KEY = "connectify-session-recovery"
const ATTEMPT_WINDOW_MS = 30_000

// One recovery attempt per window: a session that can't be repaired goes to
// /login instead of reloading forever. If the browser can't remember attempts
// (storage blocked), don't risk a loop.
function alreadyTried() {
  try {
    return (
      Date.now() - Number(sessionStorage.getItem(ATTEMPT_KEY)) <
      ATTEMPT_WINDOW_MS
    )
  } catch {
    return true
  }
}

function markTried() {
  try {
    sessionStorage.setItem(ATTEMPT_KEY, String(Date.now()))
  } catch {
    // alreadyTried() treats unreadable storage as "tried".
  }
}

function goToLogin() {
  const next = `${window.location.pathname}${window.location.search}`
  window.location.assign(`/login?next=${encodeURIComponent(next)}`)
}

// Shown by the (app) layout when the API says 401 although a session cookie
// exists (e.g. a revoked or stale access token). Server Components can't set
// cookies, so the browser asks the API for a fresh pair, then reloads. If that
// fails the session is really gone and the visitor goes to /login.
export function SessionRecovery() {
  const started = useRef(false)

  useEffect(() => {
    // Strict Mode runs effects twice in development; recover once.
    if (started.current) return
    started.current = true

    if (alreadyTried()) {
      goToLogin()
      return
    }
    markTried()
    void refreshSession().then((renewed) => {
      if (renewed) window.location.reload()
      else goToLogin()
    })
  }, [])

  return (
    <div
      role="status"
      aria-label="Restoring your session"
      className="mx-auto flex min-h-svh w-full max-w-[680px] flex-col gap-4 px-4 py-6 md:px-6"
    >
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-28 w-full" />
    </div>
  )
}
