// The single place that talks HTTP to the Connectify API. Feature request
// functions call `apiRequest`; Server Components use `serverApiRequest`
// (lib/api-server.ts), which shares the same request core.

type SuccessEnvelope<T> = {
  success: true
  statusCode: number
  data: T
  timestamp: string
}

type ErrorEnvelope = {
  success: false
  statusCode: number
  message: string | string[]
  error: string
  timestamp: string
  path: string
}

export class ApiError extends Error {
  readonly status: number
  // Stable, machine-readable code derived from the HTTP error name
  // ("Bad Request" -> "BAD_REQUEST"). UI branches on this, never on `message`.
  readonly code: string
  // Individual validation messages when the API rejected the body.
  readonly details: string[]

  constructor(
    status: number,
    code: string,
    message: string,
    details: string[] = []
  ) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

export type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown }

function isErrorEnvelope(payload: unknown): payload is ErrorEnvelope {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as { success?: unknown }).success === false
  )
}

function toApiError(status: number, payload: unknown): ApiError {
  if (!isErrorEnvelope(payload)) {
    return new ApiError(
      status,
      "UNKNOWN_ERROR",
      "Something went wrong. Please try again."
    )
  }
  const details = Array.isArray(payload.message) ? payload.message : []
  const message = Array.isArray(payload.message)
    ? (payload.message[0] ?? payload.error)
    : payload.message
  const code = payload.error.trim().toUpperCase().replace(/\s+/g, "_")
  return new ApiError(status, code, message, details)
}

export async function sendRequest<T>(
  url: string,
  { body, headers, ...init }: RequestOptions = {}
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      0,
      "NETWORK_ERROR",
      "Couldn't reach Connectify. Check your connection and try again."
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  const payload: unknown = await response.json().catch(() => null)
  if (!response.ok) {
    throw toApiError(response.status, payload)
  }
  return (payload as SuccessEnvelope<T>).data
}

// Requests where a 401 is an answer, not an expired session.
const NO_REFRESH_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
])

// Shared by every request that hits a 401 at the same time, so the refresh
// token is rotated once (presenting it twice revokes every session).
let refreshInFlight: Promise<boolean> | null = null

function refreshSession(): Promise<boolean> {
  refreshInFlight ??= sendRequest("/api/auth/refresh", { method: "POST" })
    .then(
      () => true,
      () => false
    )
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

// Browser-side request to the API through the same-origin `/api` rewrite.
// The httpOnly auth cookies travel automatically; on an expired access token
// the session is refreshed once and the request retried.
export async function apiRequest<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  try {
    return await sendRequest<T>(`/api${path}`, options)
  } catch (error) {
    const canRefresh =
      error instanceof ApiError &&
      error.status === 401 &&
      !NO_REFRESH_PATHS.has(path)
    if (canRefresh && (await refreshSession())) {
      return sendRequest<T>(`/api${path}`, options)
    }
    throw error
  }
}

// Picks the validation messages that belong to each field. class-validator
// messages start with the property name ("email must be an email").
export function fieldErrorsFrom<F extends string>(
  error: unknown,
  fields: readonly F[]
): Partial<Record<F, string>> {
  if (!(error instanceof ApiError)) return {}
  const result: Partial<Record<F, string>> = {}
  for (const detail of error.details) {
    const field = fields.find((name) => detail.startsWith(`${name} `))
    if (field && !result[field]) {
      result[field] = detail.charAt(0).toUpperCase() + detail.slice(1)
    }
  }
  return result
}
