import { NextResponse, type NextRequest } from "next/server"

import { API_URL } from "@/lib/env"

const ACCESS_TOKEN_COOKIE = "access_token"
const REFRESH_TOKEN_COOKIE = "refresh_token"
const AUTH_PAGES = ["/login", "/register"]

function isAuthPage(pathname: string) {
  return AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  )
}

function redirectToLogin(request: NextRequest) {
  const url = new URL("/login", request.url)
  const { pathname, search } = request.nextUrl
  url.searchParams.set("next", `${pathname}${search}`)
  return NextResponse.redirect(url)
}

// Exchanges the refresh cookie for a new pair of auth cookies. Returns the
// raw Set-Cookie headers, or null when the session can't be renewed.
async function requestRefresh(refreshToken: string): Promise<string[] | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
      cache: "no-store",
    })
    return response.ok ? response.headers.getSetCookie() : null
  } catch {
    return null
  }
}

// The API rotates the refresh token on every use and revokes every session if
// an old one is presented again. Several page requests (link prefetches, other
// tabs) can reach this proxy with the same expired session at once, so they
// share one refresh per refresh token. A successful result stays reusable for
// a short window, because requests sent before the browser stored the new
// cookies still carry the old token. This is per server process and keeps the
// token in memory only for that window; failures are never kept.
const REFRESH_REUSE_WINDOW_MS = 10_000
const refreshes = new Map<string, Promise<string[] | null>>()

function refreshSession(refreshToken: string) {
  const shared = refreshes.get(refreshToken)
  if (shared) return shared

  const attempt = requestRefresh(refreshToken).then((setCookies) => {
    if (setCookies) {
      setTimeout(() => refreshes.delete(refreshToken), REFRESH_REUSE_WINDOW_MS)
    } else {
      refreshes.delete(refreshToken)
    }
    return setCookies
  })
  refreshes.set(refreshToken, attempt)
  return attempt
}

// Route protection runs on the server for every page navigation. It is a cheap
// check on cookies only: the API stays the authority (the (app) layout asks it
// who the user is). This decides where to send visitors without a session and
// keeps the access cookie fresh so Server Components can fetch as the user.
export async function proxy(request: NextRequest) {
  const onAuthPage = isAuthPage(request.nextUrl.pathname)

  // A cookie is only a hint, not proof of a session, so signed-in visitors
  // aren't sent away from /login here: the auth pages confirm with the API
  // (redirectIfSignedIn). Doing it on the cookie alone would loop with the
  // (app) layout whenever the cookie is stale.
  if (request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    return NextResponse.next()
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) {
    return onAuthPage ? NextResponse.next() : redirectToLogin(request)
  }

  const setCookies = await refreshSession(refreshToken)
  if (!setCookies) {
    const response = onAuthPage ? NextResponse.next() : redirectToLogin(request)
    response.cookies.delete(REFRESH_TOKEN_COOKIE)
    return response
  }

  // Make the new cookies visible to this render's Server Components...
  for (const header of setCookies) {
    const [pair = ""] = header.split(";")
    const separator = pair.indexOf("=")
    request.cookies.set(
      pair.slice(0, separator),
      decodeURIComponent(pair.slice(separator + 1))
    )
  }
  const response = onAuthPage
    ? NextResponse.redirect(new URL("/", request.url))
    : NextResponse.next({ request: { headers: request.headers } })
  // ...and store them in the browser.
  for (const header of setCookies) {
    response.headers.append("set-cookie", header)
  }
  return response
}

export const config = {
  // Pages only: API calls, Next internals and static files skip the proxy.
  matcher: ["/((?!api|_next/static|_next/image|brand|favicon.ico|.*\\..*).*)"],
}
