// Where the Next server reaches the API (rewrites, proxy.ts, Server
// Components). The browser never uses this: it calls the same-origin `/api/*`
// path, which `next.config.ts` rewrites to here. Not NEXT_PUBLIC on purpose.
export const API_URL = process.env.API_URL ?? "http://localhost:4000"
