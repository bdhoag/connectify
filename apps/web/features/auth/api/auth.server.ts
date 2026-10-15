import "server-only"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { ApiError } from "@/lib/api-client"
import { serverApiRequest } from "@/lib/api-server"
import type { User } from "@/features/auth/schemas/auth"

const ACCESS_TOKEN_COOKIE = "access_token"

export function getMeOnServer() {
  return serverApiRequest<User>("/auth/me")
}

// For /login and /register: send visitors who already have a session to the
// app. A cookie alone isn't proof (it can be stale or revoked), so ask the
// API. If it doesn't confirm, show the page, so a bad cookie can never bounce
// between this page and the app.
export async function redirectIfSignedIn() {
  const cookieStore = await cookies()
  if (!cookieStore.has(ACCESS_TOKEN_COOKIE)) return

  try {
    await getMeOnServer()
  } catch (error) {
    if (error instanceof ApiError) return
    throw error
  }
  redirect("/")
}
