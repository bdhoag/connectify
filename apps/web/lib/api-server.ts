import "server-only"

import { cookies } from "next/headers"

import { sendRequest, type RequestOptions } from "@/lib/api-client"
import { API_URL } from "@/lib/env"

// Server Component counterpart of `apiRequest`: calls the API directly and
// forwards the visitor's cookies so the request is made as them. Token refresh
// happens earlier, in `proxy.ts`.
export async function serverApiRequest<T>(
  path: string,
  { headers, ...options }: RequestOptions = {}
): Promise<T> {
  const cookieStore = await cookies()
  return sendRequest<T>(`${API_URL}/api${path}`, {
    cache: "no-store",
    ...options,
    headers: { cookie: cookieStore.toString(), ...headers },
  })
}
